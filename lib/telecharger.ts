/* Déclenche le téléchargement d'un fichier servi par un Route Handler
   (Content-Disposition: attachment) sans quitter la page. Côté client uniquement. */
export function telecharger(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.append(a);
  a.click();
  a.remove();
}
