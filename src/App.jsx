import { MotionConfig } from 'motion/react';
import Portada from './sections/Portada.jsx';
import Realidad from './sections/Realidad.jsx';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <main id="contenido" className="grain">
        <Portada />
        <Realidad />
      </main>
    </MotionConfig>
  );
}
