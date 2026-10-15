/* Robustesse d'un mot de passe : 0 (trop court) à 4 (très bonne). Pur, côté client ou serveur. */
export function forceMotDePasse(mdp: string) {
  let n = 0;
  if (mdp.length >= 10) n++;
  if (mdp.length >= 14) n++;
  if (/[A-Z]/.test(mdp) && /[a-z]/.test(mdp)) n++;
  if (/[0-9]/.test(mdp)) n++;
  if (/[^A-Za-z0-9]/.test(mdp)) n++;
  return Math.min(n, 4);
}
