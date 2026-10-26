// Control privado: nunca importar desde componentes ni publicar filas individuales.
import { clasificado } from './maestra.js';
export function conciliarConcierto(maestra, cola, { previo = '2026-10-23', dia = '2026-10-24' } = {}) {
  const porH = new Map(maestra.registros.map(r => [r.h, r]));
  const sentione = d => maestra.registros.filter(r => r.d === d && (r.k !== 'externo' || r.capturas?.includes('sentione')));
  const a = rs => rs.filter(r => clasificado(r) && r.c.rel === 'si').length;
  const s23 = sentione(previo), s24 = sentione(dia);
  const manuales = (cola?.items ?? []).filter(x => x.validacionEditorial?.estado === 'confirmada').map(x => {
    const r = porH.get(x.registro);
    const faltan = x.pendientesTecnicos ?? (r ? ['texto_verificable', 'clasificacion_tematica', 'metricas_si_disponibles'] : ['identidad_canonica_y_deduplicacion', 'fecha_hora_y_zona', 'texto_verificable', 'clasificacion_tematica', 'metricas_si_disponibles']);
    return { id: x.id, plataforma: x.plataforma, procedencia: 'captura_manual_validada', incorporada: !!r, fecha: r?.d ?? null,
      fuenteFecha: x.fechaTecnica?.fuente ?? null, fechaVerificadaEnPlataforma: x.fechaTecnica?.verificadaEnPlataforma ?? false,
      duplicadaSentiOne: r ? r.k !== 'externo' || !!r.capturas?.includes('sentione') : null,
      tema: r && clasificado(r) ? r.c.rel : null, registro: r?.h ?? null, faltan };
  });
  const identificadas = [...new Map(manuales.filter(x => x.registro).map(x => [x.registro, x])).values()];
  const del24 = identificadas.filter(x => x.fecha === dia);
  const combinados = [...new Map([...s24, ...del24.map(x => porH.get(x.registro))].map(r => [r.h, r])).values()];
  const relevantes = a(combinados), previas = a(s23);
  return { version: 1, previo, dia,
    sentione23: { total: s23.length, relevantes: previas }, sentione24: { total: s24.length, relevantes: a(s24) },
    manualesCampana: manuales.length, manualesFechadas24: del24.length,
    duplicadasSentiOne: { confirmadas: manuales.filter(x => x.duplicadaSentiOne === true).length, sinResolver: manuales.filter(x => x.duplicadaSentiOne == null).length },
    manualesA: { confirmadas: identificadas.filter(x => x.tema === 'si').length, sinClasificar: manuales.filter(x => x.tema == null).length },
    totalUnicoCombinado24: combinados.length, totalRelevanteCombinado24: relevantes,
    pendientesClasificacion24: combinados.filter(r => !clasificado(r)).length,
    manualesSinFecha: manuales.filter(x => !x.fecha).length,
    variacionRelevanteVs23: previas > 0 ? (relevantes / previas - 1) * 100 : null,
    conciliacionCompleta: manuales.every(x => x.fecha && x.duplicadaSentiOne != null && x.tema != null),
    nota: 'Totales comprobados en la base actual, no cierre de la captura manual. Fecha derivada de ID no equivale a verificación en plataforma. Relevancia desconocida no equivale a no relevante.',
    manuales };
}
