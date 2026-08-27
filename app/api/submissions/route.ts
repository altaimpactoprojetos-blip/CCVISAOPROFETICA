import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { submissions } from "../../../db/schema";

const allowedKinds = new Set(["fazer_parte", "celula", "batismo", "oracao", "contato", "evento", "ministerio"]);

function cleanPayload(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Dados inválidos");
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 30).map(([key, item]) => [key.slice(0, 80), String(item ?? "").trim().slice(0, 3000)]);
  return Object.fromEntries(entries);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { kind?: unknown; payload?: unknown };
    const kind = typeof body.kind === "string" ? body.kind : "";
    if (!allowedKinds.has(kind)) return Response.json({ error: "Tipo de formulário inválido" }, { status: 400 });
    const payload = cleanPayload(body.payload);
    if (!Object.values(payload).some(Boolean)) return Response.json({ error: "Preencha o formulário" }, { status: 400 });
    const user = await getChatGPTUser();
    const db = getDb();
    const [submission] = await db.insert(submissions).values({ kind, payload: JSON.stringify(payload), ownerEmail: user?.email ?? null }).returning({ id: submissions.id });
    return Response.json({ ok: true, id: submission.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível registrar";
    return Response.json({ error: message }, { status: 500 });
  }
}
