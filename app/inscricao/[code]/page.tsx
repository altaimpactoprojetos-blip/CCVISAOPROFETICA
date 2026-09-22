import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { SiteShell } from "../../../components/SiteShell";
import { PageHero } from "../../../components/PageHero";
import { ShareTicket } from "../../../components/ShareTicket";
import { formatDate } from "../../../lib/content";
import { ticketByCode, ticketCodePattern, ticketQrSvg, ticketUrl } from "../../../lib/tickets";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Comprovante de inscrição", robots: {index: false, follow: false}};
export default async function TicketPage({params}: {params: Promise<{code: string}>}) {
  const {code} = await params;
  const normalized = code.toUpperCase();
  if (!ticketCodePattern.test(normalized)) notFound();
  let ticket;
  try { ticket = await ticketByCode(normalized); }
  catch (error) { console.error("Ticket unavailable", error); return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Comprovante temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível consultar a inscrição agora. Tente novamente em instantes.</p></div></section></SiteShell>; }
  if (!ticket) notFound();
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "ccvisaoprofetica.online";
  const url = ticketUrl(`https://${host}`, ticket.code);
  const qr = await ticketQrSvg(url);
  const active = ticket.status !== "cancelado";
  const when = `${formatDate(ticket.event.event_date)}${ticket.event.time ? ` às ${ticket.event.time}` : ""}`;
  return <SiteShell>
    <PageHero eyebrow="Comprovante de inscrição" title={ticket.event.name} description={`${when} · ${ticket.event.location}`}/>
    <section className="content-section"><div className="container-shell">
      <article className="panel ticket">
        <div className="ticket-head">
          <span className={`event-status ${active ? "is-open" : "is-closed"}`}>{active ? "Inscrição confirmada" : "Inscrição cancelada"}</span>
          <h2 className="mt-4 text-2xl font-bold">{ticket.name || "Participante"}</h2>
          <div className="ticket-details">
            <span>Evento: <strong>{ticket.event.name}</strong></span>
            <span>Data: <strong>{when}</strong></span>
            <span>Local: <strong>{ticket.event.location}</strong></span>
          </div>
        </div>
        <div className="ticket-body">
          {active ? <div className="ticket-qr" aria-label="QR code da inscrição" dangerouslySetInnerHTML={{__html: qr}}/> : <p className="ticket-cancelled">Esta inscrição foi cancelada e o QR code não é mais válido.</p>}
          <div>
            <p className="eyebrow text-zinc-500">Nº da inscrição</p>
            <p className="ticket-number mt-1">{ticket.number}</p>
            <p className="ticket-code mt-1">{ticket.code}</p>
          </div>
          <p className="body-copy text-sm">Apresente este QR code na entrada do evento. Salve esta página ou compartilhe o link.</p>
          {active && <ShareTicket url={url} eventName={ticket.event.name} when={when}/>}
        </div>
      </article>
    </div></section>
  </SiteShell>;
}
