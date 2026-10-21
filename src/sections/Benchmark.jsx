import ChapterOpener from '../components/ChapterOpener.jsx';
import BenchmarkDashboard, { References } from '../dashboards/BenchmarkDashboard.jsx';
import { benchmark } from '../content/benchmark.js';

export default function Benchmark() {
  const { capitulo, titulo, entradilla } = benchmark;
  return (
    <section id="benchmark" aria-labelledby="benchmark-titulo" className="relative">
      <ChapterOpener capitulo={capitulo} titulo={titulo} entradilla={entradilla} tituloId="benchmark-titulo" />
      <div className="shell mx-auto max-w-[1440px] pb-28">
        <BenchmarkDashboard />
        <References />
      </div>
    </section>
  );
}
