// Lectura pública de agregados protegidos. No consulta registros ni infiere contenido multimedia.
export function estadoComplementarias(res) {
  const e = res.campana?.complementarias;
  if (!e) return 'La captura complementaria aún no tiene un estado de verificación publicado.';
  if (e.total === 0) return 'No hay publicaciones complementarias registradas.';
  if (e.verificadas == null || e.pendientes == null) return 'Hay publicaciones complementarias en revisión; el desglose se protege por muestra pequeña. Solo las verificadas e incorporadas pueden sumar a la campaña.';
  return `${e.total ?? 'Las'} publicaciones complementarias registradas: ${e.verificadas} verificadas y ${e.pendientes} pendientes${e.descartadas ? `; ${e.descartadas} descartadas` : ''}. Las pendientes no se suman a las métricas.`;
}

export function vistaCampana(res, periodo = 'durante') {
  const c = res.campana;
  if (!c) return { disponible: false, confirmadas: null, ambos: null, porcentajeCausa: null, pico: 'sin_auditoria' };
  const p = c.periodos.find(x => x.id === periodo);
  const confirmadas = p?.confirmadas ?? null;
  const inter = p?.interseccion;
  const ambos = confirmadas === 0 ? 0 : inter?.v?.ambos ?? (inter && !inter.otras?.ids.includes('ambos') ? 0 : null);
  const previos = c.diario.filter(x => x.d >= '2026-10-01' && x.d <= '2026-10-23');
  const dia = c.diario.find(x => x.d === '2026-10-24');
  const comparable = previos.length === 23 && previos.every(x => x.archivoEvaluadoCompleto && x.confirmadas != null) && dia?.archivoEvaluadoCompleto && dia.confirmadas != null;
  const promedioPrevio = comparable ? previos.reduce((n,x) => n + x.confirmadas, 0) / 23 : null;
  return { disponible: true, confirmadas, ambos,
    porcentajeCausa: confirmadas >= res.umbral && ambos != null ? ambos / confirmadas * 100 : null,
    evaluadas: c.evaluadas, cobertura: c.cobertura,
    // La cobertura de captura está reconocida como parcial: ni un archivo auditado entero prueba exhaustividad.
    pico: comparable && promedioPrevio > 0 ? (dia.confirmadas > promedioPrevio ? 'aumento_en_archivo' : 'sin_aumento_en_archivo') : 'no_comparable',
    promedioPrevio, serie: c.diario, complementarias: estadoComplementarias(res) };
}
