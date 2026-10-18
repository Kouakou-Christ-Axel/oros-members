import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { buildTable, EXPORT_TYPES, toCsv, toXlsx, type ExportType } from "@/lib/export";

/* GET /api/export/{membres|serviteurs|departements}?format=xlsx|csv
   Route Handler (fichier binaire, pas une Server Action) — session vérifiée ici. */
export async function GET(request: Request, { params }: RouteContext<"/api/export/[type]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { type } = await params;
  if (!EXPORT_TYPES.includes(type as ExportType)) return NextResponse.json({ error: "Export inconnu." }, { status: 404 });

  const table = await buildTable(type as ExportType);
  const csv = new URL(request.url).searchParams.get("format") === "csv";
  const nom = `oros-${type}-${new Date().toISOString().slice(0, 10)}`;

  await db.journalAction.create({ data: { userId: session.user.id, action: `export:${type}`, cible: `${table.lignes.length} lignes` } });

  const body = csv ? toCsv(table) : new Uint8Array(toXlsx(table));
  return new Response(body, {
    headers: {
      "Content-Type": csv ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nom}.${csv ? "csv" : "xlsx"}"`,
      "Cache-Control": "no-store",
    },
  });
}
