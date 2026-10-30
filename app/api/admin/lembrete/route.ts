import { database } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, id, text, time } from "../../../../lib/validation";
import { displayName } from "../../../../lib/checkin";
import { ticketNumber, ticketUrl } from "../../../../lib/tickets";
import { sendReminderEmails, type ReminderRecipient } from "../../../../lib/email";

const startOfToday = () => `${new Date().toLocaleDateString("en-CA", {timeZone: "America/Fortaleza"})}T03:00:00Z`;

async function pending(eventId: number) {
  const result = await database().from("submissions").select("id, payload, ticket_code, reminder_sent_at").eq("event_id", eventId).neq("status", "cancelado").order("id").range(0, 4999);
  if (result.error) throw result.error;
  const since = startOfToday();
  return (result.data ?? []).filter(row => row.ticket_code && !(row.reminder_sent_at && row.reminder_sent_at >= since));
}

/** Quantas pessoas ainda não receberam o lembrete hoje. */
export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const eventId = id(new URL(request.url).searchParams.get("event"));
    return privateJson({pending: (await pending(eventId)).length});
  } catch (error) { return requestFailure(error); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminRequest(request);
    const data = await body(request);
    const eventId = id(data.event_id);
    const eventTime = time(data.time);
    const note = text(data.note ?? "", "recado", 600, false);
    const db = database();
    const event = await db.from("events").select("id, name, event_date, location").eq("id", eventId).maybeSingle();
    if (event.error) throw event.error;
    if (!event.data) throw new RequestError("Evento não encontrado.", 404);
    const origin = new URL(request.url).origin;
    if (data.mode === "teste") {
      const sample = await db.from("submissions").select("id, ticket_code").eq("event_id", eventId).not("ticket_code", "is", null).limit(1).maybeSingle();
      if (sample.error) throw sample.error;
      const recipient: ReminderRecipient = {email: admin.email, name: "Teste", number: sample.data ? ticketNumber(eventId, sample.data.id) : "00-00000", url: sample.data ? ticketUrl(origin, sample.data.ticket_code) : origin};
      await sendReminderEmails(event.data, eventTime, note, [recipient]);
      return privateJson({sent: 1, to: admin.email});
    }
    if (data.mode !== "todas") throw new RequestError("Envio inválido.");
    const rows = await pending(eventId);
    const recipients: (ReminderRecipient & {id: number})[] = [];
    for (const row of rows) {
      let payload: Record<string, string> = {};
      try { payload = JSON.parse(row.payload); } catch { continue; }
      const email = String(payload.email ?? "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
      const name = displayName(String(payload.nome ?? "")).includes("@") ? "" : displayName(String(payload.nome ?? ""));
      recipients.push({id: row.id, email, name, number: ticketNumber(eventId, row.id), url: ticketUrl(origin, row.ticket_code)});
    }
    let sent = 0;
    // Marca cada lote logo após o envio: se algo falhar no meio, ninguém recebe duas vezes.
    for (let start = 0; start < recipients.length; start += 90) {
      const batch = recipients.slice(start, start + 90);
      await sendReminderEmails(event.data, eventTime, note, batch);
      const marked = await db.from("submissions").update({reminder_sent_at: new Date().toISOString()}).in("id", batch.map(person => person.id));
      if (marked.error) throw marked.error;
      sent += batch.length;
    }
    return privateJson({sent});
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("O Brevo") || error instanceof Error && error.message.startsWith("Configure")) return privateJson({error: error.message}, 502);
    return requestFailure(error);
  }
}
