import {notFound} from "next/navigation";
import {SiteShell} from "../../../components/SiteShell";
import {PageHero} from "../../../components/PageHero";
import {SubmissionForm, type Field} from "../../../components/SubmissionForm";
import {formatDate} from "../../../lib/content";
import type {EventRecord} from "../../../lib/admin-types";
import {eventWithRegistrations} from "../../../lib/site-data";
export const dynamic = "force-dynamic";
const fields: Field[] = [{name:"nome",label:"Nome completo",required:true,full:true},{name:"email",label:"E-mail",type:"email",required:true},{name:"whatsapp",label:"WhatsApp",type:"tel",required:true}];
export default async function EventPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  let event: EventRecord | null;
  try {event=await eventWithRegistrations(Number(id), true);}
  catch(error){console.error("Event unavailable",error);return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Evento temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível consultar este evento agora. Tente novamente em instantes.</p></div></section></SiteShell>;}
  if(!event) notFound();
  const available=event.registration_status==="open" && (event.capacity===null || event.registrations<event.capacity);
  return <SiteShell><PageHero eyebrow="Evento da comunidade" title={event.name} description={`${formatDate(event.event_date)} às ${event.time} · ${event.location}`}/><section className="content-section"><div className="container-shell grid gap-10 lg:grid-cols-2"><div>{event.image_url&&<img src={event.image_url} className="event-cover rounded-xl" alt={`Arte de ${event.name}`}/>}<p className="body-copy mt-6 whitespace-pre-wrap">{event.description}</p>{event.capacity!==null&&available&&<p className="mt-5 font-semibold">{Math.max(0,event.capacity-event.registrations)} vaga(s) disponível(is)</p>}</div><div>{available?<><h2 className="mb-5 text-2xl font-bold">Inscreva-se</h2><SubmissionForm kind="evento" eventId={event.id} fields={fields} buttonLabel="Confirmar inscrição" successMessage="Sua inscrição foi registrada para este evento. Guarde a data e o horário; a equipe poderá entrar em contato pelo telefone ou e-mail informado."/></>:<div className="panel p-8"><h2 className="text-2xl font-bold">Inscrições encerradas</h2><p className="body-copy mt-4">As inscrições para este evento não estão disponíveis no momento.</p></div>}</div></div></section></SiteShell>;
}
