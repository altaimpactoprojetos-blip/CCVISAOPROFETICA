import QRCode from "qrcode";
import { database } from "./database";
import type { EventRecord } from "./admin-types";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I para leitura fácil
export const ticketCodePattern = /^[A-Z2-9]{10}$/;

export function generateTicketCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

/** Número curto e legível mostrado abaixo do QR code. */
export function ticketNumber(eventId: number, submissionId: number) {
  return `${String(eventId).padStart(2, "0")}-${String(submissionId).padStart(5, "0")}`;
}

export function ticketUrl(origin: string, code: string) {
  return `${origin}/inscricao/${code}`;
}

/** Grava um código único na inscrição recém-criada. */
export async function assignTicketCode(submissionId: number) {
  const db = database();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTicketCode();
    const result = await db.from("submissions").update({ticket_code: code}).eq("id", submissionId).is("ticket_code", null).select("ticket_code").maybeSingle();
    if (result.error) { if (result.error.code === "23505") continue; throw result.error; }
    if (result.data?.ticket_code) return result.data.ticket_code as string;
    const existing = await db.from("submissions").select("ticket_code").eq("id", submissionId).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data?.ticket_code) return existing.data.ticket_code as string;
  }
  throw new Error("Não foi possível gerar o código da inscrição");
}

export type Ticket = {
  id: number;
  code: string;
  number: string;
  status: string;
  createdAt: string;
  name: string;
  email: string;
  whatsapp: string;
  event: Pick<EventRecord, "id" | "name" | "event_date" | "time" | "location" | "image_url" | "published">;
};

export async function ticketByCode(code: string): Promise<Ticket | null> {
  if (!ticketCodePattern.test(code)) return null;
  const db = database();
  const submission = await db.from("submissions").select("id, payload, status, created_at, event_id, ticket_code").eq("ticket_code", code).maybeSingle();
  if (submission.error) throw submission.error;
  if (!submission.data || !submission.data.event_id) return null;
  const event = await db.from("events").select("id, name, event_date, time, location, image_url, published").eq("id", submission.data.event_id).maybeSingle();
  if (event.error) throw event.error;
  if (!event.data) return null;
  let payload: Record<string, string> = {};
  try { payload = JSON.parse(submission.data.payload); } catch { payload = {}; }
  return {
    id: submission.data.id,
    code,
    number: ticketNumber(event.data.id, submission.data.id),
    status: submission.data.status,
    createdAt: submission.data.created_at,
    name: payload.nome ?? "",
    email: payload.email ?? "",
    whatsapp: payload.whatsapp ?? "",
    event: event.data as Ticket["event"],
  };
}

export async function ticketQrSvg(url: string) {
  return QRCode.toString(url, {type: "svg", margin: 1, errorCorrectionLevel: "M", color: {dark: "#111111", light: "#ffffff"}});
}
