// Diagnóstico de la consulta aportada; no clasifica A/B/C ni reemplaza el motor de SentiOne.
import { coincideRegla } from './consulta.js';
const normal = s => String(s ?? '').normalize('NFC').toLocaleLowerCase('es');
const GENERICO = '#Cancerdemama';
const NUEVAS = [['#JuntasContraElCáncerdemama'], ['#JuntasContraElCancerdemama'], [GENERICO], ['Fonseca', 'MSD']];
const clave = regla => regla.map(normal).join('\u0000');
export function consultaActualizada(anterior) {
  const unicas = new Map([...anterior.cualquiera, ...NUEVAS].map(r => [clave(r), r]));
  return { ...anterior, version: 2, fuente: 'usuario-2026-10-28', cualquiera: [...unicas.values()] };
}
export function consultasPorAlcance(anterior) {
  const amplia = consultaActualizada(anterior);
  // Retira únicamente la regla abierta: conserva Colombia AND #CancerDeMama y otras coincidencias.
  const enfocada = { ...amplia, cualquiera: amplia.cualquiera.filter(r => !(r.length === 1 && normal(r[0]) === normal(GENERICO))) };
  return { enfocada, amplia };
}
export function evaluarAlcances({ contenido = '', contexto = '', autor = '' }, consultas) {
  const campos = [contenido, contexto, autor];
  const excluido = (consultas.amplia.excluirAutor ?? []).some(a => normal(autor).includes(normal(a)));
  return { excluido, enfocada: !excluido && consultas.enfocada.cualquiera.some(r => coincideRegla(campos,r)), amplia: !excluido && consultas.amplia.cualquiera.some(r => coincideRegla(campos,r)), metodo: 'coincidencia_literal_local' };
}
