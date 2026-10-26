import { useResultados } from '../state/DataContext.jsx';
import { resumenImpacto } from '../lib/data/impacto.js';
import { vistaCampana, estadoComplementarias } from '../lib/data/campana-resultados.js';
import { formatNumber } from '../lib/format.js';

export default function UniversosConcierto() {
  const res = useResultados();
  const causa = resumenImpacto(res);
  const c = vistaCampana(res);
  const valor = n => n == null ? 'Medición pendiente' : formatNumber(n);
  const referencias = res.campana?.referenciasAportadas;
  const manuales = referencias?.manuales;
  const combinadas = referencias?.total;
  const cards = [
    { id: 'causa', titulo: '1 · Escucha SentiOne', cifra: valor(referencias?.sentione), texto: 'Menciones relevantes sobre cáncer de mama registradas el 24 de octubre. No todas se refieren al concierto.' },
    { id: 'campana', titulo: '2 · Publicaciones adicionales', cifra: res.campana?.complementarias?.editoriales ? valor(res.campana.complementarias.editoriales) : c.disponible ? valor(c.confirmadas) : 'Pendiente', texto: 'Referencias adicionales de El Viaje de la Vida validadas editorialmente. Fechas y posibles duplicados pendientes de cotejo.' },

  ];
  return <div>
    <div data-referencias-combinadas className="mb-5 border-l-2 border-fucsia py-2 pl-5">
      <p className="display num text-[length:var(--step-4)] leading-none text-rosa">{valor(combinadas)}</p>
      <h4 className="mt-3 font-display text-2xl text-marfil">Referencias identificadas alrededor del concierto de Fonseca</h4>
      <p className="mt-3 max-w-3xl text-sm text-bruma">{valor(referencias?.sentione)} menciones temáticas de SentiOne del 24 + {valor(manuales)} referencias adicionales de campaña validadas editorialmente. Es una suma de referencias aportadas por ambas fuentes: no equivale a publicaciones únicas verificadas del día 24 ni a menciones temáticas adicionales.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{cards.map(x => <div key={x.id} data-universo={x.id} className="rounded-sm border border-rosa/20 p-4">
      <h4 className="eyebrow text-rosa">{x.titulo}</h4><p className="display num mt-3 text-[length:var(--step-2)] text-marfil">{x.cifra}</p><p className="mt-3 text-sm text-bruma">{x.texto}</p>
    </div>)}</div>
    <p className="mt-4 text-sm text-bruma">Las dos fuentes amplían la lectura de la actividad alrededor de la iniciativa. Las referencias adicionales se mantienen visibles; solo se incorporan a la curva temática al acreditar su fecha, identidad y contenido sobre cáncer de mama.</p>
    <p className="mt-2 text-sm text-bruma">{c.pico === 'no_comparable' || !c.disponible ? 'No hay una línea base completa de la propia campaña para evaluar si tuvo un pico.' : c.pico === 'aumento_en_archivo' ? 'En el archivo auditado aumenta el volumen confirmado de campaña frente a su propia línea base; no demuestra un efecto causal.' : 'En el archivo auditado no aumenta el volumen confirmado de campaña frente a su propia línea base; la cobertura sigue siendo parcial.'}</p>
    <p className="mt-2 text-xs text-bruma/80">{estadoComplementarias(res)} Las referencias públicas de contexto se mantienen separadas de estas métricas.</p>
  </div>;
}
