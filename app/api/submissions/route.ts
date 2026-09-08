import { getChatGPTUser } from "../../chatgpt-auth";
import { database, rpcNumber, supabaseErrorCode } from "../../../lib/database";

const allowedKinds = new Set(["fazer_parte", "celula", "batismo", "oracao", "contato", "evento", "ministerio"]);
function cleanPayload(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Dados inválidos");
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0,30).map(([key, item]) => [key.slice(0,80), String(item ?? "").trim().slice(0,3000)]));
}
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 32000) return Response.json({error: "Dados acima do limite permitido."}, {status: 413});
    let body; try { body = JSON.parse(raw); } catch { return Response.json({error: "Dados inválidos."}, {status: 400}); }
    if (!body || typeof body !== "object") return Response.json({error: "Dados inválidos."}, {status: 400});
    const kind = typeof body.kind === "string" ? body.kind : "";
    if (!allowedKinds.has(kind)) return Response.json({error: "Tipo de formulário inválido."}, {status: 400});
    let payload; try { payload = cleanPayload(body.payload); } catch { return Response.json({error: "Dados inválidos."}, {status: 400}); }
    if (!Object.values(payload).some(Boolean)) return Response.json({error: "Preencha o formulário."}, {status: 400});
    const user = await getChatGPTUser();
    const db = database();
    if (kind === "evento") {
      const eventId = Number(body.eventId);
      if (!Number.isSafeInteger(eventId) || eventId < 1) return Response.json({error: "Evento inválido."}, {status: 400});
      const email = (payload.email ?? "").toLowerCase().trim();
      if (!payload.nome || payload.nome.length > 160 || !payload.whatsapp || payload.whatsapp.length > 40 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({error: "Preencha nome, WhatsApp e um e-mail válido."}, {status: 400});
      payload.email = email;
      // The RPC locks the event row while checking capacity so concurrent requests cannot take the same last place.
      const result = await db.rpc("register_event_submission", {
        p_payload: JSON.stringify(payload),
        p_owner_email: user?.email ?? null,
        p_registrant_email: email,
        p_event_id: eventId,
      });
      if (result.error) throw result.error;
      const submissionId = rpcNumber(result.data);
      if (!submissionId) return Response.json({error: "Este evento está com inscrições encerradas ou sem vagas."}, {status: 409});
      return Response.json({ok: true, id: submissionId}, {status: 201});
    }
    const result = await db.from("submissions").insert({kind, payload: JSON.stringify(payload), owner_email: user?.email ?? null}).select("id").single();
    if (result.error) throw result.error;
    return Response.json({ok: true, id: result.data.id}, {status: 201});
  } catch (error) {
    if (supabaseErrorCode(error) === "23505" || String(error).includes("UNIQUE constraint")) return Response.json({error: "Este e-mail já está inscrito neste evento."}, {status: 409});
    console.error("Submission failed", error);
    return Response.json({error: "Não foi possível registrar agora. Tente novamente em instantes."}, {status: 503});
  }
}
