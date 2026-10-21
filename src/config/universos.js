// Universos de monitoreo: cada exportación de SentiOne se importa en uno de ellos.
// Para agregar un laboratorio, añade una entrada con tipo 'marca' y sus patrones
// en `ENTIDADES` (src/config/clasificacion.js). No hace falta tocar componentes.

export const UNIVERSOS = [
  {
    id: 'categoria',
    nombre: 'Conversación de categoría',
    corto: 'Categoría',
    tipo: 'categoria',
    color: '#F4A6C4',
    descripcion:
      'Consulta del proyecto SentiOne «MSD»: conversación general sobre cáncer de mama. El nombre del proyecto no implica que cada registro mencione a MSD.',
  },
  {
    id: 'msd',
    nombre: 'MSD',
    corto: 'MSD',
    tipo: 'marca',
    color: '#E2457F',
    descripcion: 'Exportación específica de menciones de MSD con los mismos criterios de la categoría.',
  },
  {
    id: 'daiichi-sankyo',
    nombre: 'Daiichi Sankyo',
    corto: 'Daiichi Sankyo',
    tipo: 'marca',
    color: '#F2C46D',
    descripcion: 'Exportación de SentiOne independiente para Daiichi Sankyo.',
  },
  {
    id: 'astrazeneca',
    nombre: 'AstraZeneca',
    corto: 'AstraZeneca',
    tipo: 'marca',
    color: '#9FA8F5',
    descripcion: 'Exportación de SentiOne independiente para AstraZeneca.',
  },
];

export const MARCAS = UNIVERSOS.filter((u) => u.tipo === 'marca');

export const universoPorId = (id) => UNIVERSOS.find((u) => u.id === id);

// Paleta categórica para segmentos (plataformas, tipos), apta para fondo ciruela.
export const PALETA = ['#F4A6C4', '#E2457F', '#F2C46D', '#9FA8F5', '#6FD3C1', '#E8916B', '#C9B3C0', '#B07AE0', '#7FB0E8'];

// Share of Voice: solo se calcula si todas las marcas elegidas cubren el mismo periodo.
export const SOV = {
  diasMinimos: 7,
};
