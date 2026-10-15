import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { LigneApercu, Strategie } from "@/lib/import/run";

export interface Apercu {
  total: number;
  colonnes: string[];
  compte: Record<"nouveau" | "maj" | "doublon" | "erreur", number>;
  lignes: LigneApercu[];
}

const ETATS = {
  nouveau: { label: "Nouvelle fiche", variant: "secondary" },
  maj: { label: "Mise à jour", variant: "outline" },
  doublon: { label: "Doublon", variant: "outline" },
  erreur: { label: "Erreur", variant: "destructive" },
} as const;

interface Props {
  fichier: string;
  apercu: Apercu;
  strategie: Strategie;
  onStrategie: (s: Strategie) => void;
  onBack: () => void;
  onRun: () => void;
  busy: boolean;
}

export function ImportApercu({ fichier, apercu: a, strategie, onStrategie, onBack, onRun, busy }: Props) {
  const c = a.compte;
  return (
    <>
      <Alert variant="info" title={`${fichier} · ${a.total} ligne${a.total > 1 ? "s" : ""} lue${a.total > 1 ? "s" : ""}`}>
        {c.nouveau} nouvelle(s) fiche(s), {c.maj} mise(s) à jour, {c.doublon} doublon(s), {c.erreur} erreur(s). Les lignes en erreur seront ignorées.
        Colonnes reconnues : {a.colonnes.join(", ")}.
      </Alert>

      <Card pad="flush">
        <CardHeader className="border-b" style={{ padding: "16px 20px" }}>
          <CardTitle>Aperçu des {a.lignes.length} premières lignes</CardTitle>
          <CardDescription>Aucune donnée n&apos;est enregistrée à cette étape.</CardDescription>
        </CardHeader>
        <Table density="dense">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 20, width: 44 }}>#</TableHead>
              <TableHead>Nom et prénoms</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Résultat</TableHead>
              <TableHead style={{ paddingRight: 20, textAlign: "right" }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {a.lignes.map((r) => (
              <TableRow key={r.ligne} style={r.etat === "erreur" ? { background: "var(--status-danger-bg)" } : undefined}>
                <TableCell style={{ paddingLeft: 20, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{r.ligne}</TableCell>
                <TableCell style={{ fontWeight: 500 }}>{r.nom || "—"}</TableCell>
                <TableCell style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: r.etat === "erreur" ? "var(--destructive)" : "var(--warm-600)" }}>{r.telephone}</TableCell>
                <TableCell>{r.departement ?? "—"}</TableCell>
                <TableCell><Badge variant={ETATS[r.etat].variant}>{ETATS[r.etat].label}</Badge></TableCell>
                <TableCell style={{ paddingRight: 20, textAlign: "right", fontSize: 12, color: "var(--muted-foreground)" }}>{r.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader className="border-b"><CardTitle>En cas de doublon</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup>
            <RadioGroupItem label="Mettre à jour la fiche existante avec les nouvelles valeurs" checked={strategie === "update"} onChange={() => onStrategie("update")} />
            <RadioGroupItem label="Ignorer la ligne et conserver la fiche existante" checked={strategie === "skip"} onChange={() => onStrategie("skip")} />
            <RadioGroupItem label="Créer une seconde fiche (déconseillé)" checked={strategie === "dup"} onChange={() => onStrategie("dup")} />
          </RadioGroup>
        </CardContent>
        <CardFooter className="border-t" style={{ gap: 8 }}>
          <span style={{ flex: 1 }} />
          <Button variant="outline" onClick={onBack}>Retour</Button>
          <Button onClick={onRun} disabled={busy}><Icon name="check" size={16} />Lancer l&apos;import</Button>
        </CardFooter>
      </Card>
    </>
  );
}
