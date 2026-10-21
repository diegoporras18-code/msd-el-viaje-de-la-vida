---
name: motion-graphics
description: Animaciones cinematográficas para la web con Motion para React (antes Framer Motion), scrollytelling, transiciones entre secciones o páginas y gráficos animados. Úsala al animar presentaciones web, landing pages, narrativas con scroll, entradas de contenido, transiciones de layout o visualizaciones que deban cobrar vida (motion design, scroll-driven animation, page transitions, animated charts).
---

# Motion Graphics — animación cinematográfica en la web

Guía para crear movimiento con intención narrativa, fluido y accesible. Prioriza **Motion para React** (paquete `motion`, importando desde `motion/react`) en proyectos React; en proyectos sin React usa CSS, la Web Animations API o `motion` en su versión vanilla (`import { animate, scroll } from "motion"`). Todas estas opciones son gratuitas y de código abierto.

## Principios

1. **El movimiento cuenta algo.** Cada animación debe guiar la atención, explicar un cambio de estado o marcar un ritmo narrativo. Si no cumple ninguna función, elimínala.
2. **Coreografía, no simultaneidad.** Escalona (stagger) los elementos en un orden de lectura lógico: titular → subtítulo → contenido → acción.
3. **Física creíble.** Usa *springs* para interacciones y curvas de easing suaves para entradas. Evita `linear` salvo en bucles continuos.
4. **Ritmo cinematográfico:** alterna momentos rápidos (150–300 ms en microinteracciones) con momentos lentos y deliberados (600–1200 ms en revelados de sección). Deja pausas.
5. **Rendimiento:** anima solo `transform` y `opacity` (y `filter`/`clip-path` con moderación). Nunca `width`, `height`, `top` o `left` en bucles.
6. **Accesibilidad:** respeta siempre `prefers-reduced-motion`.

## Duraciones y curvas de referencia

| Uso | Duración | Curva |
|---|---|---|
| Hover / tap | 120–200 ms | spring rígido (`stiffness: 400, damping: 30`) |
| Entrada de elementos | 400–700 ms | `[0.22, 1, 0.36, 1]` (ease-out expo suave) |
| Revelado de sección | 700–1200 ms | `[0.16, 1, 0.3, 1]` |
| Salida | 60–70 % de la entrada | `[0.7, 0, 0.84, 0]` (ease-in) |
| Stagger entre hijos | 40–120 ms | — |

## Motion para React: patrones base

Instalación: `npm install motion`.

```tsx
import { motion, useReducedMotion } from "motion/react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({ children }: { children: React.ReactNode[] }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? undefined : container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={reduce ? undefined : item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
```

Otras piezas clave:

- **`AnimatePresence`** para animar montaje/desmontaje (diapositivas, modales, cambios de ruta). Usa `mode="wait"` cuando una vista debe salir antes de que entre la siguiente.
- **`layout` y `layoutId`** para transiciones de layout compartidas (una tarjeta que se expande a vista detalle).
- **`useScroll` + `useTransform`** para vincular propiedades al progreso de scroll.
- **`useSpring`** para suavizar valores derivados del scroll o del puntero.
- **`MotionConfig reducedMotion="user"`** en la raíz para respetar la preferencia del sistema en toda la app.

## Scrollytelling

Estructura recomendada: una sección alta (p. ej. `300vh`) con un contenedor `position: sticky` que ocupa la pantalla, y el progreso de scroll de la sección controla la escena.

```tsx
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function StickyScene() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} style={{ height: "300vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>
        <motion.h2 style={{ scale, opacity }}>Capítulo uno</motion.h2>
      </div>
    </section>
  );
}
```

Buenas prácticas:

- Divide la narrativa en **pasos** (steps) claros; cada paso cambia una sola idea en pantalla.
- El texto debe poder leerse aunque la animación falle: el contenido vive en el HTML, la animación solo lo realza.
- Evita secuestrar el scroll (scroll-jacking) y el scroll suave forzado que altera la velocidad del usuario.
- Ofrece navegación alternativa (índice, anclas, teclado) en narrativas largas.
- En móvil reduce la profundidad de parallax y el número de capas.
- Sin JavaScript, considera las **scroll-driven animations** nativas de CSS (`animation-timeline: view()` / `scroll()`) con fallback estático.

## Transiciones

- **Entre diapositivas o secciones:** fundido + desplazamiento corto (16–40 px), máscaras con `clip-path` (cortinillas), o zoom sutil (0.96 → 1).
- **Entre páginas:** `AnimatePresence` alrededor de la ruta, o la **View Transitions API** (`document.startViewTransition`) donde esté soportada.
- **Elementos compartidos:** `layoutId` para continuidad visual entre vistas.
- Mantén una gramática coherente: el mismo tipo de transición para el mismo tipo de cambio.

## Gráficos animados

- Anima la **entrada de datos** (barras que crecen desde la base, líneas que se dibujan con `pathLength` de 0 a 1, números que cuentan con `animate()` sobre un `MotionValue`).
- Al cambiar de datos, interpola desde el estado anterior en lugar de reiniciar desde cero: el ojo sigue el cambio.
- Escalona por categoría u orden temporal, nunca al azar.
- No animes ejes ni rejillas al mismo tiempo que los datos; primero el marco, luego los datos.
- Para el diseño del gráfico en sí, combina con la skill `data-visualization`.

## Accesibilidad y rendimiento

- `prefers-reduced-motion`: sustituye desplazamientos y zooms por fundidos breves o por el estado final directo.
- Nada debe parpadear más de 3 veces por segundo.
- Las animaciones en bucle o automáticas de más de 5 s necesitan un control para pausarlas.
- Usa `will-change` solo de forma puntual; elimina capas al terminar.
- Comprueba a 60 fps en las herramientas de rendimiento del navegador y en un móvil de gama media.
- Carga diferida de escenas pesadas (`React.lazy`, importaciones dinámicas) y pausa animaciones fuera del viewport.

## Lista de comprobación final

- [ ] Cada animación tiene un propósito narrativo o funcional.
- [ ] Duraciones y curvas coherentes en todo el proyecto (definidas como constantes compartidas).
- [ ] Solo se animan propiedades baratas (`transform`, `opacity`).
- [ ] `prefers-reduced-motion` respetado globalmente.
- [ ] El contenido es legible y navegable sin animación.
- [ ] Fluido en móvil, sin scroll-jacking.
