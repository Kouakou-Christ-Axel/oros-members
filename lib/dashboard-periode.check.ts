/* Auto-vérification : `npx tsx lib/dashboard-periode.check.ts` */
import assert from "node:assert/strict";
import { resolvePeriode } from "@/lib/dashboard-periode";

const now = new Date(Date.UTC(2026, 9, 15));
const p = resolvePeriode("plage", now, "foo", "2026-13-99");
assert.ok(!isNaN(p.from.getTime()) && !isNaN(p.to.getTime()), "dates invalides ignorées");
const large = resolvePeriode("plage", now, "0001-01-01", "2026-10-01");
assert.ok(large.buckets.length <= 36, "plage plafonnée à 36 mois");
assert.equal(resolvePeriode("douze", now).buckets.length, 12);
console.log("periode check OK");
