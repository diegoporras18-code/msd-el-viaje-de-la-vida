import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import resultados from '../data/resultados.json';
import { FILTROS_VACIOS } from '../lib/data/resultados.js';
import { RANGO_DEFECTO } from '../config/periodos.js';
import { versionesDisponibles, resolverVersion } from '../lib/data/versiones.js';
import { LABORATORIOS } from '../config/marcas.js';

const FilterCtx = createContext(null);
const ResultadosCtx = createContext(null);
const alternativas = import.meta.glob('../data/resultados-amplio.json', { eager: true, import: 'default' });
const versiones = versionesDisponibles(resultados, alternativas['../data/resultados-amplio.json']);

export const FILTROS_INICIALES = { ...FILTROS_VACIOS, ...RANGO_DEFECTO, comparar: LABORATORIOS.map((l) => l.id) };

/** Resultados publicados (solo agregados). */
export const useResultados = () => useContext(ResultadosCtx)?.version.resultados ?? resultados;
export const useVersionEscucha = () => useContext(ResultadosCtx);

export function FilterProvider({ children }) {
  const [idVersion, setIdVersion] = useState(() => typeof window === 'undefined' ? 'enfocada' : new URLSearchParams(window.location.search).get('escucha') ?? 'enfocada');
  const version = resolverVersion(idVersion, versiones);
  const cambiarVersion = useCallback(id => {
    const elegida = resolverVersion(id, versiones);
    setIdVersion(elegida.id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);url.searchParams.set('escucha', elegida.id);
      window.history.replaceState(null, '', url);
    }
  }, []);
  const valorResultados = useMemo(() => ({version, versiones, cambiarVersion}), [version,cambiarVersion]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const update = useCallback((patch) => setFiltros((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFiltros(FILTROS_INICIALES), []);
  const value = useMemo(() => ({ filtros, update, reset }), [filtros, update, reset]);
  return <ResultadosCtx.Provider value={valorResultados}><FilterCtx.Provider value={value}>{children}</FilterCtx.Provider></ResultadosCtx.Provider>;
}

export const useFilters = () => useContext(FilterCtx);
