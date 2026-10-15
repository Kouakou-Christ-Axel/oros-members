"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImportSteps } from "@/components/import/import-steps";
import { ImportApercu, type Apercu } from "@/components/import/import-apercu";
import { telecharger } from "@/lib/telecharger";
import type { Rapport, Strategie } from "@/lib/import/run";

async function envoyer<T>(file: File, champs: Record<string, string>): Promise<T> {
  const form = new FormData();
  form.set("file", file);
  Object.entries(champs).forEach(([k, v]) => form.set(k, v));
  const res = await fetch("/api/import", { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Import impossible.");
  return json as T;
}

export function ImportWizard() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [apercu, setApercu] = useState<Apercu | null>(null);
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [strategie, setStrategie] = useState<Strategie>("update");
  const [erreur, setErreur] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const step = rapport ? 3 : apercu ? 2 : 1;

  const recommencer = () => { setFile(null); setApercu(null); setRapport(null); setErreur(null); if (input.current) input.current.value = ""; };

  async function choisir(f: File) {
    setErreur(null); setBusy(true); setFile(f);
    try { setApercu(await envoyer<Apercu>(f, { mode: "apercu" })); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Fichier illisible."); setFile(null); }
    finally { setBusy(false); }
  }

  async function lancer() {
    if (!file) return;
    setErreur(null); setBusy(true);
    try { setRapport(await envoyer<Rapport>(file, { mode: "importer", strategie })); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Import impossible."); }
    finally { setBusy(false); }
  }

  return (
    <Page>
      <PageHeader
        title="Importer des membres"
        subtitle="Importez une liste depuis un fichier .xlsx, .xls ou .csv. Rien n'est écrit avant votre validation."
        actions={
          <>
            {step > 1 ? <Button variant="ghost" onClick={recommencer}><Icon name="arrow-left" size={16} />Recommencer</Button> : null}
            <Link href="/membres" data-slot="button" data-variant="outline" data-size="default">Retour aux membres</Link>
          </>
        }
      />
      <ImportSteps step={step} />
      {erreur ? <Alert variant="destructive" title="Erreur">{erreur}</Alert> : null}

      {step === 1 ? (
        <Card>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div data-slot="empty" style={{ borderColor: "var(--input)", padding: "44px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div data-slot="empty-media" style={{ background: "var(--accent)", color: "var(--accent-foreground)", width: 48, height: 48 }}>
                  <Icon name="file-spreadsheet" size={22} />
                </div>
                <div data-slot="empty-title">Choisissez votre fichier Excel</div>
                <div data-slot="empty-description">Formats acceptés : .xlsx, .xls, .csv — jusqu&apos;à 5 000 lignes et 5 Mo. La première ligne doit contenir les intitulés de colonnes.</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input ref={input} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => e.target.files?.[0] && choisir(e.target.files[0])} />
                <Button disabled={busy} onClick={() => input.current?.click()}><Icon name="upload" size={16} />Choisir un fichier</Button>
                <Button variant="outline" onClick={() => telecharger("/api/export/modele?format=xlsx")}><Icon name="download" size={16} />Télécharger le modèle</Button>
              </div>
            </div>
            <Alert variant="info" title="Colonnes attendues">
              Nom (et prénoms), Téléphone (obligatoires), puis Sexe, Date de naissance, Quartier, Date d&apos;arrivée, Statut, Département, Email. Les colonnes sont reconnues automatiquement d&apos;après leur intitulé.
            </Alert>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 && apercu && file ? (
        <ImportApercu fichier={file.name} apercu={apercu} strategie={strategie} onStrategie={setStrategie} onBack={recommencer} onRun={lancer} busy={busy} />
      ) : null}

      {step === 3 && rapport ? (
        <Card>
          <CardHeader className="border-b"><CardTitle>Import terminé</CardTitle><CardDescription>{file?.name}</CardDescription></CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Alert variant="success" title={`${rapport.crees} fiche(s) créée(s), ${rapport.maj} mise(s) à jour, ${rapport.ignorees} ignorée(s)`}>
              {rapport.erreurs.length
                ? `${rapport.erreurs.length} ligne(s) en erreur ignorée(s) : ${rapport.erreurs.slice(0, 5).map((e) => `ligne ${e.ligne} (${e.motif})`).join(", ")}${rapport.erreurs.length > 5 ? "…" : ""}.`
                : "Aucune erreur."}{" "}
              Les nouvelles fiches portent le statut « Nouveau » sauf indication contraire dans le fichier.
            </Alert>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href="/membres" data-slot="button" data-variant="default" data-size="default"><Icon name="users-round" size={16} />Voir les membres</Link>
              <Button variant="outline" onClick={recommencer}><Icon name="upload" size={16} />Importer un autre fichier</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </Page>
  );
}
