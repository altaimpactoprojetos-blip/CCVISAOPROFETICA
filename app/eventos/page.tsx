import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../../components/PageHero";
import { SiteShell } from "../../components/SiteShell";
import { formatDate } from "../../lib/content";
import type { EventRecord } from "../../lib/admin-types";
import { eventsWithRegistrations } from "../../lib/site-data";
import { raffleSettings, type RaffleSettings } from "../../lib/raffle";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Eventos"};
export default async function EventosPage() {
  let events: EventRecord[] = [], failed = false;
  try { events = await eventsWithRegistrations(true); } catch(error) {console.error("Public events unavailable",error);failed=true;}
  let raffle: RaffleSettings | null = null;
  try { const settings = await raffleSettings(); if (settings.published) raffle = settings; } catch(error) {console.error("Raffle unavailable",error);}
  return <SiteShell><PageHero eyebrow="Agenda da comunidade" title="Próximos eventos" description="Acompanhe encontros, conferências e momentos especiais da Comunidade Cristã Visão Profética."/><section className="content-section"><div className="container-shell">
    {failed ? <div className="panel p-8" role="status"><h2 className="text-xl font-bold">Agenda temporariamente indisponível</h2><p className="body-copy mt-3">Tente novamente em instantes ou entre em contato com a igreja.</p></div> : !events.length && !raffle ? <div className="panel p-8"><h2 className="text-2xl font-bold">Novos encontros em breve</h2><p className="body-copy mt-4">Nenhum evento oficial foi publicado ainda. Quando houver uma nova programação, você encontrará aqui a data, o horário, o local e a inscrição.</p></div> : <div className="event-cards">{raffle && <article className="panel event-card"><img className="event-cover" src="/eventos/rifa-iphone-17-cartao-hd.webp" width={1672} height={1115} alt={`Arte da rifa: concorra a um ${raffle.prize}`}/><div className="event-card-body"><p className="event-date">Sorteio pela Loteria Federal</p><h2 className="mt-4 text-2xl font-bold">Rifa do {raffle.prize}</h2><p className="body-copy mt-3">Números a partir de R$ 5 · para o telão da igreja</p>{raffle.open && !raffle.result ? <span className="event-status is-open mt-4 mb-6">Vendas abertas</span> : <span className="event-status is-closed mt-4 mb-6">Vendas encerradas</span>}<Link href="/rifa" className="btn-primary">Ver rifa</Link></div></article>}{events.map(event => <article className="panel event-card" key={event.id}>{event.image_url && <img className="event-cover" src={event.image_url} alt={`Arte de ${event.name}`} loading="lazy"/>}<div className="event-card-body"><p className="event-date">{formatDate(event.event_date)}{event.time ? ` · ${event.time}` : ""}</p><h2 className="mt-4 text-2xl font-bold">{event.name}</h2><p className="body-copy mt-3">{event.location}</p>{event.registration_status === "open" && (event.capacity === null || event.registrations < event.capacity) ? <span className="event-status is-open mt-4 mb-6">Inscrições abertas</span> : <span className="event-status is-closed mt-4 mb-6">Inscrições encerradas</span>}<Link href={`/eventos/${event.id}`} className="btn-primary">Ver evento</Link></div></article>)}</div>}
  </div></section></SiteShell>;
}
