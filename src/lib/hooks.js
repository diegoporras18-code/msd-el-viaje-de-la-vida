import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Ancho de un contenedor (para gráficos SVG responsive). */
export function useMeasure() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Ruta por hash: '#/explorar', '#/importar' o presentación (cualquier otro hash, p. ej. anclas). */
export function useHashRoute() {
  const read = () => {
    const h = window.location.hash;
    if (h.startsWith('#/explorar')) return 'explorar';
    if (h.startsWith('#/importar')) return 'importar';
    return 'presentacion';
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** Capítulo visible en el centro de la pantalla. */
export function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids, enabled]);
  return active;
}
