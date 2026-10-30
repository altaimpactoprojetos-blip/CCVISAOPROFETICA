import { database } from "./database";
import { ticketCodePattern, ticketNumber } from "./tickets";
import { RequestError, type StaffUser } from "./admin-auth";

export type CheckInEvent = {id: number; name: string; event_date: string; time: string; location: string};
export type Registrant = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  number: string;
  code: string;
  created_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
};

const lowerWords = new Set(["da", "das", "de", "do", "dos", "e"]);
/** "maria DA silva" → "Maria da Silva" para a lista ficar uniforme. */
export function displayName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR").split(" ")
    .map((word, index) => index > 0 && lowerWords.has(word) ? word : word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1))
    .join(" ");
}
export const sortKey = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value.trim();
}

/** Eventos para a recepção escolher, com o de mulheres (ou o próximo) primeiro. */
export async function checkInEvents(): Promise<CheckInEvent[]> {
  const result = await database().from("events").select("id, name, event_date, time, location").order("event_date", {ascending: true}).order("id", {ascending: true});
  if (result.error) throw result.error;
  return (result.data ?? []) as CheckInEvent[];
}
export function defaultEvent(events: CheckInEvent[]) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(event => event.event_date >= today);
  return upcoming.find(event => /mulher/i.test(event.name)) ?? events.find(event => /mulher/i.test(event.name)) ?? upcoming[0] ?? events[events.length - 1] ?? null;
}

/** Todas as inscrições ativas do evento, em ordem alfabética. */
export async function registrants(eventId: number): Promise<Registrant[]> {
  const db = database();
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += 1000) {
    const page = await db.from("submissions").select("id, payload, created_at, ticket_code, checked_in_at, checked_in_by")
      .eq("event_id", eventId).neq("status", "cancelado").order("id", {ascending: true}).range(from, from + 999);
    if (page.error) throw page.error;
    rows.push(...(page.data ?? []));
    if ((page.data?.length ?? 0) < 1000) break;
  }
  return rows.map(row => {
    let payload: Record<string, string> = {};
    try { payload = JSON.parse(String(row.payload)); } catch { payload = {}; }
    return {
      id: Number(row.id),
      name: displayName(String(payload.nome || payload.email || `Inscrição ${row.id}`)),
      email: String(payload.email ?? ""),
      whatsapp: formatPhone(String(payload.whatsapp || payload.telefone || "")),
      number: ticketNumber(eventId, Number(row.id)),
      code: String(row.ticket_code ?? ""),
      created_at: String(row.created_at),
      checked_in_at: (row.checked_in_at as string | null) ?? null,
      checked_in_by: (row.checked_in_by as string | null) ?? null,
    };
  }).sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), "pt-BR") || a.id - b.id);
}

/** Aceita o link do QR code, o código de 10 letras ou o nº 01-00023. */
export function parseTicketInput(value: string) {
  const text = value.trim();
  const fromUrl = text.match(/inscricao\/([A-Za-z2-9]{10})/);
  const code = (fromUrl?.[1] ?? text).toUpperCase();
  if (ticketCodePattern.test(code)) return {code};
  const number = text.match(/^(\d{1,4})\s*-\s*(\d{1,6})$/);
  if (number) return {eventId: Number(number[1]), id: Number(number[2])};
  return null;
}

export type CheckInResult = {status: "validada" | "ja_validada" | "cancelada" | "outro_evento" | "desfeita"; registrant: {id: number; name: string; number: string; event_name: string; checked_in_at: string | null; checked_in_by: string | null}};

/** Valida a entrada de forma atômica: duas recepcionistas não validam a mesma inscrição duas vezes. */
export async function checkIn(staff: StaffUser, input: {id?: number; code?: string; eventId?: number; undo?: boolean}): Promise<CheckInResult> {
  const db = database();
  let query = db.from("submissions").select("id, payload, status, event_id, checked_in_at, checked_in_by").not("event_id", "is", null);
  if (input.code) query = query.eq("ticket_code", input.code);
  else if (input.id) query = query.eq("id", input.id);
  else throw new RequestError("Informe a inscrição.");
  const found = await query.maybeSingle();
  if (found.error) throw found.error;
  if (!found.data) throw new RequestError("Inscrição não encontrada. Confira o QR code ou procure pelo nome.", 404);
  const row = found.data;
  const event = await db.from("events").select("name").eq("id", row.event_id).maybeSingle();
  if (event.error) throw event.error;
  let payload: Record<string, string> = {};
  try { payload = JSON.parse(row.payload); } catch { payload = {}; }
  const registrant = {id: row.id, name: displayName(payload.nome || payload.email || `Inscrição ${row.id}`), number: ticketNumber(row.event_id, row.id), event_name: event.data?.name ?? "", checked_in_at: row.checked_in_at, checked_in_by: row.checked_in_by};
  if (input.eventId && input.eventId !== row.event_id) return {status: "outro_evento", registrant};
  if (row.status === "cancelado") return {status: "cancelada", registrant};
  if (input.undo) {
    const undone = await db.from("submissions").update({checked_in_at: null, checked_in_by: null}).eq("id", row.id).select("id").maybeSingle();
    if (undone.error) throw undone.error;
    return {status: "desfeita", registrant: {...registrant, checked_in_at: null, checked_in_by: null}};
  }
  if (row.checked_in_at) return {status: "ja_validada", registrant};
  const now = new Date().toISOString();
  const by = staff.display_name || staff.email;
  const updated = await db.from("submissions").update({checked_in_at: now, checked_in_by: by}).eq("id", row.id).is("checked_in_at", null).neq("status", "cancelado").select("checked_in_at, checked_in_by").maybeSingle();
  if (updated.error) throw updated.error;
  if (!updated.data) {
    const again = await db.from("submissions").select("checked_in_at, checked_in_by").eq("id", row.id).maybeSingle();
    if (again.error) throw again.error;
    return {status: "ja_validada", registrant: {...registrant, checked_in_at: again.data?.checked_in_at ?? null, checked_in_by: again.data?.checked_in_by ?? null}};
  }
  return {status: "validada", registrant: {...registrant, ...updated.data}};
}
