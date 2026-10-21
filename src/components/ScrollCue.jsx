import { motion } from 'motion/react';
import { ease } from '../lib/motion.js';

/** Indicador animado para continuar hacia la siguiente sección. */
export default function ScrollCue({ href, label, delay = 0 }) {
  return (
    <motion.a
      href={href}
      className="group inline-flex min-h-11 items-center gap-4 py-2 text-bruma transition-colors hover:text-marfil"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
    >
      <span className="relative h-12 w-px overflow-hidden bg-rosa/20" aria-hidden="true">
        <motion.span
          className="absolute inset-x-0 top-0 h-1/2 bg-rosa"
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 1.8, ease: ease.out, repeat: Infinity, repeatDelay: 0.4 }}
        />
      </span>
      <span className="eyebrow">{label}</span>
    </motion.a>
  );
}
