const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf1 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatNumber = (n) => nf.format(Math.round(n));
export const formatDecimal = (n) => nf2.format(n);
export const formatOne = (n) => nf1.format(n);
export const formatPct = (n, signed = false) => `${signed && n > 0 ? '+' : ''}${nf1.format(n)} %`;
export const share = (v, total) => (total ? (v / total) * 100 : 0);
