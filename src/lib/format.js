const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export const formatNumber = (n) => nf.format(Math.round(n));
