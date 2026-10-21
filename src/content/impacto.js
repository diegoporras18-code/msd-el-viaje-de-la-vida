// Capítulo 04 · Impacto del concierto. Los resultados aún no existen:
// cada indicador muestra su estado pendiente hasta que se carguen datos reales.

export const impacto = {
  capitulo: 'Capítulo 04 · Impacto',
  titulo: { linea1: '¿Una noche logró', linea2: 'transformar la conversación?' },
  entradilla:
    'El 24 de octubre la música tendrá la palabra. Después, los datos dirán si la conversación cambió, cuánto y por cuánto tiempo.',
  estadoAntes: 'Medición prevista del 24 al 31 de octubre de 2026',
  estadoDespues: 'Periodo de medición: 24 al 31 de octubre de 2026',

  causalidad:
    'Una coincidencia temporal no prueba causalidad. Un aumento posterior al concierto se interpretará junto con su contenido (menciones del evento, de Fonseca o de MSD) y con otros sucesos del periodo, como las actividades de Octubre Rosa.',
  normalizacion:
    'Los periodos tienen duraciones distintas (23 días antes, 1 día durante, 7 días después), por eso se comparan promedios diarios y medianas, no totales.',

  modulos: {
    periodos: { titulo: 'Antes, durante y después', subtitulo: 'Promedio de registros por día en cada periodo · categoría' },
    diaria: { titulo: 'Evolución diaria alrededor del concierto', subtitulo: 'Registros por día · 17 al 31 de octubre' },
    horaria: { titulo: 'La noche del concierto, hora a hora', subtitulo: 'Registros por hora el 24 de octubre (hora de Bogotá)' },
    interacciones: { titulo: 'Interacciones generadas', subtitulo: 'Suma de interacciones registradas por SentiOne, por periodo' },
    menciones: { titulo: 'Menciones de MSD y Fonseca', subtitulo: 'Registros con mención explícita, promedio por día' },
    espontaneo: { titulo: 'Contenido espontáneo de asistentes', subtitulo: 'Publicaciones de asistentes identificadas en la revisión manual' },
    medios: { titulo: 'Medios que amplificaron la acción', subtitulo: 'Registros en sitios web y noticias verificadas' },
    creadores: { titulo: 'Creadores que compartieron contenido', subtitulo: 'Solo creadores verificados y revisados' },
    persistencia: { titulo: 'Persistencia del impacto', subtitulo: 'Cada día posterior frente al promedio diario previo' },
    intencion: { titulo: 'Indicadores de intención preventiva', subtitulo: 'Registros con señales de intención de prevenir, por cada 1.000 registros' },
    evidencias: { titulo: 'Evidencias', subtitulo: 'Enlaces a publicaciones, medios y contenidos verificados' },
  },
};
