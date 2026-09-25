import {notFound} from "next/navigation";
import {SiteShell} from "../../../components/SiteShell";
import {PageHero} from "../../../components/PageHero";
import {SubmissionForm, type Field} from "../../../components/SubmissionForm";
import {formatDate} from "../../../lib/content";
import type {EventRecord} from "../../../lib/admin-types";
import {eventWithRegistrations} from "../../../lib/site-data";
export const dynamic = "force-dynamic";
const fields: Field[] = [{name:"nome",label:"Nome completo",required:true,full:true,placeholder:"Seu nome completo"},{name:"email",label:"E-mail",type:"email",required:true,placeholder:"seuemail@exemplo.com"},{name:"whatsapp",label:"WhatsApp",type:"tel",required:true,placeholder:"(85) 90000-0000"}];
const womenEventText=[
  "Todos os anos, a Comunidade Cristã Visão Profética reúne mulheres de diferentes lugares para viver um tempo especial na presença de Deus. Mulheres que chegam de perto e de longe, com histórias diferentes, mas com o mesmo desejo: ouvir a voz do Senhor, ser fortalecidas e viver aquilo que Ele preparou para este tempo.",
  "A cada edição, somos conduzidas por uma mensagem específica que nasce no coração de Deus e aponta para aquilo que Ele deseja gerar em nós. E desta vez não será diferente.",
  "Estamos preparando um encontro marcado por oração, adoração, Palavra e um mover profético, onde mulheres serão chamadas a ampliar sua visão, reconhecer o propósito de Deus para suas vidas e se posicionar diante daquilo que o Senhor está fazendo.",
  "Será um tempo para sair do lugar comum, romper limites e permitir que Deus amplie nossa visão para enxergarmos além das circunstâncias, além do que já vivemos e além do que nossos olhos conseguem alcançar.",
  "Se você sente que Deus está chamando você para um novo tempo, este encontro é para você.",
];
const isWomenEvent=(name:string)=>/mulher/i.test(name);
export default async function EventPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  let event: EventRecord | null;
  try {event=await eventWithRegistrations(Number(id), true);}
  catch(error){console.error("Event unavailable",error);return <SiteShell><section className="content-section"><div className="container-shell panel p-8"><h1 className="text-2xl font-bold">Evento temporariamente indisponível</h1><p className="body-copy mt-4">Não foi possível consultar este evento agora. Tente novamente em instantes.</p></div></section></SiteShell>;}
  if(!event) notFound();
  const available=event.registration_status==="open" && (event.capacity===null || event.registrations<event.capacity);
  return <SiteShell><PageHero eyebrow="Evento da comunidade" title={event.name} description={`${formatDate(event.event_date)}${event.time ? ` às ${event.time}` : ""} · ${event.location}`}/><section className="content-section"><div className="container-shell grid gap-10 lg:grid-cols-2"><div>{event.image_url&&<img src={event.image_url} className="event-cover rounded-xl" alt={`Arte de ${event.name}`}/>}<p className="body-copy mt-6 whitespace-pre-wrap">{event.description}</p>{event.capacity!==null&&available&&<p className="mt-5 font-semibold">{Math.max(0,event.capacity-event.registrations)} vaga(s) disponível(is)</p>}</div><div>{isWomenEvent(event.name)&&<div className="registration-about"><h2>Sobre o encontro</h2>{womenEventText.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<p className="registration-about-closing">Prepare-se. Amplie a sua visão. Existe uma mensagem para este tempo.</p></div>}{available?<><div className="registration-intro"><span className="event-status is-open">Inscrições abertas</span><h2 className="mt-4">Garanta sua vaga</h2><p>Preencha seus dados abaixo. A confirmação aparece na hora, e a equipe pode entrar em contato pelo WhatsApp ou e-mail informado.</p></div><SubmissionForm kind="evento" eventId={event.id} fields={fields} buttonLabel="Confirmar inscrição" successMessage="Sua inscrição foi registrada para este evento. Guarde a data; a equipe poderá entrar em contato pelo telefone ou e-mail informado."/></>:<div className="panel p-8"><h2 className="text-2xl font-bold">Inscrições encerradas</h2><p className="body-copy mt-4">As inscrições para este evento não estão disponíveis no momento.</p></div>}</div></div></section></SiteShell>;
}
