import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import Portada from './sections/Portada.jsx';
import Realidad from './sections/Realidad.jsx';
import Campana from './sections/Campana.jsx';
import Impacto from './sections/Impacto.jsx';
import Conclusiones from './sections/Conclusiones.jsx';
import SiteNav from './components/SiteNav.jsx';
import Explorar from './views/Explorar.jsx';
import { FilterProvider } from './state/DataContext.jsx';
import { useHashRoute } from './lib/hooks.js';

function Presentacion() {
  // Al llegar desde Explorar con un ancla (#campana…), desplaza hasta el capítulo.
  useEffect(() => {
    const ancla = window.location.hash.slice(1);
    const id = ['antes','benchmark'].includes(ancla) ? 'impacto' : ancla;
    if (id && !id.startsWith('/')) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);
  return (
    <>
      <div id="inicio">
        <Portada />
      </div>
      <Realidad />
      <Campana />
      <Impacto />
      <Conclusiones />
    </>
  );
}

export default function App() {
  const route = useHashRoute();
  useEffect(() => {
    if (route !== 'presentacion') window.scrollTo(0, 0);
  }, [route]);

  return (
    <MotionConfig reducedMotion="user">
      <FilterProvider>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <SiteNav route={route} />
        <main id="contenido" className="grain">
          {route === 'explorar' ? <Explorar /> : <Presentacion />}
        </main>
      </FilterProvider>
    </MotionConfig>
  );
}
