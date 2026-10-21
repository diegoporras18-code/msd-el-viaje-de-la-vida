import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import publishedRaw from '../data/dataset.json';
import { ensureUniverses, exportDataset, validateDataset } from '../lib/data/dataset.js';
import { FILTROS_VACIOS } from '../lib/data/aggregate.js';
import { RANGO_DEFECTO } from '../config/periodos.js';
import { MARCAS } from '../config/universos.js';

const KEY = 'evdlv-vista-previa-v1';
const published = ensureUniverses(publishedRaw);
const DataCtx = createContext(null);
const FilterCtx = createContext(null);

function loadPreview() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const ds = JSON.parse(raw);
    return validateDataset(ds).length ? null : ensureUniverses(ds);
  } catch {
    return null;
  }
}

/**
 * Datos publicados (src/data/dataset.json) + una vista previa local opcional.
 * La vista previa solo vive en este navegador: no cambia el sitio público.
 */
export function DataProvider({ children }) {
  const [preview, setPreviewState] = useState(loadPreview);

  const setPreview = useCallback((raw) => {
    const ds = raw && ensureUniverses(raw);
    setPreviewState(ds);
    try {
      if (ds) localStorage.setItem(KEY, JSON.stringify(exportDataset(ds)));
      else localStorage.removeItem(KEY);
    } catch {
      /* almacenamiento no disponible: la vista previa dura lo que la pestaña */
    }
  }, []);

  const value = useMemo(
    () => ({ dataset: preview ?? published, published, preview, setPreview, esVistaPrevia: Boolean(preview) }),
    [preview, setPreview],
  );
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export const FILTROS_INICIALES = {
  ...FILTROS_VACIOS,
  ...RANGO_DEFECTO,
  universo: 'categoria',
  marcas: MARCAS.map((m) => m.id),
};

export function FilterProvider({ children }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const update = useCallback((patch) => setFiltros((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFiltros(FILTROS_INICIALES), []);
  const value = useMemo(() => ({ filtros, update, reset }), [filtros, update, reset]);
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export const useData = () => useContext(DataCtx);
export const useFilters = () => useContext(FilterCtx);
