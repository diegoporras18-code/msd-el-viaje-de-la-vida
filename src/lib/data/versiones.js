// Solo ofrece versiones con agregados ya disponibles; nunca duplica datos para simular una versión.
export function versionesDisponibles(enfocada, amplia) {
  return [
    { id: 'enfocada', nombre: 'Enfoque de campaña', descripcion: 'Consulta enfocada en la iniciativa y sus reglas de seguimiento.', resultados: enfocada },
    ...(amplia ? [{ id: 'amplia', nombre: 'Panorama amplio', descripcion: 'Incluye la conversación captada por el hashtag genérico #Cancerdemama.', resultados: amplia }] : []),
  ];
}
export function resolverVersion(id, versiones) {
  return versiones.find(v => v.id === id) ?? versiones[0];
}
