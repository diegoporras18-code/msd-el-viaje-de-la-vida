import { motion } from 'motion/react';
import { duration, ease, stagger } from '../lib/motion.js';

const line = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: duration.reveal, ease: ease.reveal } },
};

/**
 * Titular que entra línea por línea desde una máscara.
 * lines: [{ text, className }] — el texto completo queda en el DOM para lectores de pantalla.
 * trigger: 'mount' (al cargar) o 'inView' (al entrar en pantalla).
 */
export default function LineReveal({ as = 'h2', lines, className = '', trigger = 'inView', delay = 0, id }) {
  const Tag = motion[as];
  const play = trigger === 'mount' ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, amount: 0.5 } };

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      {...play}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger.lines, delayChildren: delay } } }}
    >
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span variants={line} className={`block will-change-transform ${l.className ?? ''}`}>
            {l.text}
          </motion.span>
          {i < lines.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
