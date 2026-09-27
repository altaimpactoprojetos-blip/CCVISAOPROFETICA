import { database, rpcNumber } from "../../../../lib/database";
import { digest } from "../../../../lib/admin-auth";
import { deleteMedia, receiptType, uploadMedia } from "../../../../lib/media";
import { ticketCodePattern } from "../../../../lib/tickets";

const MAX_BYTES = 6 * 1024 * 1024;
const failure = (error: string, status: number) => Response.json({error}, {status});

async function readLimited(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BYTES + 64 * 1024) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES + 64 * 1024) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

// O comprador envia o comprovante do Pix (imagem ou PDF) pela página do pedido.
export async function POST(request: Request) {
  let uploadedKey: string | null = null;
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) return failure("Origem da solicitação não autorizada.", 403);
    const raw = await readLimited(request);
    if (!raw) return failure("Envie um arquivo de até 6 MB.", 413);
    const form = await new Response(raw, {headers: {"Content-Type": request.headers.get("content-type") ?? ""}}).formData();
    const code = String(form.get("code") ?? "").toUpperCase();
    const file = form.get("file");
    if (!ticketCodePattern.test(code)) return failure("Pedido não encontrado.", 404);
    if (!(file instanceof File) || !file.size) return failure("Escolha a foto ou o PDF do comprovante.", 400);
    if (file.size > MAX_BYTES) return failure("Envie um arquivo de até 6 MB.", 413);
    const bytes = await file.arrayBuffer();
    const type = receiptType(new Uint8Array(bytes));
    if (!type) return failure("Use uma foto (JPG, PNG ou WebP) ou um PDF.", 400);

    const db = database();
    const order = await db.from("raffle_orders").select("id, status, receipt_key").eq("code", code).maybeSingle();
    if (order.error) throw order.error;
    if (!order.data) return failure("Pedido não encontrado.", 404);
    if (!["pendente", "expirado"].includes(order.data.status)) return failure(order.data.status === "pago" ? "Este pedido já está pago." : "Este pedido foi cancelado.", 409);

    // Limita reenvios por pedido para não encher o armazenamento.
    const now = Math.floor(Date.now() / 1000);
    const attempt = await db.rpc("register_admin_auth_attempt", {p_key: `rifa-comprovante:${digest(code)}`, p_now: now, p_reset_at: now + 3600});
    if (attempt.error) throw attempt.error;
    if ((rpcNumber(attempt.data) ?? 99) > 10) return failure("Muitos envios seguidos. Aguarde um pouco e tente de novo.", 429);

    const key = `comprovantes/${crypto.randomUUID()}`;
    await uploadMedia(key, bytes, type);
    uploadedKey = key;
    const saved = await db.from("raffle_orders").update({receipt_key: key, receipt_type: type, receipt_uploaded_at: new Date().toISOString()}).eq("id", order.data.id).in("status", ["pendente", "expirado"]).select("id").maybeSingle();
    if (saved.error) throw saved.error;
    if (!saved.data) return failure("Não foi possível anexar ao pedido.", 409);
    uploadedKey = null;
    if (order.data.receipt_key) {
      try { await deleteMedia(order.data.receipt_key); } catch (error) { console.error("Old receipt cleanup failed", error); }
    }
    return Response.json({ok: true}, {status: 201});
  } catch (error) {
    console.error("Raffle receipt upload failed", error);
    return failure("Não foi possível enviar agora. Tente novamente em instantes.", 503);
  } finally {
    if (uploadedKey) { try { await deleteMedia(uploadedKey); } catch (error) { console.error("Receipt cleanup failed", error); } }
  }
}
