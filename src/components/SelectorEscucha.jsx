import { useVersionEscucha } from '../state/DataContext.jsx';
export default function SelectorEscucha() {
  const estado = useVersionEscucha();
  if (!estado || estado.versiones.length < 2) return null;
  return <label className="flex min-h-[44px] items-center gap-2 text-xs text-rosa">
    <span className="sr-only">Versión de escucha</span>
    <select aria-label="Versión de escucha" value={estado.version.id} onChange={e => estado.cambiarVersion(e.target.value)} className="min-h-[44px] max-w-[180px] rounded-full border border-rosa/30 bg-ciruela px-3 text-xs text-marfil">
      {estado.versiones.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
    </select>
  </label>;
}
