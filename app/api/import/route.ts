import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/dal";
import { apercu, importer, type Strategie } from "@/lib/import/run";
import { MAX_OCTETS } from "@/lib/import/parse";

/* POST multipart : `file` + `mode` ("apercu" | "importer") [+ `strategie`].
   Route Handler et non Server Action : upload de fichier + réponse JSON structurée.
   Vérifie la session ici (une route est un endpoint public). */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  if (file.size > MAX_OCTETS) return NextResponse.json({ error: "Fichier trop volumineux (5 Mo maximum)." }, { status: 413 });
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return NextResponse.json({ error: "Format non pris en charge." }, { status: 400 });

  try {
    const buf = await file.arrayBuffer();
    if (form.get("mode") === "importer") {
      const s = form.get("strategie");
      const strategie: Strategie = s === "skip" || s === "dup" ? s : "update";
      return NextResponse.json(await importer(buf, strategie, session.user));
    }
    return NextResponse.json(await apercu(buf));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fichier illisible." }, { status: 422 });
  }
}
