import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { SiteShell } from "../../../../components/SiteShell";
import { PageHero } from "../../../../components/PageHero";
import { CopyPix, ReceiptUpload, ShareRaffle } from "../../../../components/RafflePayment";
import { formatDate } from "../../../../lib/content";
import { ticketCodePattern } from "../../../../lib/tickets";
import { formatMoney, formatNumber, pixPayload, pixQrSvg, raffleOrderByCode, raffleSettings, raffleStatusLabels, raffleUrl } from "../../../../lib/raffle";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Meus números da rifa", robots: {index: false, follow: false}};

export default async function RaffleOrderPage({params}: {params: Promise<{code: string}>}) {
  const {code} = await params;
  const normalized = code.toUpperCase();
  if (!ticketCodePattern.test(normalized)) notFound();
  let loaded;
  try {
    const [order, settings] = await Promise.all([raffleOrderByCode(normalized), raffleSettings()]);
    loaded = order ? {order, settings} : null;
  } catch (error) {
    console.error("Raffle order unavailable", error);
    return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Pedido temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível consultar o pedido agora. Tente novamente em instantes.</p></div></section></SiteShell>;
  }
  if (!loaded) notFound();
  const {order, settings} = loaded;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "ccvisaoprofetica.online";
  const url = raffleUrl(`https://${host}`, order.code);
  const pending = order.status === "pendente";
  const pix = pending && settings.pix_key ? pixPayload({key: settings.pix_key, name: settings.pix_name, city: settings.pix_city, amountCents: order.amount_cents, txid: order.code}) : "";
  const qr = pix ? await pixQrSvg(pix) : "";
  const deadline = new Date(new Date(order.created_at).getTime() + settings.expire_hours * 3600 * 1000).toLocaleString("pt-BR", {timeZone: "America/Fortaleza", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"});
  const statusClass = order.status === "pago" ? "is-open" : order.status === "pendente" ? "is-pending" : "is-closed";
  return <SiteShell>
    <PageHero eyebrow="Rifa solidária · Telão da igreja" title={`Rifa do ${settings.prize}`} description={`Sorteio pela Loteria Federal${settings.draw_date ? ` de ${formatDate(settings.draw_date)}` : ""}. Guarde esta página: ela mostra seus números e a situação do pagamento.`}/>
    <section className="content-section"><div className="container-shell raffle-order">
      <article className="panel ticket">
        <div className="ticket-head">
          <span className={`event-status ${statusClass}`}>{raffleStatusLabels[order.status]}</span>
          <h2 className="mt-4 text-2xl font-bold">{order.name}</h2>
          <div className="ticket-details">
            <span>Pedido: <strong className="font-mono">{order.code}</strong></span>
            <span>Valor: <strong>{formatMoney(order.amount_cents)}</strong> · {order.quantity} número{order.quantity > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="ticket-body">
          {order.numbers.length > 0 ? <div className="w-full">
            <p className="eyebrow text-zinc-500">{order.status === "pago" ? "Seus números no sorteio" : "Números reservados para você"}</p>
            <ul className="raffle-numbers">{order.numbers.map(number => <li key={number}>{formatNumber(number)}</li>)}</ul>
          </div> : <p className="ticket-cancelled">{order.status === "expirado" ? "O prazo de pagamento terminou e os números foram liberados. Se você já pagou, envie o comprovante abaixo: a equipe confere e gera novos números para você." : "Este pedido foi cancelado e não participa do sorteio."}</p>}

          {pending && <div className="raffle-pay">
            <h3>Pague com Pix</h3>
            <p className="body-copy text-sm">Faça o Pix de <strong>{formatMoney(order.amount_cents)}</strong> até <strong>{deadline}</strong>. Depois disso a reserva é liberada.</p>
            {pix ? <>
              <div className="ticket-qr" aria-label="QR code Pix" dangerouslySetInnerHTML={{__html: qr}}/>
              <CopyPix code={pix}/>
              <p className="text-sm text-zinc-600">Chave Pix: <strong className="break-all">{settings.pix_key}</strong><br/>{settings.pix_name}</p>
            </> : <p className="ticket-email-notice">A chave Pix ainda não foi cadastrada. Fale com a equipe da igreja para fazer o pagamento.</p>}
            <ReceiptUpload code={order.code} sent={Boolean(order.receipt_uploaded_at)}/>
            <p className="text-xs leading-5 text-zinc-500">Quando a equipe confirmar o pagamento, esta página muda para &quot;Pago&quot; e você recebe um e-mail.</p>
          </div>}
          {order.status === "expirado" && <ReceiptUpload code={order.code} sent={Boolean(order.receipt_uploaded_at)}/>}
          {order.status === "pago" && <p className="body-copy text-sm">Pagamento confirmado. Obrigado por ajudar a comprar o telão da igreja! O resultado sai pela Loteria Federal{settings.draw_date ? ` de ${formatDate(settings.draw_date)}` : ""} e será publicado na página da rifa.</p>}
          <ShareRaffle url={url} prize={settings.prize}/>
          <a href="/rifa" className="admin-text-button">Voltar para a página da rifa</a>
        </div>
      </article>
    </div></section>
  </SiteShell>;
}
