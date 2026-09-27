import { database, rpcNumber } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, date, id, text } from "../../../../lib/validation";
import { sendRaffleEmail } from "../../../../lib/email";
import { raffleOrderById, raffleOrders, raffleSettings, raffleStats, raffleUrl, raffleWinner, saveRaffleSettings, type RaffleSettings } from "../../../../lib/raffle";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const params = new URL(request.url).searchParams;
    const status = params.get("status") ?? "";
    if (status && !["pendente", "pago", "cancelado", "expirado"].includes(status)) throw new RequestError("Situação inválida.");
    const page = Math.max(1, Math.min(100000, Math.floor(Number(params.get("page")) || 1)));
    const settings = await raffleSettings();
    // Libera reservas vencidas antes de mostrar a lista ao painel.
    const expired = await database().rpc("raffle_expire_pending", {p_expire_hours: settings.expire_hours});
    if (expired.error) throw expired.error;
    const [stats, orders, winner] = await Promise.all([
      raffleStats(),
      raffleOrders({status, search: (params.get("search") ?? "").trim(), page}),
      settings.result ? raffleWinner(settings.result) : null,
    ]);
    return privateJson({settings, stats, orders, winner});
  } catch (error) { return requestFailure(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const input = await body(request);
    const goal = Number(input.goal);
    const expireHours = Number(input.expire_hours);
    if (!Number.isInteger(goal) || goal < 1 || goal > 10000000) throw new RequestError("Informe a meta em reais.");
    if (!Number.isInteger(expireHours) || expireHours < 1 || expireHours > 720) throw new RequestError("O prazo de pagamento deve ficar entre 1 e 720 horas.");
    const result = text(input.result ?? "", "resultado da Loteria Federal", 5, false);
    if (result && !/^\d{5}$/.test(result)) throw new RequestError("Informe o 1º prêmio da Loteria Federal com 5 dígitos.");
    if (typeof input.published !== "boolean" || typeof input.open !== "boolean") throw new RequestError("Publicação inválida.");
    const settings: RaffleSettings = {
      published: input.published,
      open: input.open,
      prize: text(input.prize, "prêmio", 80),
      goal,
      draw_date: date(input.draw_date, false) ?? "",
      pix_key: text(input.pix_key ?? "", "chave Pix", 77, false),
      pix_name: text(input.pix_name ?? "", "titular do Pix", 60, false),
      pix_city: text(input.pix_city ?? "", "cidade do Pix", 40, false),
      whatsapp: text(input.whatsapp ?? "", "WhatsApp", 40, false),
      expire_hours: expireHours,
      result,
    };
    await saveRaffleSettings(settings);
    return privateJson({ok: true});
  } catch (error) { return requestFailure(error); }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminRequest(request);
    const input = await body(request);
    const status = String(input.status);
    if (!["pendente", "pago", "cancelado"].includes(status)) throw new RequestError("Situação inválida.");
    const orderId = id(input.id);
    const before = await raffleOrderById(orderId);
    if (!before) throw new RequestError("Pedido não encontrado.", 404);
    const result = await database().rpc("set_raffle_order_status", {p_order_id: orderId, p_status: status});
    if (result.error) {
      if (String(result.error.message).includes("raffle_sold_out")) throw new RequestError("Não há números livres para reativar este pedido.", 409);
      throw result.error;
    }
    if (rpcNumber(result.data) !== 1) throw new RequestError("Não foi possível atualizar o pedido.", 409);
    if (status === "pago" && before.status !== "pago") {
      try {
        const [order, settings] = await Promise.all([raffleOrderById(orderId), raffleSettings()]);
        if (order) await sendRaffleEmail(order, raffleUrl(new URL(request.url).origin, order.code), settings.prize, "pago");
      } catch (error) { console.error("Raffle paid email failed", error); }
    }
    return privateJson({ok: true});
  } catch (error) { return requestFailure(error); }
}
