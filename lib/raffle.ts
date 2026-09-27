import QRCode from "qrcode";
import { database } from "./database";
import { generateTicketCode, ticketCodePattern } from "./tickets";

/** Cada número custa R$ 5; os pacotes são múltiplos desse valor. */
export const RAFFLE_NUMBER_PRICE = 5;
export const RAFFLE_PACKAGES = [5, 10, 15, 20, 50];
export const RAFFLE_MAX_AMOUNT = 1000;
export const RAFFLE_TOTAL_NUMBERS = 100000;

export type RaffleSettings = {
  published: boolean;
  open: boolean;
  prize: string;
  goal: number;
  draw_date: string;
  pix_key: string;
  pix_name: string;
  pix_city: string;
  whatsapp: string;
  expire_hours: number;
  /** 1º prêmio da Loteria Federal informado após o sorteio (5 dígitos). */
  result: string;
};

export const defaultRaffleSettings: RaffleSettings = {
  published: false,
  open: false,
  prize: "iPhone 17",
  goal: 80000,
  draw_date: "",
  pix_key: "65128666000175",
  pix_name: "Comunidade Cristã Visão Profética",
  pix_city: "Fortaleza",
  whatsapp: "",
  expire_hours: 48,
  result: "",
};

export type RaffleOrder = {
  id: number;
  code: string;
  name: string;
  email: string;
  whatsapp: string;
  quantity: number;
  amount_cents: number;
  status: "pendente" | "pago" | "cancelado" | "expirado";
  created_at: string;
  paid_at: string | null;
  receipt_key: string | null;
  receipt_type: string | null;
  receipt_uploaded_at: string | null;
  numbers: number[];
};

export type RaffleStats = {orders: number; paid_orders: number; pending_orders: number; paid_cents: number; pending_cents: number; paid_numbers: number};

export const raffleStatusLabels: Record<RaffleOrder["status"], string> = {pendente: "Aguardando pagamento", pago: "Pago", cancelado: "Cancelado", expirado: "Prazo expirado"};

export const formatNumber = (value: number) => String(value).padStart(5, "0");
export const formatMoney = (cents: number) => (cents / 100).toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
export const numbersFor = (amount: number) => Math.floor(amount / RAFFLE_NUMBER_PRICE);

export function raffleUrl(origin: string, code: string) {
  return `${origin}/rifa/pedido/${code}`;
}

export async function raffleSettings(): Promise<RaffleSettings> {
  const {data, error} = await database().from("content_items").select("value").eq("section", "site").eq("key", "rifa").maybeSingle();
  if (error) throw error;
  if (!data?.value) return defaultRaffleSettings;
  try { return {...defaultRaffleSettings, ...JSON.parse(data.value)}; } catch { return defaultRaffleSettings; }
}

export async function saveRaffleSettings(value: RaffleSettings) {
  const updatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
  const result = await database().from("content_items").upsert({section: "site", key: "rifa", value: JSON.stringify(value), updated_at: updatedAt}, {onConflict: "section,key"});
  if (result.error) throw result.error;
}

export async function raffleStats(): Promise<RaffleStats> {
  const db = database();
  const orders = await db.from("raffle_orders").select("status, amount_cents, quantity").limit(100000);
  if (orders.error) throw orders.error;
  const stats: RaffleStats = {orders: 0, paid_orders: 0, pending_orders: 0, paid_cents: 0, pending_cents: 0, paid_numbers: 0};
  for (const row of orders.data ?? []) {
    stats.orders++;
    if (row.status === "pago") { stats.paid_orders++; stats.paid_cents += row.amount_cents; stats.paid_numbers += row.quantity; }
    if (row.status === "pendente") { stats.pending_orders++; stats.pending_cents += row.amount_cents; }
  }
  return stats;
}

async function attachNumbers(rows: Omit<RaffleOrder, "numbers">[]): Promise<RaffleOrder[]> {
  if (!rows.length) return [];
  const numbers = await database().from("raffle_numbers").select("number, order_id").in("order_id", rows.map(row => row.id)).order("number", {ascending: true}).limit(100000);
  if (numbers.error) throw numbers.error;
  const byOrder = new Map<number, number[]>();
  for (const row of numbers.data ?? []) byOrder.set(row.order_id, [...(byOrder.get(row.order_id) ?? []), row.number]);
  return rows.map(row => ({...row, numbers: byOrder.get(row.id) ?? []}));
}

export async function raffleOrderByCode(code: string) {
  if (!ticketCodePattern.test(code)) return null;
  const result = await database().from("raffle_orders").select("*").eq("code", code).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  return (await attachNumbers([result.data]))[0];
}

export async function raffleOrderById(id: number) {
  const result = await database().from("raffle_orders").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  return (await attachNumbers([result.data]))[0];
}

export async function raffleOrders({status, search, page}: {status: string; search: string; page: number}) {
  let query = database().from("raffle_orders").select("*", {count: "exact"});
  // "comprovante": pedidos ainda não pagos com comprovante enviado, esperando conferência.
  if (status === "comprovante") query = query.in("status", ["pendente", "expirado"]).not("receipt_key", "is", null);
  else if (status) query = query.eq("status", status);
  if (search) {
    const term = search.slice(0, 100).replace(/[\\%_,()]/g, "");
    const digits = term.replace(/\D/g, "");
    const filters = [`name.ilike.%${term}%`, `email.ilike.%${term}%`, `code.ilike.%${term}%`];
    if (digits) filters.push(`whatsapp.ilike.%${digits}%`);
    // Busca também pelo número da rifa (ex.: 04217).
    if (/^\d{1,5}$/.test(term)) {
      const owner = await database().from("raffle_numbers").select("order_id").eq("number", Number(term)).maybeSingle();
      if (owner.error) throw owner.error;
      if (owner.data) filters.push(`id.eq.${owner.data.order_id}`);
    }
    query = query.or(filters.join(","));
  }
  const result = await query.order("id", {ascending: false}).range((page - 1) * 30, page * 30 - 1);
  if (result.error) throw result.error;
  return {rows: await attachNumbers(result.data ?? []), total: result.count ?? 0, page};
}

export async function createRaffleCode() {
  // Reaproveita o alfabeto sem caracteres ambíguos dos comprovantes.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTicketCode();
    const existing = await database().from("raffle_orders").select("id").eq("code", code).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return code;
  }
  throw new Error("Não foi possível gerar o código do pedido");
}

export async function raffleWinner(result: string) {
  if (!/^\d{5}$/.test(result)) return null;
  const winner = await database().rpc("raffle_winner", {p_result: Number(result)});
  if (winner.error) throw winner.error;
  const row = (winner.data as {number: number; order_id: number}[] | null)?.[0];
  if (!row) return null;
  const order = await raffleOrderById(row.order_id);
  return order ? {number: row.number, order} : null;
}

/* Pix "copia e cola" (BR Code estático do Banco Central) com o valor do pedido. */
function emv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}
function pixText(value: string, max: number) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim().toUpperCase().slice(0, max);
}
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
export function normalizePixKey(key: string) {
  const trimmed = key.trim();
  if (/^[\d.\-/ ]+$/.test(trimmed)) return trimmed.replace(/\D/g, "");
  if (/^\+?[\d ()-]+$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    return `+${trimmed.startsWith("+") || digits.length > 11 ? digits : `55${digits}`}`;
  }
  return trimmed;
}
export function pixPayload({key, name, city, amountCents, txid}: {key: string; name: string; city: string; amountCents: number; txid: string}) {
  const account = emv("00", "br.gov.bcb.pix") + emv("01", normalizePixKey(key));
  const body = emv("00", "01") + emv("26", account) + emv("52", "0000") + emv("53", "986") + emv("54", (amountCents / 100).toFixed(2)) + emv("58", "BR") + emv("59", pixText(name, 25) || "RECEBEDOR") + emv("60", pixText(city, 15) || "BRASIL") + emv("62", emv("05", txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***")) + "6304";
  return body + crc16(body);
}
export async function pixQrSvg(payload: string) {
  return QRCode.toString(payload, {type: "svg", margin: 1, errorCorrectionLevel: "M", color: {dark: "#111111", light: "#ffffff"}});
}
