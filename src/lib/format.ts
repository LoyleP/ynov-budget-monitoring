const utc = { timeZone: "UTC" } as const;

export const formatDateShort = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { ...utc, weekday: "short", day: "numeric", month: "long" }).format(new Date(`${iso}T00:00:00Z`));

export const formatDateLong = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { ...utc, dateStyle: "full" }).format(new Date(`${iso}T00:00:00Z`));

export const formatEuro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
