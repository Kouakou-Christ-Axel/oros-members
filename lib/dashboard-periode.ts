/* Périodes du tableau de bord + découpage de la série « arrivées ».
   Pur (pas de DB) : toutes les dates sont en UTC, comme les dates stockées. */
export const PERIODES = [
  { id: "mois", label: "Mois en cours" },
  { id: "j30", label: "30 derniers jours" },
  { id: "annee", label: "Année en cours" },
  { id: "douze", label: "12 mois" },
  { id: "plage", label: "Plage" },
] as const;

export type PeriodeId = (typeof PERIODES)[number]["id"];

export interface Bucket { label: string; from: Date; to: Date }
export interface Periode { from: Date; to: Date; buckets: Bucket[]; unite: "semaine" | "mois" }

const DAY = 86_400_000;
const MOIS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

const utc = (y: number, m: number, d = 1) => new Date(Date.UTC(y, m, d));

function isoWeek(d: Date) {
  const t = utc(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t.getTime() - utc(t.getUTCFullYear(), 0, 1).getTime()) / DAY + 1) / 7);
}

/** `n` semaines glissantes se terminant à `fin` (exclu). */
function semaines(fin: Date, n: number): Bucket[] {
  return Array.from({ length: n }, (_, i) => {
    const to = new Date(fin.getTime() - (n - 1 - i) * 7 * DAY);
    const from = new Date(to.getTime() - 7 * DAY);
    return { label: `S${isoWeek(from)}`, from, to };
  });
}

/** Mois entiers de `debut` à `fin` inclus (rang = année*12+mois). */
function mois(debut: Date, fin: Date): Bucket[] {
  const out: Bucket[] = [];
  for (let r = debut.getUTCFullYear() * 12 + debut.getUTCMonth(); r <= fin.getUTCFullYear() * 12 + fin.getUTCMonth(); r++) {
    const y = Math.floor(r / 12), m = r % 12;
    out.push({ label: MOIS[m], from: utc(y, m), to: utc(y, m + 1) });
  }
  return out;
}

const dateValide = (s?: string): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

export function resolvePeriode(id: PeriodeId, now: Date, du?: string, au?: string): Periode {
  const demain = new Date(utc(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()).getTime() + DAY);
  const y = now.getUTCFullYear(), m = now.getUTCMonth();
  switch (id) {
    case "mois": return { from: utc(y, m), to: demain, buckets: semaines(demain, 8), unite: "semaine" };
    case "j30": return { from: new Date(demain.getTime() - 30 * DAY), to: demain, buckets: semaines(demain, 8), unite: "semaine" };
    case "annee": return { from: utc(y, 0), to: demain, buckets: mois(utc(y, 0), now), unite: "mois" };
    case "douze": { const d = utc(y, m - 11); return { from: d, to: demain, buckets: mois(d, now), unite: "mois" }; }
    case "plage": {
      const a = dateValide(du) ? new Date(`${du}T00:00:00Z`) : utc(y, m - 11);
      const b = dateValide(au) ? new Date(`${au}T00:00:00Z`) : now;
      const [debut, f] = a <= b ? [a, b] : [b, a];
      // au plus 36 mois affichés, quelle que soit la plage demandée dans l'URL
      const plancher = utc(f.getUTCFullYear(), f.getUTCMonth() - 35);
      const d = debut < plancher ? plancher : debut;
      return { from: d, to: new Date(f.getTime() + DAY), buckets: mois(d, f), unite: "mois" };
    }
  }
}

export const isPeriode = (v: string | undefined): v is PeriodeId => PERIODES.some((p) => p.id === v);
