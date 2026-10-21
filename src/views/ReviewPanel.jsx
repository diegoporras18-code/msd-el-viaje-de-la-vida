import { useMemo, useState } from 'react';
import Chips from '../components/Chips.jsx';
import { applyReview, removeDestacado, upsertDestacado } from '../lib/data/dataset.js';
import { EMOCIONES, NARRATIVAS, RELACIONES, nombreNarrativa, nombrePlataforma, nombreSentimiento } from '../config/clasificacion.js';
import { universoPorId } from '../config/universos.js';
import { relationOf } from '../lib/data/classify.js';
import { longDate } from '../lib/data/dates.js';
import { formatNumber } from '../lib/format.js';

const input = 'min-h-[44px] w-full rounded-sm border border-rosa/30 bg-ciruela-800 px-3 text-marfil';
const POR_PAGINA = 12;
const ESTADOS = [
  { id: 'sin_clasificar', nombre: 'Sin clasificar' },
  { id: 'sugeridos', nombre: 'Con sugerencia' },
  { id: 'pendientes', nombre: 'Sin revisar' },
  { id: 'revisados', nombre: 'Revisados' },
  { id: 'todos', nombre: 'Todos' },
];

/**
 * Revisión manual de los registros importados en esta sesión (el texto solo existe aquí).
 * Lo guardado se marca como validado; los destacados requieren confirmación expresa.
 */
export default function ReviewPanel({ trabajo, locales, onChange }) {
  const [estado, setEstado] = useState('sin_clasificar');
  const [q, setQ] = useState('');
  const [pagina, setPagina] = useState(0);
  const [abierto, setAbierto] = useState(null);

  const items = useMemo(() => {
    const out = [];
    for (const [key, local] of locales) {
      const [universo, h] = key.split(':');
      const r = trabajo.universos[universo]?.registros.find((x) => x.h === h);
      if (r) out.push({ key, universo, r, local });
    }
    return out.sort((a, b) => a.r.d.localeCompare(b.r.d));
  }, [trabajo, locales]);

  const filtrados = items.filter(({ r, local }) => {
    if (estado === 'sin_clasificar' && (r.so !== 'sin_clasificar' || r.rv?.s)) return false;
    if (estado === 'sugeridos' && !r.sg) return false;
    if (estado === 'pendientes' && r.rv) return false;
    if (estado === 'revisados' && !r.rv) return false;
    if (q && !local.texto.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const visibles = filtrados.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);
  const revisados = items.filter((x) => x.r.rv).length;

  return (
    <div>
      <p className="text-sm text-bruma">
        {formatNumber(items.length)} registros de esta sesión · {formatNumber(revisados)} revisados. El texto, la URL y el autor solo se muestran aquí y no se exportan.
      </p>
      <div className="mt-5 space-y-4">
        <Chips multiple={false} opciones={ESTADOS} valor={estado} onChange={(v) => { setEstado(v); setPagina(0); }} etiqueta="Estado de revisión" />
        <label className="block max-w-md text-sm text-bruma">
          Buscar en el texto
          <input type="search" className={`${input} mt-1`} value={q} onChange={(e) => { setQ(e.target.value); setPagina(0); }} />
        </label>
      </div>

      <ul className="mt-6 divide-y divide-rosa/10 border-y border-rosa/10">
        {visibles.map((it) => (
          <Item
            key={it.key}
            it={it}
            destacado={(trabajo.destacados ?? []).find((d) => d.id === it.r.h)}
            abierto={abierto === it.key}
            onToggle={() => setAbierto(abierto === it.key ? null : it.key)}
            onSave={(rv) => onChange(applyReview(trabajo, it.universo, it.r.h, rv))}
            onDestacar={(d) => onChange(d ? upsertDestacado(trabajo, d) : removeDestacado(trabajo, it.r.h))}
          />
        ))}
        {!visibles.length && <li className="py-6 text-sm text-bruma">No hay registros con este filtro.</li>}
      </ul>

      {paginas > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button type="button" className="min-h-[44px] px-3 text-rosa disabled:opacity-30" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
            ← Anterior
          </button>
          <span className="text-bruma">
            Página {pagina + 1} de {paginas}
          </span>
          <button type="button" className="min-h-[44px] px-3 text-rosa disabled:opacity-30" disabled={pagina >= paginas - 1} onClick={() => setPagina((p) => p + 1)}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

function Item({ it, destacado, abierto, onToggle, onSave, onDestacar }) {
  const { r, local, universo } = it;
  const [rv, setRv] = useState(() => ({
    s: r.rv?.s ?? '',
    n: r.rv?.n ?? r.sg?.n ?? [],
    e: r.rv?.e ?? r.sg?.e ?? '',
    i: r.rv?.i ?? Boolean(r.sg?.i),
    r: r.rv?.r ?? relationOf(r).id,
    asistente: r.rv?.asistente ?? false,
  }));
  const [dest, setDest] = useState(() => ({
    tipo: destacado?.tipo ?? 'publicacion',
    extracto: destacado?.extracto ?? local.texto.slice(0, 280),
    url: destacado?.url ?? (/^https:\/\//.test(local.url) ? local.url : ''),
    autorPublico: destacado?.autorPublico ?? '',
    confirmado: Boolean(destacado),
  }));

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-bruma">
        <span className="text-marfil">{longDate(r.d)}{r.t != null && ` · ${r.t}:00`}</span>
        <span>{nombrePlataforma(r.p)}</span>
        <span>{universoPorId(universo).corto}</span>
        <span>SentiOne: {nombreSentimiento(r.so)}</span>
        {r.rv && <span className="text-rosa">✓ Revisado</span>}
        {destacado && <span className="text-fucsia">★ Destacado</span>}
      </div>
      <p className="mt-2 line-clamp-4 text-sm text-marfil/90">{local.texto || '(sin texto)'}</p>
      {r.sg && (
        <p className="mt-2 text-xs text-bruma">
          Sugerido: {[r.sg.s && `sentimiento ${r.sg.s}`, r.sg.n && r.sg.n.map(nombreNarrativa).join(', '), r.sg.i && 'intención preventiva'].filter(Boolean).join(' · ')}
        </p>
      )}
      <button type="button" onClick={onToggle} aria-expanded={abierto} className="mt-3 min-h-[44px] text-sm text-rosa underline underline-offset-4">
        {abierto ? 'Cerrar' : 'Revisar'}
      </button>

      {abierto && (
        <div className="mt-4 grid gap-5 rounded-sm border border-rosa/20 p-4 sm:grid-cols-2">
          <label className="text-sm text-bruma">
            Sentimiento revisado
            <select className={`${input} mt-1`} value={rv.s} onChange={(e) => setRv({ ...rv, s: e.target.value })}>
              <option value="">— Pendiente —</option>
              <option value="positivo">Positivo</option>
              <option value="neutral">Neutral</option>
              <option value="negativo">Negativo</option>
            </select>
          </label>
          <label className="text-sm text-bruma">
            Emoción
            <select className={`${input} mt-1`} value={rv.e ?? ''} onChange={(e) => setRv({ ...rv, e: e.target.value })}>
              <option value="">Ninguna</option>
              {EMOCIONES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm text-bruma">Narrativas</p>
            <Chips opciones={NARRATIVAS} valor={rv.n} onChange={(n) => setRv({ ...rv, n })} etiqueta="Narrativas revisadas" />
          </div>
          <label className="text-sm text-bruma">
            Relación
            <select className={`${input} mt-1`} value={rv.r} onChange={(e) => setRv({ ...rv, r: e.target.value })}>
              {RELACIONES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2 text-sm text-marfil">
            <label className="flex min-h-[44px] items-center gap-3">
              <input type="checkbox" checked={rv.i} onChange={(e) => setRv({ ...rv, i: e.target.checked })} className="h-5 w-5 accent-[#E2457F]" />
              Intención preventiva
            </label>
            <label className="flex min-h-[44px] items-center gap-3">
              <input type="checkbox" checked={rv.asistente} onChange={(e) => setRv({ ...rv, asistente: e.target.checked })} className="h-5 w-5 accent-[#E2457F]" />
              Contenido espontáneo de asistente al concierto
            </label>
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              className="min-h-[44px] rounded-full bg-rosa px-5 text-sm font-medium text-ciruela"
              onClick={() => onSave({ ...(rv.s ? { s: rv.s } : {}), n: rv.n, e: rv.e || null, i: rv.i, r: rv.r, asistente: rv.asistente })}
            >
              Guardar revisión
            </button>
          </div>

          <fieldset className="border-t border-rosa/15 pt-4 sm:col-span-2">
            <legend className="eyebrow text-rosa">Publicar como destacado</legend>
            <p className="mt-2 text-xs text-bruma">Solo contenidos verificados. No publiques datos de particulares: deja el autor vacío salvo medios, instituciones o creadores con cuenta pública.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-bruma">
                Tipo
                <select className={`${input} mt-1`} value={dest.tipo} onChange={(e) => setDest({ ...dest, tipo: e.target.value })}>
                  <option value="publicacion">Publicación</option>
                  <option value="medio">Medio de comunicación</option>
                  <option value="creador">Creador de contenido</option>
                </select>
              </label>
              <label className="text-sm text-bruma">
                Autor público (opcional)
                <input className={`${input} mt-1`} value={dest.autorPublico} onChange={(e) => setDest({ ...dest, autorPublico: e.target.value })} placeholder="p. ej. nombre del medio" />
              </label>
              <label className="text-sm text-bruma sm:col-span-2">
                Extracto para publicar
                <textarea className={`${input} mt-1 min-h-[6rem] py-2`} maxLength={400} value={dest.extracto} onChange={(e) => setDest({ ...dest, extracto: e.target.value })} />
              </label>
              <label className="text-sm text-bruma sm:col-span-2">
                URL (https)
                <input className={`${input} mt-1`} value={dest.url} onChange={(e) => setDest({ ...dest, url: e.target.value.trim() })} />
              </label>
              <label className="flex min-h-[44px] items-center gap-3 text-sm text-marfil sm:col-span-2">
                <input type="checkbox" checked={dest.confirmado} onChange={(e) => setDest({ ...dest, confirmado: e.target.checked })} className="h-5 w-5 accent-[#E2457F]" />
                Confirmo que revisé este contenido y puede publicarse
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!dest.confirmado || !dest.extracto.trim() || (dest.url && !/^https:\/\//.test(dest.url))}
                className="min-h-[44px] rounded-full border border-fucsia px-5 text-sm text-marfil disabled:opacity-40"
                onClick={() =>
                  onDestacar({ id: r.h, universo, fecha: r.d, plataforma: r.p, tipo: dest.tipo, extracto: dest.extracto.trim(), url: dest.url || null, autorPublico: dest.autorPublico.trim() || null, marcas: (r.ent ?? []).filter((e) => e !== 'fonseca' && e !== 'lotengo') })
                }
              >
                {destacado ? 'Actualizar destacado' : 'Marcar como destacado'}
              </button>
              {destacado && (
                <button type="button" className="min-h-[44px] px-3 text-sm text-rosa underline" onClick={() => onDestacar(null)}>
                  Quitar destacado
                </button>
              )}
            </div>
          </fieldset>
        </div>
      )}
    </li>
  );
}
