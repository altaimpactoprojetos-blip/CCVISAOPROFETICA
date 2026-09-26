import {notFound} from "next/navigation";
import {SiteShell} from "../../../components/SiteShell";
import {PageHero} from "../../../components/PageHero";
import {SubmissionForm, type Field} from "../../../components/SubmissionForm";
import {formatDate} from "../../../lib/content";
import type {EventRecord} from "../../../lib/admin-types";
import {eventWithRegistrations} from "../../../lib/site-data";
import {eventContent} from "../../../lib/event-content";
export const dynamic = "force-dynamic";
const fields: Field[] = [{name:"nome",label:"Nome completo",required:true,full:true,placeholder:"Seu nome completo"},{name:"email",label:"E-mail",type:"email",required:true,placeholder:"seuemail@exemplo.com"},{name:"whatsapp",label:"WhatsApp",type:"tel",required:true,placeholder:"(85) 90000-0000"}];
export default async function EventPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  let event: EventRecord | null;
  try {event=await eventWithRegistrations(Number(id), true);}
  catch(error){console.error("Event unavailable",error);return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Evento temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível consultar este evento agora. Tente novamente em instantes.</p></div></section></SiteShell>;}
  if(!event) notFound();
  const available=event.registration_status==="open" && (event.capacity===null || event.registrations<event.capacity);
  const content=eventContent(event.name);
  const about=content?.about ?? [];
  const details=[["Data",formatDate(event.event_date)],["Horário",event.time ? event.time.replace(":","h") : "A confirmar"],["Local",event.location]];
  return <SiteShell><PageHero eyebrow="Evento da comunidade" title={event.name} description={`${formatDate(event.event_date)}${event.time ? ` às ${event.time}` : ""} · ${event.location}`}/><section className="content-section"><div className="container-shell event-detail">
    <div className="event-detail-main">
      {event.image_url&&<img src={event.image_url} className="event-cover event-detail-cover" alt={`Arte de ${event.name}`}/>}
      <dl className="event-facts">{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="registration-about"><h2>Sobre o evento</h2>{about.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{event.description&&<p className="whitespace-pre-wrap">{event.description}</p>}{content?.closing&&<p className="registration-about-closing">{content.closing}</p>}</div>
    </div>
    <aside className="event-detail-aside">{available?<div className="panel event-registration"><div className="registration-intro"><span className="event-status is-open">Inscrições abertas</span><h2 className="mt-4">{content?.registrationTitle ?? "Garanta sua vaga"}</h2><p>{content?.registrationText ?? "Preencha seus dados abaixo. A confirmação aparece na hora, e a equipe pode entrar em contato pelo WhatsApp ou e-mail informado."}</p>{event.capacity!==null&&<p className="mt-3 font-semibold">{Math.max(0,event.capacity-event.registrations)} vaga(s) disponível(is)</p>}</div><SubmissionForm kind="evento" eventId={event.id} fields={fields} buttonLabel="Confirmar inscrição" successMessage="Sua inscrição foi registrada para este evento. Guarde a data; a equipe poderá entrar em contato pelo telefone ou e-mail informado."/></div>:<div className="panel p-8"><span className="event-status is-closed">Inscrições encerradas</span><h2 className="mt-4 text-2xl font-bold">Inscrições encerradas</h2><p className="body-copy mt-4">As inscrições para este evento não estão disponíveis no momento.</p></div>}</aside>
  </div></section></SiteShell>;
}
