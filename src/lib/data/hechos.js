// Hechos medidos: frases con cifras calculadas en el momento a partir de los resultados.
// Son la parte «hecho medido» de cada hallazgo; las interpretaciones editoriales viven en
// src/content/conclusiones.js y nunca se generan aquí.
// Reglas de redacción: cada porcentaje dice su denominador; «menciones» no son personas
// alcanzadas; el sentimiento es el tono hacia el tema, no favorabilidad hacia una marca; las
// cifras bajo el umbral de publicación se expresan como «menos de N».
import { FILTROS_VACIOS, MUESTRA_MINIMA, dailyTotals, diasCubiertos, growth, marcasView, peaks, periodStats, tieneBaseMaestra, umbral, view } from './resultados.js';
import { EVENTO, PERIODO_PREVIO, PERIODOS_IMPACTO } from '../../config/periodos.js';
import { LABORATORIOS, entidad } from '../../config/marcas.js';
import { PATRONES_SENTIMIENTO } from '../../config/patrones.js';
import { nombreTema } from '../../config/clasificacion.js';
import { formatDecimal, formatNumber, formatOne, formatPct } from '../format.js';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const parte = (s) => {
  const [, m, d] = s.split('-').map(Number);
  return { d, m: MESES[m - 1] };
};
export const diaTexto = (s) => {
  const p = parte(s);
  return `${p.d} de ${p.m}`;
};
export const rangoTexto = (a, b) => {
  const x = parte(a);
  const y = parte(b);
  return x.m === y.m ? `del ${x.d} al ${y.d} de ${y.m}` : `del ${x.d} de ${x.m} al ${y.d} de ${y.m}`;
};
const pct = (a, b) => (b ? (a / b) * 100 : 0);
// Los nombres de plataforma propios (Facebook, X…) se mantienen; los genéricos van en minúscula.
const nombreComun = (n) => (/^(Sitios web|Video|Blogs|Foros|Podcast y radio|Otras fuentes)$/.test(n) ? n.toLowerCase() : n);
const lista = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
const cuenta = (v, k) => (v == null ? `menos de ${k}` : formatNumber(v));
const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Devuelve { id: { disponible, tipo, cifra, unidad, texto, estado? } } para el periodo previo
 * al concierto y, si existen datos posteriores, para el impacto. Con clasificación por contenido,
 * sentimiento, temáticas, barreras y marcas se miden solo en las menciones que hablan de cáncer de mama.
 */
export function hechos(res, hoy = '2026-10-21') {
  const F = { ...FILTROS_VACIOS, ...PERIODO_PREVIO };
  const FT = { ...F, segmento: 'todas' };
  const k = umbral(res);
  const st = periodStats(res, FT);
  const out = {};
  const no = (estado = 'medicion') => ({ disponible: false, estado });
  const base = tieneBaseMaestra(res) && diasCubiertos(res, F.desde, F.hasta) > 0;
  const unidad = { 'base-maestra': 'menciones únicas', mixta: 'menciones', referencia: 'registros' }[st?.fuente] ?? 'registros';
  // Universo captado por la consulta y menciones que hablan realmente de cáncer de mama.
  const v = view(res, FT);
  const vr = view(res, F);
  const conRelevancia = base && v.clasificados >= MUESTRA_MINIMA && vr.registros > 0;
  const rango = st ? rangoTexto(st.desde, st.hasta) : '';
  const corte = st && st.hasta < F.hasta ? ` (corte de datos; el periodo previo al concierto llega hasta el ${diaTexto(F.hasta)})` : '';

  // Volumen y comportamiento: la medida principal son las menciones que hablan de cáncer de mama.
  const sr = conRelevancia ? periodStats(res, F) : null;
  const diasRel = conRelevancia ? dailyTotals(res, F) : null;
  const maxRel = diasRel ? diasRel.filter((x) => x.v != null).sort((a, b) => b.v - a.v)[0] : null;
  if (sr) {
    const g = growth(res, F);
    out.volumen = {
      disponible: true,
      tipo: 'medido',
      cifra: formatNumber(sr.total),
      unidad: `menciones sobre cáncer de mama ${rango}`,
      texto:
        `${mayus(rango)}${corte}, ${formatNumber(sr.total)} menciones hablaron realmente de cáncer de mama: ${formatDecimal(sr.promedioDiario)} por día` +
        (g.ok ? `, frente a ${formatOne(g.anterior.promedioDiario)} ${rangoTexto(g.anterior.desde, g.anterior.hasta)} (${formatPct(g.pct, true)})` : '') +
        `. La mediana diaria fue ${formatOne(sr.mediana)} y el máximo, ${formatNumber(maxRel.v)} el ${diaTexto(maxRel.d)}. Son menciones, no personas alcanzadas.`,
      stats: sr,
      crecimiento: g.ok ? g.pct : null,
      maximo: maxRel,
    };
  } else if (st) {
    const g = growth(res, FT);
    out.volumen = {
      disponible: true,
      tipo: base ? 'medido' : 'referencia',
      cifra: formatDecimal(st.promedioDiario),
      unidad: `${unidad} captadas por día`,
      texto:
        `${mayus(rango)}${corte} la consulta captó ${formatNumber(st.total)} ${unidad}: ${formatDecimal(st.promedioDiario)} por día` +
        (g.ok ? `, frente a ${formatOne(g.anterior.promedioDiario)} ${rangoTexto(g.anterior.desde, g.anterior.hasta)} (${formatPct(g.pct, true)})` : '') +
        `. La mediana diaria fue ${formatOne(st.mediana)}. Son menciones, no personas alcanzadas.`,
    };
  } else out.volumen = no();

  // Universo captado: contexto metodológico, nunca medida principal.
  if (conRelevancia) {
    const { si, dudosa, no: ruido, pendiente } = v.relevancia;
    out.universo = {
      disponible: true,
      tipo: 'medido',
      cifra: formatNumber(v.universo),
      unidad: 'menciones captadas por la consulta',
      texto:
        `La consulta captó ${formatNumber(v.universo)} menciones ${rango}; la medición principal usa las ${formatNumber(si)} que hablan de cáncer de mama` +
        ` y deja fuera ${lista([ruido != null && `${formatNumber(ruido)} de ruido`, dudosa != null && `${formatNumber(dudosa)} contextuales o dudosas`, pendiente ? `${formatNumber(pendiente)} aún sin clasificar` : null].filter(Boolean))}.`,
    };
  } else out.universo = no('analisis');

  // Relevancia: qué parte de lo que capta la consulta habla realmente de cáncer de mama.
  if (conRelevancia) {
    const { si, dudosa, no: ajenas, pendiente } = v.relevancia;
    out.relevancia = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(si, v.clasificados)),
      unidad: `de ${formatNumber(v.clasificados)} menciones clasificadas habla realmente de cáncer de mama`,
      texto:
        `${mayus(rango)}, de ${formatNumber(v.clasificados)} menciones clasificadas por contenido, ${formatNumber(si)} (${formatPct(pct(si, v.clasificados))}) hablan realmente de cáncer de mama` +
        (dudosa != null ? `; ${formatNumber(dudosa)} (${formatPct(pct(dudosa, v.clasificados))}) son contextuales o dudosas` : '') +
        (ajenas != null ? ` y ${formatNumber(ajenas)} (${formatPct(pct(ajenas, v.clasificados))}) son ruido que no aporta sobre la enfermedad` : '') +
        `.${pendiente ? ` Otras ${formatNumber(pendiente)} de las ${formatNumber(v.universo)} captadas aún no se han clasificado.` : ''}`,
    };
  } else out.relevancia = no('analisis');

  // Picos de la conversación sobre cáncer de mama (o del universo si aún no hay clasificación).
  const diasPico = diasRel ?? dailyTotals(res, FT);
  const pk = peaks(diasPico);
  const totalPico = sr?.total ?? st?.total;
  if (totalPico && pk.length >= 1) {
    const [top, ...resto] = pk;
    const grupo = sr ? 'menciones sobre cáncer de mama' : `${unidad} captadas`;
    out.picos = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(top.v, totalPico)),
      unidad: `de las ${formatNumber(totalPico)} ${grupo}, en un solo día`,
      texto:
        `El ${diaTexto(top.d)} (${formatNumber(top.v)}) reúne el ${formatPct(pct(top.v, totalPico))} de las ${formatNumber(totalPico)} ${grupo} ${rango}.` +
        (resto.length ? ` También destacan ${lista(resto.map((x) => `el ${diaTexto(x.d)} (${formatNumber(x.v)})`))}.` : ''),
      dias: pk,
    };
  } else out.picos = no();

  // Plataformas: primero la conversación sobre cáncer de mama; el universo, como contexto.
  const platU = v.plataformas.items.filter((x) => x.id !== 'otras');
  if (conRelevancia && vr.plataformas.items.length >= 2) {
    const [a, b] = vr.plataformas.items;
    out.plataformas = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(a.v + b.v, vr.registros)),
      unidad: `de ${formatNumber(vr.registros)} menciones sobre cáncer de mama, en ${nombreComun(a.nombre)} y ${nombreComun(b.nombre)}`,
      texto:
        `De ${formatNumber(vr.registros)} menciones que hablan de cáncer de mama, se publicaron ${lista(vr.plataformas.items.slice(0, 3).map((x) => `${formatNumber(x.v)} (${formatPct(pct(x.v, vr.registros))}) en ${nombreComun(x.nombre)}`))}.` +
        (platU.length >= 2 ? ` En el universo captado (${formatNumber(v.universo)}) dominan ${nombreComun(platU[0].nombre)} (${formatNumber(platU[0].v)}) y ${nombreComun(platU[1].nombre)} (${formatNumber(platU[1].v)}), impulsados por comentarios ajenos al tema.` : ''),
    };
  } else if (platU.length >= 2) {
    const [a, b] = platU;
    const totalPlat = v.plataformas.items.reduce((s, x) => s + x.v, 0);
    out.plataformas = {
      disponible: true,
      tipo: base ? 'medido' : 'referencia',
      cifra: formatPct(pct(a.v + b.v, totalPlat)),
      unidad: `en ${a.nombre.toLowerCase()} y ${b.nombre.toLowerCase()}`,
      texto: `${a.nombre} (${formatNumber(a.v)}) y ${b.nombre} (${formatNumber(b.v)}) concentran el ${formatPct(pct(a.v + b.v, totalPlat))} de ${formatNumber(totalPlat)} ${unidad} del periodo.`,
    };
  } else out.plataformas = no();

  // Sentimiento: tono hacia el tema en las menciones relevantes; sin clasificación, referencia de SentiOne.
  if (conRelevancia) {
    const s = vr.sentimiento.items;
    const n = vr.registros;
    const top = s[0];
    out.sentimiento = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(top.v, n)),
      unidad: `${top.nombre.toLowerCase()}, de ${formatNumber(n)} menciones sobre cáncer de mama`,
      texto:
        `De ${formatNumber(n)} menciones que hablan de cáncer de mama, ${lista(s.map((x) => `${formatPct(pct(x.v, n))} ${x.id === 'otras' ? x.agrupa.join(' o ').toLowerCase() : x.nombre.toLowerCase()}`))}. ` +
        'Es el tono hacia el tema, no una medida de favorabilidad hacia MSD ni hacia ningún laboratorio.',
    };
  } else {
    const ref = res.base?.distribuciones?.sentimiento;
    const tot = ref ? Object.values(ref).reduce((a, b) => a + b, 0) : 0;
    out.sentimiento = ref?.sin_clasificar
      ? {
          disponible: true,
          tipo: 'referencia',
          cifra: formatPct(pct(ref.sin_clasificar, tot)),
          unidad: 'sin clasificar por SentiOne',
          texto: `La clasificación automática de SentiOne dejó sin sentimiento el ${formatPct(pct(ref.sin_clasificar, tot))} de los registros (${formatNumber(ref.sin_clasificar)} de ${formatNumber(tot)}). El análisis por contenido sustituirá esta referencia.`,
        }
      : no();
  }

  // Temáticas y barreras (solo con clasificación por contenido).
  if (conRelevancia) {
    const temas = vr.temas.items;
    const top = temas.slice(0, 3);
    out.temas = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(top[0]?.v ?? 0, vr.registros)),
      unidad: `${top[0] ? top[0].nombre.toLowerCase() : ''}, de ${formatNumber(vr.registros)} menciones sobre cáncer de mama`,
      texto: `En las ${formatNumber(vr.registros)} menciones que hablan de cáncer de mama, las temáticas principales son ${lista(top.map((t) => `${t.nombre.toLowerCase()} (${formatNumber(t.v)}; ${formatPct(pct(t.v, vr.registros))})`))}. Una mención puede tener varias temáticas.`,
    };
    const tema = (id) => temas.find((t) => t.id === id)?.v ?? (vr.temas.menores.includes(nombreTema(id)) ? null : 0);
    const [acc, bar] = [tema('acceso_sistema_salud'), tema('barreras_atencion')];
    out.barreras = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(acc ?? 0, vr.registros)),
      unidad: `${nombreTema('acceso_sistema_salud').toLowerCase()}, de ${formatNumber(vr.registros)} menciones sobre cáncer de mama`,
      texto: `${cuenta(acc, k)} de las ${formatNumber(vr.registros)} menciones sobre cáncer de mama${acc != null ? ` (${formatPct(pct(acc, vr.registros))})` : ''} hablan de ${nombreTema('acceso_sistema_salud').toLowerCase()} y ${cuenta(bar, k)}${bar != null ? ` (${formatPct(pct(bar, vr.registros))})` : ''} de ${nombreTema('barreras_atencion').toLowerCase()}. Una mención puede tener ambas temáticas.`,
    };
  } else {
    out.temas = no('analisis');
    out.barreras = no('analisis');
  }

  // Calidad de la clasificación: lo que tiene confianza baja queda sujeto a revisión.
  if (base && res.totales.clasificados) {
    const t = res.totales;
    out.calidad = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(t.revisar, t.clasificados)),
      unidad: 'de las clasificaciones, sujetas a revisión',
      texto: `${formatNumber(t.revisar)} de ${formatNumber(t.clasificados)} menciones clasificadas en toda la base (${formatPct(pct(t.revisar, t.clasificados))}) tienen confianza baja y quedan sujetas a revisión${vr.revisar != null ? `; ${formatNumber(vr.revisar)} de ellas` : `; menos de ${k} de ellas`} están entre las menciones sobre cáncer de mama del periodo.`,
    };
  } else out.calidad = no('analisis');

  // Preocupaciones y emociones: lo negativo se concentra en barreras de acceso.
  if (conRelevancia) {
    const neg = vr.sentimiento.items.find((x) => x.id === 'negativo');
    const barreras = vr.patrones.negativo_barreras;
    const emo = vr.emociones.items.filter((x) => !['no_identificable', 'otras'].includes(x.id)).slice(0, 3);
    out.preocupaciones = {
      disponible: true,
      tipo: 'medido',
      cifra: neg ? formatPct(pct(neg.v, vr.registros)) : `< ${k}`,
      unidad: `de ${formatNumber(vr.registros)} menciones sobre cáncer de mama son negativas`,
      texto:
        (neg ? `${formatNumber(neg.v)} de las ${formatNumber(vr.registros)} menciones (${formatPct(pct(neg.v, vr.registros))}) tienen un tono negativo` : `Menos de ${k} menciones tienen un tono negativo`) +
        (barreras != null && neg ? ` y ${formatNumber(barreras)} de ellas hablan de barreras o de acceso a la atención` : '') +
        `. Las emociones más frecuentes son ${lista(emo.map((x) => `${x.nombre.toLowerCase()} (${formatPct(pct(x.v, vr.registros))})`))}.`,
    };
    // Ejemplos representativos: solo los patrones que alcanzan el umbral.
    out.ejemplos = {
      disponible: true,
      tipo: 'medido',
      patrones: Object.fromEntries(PATRONES_SENTIMIENTO.map((p) => [p.id, vr.patrones[p.id] ?? null])),
      total: vr.registros,
    };
  } else {
    out.preocupaciones = no('analisis');
    out.ejemplos = no('analisis');
  }

  // MSD y marcas: presencia en esta consulta, nunca Share of Voice.
  if (base) {
    const [msd] = marcasView(res, F, ['msd']);
    out.msd = {
      disponible: true,
      tipo: 'medido',
      cifra: msd.todas == null ? `< ${k}` : formatNumber(msd.todas),
      unidad: `menciones explícitas de MSD entre ${formatNumber(v.universo)} captadas`,
      texto:
        `MSD aparece de forma explícita en ${cuenta(msd.todas, k)} de las ${formatNumber(v.universo)} menciones captadas ${rango}` +
        (conRelevancia ? ` y en ${cuenta(msd.relevantes, k)} de las ${formatNumber(vr.registros)} que hablan de cáncer de mama` : '') +
        '. Refleja presencia en esta consulta, no la conversación pública total sobre MSD.',
    };
    // Laboratorios: todos los del catálogo con presencia verificada en la conversación relevante.
    const labs = marcasView(res, F, LABORATORIOS.map((l) => l.id)).filter((x) => x.relevantes !== 0);
    const conCifra = labs.filter((x) => x.relevantes != null).sort((a, b) => b.relevantes - a.relevantes);
    const menores = labs.filter((x) => x.relevantes == null).map((x) => entidad(x.id).nombre).sort((a, b) => a.localeCompare(b, 'es'));
    out.marcas = {
      disponible: true,
      tipo: 'medido',
      texto:
        `Laboratorios nombrados en ${conRelevancia ? `las ${formatNumber(vr.registros)} menciones sobre cáncer de mama` : 'la base'}: ` +
        lista([...conCifra.map((x) => `${entidad(x.id).nombre} ${formatNumber(x.relevantes)}`), ...(menores.length ? [`${lista(menores)}, con menos de ${k} cada uno`] : [])]) +
        '. Solo reflejan presencia en esta consulta, que no está diseñada para capturar a cada laboratorio con el mismo criterio: no son un Share of Voice representativo.',
      laboratorios: labs.map((x) => ({ id: x.id, nombre: entidad(x.id).nombre, n: x.relevantes })),
      // Temática principal de los laboratorios que alcanzan el umbral (un periodo base).
      temas: conRelevancia ? Object.fromEntries(Object.entries(vr.laboratorios).filter(([, l]) => l.tema).map(([id, l]) => [id, { ...l, temaNombre: nombreTema(l.tema) }])) : {},
    };
    if (conRelevancia && vr.conLaboratorio !== 0) {
      const t = vr.temasConLaboratorio;
      const top = t.items.filter((x) => x.id !== 'noticias').slice(0, 3);
      const menoresClave = ['historias_pacientes', 'apoyo_emocional', 'barreras_atencion'].map(nombreTema).filter((x) => t.menores.includes(x));
      out.laboratorios = {
        disponible: true,
        tipo: 'medido',
        cifra: vr.conLaboratorio == null ? `< ${k}` : formatPct(pct(vr.conLaboratorio, vr.registros)),
        unidad: `de ${formatNumber(vr.registros)} menciones sobre cáncer de mama nombran a algún laboratorio`,
        texto:
          `${vr.conLaboratorio == null ? `Menos de ${k}` : formatNumber(vr.conLaboratorio)} de las ${formatNumber(vr.registros)} menciones sobre cáncer de mama nombran a algún laboratorio.` +
          (top.length ? ` En conjunto hablan sobre todo de ${lista(top.map((x) => `${x.nombre.toLowerCase()} (${formatNumber(x.v)})`))}` : '') +
          (menoresClave.length ? `; ${lista(menoresClave.map((x) => x.toLowerCase()))} quedan por debajo de ${k}.` : '.'),
      };
    } else out.laboratorios = no('analisis');
  } else {
    out.msd = no('analisis');
    out.marcas = no('analisis');
    out.laboratorios = no('analisis');
  }

  // Impacto del concierto: solo con datos del 24 de octubre en adelante.
  const [antes, durante, despues] = PERIODOS_IMPACTO.map((p) => periodStats(res, { ...FT, desde: p.desde, hasta: p.hasta }));
  const post = diasCubiertos(res, PERIODOS_IMPACTO[1].desde, PERIODOS_IMPACTO[2].hasta);
  if (antes && post && (durante || despues)) {
    const partes = [];
    if (durante) partes.push(`el día del concierto se captaron ${formatNumber(durante.total)} menciones (${formatPct(pct(durante.promedioDiario - antes.promedioDiario, antes.promedioDiario), true)} frente al promedio diario previo)`);
    if (despues) partes.push(`en los días posteriores, ${formatDecimal(despues.promedioDiario)} por día (${formatPct(pct(despues.promedioDiario - antes.promedioDiario, antes.promedioDiario), true)})`);
    out.impacto = { disponible: true, tipo: 'medido', texto: `${partes.join('; ').replace(/^el/, 'El')}. Un cambio coincidente en el tiempo no demuestra por sí solo que lo haya causado el concierto.` };
  } else out.impacto = no(hoy < EVENTO.fecha ? 'evento' : 'medicion');

  return out;
}
