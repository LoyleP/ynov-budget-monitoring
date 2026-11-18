const utc = { timeZone: "UTC" } as const;

export const formatDateShort = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { ...utc, weekday: "short", day: "numeric", month: "long" }).format(new Date(`${iso}T00:00:00Z`));

export const formatDateLong = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { ...utc, dateStyle: "full" }).format(new Date(`${iso}T00:00:00Z`));

export const formatEuro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const k = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const m = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
export const formatK = (v: number | null) => (v === null ? "–" : k.format(v));
/** Amounts are in K€; from 1 000 K€ show M€. */
export const formatKCompact = (v: number) => (Math.abs(v) >= 1000 ? `${m.format(v / 1000)} M€` : `${formatK(v)} K€`);
