const ESTADOS = {
  medicion: { etiqueta: 'Pendiente de medición', tono: 'text-rosa border-rosa/40' },
  evento: { etiqueta: 'Disponible después del evento', tono: 'text-fucsia border-fucsia/50' },
  analisis: { etiqueta: 'Disponible en la próxima actualización', tono: 'text-rosa border-rosa/40' },
  sin_datos: { etiqueta: 'Sin datos para este filtro', tono: 'text-bruma border-bruma/40' },
};

// Barras fantasma deterministas: evocan la onda musical sin sugerir valores.
const GHOST = Array.from({ length: 32 }, (_, i) => 0.25 + 0.6 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)));

/** Estado visual para información que aún no existe. No muestra ceros. */
export default function Pending({ estado = 'medicion', titulo, detalle, requiere, compacto = false }) {
  const e = ESTADOS[estado] ?? ESTADOS.medicion;
  return (
    <div className={`relative overflow-hidden rounded-sm border border-dashed border-rosa/20 ${compacto ? 'px-4 py-5' : 'px-5 py-8 sm:px-8 sm:py-10'}`} role="status">
      <div className="pointer-events-none absolute inset-x-6 bottom-0 flex h-2/3 items-end gap-[3px] opacity-[0.12]" aria-hidden="true">
        {GHOST.map((h, i) => (
          <span key={i} className="flex h-full flex-1 items-end">
            <span className="block w-full rounded-t-full bg-rosa" style={{ height: `${h * 100}%` }} />
          </span>
        ))}
      </div>
      <div className="relative">
        <span className={`eyebrow inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${e.tono}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {e.etiqueta}
        </span>
        {titulo && <p className="mt-4 max-w-xl font-display text-[length:var(--step-1)] italic leading-snug text-marfil">{titulo}</p>}
        {detalle && <p className="mt-2 max-w-xl text-sm text-bruma">{detalle}</p>}
        {requiere && (
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-bruma/80">
            Se incluirá: <span className="normal-case tracking-normal text-marfil/90">{requiere}</span>
          </p>
        )}
      </div>
    </div>
  );
}
