/** Leyenda: muestra de color (o patrón) + nombre. `tipo`: 'solido' | 'tenue' | 'linea' | 'vacio'. */
export default function Legend({ items, className = '' }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-xs text-bruma ${className}`}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <Swatch color={it.color} tipo={it.tipo} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function Swatch({ color = '#F4A6C4', tipo = 'solido' }) {
  if (tipo === 'linea') return <span className="h-0.5 w-4 rounded-full" style={{ background: color }} aria-hidden="true" />;
  if (tipo === 'punteada')
    return <span className="h-0 w-4 border-t-2 border-dotted" style={{ borderColor: color }} aria-hidden="true" />;
  if (tipo === 'vacio')
    return <span className="h-3 w-3 rounded-[2px] border border-dashed border-bruma/60 bg-[repeating-linear-gradient(45deg,transparent_0_3px,rgb(201_179_192/0.35)_3px_4px)]" aria-hidden="true" />;
  return (
    <span
      className="h-3 w-3 rounded-[2px]"
      style={{ background: color, opacity: tipo === 'tenue' ? 0.45 : 1 }}
      aria-hidden="true"
    />
  );
}
