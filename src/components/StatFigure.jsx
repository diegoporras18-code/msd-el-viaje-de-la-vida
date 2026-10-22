import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import CountUp from './CountUp.jsx';
import { duration, ease } from '../lib/motion.js';

const tones = {
  rosa: 'text-rosa',
  fucsia: 'text-fucsia',
  marfil: 'text-marfil',
};

/**
 * Cifra editorial a gran escala: índice, número protagonista, etiqueta en cursiva y detalle.
 * align: 'start' | 'end' — alterna la composición para un ritmo asimétrico.
 */
export default function StatFigure({ index, value, label, detail, tone = 'rosa', align = 'start' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Deriva horizontal sutil ligada al scroll: el número "viaja" mientras se lee.
  const drift = align === 'end' ? ['4%', '-2%'] : ['-4%', '2%'];
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : drift);
  const end = align === 'end';

  return (
    <div ref={ref} className="relative py-6 sm:py-8 lg:py-12">
      <motion.span
        className="absolute inset-x-0 top-0 block h-px origin-left bg-rosa/25"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: duration.reveal, ease: ease.reveal }}
        aria-hidden="true"
      />

      <div className={`grid gap-y-4 lg:grid-cols-12 lg:items-end lg:gap-x-8 ${end ? 'lg:text-right' : ''}`}>
        <p className={`eyebrow num text-bruma lg:col-span-1 ${end ? 'lg:order-last' : ''}`}>{index}</p>

        <motion.p
          style={{ x }}
          className={`display num whitespace-nowrap ${tones[tone]} lg:col-span-8 ${end ? 'lg:col-start-4' : ''}`}
        >
          <CountUp value={value} className="block text-[length:var(--step-5)]" />
        </motion.p>

        <motion.div
          className={`max-w-sm lg:col-span-3 lg:pb-[0.6em] ${end ? 'lg:order-first lg:col-start-1' : 'lg:justify-self-end'}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: duration.enter, ease: ease.out, delay: 0.4 }}
        >
          <p className="font-display text-[length:var(--step-2)] italic leading-tight text-marfil">{label}</p>
          <p className="mt-3 text-[length:var(--step--1)] leading-relaxed text-bruma">{detail}</p>
        </motion.div>
      </div>
    </div>
  );
}
