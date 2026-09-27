import { database, rpcNumber } from "../../../lib/database";
import { digest } from "../../../lib/admin-auth";
import { sendRaffleEmail } from "../../../lib/email";
import { RAFFLE_MAX_AMOUNT, RAFFLE_NUMBER_PRICE, createRaffleCode, numbersFor, raffleOrderById, raffleSettings, raffleUrl } from "../../../lib/raffle";

const failure = (error: string, status: number) => Response.json({error}, {status});

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 4000) return failure("Dados acima do limite permitido.", 413);
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
    if (!body || typeof body !== "object") return failure("Dados inválidos.", 400);
    const name = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const amount = Number(body.valor);
    if (!name || name.length > 160 || whatsapp.replace(/\D/g, "").length < 10 || whatsapp.length > 40 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return failure("Preencha nome, WhatsApp com DDD e um e-mail válido.", 400);
    if (!Number.isInteger(amount) || amount < RAFFLE_NUMBER_PRICE || amount > RAFFLE_MAX_AMOUNT || amount % RAFFLE_NUMBER_PRICE !== 0) return failure(`Escolha um valor múltiplo de R$ ${RAFFLE_NUMBER_PRICE}, até R$ ${RAFFLE_MAX_AMOUNT}.`, 400);

    const settings = await raffleSettings();
    if (!settings.published || !settings.open || settings.result) return failure("A venda de números está encerrada.", 409);

    // Limita pedidos por origem de rede para que ninguém reserve todos os números sem pagar.
    const db = database();
    const now = Math.floor(Date.now() / 1000);
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const attempt = await db.rpc("register_admin_auth_attempt", {p_key: `rifa:${digest(ip)}`, p_now: now, p_reset_at: now + 3600});
    if (attempt.error) throw attempt.error;
    if ((rpcNumber(attempt.data) ?? 99) > 20) return failure("Muitos pedidos seguidos. Aguarde um pouco ou fale com a igreja pelo WhatsApp.", 429);

    const code = await createRaffleCode();
    const created = await db.rpc("create_raffle_order", {
      p_code: code,
      p_name: name,
      p_email: email,
      p_whatsapp: whatsapp,
      p_quantity: numbersFor(amount),
      p_amount_cents: amount * 100,
      p_expire_hours: settings.expire_hours,
    });
    if (created.error) {
      if (String(created.error.message).includes("raffle_sold_out")) return failure("Não há mais números disponíveis.", 409);
      throw created.error;
    }
    const orderId = rpcNumber(created.data);
    const url = raffleUrl(new URL(request.url).origin, code);
    // O pedido já está gravado; o e-mail é apenas um complemento.
    try {
      const order = orderId ? await raffleOrderById(orderId) : null;
      if (order) await sendRaffleEmail(order, url, settings.prize, "reserva");
    } catch (error) { console.error("Raffle email failed", error); }
    return Response.json({ok: true, url}, {status: 201});
  } catch (error) {
    console.error("Raffle order failed", error);
    return failure("Não foi possível reservar agora. Tente novamente em instantes.", 503);
  }
}
