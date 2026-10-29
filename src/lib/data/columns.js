import { normalizeText } from './text.js';

// Campos que el importador sabe leer. Los sinónimos cubren exportaciones de SentiOne
// en español e inglés; el mapeo siempre puede corregirse a mano.
export const CAMPOS = [
  { id: 'id', nombre: 'ID de la publicación', sinonimos: ['id', 'mention id', 'id mencion', 'id de la mencion', 'post id', 'identificador', 'id publicacion'] },
  { id: 'url', nombre: 'URL', sinonimos: ['url', 'link', 'enlace', 'permalink', 'address', 'direccion', 'mention url', 'url de la mencion'] },
  { id: 'fecha', nombre: 'Fecha', requerido: true, sinonimos: ['date', 'fecha', 'published', 'publication date', 'fecha de publicacion', 'created at', 'datetime', 'date published', 'published at', 'fecha y hora'] },
  { id: 'hora', nombre: 'Hora', sinonimos: ['time', 'hora', 'hour', 'publication time', 'hora de publicacion'] },
  { id: 'fuente', nombre: 'Fuente o plataforma', requerido: true, sinonimos: ['source', 'fuente', 'source type', 'tipo de fuente', 'platform', 'plataforma', 'channel', 'canal', 'medium', 'media type', 'source name'] },
  { id: 'dominio', nombre: 'Dominio', sinonimos: ['domain', 'dominio', 'site', 'sitio', 'host', 'website'] },
  { id: 'texto', nombre: 'Texto', sinonimos: ['text', 'texto', 'content', 'contenido', 'mention', 'mencion', 'message', 'mensaje', 'body', 'snippet', 'mention text'] },
  { id: 'contexto', nombre: 'Contexto (solo uso local)', sinonimos: ['context', 'contexto', 'mention context', 'parent content', 'contenido del contexto'] },
  { id: 'titulo', nombre: 'Título', sinonimos: ['title', 'titulo', 'headline'] },
  { id: 'autor', nombre: 'Autor (solo uso local)', sinonimos: ['author', 'autor', 'user', 'usuario', 'username', 'nombre de usuario', 'profile', 'perfil', 'author name'] },
  { id: 'sentimiento', nombre: 'Sentimiento', sinonimos: ['sentiment', 'sentimiento', 'tone', 'tono'] },
  { id: 'pais', nombre: 'País', sinonimos: ['country', 'pais', 'location', 'ubicacion'] },
  { id: 'idioma', nombre: 'Idioma', sinonimos: ['language', 'idioma', 'lang'] },
  { id: 'interacciones', nombre: 'Interacciones', sinonimos: ['interactions', 'interacciones', 'engagement', 'engagements', 'total interactions', 'total engagement'] },
  { id: 'likes', nombre: 'Reacciones', sinonimos: ['likes', 'me gusta', 'reactions', 'reacciones'] },
  { id: 'comentarios', nombre: 'Comentarios', sinonimos: ['comments', 'comentarios', 'replies', 'respuestas'] },
  { id: 'compartidos', nombre: 'Compartidos', sinonimos: ['shares', 'compartidos', 'retweets', 'reposts', 'veces compartido'] },
  { id: 'alcance', nombre: 'Alcance o vistas', sinonimos: ['reach', 'alcance', 'impressions', 'impresiones', 'views', 'visualizaciones', 'vistas', 'potential reach', 'alcance potencial'] },
  { id: 'tipo', nombre: 'Tipo de publicación', sinonimos: ['post type', 'tipo de publicacion', 'mention type', 'tipo de mencion', 'type', 'tipo', 'kind', 'format', 'formato'] },
];

const SIN = CAMPOS.map((c) => ({ ...c, norm: c.sinonimos.map(normalizeText) }));

function score(header, campo) {
  const h = normalizeText(header);
  if (!h) return 0;
  if (campo.norm.includes(h)) return 3;
  const words = ` ${h.replace(/[^a-z0-9]+/g, ' ')} `;
  return campo.norm.some((s) => s.length > 2 && words.includes(` ${s} `)) ? 1 : 0;
}

/** Busca la fila de encabezados en las primeras filas (SentiOne puede incluir filas de metadatos). */
export function detectHeaderRow(rows, maxScan = 25) {
  let best = { index: 0, hits: -1 };
  rows.slice(0, maxScan).forEach((row, index) => {
    const hits = (row ?? []).filter((cell) => typeof cell === 'string' && SIN.some((c) => score(cell, c) > 0)).length;
    if (hits > best.hits) best = { index, hits };
  });
  return best.hits >= 2 ? best.index : 0;
}

/** Propone un mapeo campo → índice de columna. Cada columna se asigna a un solo campo. */
export function suggestMapping(headers) {
  const pairs = [];
  headers.forEach((h, col) => SIN.forEach((c) => {
    const s = score(h, c);
    if (s) pairs.push({ campo: c.id, col, s, order: SIN.indexOf(c) });
  }));
  pairs.sort((a, b) => b.s - a.s || a.order - b.order || a.col - b.col);
  const mapping = {};
  const used = new Set();
  for (const p of pairs) {
    if (mapping[p.campo] != null || used.has(p.col)) continue;
    mapping[p.campo] = p.col;
    used.add(p.col);
  }
  return mapping;
}

export function validateMapping(mapping) {
  const errores = [];
  const avisos = [];
  for (const c of CAMPOS) if (c.requerido && mapping[c.id] == null) errores.push(`Falta asignar la columna «${c.nombre}».`);
  if (mapping.id == null && mapping.url == null)
    avisos.push('Sin columna de ID ni de URL: la deduplicación usará una clave débil (fecha, fuente y texto).');
  if (mapping.texto == null) avisos.push('Sin columna de texto: no se podrán sugerir narrativas, hashtags ni menciones de marca.');
  if (mapping.sentimiento == null) avisos.push('Sin columna de sentimiento: todos los registros quedarán «sin clasificar».');
  return { ok: errores.length === 0, errores, avisos };
}
