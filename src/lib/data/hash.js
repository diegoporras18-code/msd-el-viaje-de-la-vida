// Hash determinista y síncrono (cyrb53, dos semillas ≈ 106 bits).
// Funciona igual en Node, en navegadores y en contextos http sin crypto.subtle.
function cyrb53(str, seed) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (2097152 * (h2 >>> 0) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

// El identificador publicado no permite reconstruir la URL ni el ID original.
export const hashKey = (key) => cyrb53(key, 1) + cyrb53(key, 7);
