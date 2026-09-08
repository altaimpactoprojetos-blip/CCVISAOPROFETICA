import { database, rpcNumber, supabaseErrorCode } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, id } from "../../../../lib/validation";
export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Math.min(100000, Number(params.get("page")) || 1));
    const db = database();
    let query = db.from("submissions").select("*", {count: "exact"});
    if (params.get("kind")) query = query.eq("kind", params.get("kind"));
    if (params.get("event")) query = query.eq("event_id", id(params.get("event")));
    if (params.get("search")) {
      const search = params.get("search")!.slice(0, 100).replace(/[\\%_]/g, "\\$&");
      query = query.ilike("payload", `%${search}%`);
    }
    const result = await query.order("id", {ascending: false}).range((Math.floor(page) - 1) * 30, Math.floor(page) * 30 - 1);
    if (result.error) throw result.error;
    const rows = result.data ?? [];
    const eventIds = [...new Set(rows.map(row => Number(row.event_id)).filter(Number.isSafeInteger))];
    const eventNames = new Map<number, string>();
    if (eventIds.length) {
      const events = await db.from("events").select("id, name").in("id", eventIds);
      if (events.error) throw events.error;
      for (const event of events.data ?? []) eventNames.set(Number(event.id), event.name);
    }
    return privateJson({
      total: result.count ?? 0,
      rows: rows.map(row => ({...row, event_name: row.event_id ? eventNames.get(Number(row.event_id)) ?? null : null})),
      page: Math.floor(page),
    });
  } catch (error) { return requestFailure(error); }
}
export async function PATCH(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    if (!["novo", "em_contato", "confirmado", "cancelado"].includes(String(data.status))) throw new RequestError("Situação inválida.");
    const db = database();
    const submissionId = id(data.id);
    const found = await db.from("submissions").select("id").eq("id", submissionId).maybeSingle();
    if (found.error) throw found.error;
    if (!found.data) throw new RequestError("Inscrição não encontrada.", 404);
    const result = await db.rpc("update_submission_status", {p_submission_id: submissionId, p_status: String(data.status)});
    if (result.error) throw result.error;
    if (rpcNumber(result.data) !== 1) throw new RequestError("O evento está lotado. A inscrição não pode ser reativada.", 409);
    return privateJson({ok: true});
  } catch (error) {
    if (supabaseErrorCode(error) === "23505" || String(error).includes("UNIQUE constraint")) return privateJson({error: "Já existe outra inscrição ativa desse e-mail no evento."}, 409);
    return requestFailure(error);
  }
}
