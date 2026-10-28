import { database } from "../../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../../lib/admin-auth";
import { body, id } from "../../../../../lib/validation";
import { ticketNumber, ticketUrl } from "../../../../../lib/tickets";
import { sendReminderEmail } from "../../../../../lib/email";

// O Worker tem limite de requisições externas por chamada; o painel repete até acabar.
const batchSize = 15;

async function eventWithRegistrations(eventId: number) {
  const db = database();
  const event = await db.from("events").select("id, name, event_date, time, location").eq("id", eventId).maybeSingle();
  if (event.error) throw event.error;
  if (!event.data) throw new RequestError("Evento não encontrado.", 404);
  const rows = await db.from("submissions").select("id, payload, ticket_code, reminder_sent_at").eq("event_id", eventId).neq("status", "cancelado").order("id");
  if (rows.error) throw rows.error;
  return {event: event.data, rows: rows.data ?? []};
}

function person(row: {payload: string}) {
  let payload: Record<string, string> = {};
  try { payload = JSON.parse(row.payload); } catch { payload = {}; }
  return {name: String(payload.nome ?? ""), email: String(payload.email ?? ""), whatsapp: String(payload.whatsapp ?? "")};
}

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const url = new URL(request.url);
    const {event, rows} = await eventWithRegistrations(id(url.searchParams.get("event")));
    return privateJson({
      event,
      rows: rows.map(row => ({id: row.id, ...person(row), number: ticketNumber(event.id, row.id), url: row.ticket_code ? ticketUrl(url.origin, row.ticket_code) : "", reminder_sent_at: row.reminder_sent_at})),
    });
  } catch (error) { return requestFailure(error); }
}

/** Envia o lembrete por e-mail para quem ainda não recebeu, em lotes. */
export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    const origin = new URL(request.url).origin;
    const {event, rows} = await eventWithRegistrations(id(data.event_id));
    const pending = rows.filter(row => !row.reminder_sent_at && row.ticket_code && person(row).email);
    let sent = 0, failed = 0, limit = false;
    const db = database();
    for (const row of pending.slice(0, batchSize)) {
      const result = await sendReminderEmail({...person(row), number: ticketNumber(event.id, row.id), url: ticketUrl(origin, row.ticket_code as string), event});
      if (result === "sem_configuracao") throw new RequestError("Configure o e-mail do Brevo em Programação e contato.");
      if (result === "limite") { limit = true; break; }
      if (result === "falhou") { failed++; continue; }
      sent++;
      const marked = await db.from("submissions").update({reminder_sent_at: new Date().toISOString()}).eq("id", row.id);
      if (marked.error) throw marked.error;
    }
    return privateJson({ok: true, sent, failed, limit, remaining: pending.length - sent});
  } catch (error) { return requestFailure(error); }
}
