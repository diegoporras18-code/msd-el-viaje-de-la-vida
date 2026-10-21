import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import Portada from './sections/Portada.jsx';
import Realidad from './sections/Realidad.jsx';
import Campana from './sections/Campana.jsx';
import Conversacion from './sections/Conversacion.jsx';
import Impacto from './sections/Impacto.jsx';
import Benchmark from './sections/Benchmark.jsx';
import Conclusiones from './sections/Conclusiones.jsx';
import SiteNav from './components/SiteNav.jsx';
import Explorar from './views/Explorar.jsx';
import { DataProvider, FilterProvider, useData } from './state/DataContext.jsx';
import { useHashRoute } from './lib/hooks.js';

// El importador (y sus bibliotecas de lectura) solo se descarga al usarlo.
const Importar = lazy(() => import('./views/Importar.jsx'));

function Presentacion() {
  // Al llegar desde otro modo con un ancla (#campana…), desplaza hasta el capítulo.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);
  return (
    <>
      <div id="inicio">
        <Portada />
      </div>
      <Realidad />
      <Campana />
      <Conversacion />
      <Impacto />
      <Benchmark />
      <Conclusiones />
    </>
  );
}

function PreviewBanner() {
  const { esVistaPrevia, setPreview } = useData();
  if (!esVistaPrevia) return null;
  return (
    <div role="status" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-full border border-fucsia/60 bg-ciruela-900/95 px-5 py-2 text-sm text-marfil shadow-xl backdrop-blur">
      <span>Vista previa local: no publicada</span>
      <span className="flex gap-4">
        <a href="#/importar" className="text-rosa underline underline-offset-4">
          Importador
        </a>
        <button type="button" onClick={() => setPreview(null)} className="text-rosa underline underline-offset-4">
          Descartar
        </button>
      </span>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  useEffect(() => {
    if (route !== 'presentacion') window.scrollTo(0, 0);
  }, [route]);

  return (
    <MotionConfig reducedMotion="user">
      <DataProvider>
        <FilterProvider>
          <a href="#contenido" className="skip-link">
            Saltar al contenido
          </a>
          <SiteNav route={route} />
          <main id="contenido" className="grain">
            {route === 'explorar' && <Explorar />}
            {route === 'importar' && (
              <Suspense fallback={<p className="shell pt-32 text-bruma">Cargando importador…</p>}>
                <Importar />
              </Suspense>
            )}
            {route === 'presentacion' && <Presentacion />}
          </main>
          <PreviewBanner />
        </FilterProvider>
      </DataProvider>
    </MotionConfig>
  );
}
