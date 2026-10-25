// Fecha técnica codificada en el ID Snowflake de X; no equivale a consultar la plataforma.
export function fechaDesdeIdX(codigo) {
  if (!/^\d{15,20}$/.test(String(codigo))) throw new Error('ID Snowflake de X inválido');
  const ms = Number((BigInt(codigo) >> 22n) + 1288834974657n);
  const instant = new Date(ms);
  if (!Number.isFinite(ms) || instant.getUTCFullYear() < 2011 || instant.getUTCFullYear() > 2100) throw new Error('Fecha Snowflake fuera de rango');
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
  return { fecha, utc: instant.toISOString(), zona: 'America/Bogota', fuente: 'fecha_codificada_id_x', verificadaEnPlataforma: false };
}
