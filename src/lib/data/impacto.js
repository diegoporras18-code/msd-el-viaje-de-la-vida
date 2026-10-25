import { FILTROS_VACIOS, periodStats } from './resultados.js';
import { PERIODOS_IMPACTO } from '../../config/periodos.js';
import { addDays, isCovered } from './dates.js';

/** Compara solo menciones A y días cubiertos; nunca atribuye el volumen a la campaña. */
export function resumenImpacto(res) {
  const [antes, durante, despues] = PERIODOS_IMPACTO.map((p) =>
    periodStats(res, { ...FILTROS_VACIOS, desde: p.desde, hasta: p.hasta }),
  );
  const evento = PERIODOS_IMPACTO[1].desde;
  const reciente = periodStats(res, { ...FILTROS_VACIOS, desde: addDays(evento, -7), hasta: addDays(evento, -1) });
  const cambio = antes?.promedioDiario > 0 && durante
    ? (durante.promedioDiario / antes.promedioDiario - 1) * 100 : null;
  return {
    antes, durante, despues, reciente, cambio,
    disponible: Boolean(antes && durante && isCovered(res.cobertura, evento)),
    // Descripción de volumen, no una prueba de significancia ni de causalidad.
    superaPromedio: cambio == null ? null : cambio > 0,
  };
}
