// Marcas, campañas y entidades que se identifican en la base maestra.
// Todas salen de la MISMA base: un registro puede mencionar varias a la vez.
//
// `patrones`: detección de menciones explícitas del nombre corporativo (Claude la valida al clasificar).
// Nunca se detecta un laboratorio por el nombre de un medicamento: un fármaco puede tener varios
// titulares, licencias o biosimilares, y nombrarlo no implica que la publicación sea del laboratorio.
// `cobertura` (solo laboratorios): cómo captura la consulta de SentiOne a esa marca.
//   'equivalente'  → la consulta incluye sus términos con el mismo criterio que MSD.
//   'incidental'   → solo aparece cuando la conversación general la menciona.
//   'por-confirmar'→ no se ha verificado el diseño de la consulta.
// El Share of Voice solo se calcula si todas las marcas comparadas tienen 'equivalente'.

export const ENTIDADES = [
  { id: 'msd', nombre: 'MSD', tipo: 'laboratorio', color: '#E2457F', cobertura: 'por-confirmar', patrones: ['msd', 'merck sharp', '#msd', 'msd colombia', 'msd salud'] },
  { id: 'daiichi-sankyo', nombre: 'Daiichi Sankyo', tipo: 'laboratorio', color: '#F2C46D', cobertura: 'por-confirmar', patrones: ['daiichi'] },
  { id: 'astrazeneca', nombre: 'AstraZeneca', tipo: 'laboratorio', color: '#9FA8F5', cobertura: 'por-confirmar', patrones: ['astrazeneca', 'astra zeneca', '@astrazeneca'] },
  // Laboratorios que la consulta solo capta cuando la conversación general los nombra.
  // `excluir`: expresiones que contienen el patrón pero no se refieren al laboratorio.
  { id: 'roche', nombre: 'Roche', tipo: 'laboratorio', color: '#7FB7E8', cobertura: 'incidental', patrones: ['roche', 'genentech'], excluir: ['roche-posay', 'roche posay', 'roche bobois'] },
  { id: 'novartis', nombre: 'Novartis', tipo: 'laboratorio', color: '#B39DDB', cobertura: 'incidental', patrones: ['novartis'] },
  { id: 'pfizer', nombre: 'Pfizer', tipo: 'laboratorio', color: '#80CBC4', cobertura: 'incidental', patrones: ['pfizer'] },
  { id: 'lilly', nombre: 'Lilly', tipo: 'laboratorio', color: '#EF9A9A', cobertura: 'incidental', patrones: ['eli lilly', 'lilly oncology', 'lilly colombia', '@elilillyandco', 'laboratorio lilly', 'farmaceutica lilly'] },
  { id: 'gilead', nombre: 'Gilead', tipo: 'laboratorio', color: '#FFCC80', cobertura: 'incidental', patrones: ['gilead', 'kite pharma'] },
  { id: 'menarini', nombre: 'Menarini Stemline', tipo: 'laboratorio', color: '#A5D6A7', cobertura: 'incidental', patrones: ['menarini', 'stemline'] },
  { id: 'bayer', nombre: 'Bayer', tipo: 'laboratorio', color: '#90CAF9', cobertura: 'incidental', patrones: ['bayer'] },
  {
    id: 'otro-laboratorio',
    nombre: 'Otros laboratorios',
    tipo: 'laboratorio',
    color: '#6FD3C1',
    cobertura: 'incidental',
    patrones: ['sanofi', 'abbvie', 'amgen', 'bristol myers', 'bristol-myers', 'glaxosmithkline', 'gsk', 'boehringer', 'janssen', 'johnson & johnson', 'takeda', 'teva', 'sandoz', 'viatris', 'seagen', 'pierre fabre', 'tecnoquimicas', 'procaps', 'biocon', 'celltrion', 'eisai'],
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
