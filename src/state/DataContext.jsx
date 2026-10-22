import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import resultados from '../data/resultados.json';
import { FILTROS_VACIOS } from '../lib/data/resultados.js';
import { RANGO_DEFECTO } from '../config/periodos.js';
import { LABORATORIOS } from '../config/marcas.js';

const FilterCtx = createContext(null);

export const FILTROS_INICIALES = { ...FILTROS_VACIOS, ...RANGO_DEFECTO, comparar: LABORATORIOS.map((l) => l.id) };

/** Resultados publicados (solo agregados). */
export const useResultados = () => resultados;

export function FilterProvider({ children }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const update = useCallback((patch) => setFiltros((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFiltros(FILTROS_INICIALES), []);
  const value = useMemo(() => ({ filtros, update, reset }), [filtros, update, reset]);
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export const useFilters = () => useContext(FilterCtx);
