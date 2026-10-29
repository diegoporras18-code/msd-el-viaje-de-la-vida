// Segunda dimensión privada: nunca sustituye ni deriva la clasificación temática A/B/C.
export const CAMPANA_VERSION = 2;
export const ESTADOS_CAMPANA = ['confirmada', 'posible', 'no_relacionada'];
export const EVIDENCIAS_CAMPANA = ['texto_identifica_iniciativa', 'contexto_exportado_identifica_iniciativa', 'evento_identificado', 'original_verificado', 'captura_verificada', 'evento_sin_vinculo_msd', 'homonimo', 'otra_actividad', 'solo_enlace_relacionado', 'sin_vinculo_en_contenido', 'contexto_otra_actividad', 'contenido_insuficiente', 'vinculo_validado_usuario', 'concierto_sin_vinculo_campana'];
export const VINCULOS_CAMPANA = ['asistente', 'organizador', 'aliado', 'artista', 'medio', 'tercero', 'indeterminado'];
export const TEMAS_CAMPANA = ['experiencia', 'convocatoria', 'concientizacion', 'amplificacion', 'informacion_evento', 'otro'];
const PRUEBA_CONFIRMADA = new Set(['texto_identifica_iniciativa', 'contexto_exportado_identifica_iniciativa', 'original_verificado', 'captura_verificada', 'vinculo_validado_usuario']);

export function validarCampana(c, h) {
  const e = [];
  if (![1, CAMPANA_VERSION].includes(c?.version) || !ESTADOS_CAMPANA.includes(c.estado)) e.push('versión o estado de campaña inválido');
  if (c?.registro !== h) e.push('referencia de campaña no corresponde al registro');
  if (!['codex', 'manual', 'validacion_usuario'].includes(c?.fuente)) e.push('fuente de decisión de campaña inválida');
  if (!['sentione', 'complementaria'].includes(c?.origen)) e.push('origen de captura inválido');
  if (!Array.isArray(c?.evidencias) || !c.evidencias.length || c.evidencias.some(x => !EVIDENCIAS_CAMPANA.includes(x))) e.push('evidencias de campaña inválidas');
  if (!VINCULOS_CAMPANA.includes(c?.vinculo)) e.push('vínculo de campaña inválido');
  if (!Array.isArray(c?.temas) || c.temas.some(x => !TEMAS_CAMPANA.includes(x))) e.push('temas de campaña inválidos');
  if (typeof c?.confianza !== 'number' || c.confianza < 0 || c.confianza > 1) e.push('confianza de campaña inválida');
  if (!['pendiente', 'verificada', 'descartada'].includes(c?.revision)) e.push('revisión de campaña inválida');
  if (c?.estado === 'confirmada' && (c.revision !== 'verificada' || c.confianza < 0.8 || !c.evidencias?.some(x => PRUEBA_CONFIRMADA.has(x)))) e.push('campaña confirmada sin evidencia suficiente');
  if (c?.estado === 'posible' && c.revision !== 'pendiente') e.push('campaña posible debe seguir pendiente');
  if (c?.version >= 2 && c.estado === 'posible' && c.evidencias?.every(x => ['evento_sin_vinculo_msd', 'concierto_sin_vinculo_campana'].includes(x))) e.push('Una noticia genérica del concierto sin vínculo de campaña queda fuera');
  if (c?.estado === 'no_relacionada' && c.revision !== 'descartada') e.push('campaña no relacionada debe llevar revisión descartada');
  if (c?.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(c.fecha)) e.push('fecha de decisión inválida');
  const permitidos = ['version', 'registro', 'fuente', 'origen', 'evidencias', 'vinculo', 'temas', 'confianza', 'revision', 'estado', 'fecha', 'obsoleta', 'prev'];
  if (Object.keys(c ?? {}).some(k => !permitidos.includes(k))) e.push('campo no permitido en campaña');
  if (c?.prev) e.push(...validarCampana(c.prev, h));
  return e;
}

/** Migración aditiva v1→v2; conserva todos los objetos y clasificaciones originales. */
export function migrarMaestra(m) {
  if (![1, 2].includes(m.version)) throw new Error('Versión de base maestra no compatible');
  return { ...m, version: 2 };
}

export function aplicarAuditoriaCampana(m, decisiones, { fecha = new Date().toISOString().slice(0, 10) } = {}) {
  const by = new Map(m.registros.map(r => [r.h, r]));
  const vistos = new Set();
  for (const d of decisiones) {
    if (!by.has(d.h) || vistos.has(d.h)) throw new Error('Registro desconocido o repetido en auditoría de campaña');
    vistos.add(d.h);
    if (['manual', 'validacion_usuario'].includes(by.get(d.h).cp?.fuente) && !['manual', 'validacion_usuario'].includes(d.cp.fuente)) throw new Error('Decisión manual de campaña protegida');
    const errores = validarCampana(d.cp, d.h);
    if (errores.length) throw new Error(errores.join('; '));
  }
  const updates = new Map(decisiones.map(d => [d.h, d.cp]));
  return { ...migrarMaestra(m), registros: m.registros.map(r => {
    const cp = updates.get(r.h);
    if (!cp) return r;
    const comparable = ({ fecha, prev, ...rest }) => rest;
    const igual = r.cp && JSON.stringify(comparable(r.cp)) === JSON.stringify(comparable(cp));
    return { ...r, cp: igual ? r.cp : { ...cp, fecha, ...(r.cp ? { prev: r.cp } : {}) } };
  }) };
}
