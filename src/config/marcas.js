// Marcas, campañas y entidades que se identifican en la base maestra.
// Todas salen de la MISMA base: un registro puede mencionar varias a la vez.
//
// `patrones`: detección de menciones explícitas en el texto (Claude la valida al clasificar).
// `cobertura` (solo laboratorios): cómo captura la consulta de SentiOne a esa marca.
//   'equivalente'  → la consulta incluye sus términos con el mismo criterio que MSD.
//   'incidental'   → solo aparece cuando la conversación general la menciona.
//   'por-confirmar'→ no se ha verificado el diseño de la consulta.
// El Share of Voice solo se calcula si todas las marcas comparadas tienen 'equivalente'.

export const ENTIDADES = [
  { id: 'msd', nombre: 'MSD', tipo: 'laboratorio', color: '#E2457F', cobertura: 'por-confirmar', patrones: ['msd', 'merck sharp', '#msd', 'msd colombia'] },
  { id: 'daiichi-sankyo', nombre: 'Daiichi Sankyo', tipo: 'laboratorio', color: '#F2C46D', cobertura: 'por-confirmar', patrones: ['daiichi'] },
  { id: 'astrazeneca', nombre: 'AstraZeneca', tipo: 'laboratorio', color: '#9FA8F5', cobertura: 'por-confirmar', patrones: ['astrazeneca', 'astra zeneca'] },
  {
    id: 'otro-laboratorio',
    nombre: 'Otros laboratorios',
    tipo: 'laboratorio',
    color: '#6FD3C1',
    cobertura: 'incidental',
    patrones: ['roche', 'novartis', 'pfizer', 'eli lilly', 'gilead', 'sanofi', 'bayer', 'abbvie', 'amgen', 'bristol myers', 'glaxosmithkline', 'gsk', 'boehringer'],
  },
  { id: 'fonseca', nombre: 'Fonseca', tipo: 'artista', color: '#F4A6C4', patrones: ['fonseca'] },
  { id: 'el-viaje-de-la-vida', nombre: 'El Viaje de la Vida', tipo: 'campana', color: '#F4A6C4', patrones: ['el viaje de la vida', 'viajedelavida', '#elviajedelavida'] },
  { id: 'lotengo', nombre: 'Lotengo', tipo: 'agencia', color: '#C9B3C0', patrones: ['lotengo'] },
];

export const LABORATORIOS = ENTIDADES.filter((e) => e.tipo === 'laboratorio');
// Marcas comparadas en el benchmark de la presentación.
export const BENCHMARK = ['msd', 'daiichi-sankyo', 'astrazeneca'];
export const entidad = (id) => ENTIDADES.find((e) => e.id === id);
export const IDS_ENTIDADES = new Set(ENTIDADES.map((e) => e.id));
