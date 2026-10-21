// Fechas de análisis. Cambia aquí los periodos sin tocar componentes.

export const EVENTO = {
  fecha: '2026-10-24',
  // Franja horaria del concierto (hora de Bogotá) para resaltar en el gráfico horario.
  horas: { desde: 18, hasta: 23 },
};

export const RANGO_DEFECTO = { desde: '2026-10-01', hasta: '2026-10-31' };

export const LIMITES = { min: '2026-09-01', max: '2026-12-31' };

export const PRESETS = [
  { id: 'previo', nombre: 'Antes del concierto', desde: '2026-10-01', hasta: '2026-10-23' },
  { id: 'octubre', nombre: 'Octubre', desde: '2026-10-01', hasta: '2026-10-31' },
  { id: 'concierto', nombre: 'Semana del concierto', desde: '2026-10-24', hasta: '2026-10-31' },
  { id: 'todo', nombre: 'Todo', desde: '2026-09-21', hasta: '2026-10-31' },
];

// Comparación del impacto: duraciones distintas, se normalizan con promedios diarios.
export const PERIODOS_IMPACTO = [
  { id: 'antes', nombre: 'Antes', desde: '2026-10-01', hasta: '2026-10-23' },
  { id: 'durante', nombre: 'Durante', desde: '2026-10-24', hasta: '2026-10-24' },
  { id: 'despues', nombre: 'Después', desde: '2026-10-25', hasta: '2026-10-31' },
];

// Periodo «antes del concierto» que resumen la presentación y las conclusiones.
export const PERIODO_PREVIO = { desde: '2026-10-01', hasta: '2026-10-23' };
