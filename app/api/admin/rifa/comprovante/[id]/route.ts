import { database } from "../../../../../../lib/database";
import { getAdmin } from "../../../../../../lib/admin-auth";
import { getMedia } from "../../../../../../lib/media";

// Abre o comprovante de um pedido. Somente para quem está logado no painel.
export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const notFound = () => new Response("Não encontrado", {status: 404, headers: {"Cache-Control": "no-store"}});
  try {
    const {id} = await params;
    if (!/^\d{1,10}$/.test(id)) return notFound();
    if (!await getAdmin()) return notFound();
    const order = await database().from("raffle_orders").select("code, receipt_key, receipt_type").eq("id", Number(id)).maybeSingle();
    if (order.error) throw order.error;
    if (!order.data?.receipt_key) return notFound();
    const object = await getMedia(order.data.receipt_key);
    if (!object) return notFound();
    const type = order.data.receipt_type || object.httpMetadata?.contentType || "application/octet-stream";
    const extension = type === "application/pdf" ? "pdf" : type.split("/")[1] ?? "bin";
    return new Response(object.body, {headers: {
      "Content-Type": type,
      "Content-Disposition": `inline; filename="comprovante-${order.data.code}.${extension}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      ...(type === "application/pdf" ? {} : {"Content-Security-Policy": "default-src 'none'; img-src 'self'"}),
    }});
  } catch (error) {
    console.error("Receipt unavailable", error);
    return new Response("Comprovante temporariamente indisponível", {status: 503});
  }
}
