// Pertenencia a consultas; nunca decide relevancia temática ni guarda texto o autores.
const normal = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');

export function coincideConsultaEnfocada(local, consulta) {
  if (!Array.isArray(consulta?.cualquiera) || !consulta.cualquiera.length) throw new Error('Falta la consulta enfocada en alcances.consultas.');
  const autor = normal(local?.autor);
  if ((consulta.excluirAutor ?? []).some(x => autor.includes(normal(x)))) return false;
  const campos = [local?.texto, local?.contexto, local?.autor].map(normal);
  return consulta.cualquiera.some(regla => {
    if (!Array.isArray(regla) || !regla.length || regla.some(x => typeof x !== 'string' || !x.trim())) throw new Error('Regla de alcance inválida.');
    return regla.every(termino => campos.some(campo => campo.includes(normal(termino))));
  });
}

/** Acumula pertenencia sin retirar registros ya observados en ninguna consulta. */
export function actualizarAlcances(alcances, procesados) {
  if (alcances?.version !== 1 || !alcances.registros || typeof alcances.registros !== 'object') throw new Error('Formato de alcances inválido.');
  const registros = { ...alcances.registros };
  for (const r of procesados) {
    if (!r.h || !r._local) throw new Error('La actualización de alcances necesita registros procesados con contenido local.');
    const anterior = registros[r.h] ?? {};
    registros[r.h] = { ...anterior,
      enfocada: anterior.enfocada === true || coincideConsultaEnfocada(r._local, alcances.consultas?.enfocada),
      amplia: true,
      metodo: anterior.metodo ?? 'reconstruccion_local_consulta_sin_acentos',
    };
  }
  return { ...alcances, registros };
}

/** La omisión de una huella debe resolverse antes de publicar, nunca excluirla en silencio. */
export function maestraPorAlcance(maestra, alcances, alcance) {
  if (!['enfocada', 'amplia'].includes(alcance) || alcances?.version !== 1 || !alcances.registros) throw new Error('Alcance inválido.');
  const faltantes = maestra.registros.filter(r => !alcances.registros[r.h] && r.k !== 'externo');
  if (faltantes.length) throw new Error(`Falta pertenencia de consulta para ${faltantes.length} registros; reconstruye maestra/alcances.json antes de publicar.`);
  return { ...maestra, registros: maestra.registros.filter(r => alcances.registros[r.h]?.[alcance] === true || (r.k === 'externo' && !alcances.registros[r.h])) };
}
