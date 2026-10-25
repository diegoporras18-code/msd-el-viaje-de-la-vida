// Diagnóstico literal local. No pretende reproducir la normalización interna de SentiOne.
const normal = s => String(s ?? '').normalize('NFC').toLocaleLowerCase('es');
export function coincideRegla(campos, terminos) {
  if (!Array.isArray(terminos) || !terminos.length || terminos.some(t => typeof t !== 'string' || !t.trim())) throw new Error('Regla de consulta vacía o inválida');
  return terminos.every(t => campos.some(c => normal(c).includes(normal(t))));
}
