// Identidad privada de publicaciones: sin autores, URLs ni textos en los índices persistidos.
import { createHash } from 'node:crypto';
import { validarCampana } from './campana.js';
import { fechaDesdeIdX } from './fecha-x.js';
const hash = s => createHash('sha256').update(s).digest('hex');

/** Recupera el enlace aportado sin conservar cuentas ni parámetros de rastreo. Uso privado. */
export function enlacePendiente(localizador) {
  const { tipo, codigo, formato } = localizador;
  if (!/^[A-Za-z0-9_-]+$/.test(codigo)) throw new Error('Localizador inválido');
  if (tipo === 'x_status') return `https://x.com/i/status/${codigo}`;
  if (tipo === 'linkedin_corto') return `https://lnkd.in/p/${codigo}`;
  if (tipo === 'instagram' && ['p', 'reel'].includes(formato)) return `https://www.instagram.com/${formato}/${codigo}/`;
  if (tipo === 'facebook_share' && [null, 'v', 'r'].includes(formato)) return `https://www.facebook.com/share/${formato ? `${formato}/` : ''}${codigo}/`;
  throw new Error('Plataforma pendiente no compatible');
}

export function identidadPublicacion(raw) {
  const u = new URL(raw);
  if (u.protocol !== 'https:') throw new Error('Solo enlaces HTTPS');
  const host = u.hostname.replace(/^(www|m|mobile)\./, '').toLowerCase();
  const p = decodeURIComponent(u.pathname);
  if (u.searchParams.has('comment_id') || u.searchParams.has('reply_comment_id')) return null;
  let key;
  if (['twitter.com', 'x.com'].includes(host)) key = p.match(/\/(?:i\/)?(?:[^/]+\/)?status\/(\d+)/)?.[1] && `x:${p.match(/status\/(\d+)/)[1]}`;
  if (host === 'instagram.com') key = p.match(/^\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1] && `instagram:${p.split('/')[2]}`;
  if (host === 'linkedin.com') { const id = p.match(/(?:activity[-:]|urn:li:activity:)(\d+)/)?.[1]; if (id) key = `linkedin:${id}`; }
  if (host === 'facebook.com') {
    const id = u.searchParams.get('v') ?? u.searchParams.get('story_fbid') ?? u.searchParams.get('fbid') ?? p.match(/\/(?:reel|videos|posts)\/([A-Za-z0-9]+)/)?.[1];
    if (id && /^(?:\d+|pfbid[A-Za-z0-9]+)$/.test(id)) key = `facebook:${id}`;
  }
  // No convertir un short link o un alias share en una identidad canónica verificada.
  return key ? hash(key) : null;
}

export function indexarPublicaciones(procesados, anterior = { version: 1, publicaciones: {} }, historico = []) {
  const publicaciones = structuredClone(anterior.publicaciones);
  const sinResolver = structuredClone(anterior.sinResolver ?? {});
  const tiposPost = ['post', 'tweet', 'quote tweet', 'video', 'reels', 'article'];
  const resueltos = new Set(Object.values(publicaciones).flat());
  for (const r of historico) if (tiposPost.includes(r.tp) && !resueltos.has(r.h)) sinResolver[r.h] = r.p;
  for (const r of procesados) {
    if (!tiposPost.includes(r.tp)) continue;
    let key; try { key = identidadPublicacion(r._local.url); } catch { sinResolver[r.h] = r.p; continue; }
    if (!key) { sinResolver[r.h] = r.p; continue; }
    delete sinResolver[r.h];
    publicaciones[key] = [...new Set([...(publicaciones[key] ?? []), r.h])].sort();
  }
  return { version: 1, publicaciones, sinResolver };
}

/** Incorpora solo registros ya verificados; no deduplica comentarios por la URL del hilo. */
export function incorporarComplementaria(m, indice, entrada) {
  const editorial = entrada.validacionEditorial?.fuente === 'validacion_usuario' && entrada.validacionEditorial?.estado === 'confirmada';
  if (entrada.estado !== 'verificada' || (!editorial && !entrada.verificacion?.contenidoRevisado) || !entrada.verificacion?.fechaConfirmada || (!editorial && !entrada.verificacion?.vinculoConfirmado)) throw new Error('Publicación externa sin verificación completa');
  if (!['post', 'tweet', 'quote tweet', 'video', 'reels', 'article'].includes(entrada.registro?.tp)) throw new Error('Un comentario externo requiere resolver su ID propio; no se incorpora mediante la URL de su publicación matriz');
  if (!['acceso_directo', 'metadatos_publicos', 'captura_aportada', 'validacion_usuario'].includes(entrada.verificacion.metodo)) throw new Error('Método de verificación inválido');
  if (entrada.verificacion.metodo === 'validacion_usuario' && !editorial) throw new Error('Falta validación editorial del responsable');
  const key = identidadPublicacion(entrada.urlCanonica);
  if (!key) throw new Error('Falta URL canónica con ID estable');
  const matches = indice.publicaciones[key] ?? [];
  let fechaId = null;
  if (editorial && entrada.verificacion.fuenteFecha === 'fecha_codificada_id_x') {
    const u = new URL(entrada.urlCanonica);
    if (!['x.com', 'twitter.com'].includes(u.hostname.replace(/^www\./,''))) throw new Error('Fuente de fecha incompatible');
    fechaId = fechaDesdeIdX(u.pathname.match(/status\/(\d+)/)?.[1]);
    if (fechaId.fecha !== entrada.registro?.d) throw new Error('Fecha no coincide con el identificador X');
  }
  const sinResolver = Object.entries(indice.sinResolver ?? {}).filter(([, p]) => p === entrada.registro?.p || p === 'otros');
  const riesgo = sinResolver.some(([h]) => {
    const r = m.registros.find(r => r.h === h);
    if (!fechaId || !r) return true;
    // Solo permite descartar otro mes acreditado; no resuelve diferencias de zona o de pocos días.
    return r.d.slice(0,7) === fechaId.fecha.slice(0,7);
  });
  if (!matches.length && riesgo) throw new Error('Hay publicaciones SentiOne sin identidad canónica en esa plataforma: resolver antes de añadir');
  if (matches.length > 1) throw new Error('Identidad ambigua: resolver duplicados antes de incorporar');
  const h = matches[0] ?? hash(`externo:${key}`).slice(0, 26);
  const existe = m.registros.find(r => r.h === h);
  const propuesta = entrada.registro?.cp;
  if (!propuesta || propuesta.estado !== 'confirmada') throw new Error('Falta clasificación de campaña confirmada');
  const cp = { ...propuesta, registro: h, origen: existe && existe.k !== 'externo' ? 'sentione' : 'complementaria' };
  if (validarCampana(cp, h).length) throw new Error('Clasificación de campaña inválida');
  if (matches.length && !existe) throw new Error('Índice inconsistente con la base');
  if (existe) {
    const comparable = ({ prev, ...rest }) => rest;
    const igual = existe.cp && JSON.stringify(comparable(cp)) === JSON.stringify(comparable(existe.cp));
    if (['manual', 'validacion_usuario'].includes(existe.cp?.fuente) && !igual && cp.fuente !== 'validacion_usuario') throw new Error('Decisión manual de campaña protegida');
    // No duplicar ni sumar métricas de dos capturas de la misma publicación.
    return { maestra: { ...m, version: 2, registros: m.registros.map(r => r.h === h ? { ...r, cp: igual ? r.cp : { ...cp, ...(r.cp ? { prev: r.cp } : {}) }, capturas: [...new Set([...(r.capturas ?? ['sentione']), 'complementaria'])] } : r) }, indice, nuevo: false, h };
  }
  const r = entrada.registro;
  if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.d) || !r.p || r.cp?.estado !== 'confirmada') throw new Error('Faltan registro, fecha, plataforma o campaña confirmada');
  // Lista cerrada: ni la URL ni el texto usados para verificar se serializan.
  const nuevo = { h, k: 'externo', d: r.d, t: r.t ?? null, p: r.p, so: 'sin_clasificar', capturas: ['complementaria'], ...(r.tp ? { tp: r.tp } : {}), ...(r.c ? { c: r.c } : {}), cp };
  return { maestra: { ...m, version: 2, registros: [...m.registros, nuevo] }, indice: { ...indice, publicaciones: { ...indice.publicaciones, [key]: [h] } }, nuevo: true, h };
}
