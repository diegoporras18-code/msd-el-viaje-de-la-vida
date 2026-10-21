// Hechos medidos: frases con cifras calculadas en el momento a partir de los resultados.
// Son la parte «hecho medido» de cada hallazgo; las interpretaciones editoriales viven en
// src/content/conclusiones.js y nunca se generan aquí.
import { FILTROS_VACIOS, MUESTRA_MINIMA, dailyTotals, diasCubiertos, growth, peaks, periodStats, tieneBaseMaestra, view } from './resultados.js';
import { EVENTO, PERIODO_PREVIO, PERIODOS_IMPACTO } from '../../config/periodos.js';
import { BENCHMARK, entidad } from '../../config/marcas.js';
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
const lista = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);

/**
 * Devuelve { id: { disponible, tipo, cifra, unidad, texto, estado? } } para el periodo previo
 * al concierto y, si existen datos posteriores, para el impacto.
 */
export function hechos(res, hoy = '2026-10-21') {
  const F = { ...FILTROS_VACIOS, ...PERIODO_PREVIO };
  const st = periodStats(res, F);
  const out = {};
  const no = (estado = 'medicion') => ({ disponible: false, estado });
  const base = tieneBaseMaestra(res) && diasCubiertos(res, F.desde, F.hasta) > 0;
  const unidad = { 'base-maestra': 'menciones únicas', mixta: 'menciones', referencia: 'registros' }[st?.fuente] ?? 'registros';

  // Volumen y crecimiento normalizado.
  if (st) {
    const g = growth(res, F);
    out.volumen = {
      disponible: true,
      tipo: 'medido',
      cifra: formatDecimal(st.promedioDiario),
      unidad: `${unidad} por día`,
      texto:
        `${rangoTexto(st.desde, st.hasta).replace(/^del/, 'Del')} se registraron ${formatNumber(st.total)} ${unidad}: ${formatDecimal(st.promedioDiario)} por día` +
        (g.ok ? `, frente a ${formatOne(g.anterior.promedioDiario)} ${rangoTexto(g.anterior.desde, g.anterior.hasta)} (${formatPct(g.pct, true)})` : '') +
        `. La mediana diaria fue ${formatOne(st.mediana)}.`,
    };
  } else out.volumen = no();

  // Picos.
  const dias = dailyTotals(res, F);
  const pk = peaks(dias);
  if (st && pk.length >= 1) {
    const top = pk.slice(0, 2);
    const suma = top.reduce((a, x) => a + x.v, 0);
    const resto = pk.slice(2);
    out.picos = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(suma, st.total)),
      unidad: `del periodo en ${top.length === 1 ? 'un día' : 'dos días'}`,
      texto:
        `${lista(top.map((x) => `el ${diaTexto(x.d)} (${formatNumber(x.v)})`)).replace(/^el/, 'El')} ${top.length === 1 ? 'concentra' : 'concentran'} el ${formatPct(pct(suma, st.total))} de los ${unidad} del periodo.` +
        (resto.length ? ` También destacan ${lista(resto.map((x) => `el ${diaTexto(x.d)} (${formatNumber(x.v)})`))}.` : ''),
      dias: pk,
    };
  } else out.picos = no();

  // Plataformas.
  const v = view(res, F);
  if (v.plataformas.length >= 2) {
    const [a, b] = v.plataformas;
    const totalPlat = v.plataformas.reduce((s, x) => s + x.v, 0);
    out.plataformas = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(a.v + b.v, totalPlat)),
      unidad: `en ${a.nombre.toLowerCase()} y ${b.nombre.toLowerCase()}`,
      texto: `${a.nombre} (${formatNumber(a.v)}) y ${b.nombre} (${formatNumber(b.v)}) concentran el ${formatPct(pct(a.v + b.v, totalPlat))} de la conversación del periodo.`,
    };
  } else out.plataformas = no();

  // Sentimiento: clasificado por contenido si hay muestra suficiente; si no, referencia de SentiOne.
  if (v.clasificados >= MUESTRA_MINIMA) {
    const cl = v.sentimiento.filter((s) => s.id !== 'pendiente');
    const n = cl.reduce((a, s) => a + s.v, 0);
    out.sentimiento = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(cl[0].v, n)),
      unidad: cl[0].nombre.toLowerCase(),
      texto: `De ${formatNumber(n)} menciones clasificadas por contenido, ${lista(cl.map((s) => `${formatPct(pct(s.v, n))} ${s.nombre.toLowerCase()}`))}.`,
    };
  } else {
    const vo = view(res, { ...F, tipoSentimiento: 'original' });
    const sc = vo.sentimiento.find((s) => s.id === 'sin_clasificar');
    const tot = vo.sentimiento.reduce((a, s) => a + s.v, 0);
    out.sentimiento = sc
      ? {
          disponible: true,
          tipo: 'referencia',
          cifra: formatPct(pct(sc.v, tot)),
          unidad: 'sin clasificar por SentiOne',
          texto: `La clasificación automática de SentiOne dejó sin sentimiento el ${formatPct(pct(sc.v, tot))} de los registros (${formatNumber(sc.v)} de ${formatNumber(tot)}). El análisis por contenido sustituirá esta referencia.`,
        }
      : no();
  }

  // Temáticas y barreras (solo con clasificación por contenido).
  if (v.clasificados >= MUESTRA_MINIMA) {
    const top = v.temas.slice(0, 3);
    out.temas = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(top[0]?.v ?? 0, v.clasificados)),
      unidad: top[0] ? top[0].nombre.toLowerCase() : '',
      texto: `Las temáticas principales son ${lista(top.map((t) => `${t.nombre.toLowerCase()} (${formatPct(pct(t.v, v.clasificados))})`))} de las menciones clasificadas. Una mención puede tener varias temáticas.`,
    };
    const barreras = res.cubo
      .filter((r) => r.cl && r.d >= F.desde && r.d <= F.hasta && (r.tm ?? []).some((t) => t === 'barreras_atencion' || t === 'acceso_sistema_salud'))
      .reduce((a, r) => a + r.n, 0);
    out.barreras = {
      disponible: true,
      tipo: 'medido',
      cifra: formatPct(pct(barreras, v.clasificados)),
      unidad: 'habla de barreras o acceso',
      texto: `${formatNumber(barreras)} menciones (${formatPct(pct(barreras, v.clasificados))} de las clasificadas) hablan de ${nombreTema('barreras_atencion').toLowerCase()} o de ${nombreTema('acceso_sistema_salud').toLowerCase()}.`,
    };
  } else {
    out.temas = no('analisis');
    out.barreras = no('analisis');
  }

  // MSD y marcas (requieren registros individuales de la base maestra).
  if (base) {
    const msd = v.marcas.find((m) => m.id === 'msd')?.v ?? 0;
    out.msd = {
      disponible: true,
      tipo: 'medido',
      cifra: formatNumber(msd),
      unidad: 'menciones explícitas de MSD',
      texto: msd
        ? `MSD aparece de forma explícita en ${formatNumber(msd)} de ${formatNumber(v.registros)} menciones (${formatPct(pct(msd, v.registros))}).`
        : `No se identificaron menciones explícitas de MSD entre ${formatNumber(v.registros)} menciones del periodo.`,
    };
    const labs = BENCHMARK.map((id) => ({ id, v: v.marcas.find((m) => m.id === id)?.v ?? 0 }));
    out.marcas = {
      disponible: true,
      tipo: 'medido',
      texto: `Menciones explícitas en la base: ${lista(labs.map((x) => `${entidad(x.id).nombre} ${formatNumber(x.v)}`))}. La consulta no está diseñada para capturar a cada laboratorio con el mismo criterio, por lo que estas cifras no equivalen a su conversación pública total.`,
    };
  } else {
    out.msd = no('analisis');
    out.marcas = no('analisis');
  }

  // Impacto del concierto: solo con datos del 24 de octubre en adelante.
  const [antes, durante, despues] = PERIODOS_IMPACTO.map((p) => periodStats(res, { ...FILTROS_VACIOS, desde: p.desde, hasta: p.hasta }));
  const post = diasCubiertos(res, PERIODOS_IMPACTO[1].desde, PERIODOS_IMPACTO[2].hasta);
  if (antes && post && (durante || despues)) {
    const partes = [];
    if (durante) partes.push(`el día del concierto se registraron ${formatNumber(durante.total)} menciones (${formatPct(pct(durante.promedioDiario - antes.promedioDiario, antes.promedioDiario), true)} frente al promedio diario previo)`);
    if (despues) partes.push(`en los días posteriores, ${formatDecimal(despues.promedioDiario)} por día (${formatPct(pct(despues.promedioDiario - antes.promedioDiario, antes.promedioDiario), true)})`);
    out.impacto = { disponible: true, tipo: 'medido', texto: `${partes.join('; ').replace(/^el/, 'El')}. Un cambio coincidente en el tiempo no demuestra por sí solo que lo haya causado el concierto.` };
  } else out.impacto = no(hoy < EVENTO.fecha ? 'evento' : 'medicion');

  return out;
}
