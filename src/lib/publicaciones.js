// Publicaciones públicas verificadas de un laboratorio: las captadas en la escucha social
// (src/content/publicaciones.js) y las referencias externas adicionales del capítulo 05.
// Es una selección curada: no es un recuento y no se cruza con las cifras protegidas.
import { PUBLICACIONES } from '../content/publicaciones.js';
import { benchmark } from '../content/benchmark.js';

const recientes = (a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '');

export const EXTERNAS = benchmark.referencias.items
  .filter((r) => r.estado === 'verificado' && r.laboratorios?.length)
  .map((r) => ({
    id: r.id,
    laboratorios: r.laboratorios,
    emisor: r.emisor,
    formato: r.nombre,
    medio: r.fuente.nombre,
    pais: r.pais,
    fecha: r.fecha ?? null,
    tema: r.tema,
    descripcion: r.descripcion,
    url: r.fuente.url,
  }));

export function publicacionesDe(id) {
  const escucha = PUBLICACIONES.filter((p) => p.laboratorios.includes(id)).sort(recientes);
  const externas = EXTERNAS.filter((p) => p.laboratorios.includes(id)).sort(recientes);
  return { escucha, externas, total: escucha.length + externas.length };
}
