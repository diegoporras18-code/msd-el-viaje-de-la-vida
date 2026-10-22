import { AnimatePresence, motion } from 'motion/react';
import { publicacionesDe } from '../lib/publicaciones.js';
import { longDate } from '../lib/data/dates.js';
import { formatNumber } from '../lib/format.js';
import { nombreTema } from '../config/clasificacion.js';
import { entidad } from '../config/marcas.js';
import { duration, ease } from '../lib/motion.js';

const EMISOR = {
  laboratorio: { texto: 'Emitida por el laboratorio', tono: 'border-fucsia/50 text-fucsia' },
  tercero: { texto: 'Tercero que lo menciona', tono: 'border-rosa/30 text-rosa' },
};

/** Laboratorios como botones conmutables: al elegir uno se abre su panel de publicaciones. */
export function SelectorLaboratorios({ labs, k, seleccion, onSelect, animar = false }) {
  const Item = animar ? motion.li : 'li';
  return (
    <ul className="flex flex-wrap content-start gap-2" aria-label="Laboratorios identificados: elige uno para ver sus publicaciones">
      {labs.map((l, i) => {
        const activo = seleccion === l.id;
        return (
          <Item
            key={l.id}
            {...(animar && {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, amount: 0.3 },
              transition: { duration: duration.enter, ease: ease.out, delay: 0.04 * i },
            })}
          >
            <button
              type="button"
              aria-pressed={activo}
              aria-controls="publicaciones-laboratorio"
              onClick={() => onSelect(activo ? null : l.id)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                activo ? 'border-rosa bg-rosa/15' : 'border-rosa/20 hover:border-rosa/60'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: entidad(l.id).color }} aria-hidden="true" />
              <span className={l.id === 'msd' ? 'text-fucsia' : 'text-marfil'}>{l.nombre}</span>
              {l.n !== undefined && <span className="num text-xs text-bruma">{l.n == null ? `< ${k}` : formatNumber(l.n)}</span>}
            </button>
          </Item>
        );
      })}
    </ul>
  );
}

function Tarjeta({ p }) {
  const e = EMISOR[p.emisor];
  return (
    <li className="flex w-[85%] shrink-0 snap-start flex-col rounded-sm border border-rosa/15 p-4 sm:w-auto">
      <p className="flex flex-wrap items-center gap-2">
        <span className={`eyebrow rounded-full border px-2 py-0.5 normal-case tracking-normal ${e.tono}`}>{e.texto}</span>
        <span className="eyebrow rounded-full border border-bruma/30 px-2 py-0.5 normal-case tracking-normal text-bruma">{nombreTema(p.tema)}</span>
      </p>
      <p className="mt-3 text-xs text-bruma">
        <span className="text-marfil">{p.medio}</span> · {p.pais} · {p.fecha ? longDate(p.fecha) : 'Fecha no verificada'}
        {p.formato && <span className="block">{p.formato}</span>}
      </p>
      <p className="mt-2 flex-1 text-sm text-marfil">{p.descripcion}</p>
      <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-[44px] items-center text-sm text-rosa underline underline-offset-4">
        Abrir publicación
        <span aria-hidden="true">&nbsp;↗</span>
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    </li>
  );
}

function Grupo({ titulo, items }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="eyebrow text-bruma">
        {titulo} <span className="num">({items.length})</span>
      </p>
      <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
        {items.map((p) => (
          <Tarjeta key={p.id} p={p} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Panel desplegable «Ver publicaciones» del laboratorio elegido. Es una selección curada de
 * contenidos públicos verificados: no es un recuento ni reemplaza las cifras protegidas.
 */
export function PanelPublicaciones({ id }) {
  return (
    <div id="publicaciones-laboratorio" className="min-w-0" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {id && (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.micro, ease: ease.out }}
          >
            <Contenido id={id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Contenido({ id }) {
  const { escucha, externas, total } = publicacionesDe(id);
  const lab = entidad(id);
  return (
    <details className="group mt-4 min-w-0 overflow-hidden rounded-sm [contain:paint] border border-rosa/20 px-4 sm:px-5">
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-3">
        <span className="flex flex-wrap items-center gap-x-3">
          <span className="font-display text-[length:var(--step-1)] italic" style={{ color: lab.color }}>
            {lab.nombre}
          </span>
          <span className="text-sm text-marfil">Ver publicaciones{total ? <span className="num text-bruma"> · {total}</span> : null}</span>
        </span>
        <span className="text-xl leading-none text-rosa transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-5">
        {total ? (
          <>
            <Grupo titulo="Captadas en la escucha social (SentiOne)" items={escucha} />
            <Grupo titulo="Referencias externas adicionales" items={externas} />
          </>
        ) : (
          <p className="text-sm text-bruma">Sin publicaciones públicas verificadas disponibles.</p>
        )}
        <p className="mt-5 max-w-3xl text-xs text-bruma/80">
          Selección de contenidos públicos de medios, instituciones y laboratorios, revisados uno a uno. No incluye publicaciones de personas particulares, no equivale al
          número de menciones y las réplicas de una misma nota se muestran una sola vez.
        </p>
      </div>
    </details>
  );
}
