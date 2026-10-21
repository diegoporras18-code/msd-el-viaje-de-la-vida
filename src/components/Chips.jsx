/** Grupo de botones conmutables (selección múltiple o única). Objetivos táctiles ≥ 44 px. */
export default function Chips({ opciones, valor, onChange, multiple = true, etiqueta }) {
  const activo = (id) => (multiple ? valor.includes(id) : valor === id);
  const toggle = (id) => {
    if (!multiple) return onChange(id);
    onChange(valor.includes(id) ? valor.filter((v) => v !== id) : [...valor, id]);
  };
  return (
    <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={activo(o.id)}
          onClick={() => toggle(o.id)}
          className={`min-h-[44px] rounded-full border px-4 text-sm transition-colors ${
            activo(o.id) ? 'border-rosa bg-rosa text-ciruela' : 'border-rosa/25 text-marfil hover:border-rosa/60'
          }`}
        >
          {o.color && <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: o.color }} aria-hidden="true" />}
          {o.nombre}
        </button>
      ))}
    </div>
  );
}
