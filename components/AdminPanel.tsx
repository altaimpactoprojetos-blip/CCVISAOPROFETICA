"use client";

import {useCallback, useEffect, useState, type FormEvent, type ReactNode} from "react";
import type {AdminData, Contact, EventRecord, GalleryRecord, PhotoRecord, Schedule, SubmissionRecord, EmailConfig} from "../lib/admin-types";
import {AdminPassword} from "./AdminLogin";
import {kindLabels, kindSources, statusLabels} from "../lib/admin-types";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {...options, cache: "no-store"});
  let data; try { data = await response.json(); } catch { throw new Error("Não foi possível concluir. Confira a conexão e tente novamente."); }
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir.");
  return data;
}
const json = (value: unknown, method = "POST"): RequestInit => ({method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(value)});
function Notice({error, message}: {error?: string; message?: string}) {
  if (!error && !message) return null;
  return <p className={`admin-notice ${error ? "admin-error" : "admin-success"}`} role={error ? "alert" : "status"}>{error || message}</p>;
}
function Field({label, children, full = false}: {label: string; children: ReactNode; full?: boolean}) {
  return <label className={`field-label ${full ? "sm:col-span-2" : ""}`}><span>{label}</span>{children}</label>;
}
const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches;
function revealOnPhone(id: string) { if (isPhone()) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({behavior: "smooth", block: "start"})); }
function contactLinks(payload: Record<string,string>) {
  const phone = String(payload.whatsapp || payload.telefone || payload.celular || "").replace(/\D/g, "");
  const full = phone.length === 10 || phone.length === 11 ? `55${phone}` : phone;
  return {whatsapp: full.length >= 12 ? `https://wa.me/${full}` : "", phone: phone.length >= 8 ? `tel:+${full}` : "", email: payload.email ? `mailto:${payload.email}` : ""};
}
const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");

export function AdminPanel() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [eventId, setEventId] = useState<number | null>(null);
  const [galleryId, setGalleryId] = useState<number | null>(null);
  const [registrationEvent, setRegistrationEvent] = useState("");
  const refresh = useCallback(async () => {
    const result = await api<AdminData>("data"); setData(result); setError("");
  }, []);
  useEffect(() => { refresh().catch(error => setError(error.message)); }, [refresh]);
  useEffect(() => {
    const active = document.querySelector<HTMLElement>(".admin-sidebar nav [aria-pressed='true']");
    const nav = active?.parentElement;
    if (active && nav) nav.scrollTo({left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: "smooth"});
  }, [tab, data]);
  const [registrationKind, setRegistrationKind] = useState("");
  function submissionsOf(event: string, kind: string) { setRegistrationEvent(event); setRegistrationKind(kind); setTab("submissions"); revealOnPhone("admin-workspace"); }
  function registrations(id: number) { submissionsOf(String(id), ""); }
  if (!data) return <section className="content-section"><div className="container-shell panel p-8"><p role="status">{error ? "Não foi possível carregar o painel." : "Carregando informações da igreja…"}</p><Notice error={error}/>{error && <button className="btn-primary mt-4" onClick={() => refresh().catch(error => setError(error.message))}>Tentar novamente</button>}</div></section>;
  const sortedEvents = [...data.events].sort((a, b) => a.event_date.localeCompare(b.event_date) || a.id - b.id);
  const eventRegistrations = data.events.reduce((sum, event) => sum + event.registrations, 0);
  const formKinds = ["batismo", "fazer_parte", "oracao", "celula", "contato", ...data.kinds.map(row => row.kind).filter(kind => kind !== "evento")]
    .filter((kind, index, list) => list.indexOf(kind) === index)
    .map(kind => data.kinds.find(row => row.kind === kind) ?? {kind, total: 0, pending: 0});
  const formTotal = formKinds.reduce((sum, row) => sum + row.total, 0);
  return <div className="container-shell admin-layout">
    <aside className="admin-sidebar"><nav aria-label="Seções da administração">
      {[["overview", "Visão geral"], ["events", "Eventos"], ["submissions", "Inscrições e contatos"], ["galleries", "Fotos dos cultos"], ["settings", "Programação e contato"]].map(([key,label]) => <button key={key} type="button" aria-pressed={tab === key} onClick={() => {setTab(key); revealOnPhone("admin-workspace");}}>{label}</button>)}
    </nav><a href="/" className="admin-return">Ver site público</a></aside>
    <div className="admin-workspace" id="admin-workspace"><Notice error={error}/>
      {tab === "overview" && <>
        <div className="admin-section-heading"><div><h2>Visão geral</h2><p className="admin-subtitle">Resumo do que chegou pelo site e dos eventos da igreja.</p></div><button className="btn-secondary" onClick={() => refresh().catch(error => setError(error.message))}>Atualizar números</button></div>
        <div className="admin-metrics">{([["Aguardando atendimento", data.stats.new_submissions, "Cadastros com situação Novo"], ["Inscrições em eventos", eventRegistrations, `${data.events.length} evento(s) cadastrado(s)`], ["Pedidos pelo site", formTotal, "Batismo, fazer parte, oração e contato"], ["Eventos no site", data.stats.published_events, `${data.events.length - data.stats.published_events} em rascunho`]] as const).map(([label,value,hint]) => <article key={label} className="panel"><p>{label}</p><strong>{Number(value).toLocaleString("pt-BR")}</strong><span>{hint}</span></article>)}</div>
        <section className="panel admin-overview-block"><div className="admin-block-heading"><div><h3>Eventos</h3><p>Datas, situação no site e inscritos de cada evento.</p></div><button className="btn-primary" onClick={() => {setEventId(null); setTab("events");}}>Criar evento</button></div>
          {sortedEvents.length ? <ul className="admin-event-list">{sortedEvents.map(event => {const open = event.registration_status === "open" && (event.capacity === null || event.registrations < event.capacity); return <li key={event.id}>
            {event.image_url ? <img src={event.image_url} alt="" className="admin-event-thumb"/> : <span className="admin-event-thumb"/>}
            <div className="admin-event-info"><strong>{event.name}</strong><span>{dateLabel(event.event_date)}{event.time ? ` · ${event.time.replace(":","h")}` : ""}</span><div className="admin-event-tags"><span className={`admin-tag ${event.published ? "is-positive" : ""}`}>{event.published ? "No site" : "Rascunho"}</span><span className={`admin-tag ${open ? "is-positive" : ""}`}>{open ? "Inscrições abertas" : "Inscrições encerradas"}</span></div></div>
            <div className="admin-event-count"><strong>{event.registrations}{event.capacity ? `/${event.capacity}` : ""}</strong><span>inscrito(s)</span></div>
            <div className="admin-event-actions"><button className="btn-secondary" onClick={() => registrations(event.id)}>Ver inscritos</button><button className="admin-text-button" onClick={() => {setEventId(event.id); setTab("events"); revealOnPhone("admin-editor");}}>Editar</button></div>
          </li>;})}</ul> : <p className="body-copy mt-4">Cadastre o primeiro evento, adicione a arte e abra as inscrições quando estiver pronto.</p>}
        </section>
        <section className="panel admin-overview-block"><div className="admin-block-heading"><div><h3>Formulários do site</h3><p>Pessoas que preencheram os formulários das páginas do site (fora dos eventos).</p></div><button className="btn-secondary" onClick={() => submissionsOf("", "")}>Ver todos os cadastros</button></div>
          <ul className="admin-form-list">{formKinds.map(row => <li key={row.kind}><button type="button" onClick={() => submissionsOf("", row.kind)} disabled={!row.total}><span className="admin-form-name"><strong>{kindLabels[row.kind] || row.kind}</strong><span>{kindSources[row.kind] || "Formulário do site"}</span></span>{row.pending > 0 && <span className="admin-tag is-attention">{row.pending} novo(s)</span>}<strong className="admin-form-total">{row.total}</strong></button></li>)}</ul>
        </section>
      </>}
      {tab === "events" && <>
        <div className="admin-section-heading"><h2>Eventos</h2><button className="btn-secondary" onClick={() => {setEventId(null); revealOnPhone("admin-editor");}}>Novo evento</button></div>
        <div className="admin-editor-layout"><div className="admin-record-list">{data.events.length ? data.events.map(event => <button key={event.id} className={`panel admin-record ${eventId === event.id ? "is-selected" : ""}`} onClick={() => {setEventId(event.id); revealOnPhone("admin-editor");}}><span className="admin-badge">{event.published ? "Publicado" : "Rascunho"}</span><strong>{event.name}</strong><span>{dateLabel(event.event_date)}{event.time ? ` · ${event.time}` : ""}</span><span>{event.registrations} inscritos{event.capacity ? ` de ${event.capacity} vagas` : ""}</span></button>) : <p className="body-copy">Nenhum evento cadastrado.</p>}</div>
        <EventEditor key={eventId ?? "new"} event={data.events.find(event => event.id === eventId)} onSaved={async id => {await refresh(); setEventId(id);}} onRegistrations={registrations}/></div>
      </>}
      {tab === "submissions" && <Registrations key={`${registrationEvent}:${registrationKind}`} events={data.events} initialEvent={registrationEvent} initialKind={registrationKind} onChanged={refresh}/>}
      {tab === "galleries" && <>
        <div className="admin-section-heading"><h2>Fotos dos cultos e eventos</h2><button className="btn-secondary" onClick={() => {setGalleryId(null); revealOnPhone("admin-editor");}}>Novo álbum</button></div>
        <div className="admin-editor-layout"><div className="admin-record-list">{data.galleries.length ? data.galleries.map(album => <button key={album.id} className={`panel admin-record ${galleryId === album.id ? "is-selected" : ""}`} onClick={() => {setGalleryId(album.id); revealOnPhone("admin-editor");}}><span className="admin-badge">{album.published ? "Publicado" : "Rascunho"}</span><strong>{album.name}</strong><span>{album.category}{album.event_date ? ` · ${dateLabel(album.event_date)}` : ""}</span><span>{album.photos} fotos</span></button>) : <p className="body-copy">Crie um álbum para organizar as fotos por culto ou evento.</p>}</div>
        <GalleryEditor key={galleryId ?? "new"} gallery={data.galleries.find(album => album.id === galleryId)} onSaved={async id => {await refresh(); setGalleryId(id);}} onUpdated={refresh}/></div>
      </>}
      {tab === "settings" && <Settings data={data.content} onSaved={refresh}/>}
    </div>
  </div>;
}

function EventEditor({event, onSaved, onRegistrations}: {event?: EventRecord; onSaved: (id: number) => Promise<void>; onRegistrations: (id: number) => void}) {
  const [image, setImage] = useState(event?.image_url ?? "");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const values = new FormData(e.currentTarget);
    try {
      const result = await api<{id: number}>("events", json({...Object.fromEntries(values), id: event?.id, image_url: image, published: values.get("published") === "on"}));
      await onSaved(result.id); setMessage("Evento salvo. A publicação segue a opção selecionada abaixo.");
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="panel admin-editor" id="admin-editor"><h3 className="text-xl font-bold">{event ? "Editar evento" : "Novo evento"}</h3>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <Field label="Nome do evento *" full><input name="name" className="field-control" required maxLength={160} defaultValue={event?.name}/></Field>
      <Field label="Data *"><input name="event_date" type="date" required className="field-control" defaultValue={event?.event_date}/></Field>
      <Field label="Horário (opcional)"><input name="time" type="time" className="field-control" defaultValue={event?.time}/></Field>
      <Field label="Local *" full><input name="location" required maxLength={300} className="field-control" defaultValue={event?.location}/></Field>
      <Field label="Descrição" full><textarea name="description" rows={5} maxLength={5000} className="field-control" defaultValue={event?.description}/></Field>
      <Field label="Número de vagas"><input name="capacity" type="number" min={1} max={100000} placeholder="Sem limite" className="field-control" defaultValue={event?.capacity ?? ""}/></Field>
      <Field label="Inscrições"><select name="registration_status" className="field-control" defaultValue={event?.registration_status ?? "closed"}><option value="closed">Encerradas</option><option value="open">Abertas</option></select></Field>
      <Field label="Arte do evento — horizontal, 1600 × 900 px" full><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || uploading} className="field-control" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return; setUploading(true); setError("");
        try { if (file.size > 8 * 1024 * 1024) throw new Error("Use uma imagem de até 8 MB."); const form = new FormData(); form.set("file",file); const result = await api<{url: string}>("photos",{method:"POST",body:form}); setImage(result.url); setMessage("Imagem enviada. Salve o evento para aplicar."); }
        catch(error) {setError((error as Error).message);} finally {setUploading(false);}
      }}/></Field>
      {image && <div className="sm:col-span-2"><img className="admin-cover" src={image} alt="Prévia da arte do evento"/><button type="button" className="admin-text-button mt-2" onClick={() => setImage("")}>Remover arte do evento</button></div>}
    </div>
    <label className="admin-checkbox mt-6"><input name="published" type="checkbox" defaultChecked={Boolean(event?.published)}/><span>Publicar este evento no site</span></label>
    <p className="mt-2 text-sm text-zinc-600">Desmarque para manter como rascunho. As inscrições só funcionam quando o evento está publicado e com inscrições abertas.</p>
    <Notice error={error} message={uploading ? "Enviando imagem…" : message}/>
    <div className="mt-6 flex flex-wrap gap-3"><button disabled={busy || uploading} className="btn-primary">{busy ? "Salvando…" : "Salvar evento"}</button>{event && <><button type="button" className="btn-secondary" onClick={() => onRegistrations(event.id)}>Ver {event.registrations} inscritos</button>{Boolean(event.published) && <a className="btn-secondary" href={`/eventos/${event.id}`}>Ver no site</a>}</>}</div>
  </form>;
}

function Registrations({events, initialEvent, initialKind, onChanged}: {events: EventRecord[]; initialEvent: string; initialKind: string; onChanged: () => Promise<void>}) {
  const [filters,setFilters] = useState({kind:initialKind,event:initialEvent,search:"",page:1});
  const [result,setResult] = useState<{rows: SubmissionRecord[];total:number;page:number} | null>(null);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState<number | null>(null);
  const [loading,setLoading] = useState(false);
  const [revision,setRevision] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    const params = new URLSearchParams({...filters,page:String(filters.page)});
    api<{rows: SubmissionRecord[];total:number;page:number}>(`submissions?${params}`).then(value => {if(active)setResult(value);}).catch(error => {if(active)setError(error.message);}).finally(() => {if(active)setLoading(false);});
    return () => {active=false;};
  }, [filters,revision]);
  return <><div className="admin-section-heading"><h2>Inscrições e contatos</h2><button className="btn-secondary" onClick={() => setRevision(value=>value+1)}>Atualizar lista</button></div>
    <form className="panel admin-filters" onSubmit={e => {e.preventDefault(); const data = new FormData(e.currentTarget); setFilters({kind:String(data.get("kind")),event:String(data.get("event")),search:String(data.get("search")),page:1});}}>
      <Field label="Assunto"><select name="kind" className="field-control" defaultValue={initialKind}><option value="">Todos</option>{Object.entries(kindLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      <Field label="Evento"><select name="event" className="field-control" defaultValue={initialEvent}><option value="">Todos os eventos</option>{events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}</select></Field>
      <Field label="Buscar nome, e-mail ou telefone"><input name="search" className="field-control" maxLength={100} placeholder="Digite para buscar"/></Field><button className="btn-primary" disabled={loading}>Filtrar</button>
    </form>
    <Notice error={error} message={message}/><p className="my-5 text-sm text-zinc-600" role="status">{loading ? "Atualizando cadastros…" : result ? `${result.total} cadastro(s) encontrado(s)` : ""}</p>
    <div className="admin-submissions">{!loading && result?.rows.length === 0 && <div className="panel p-8"><p>Nenhum cadastro encontrado para estes filtros.</p></div>}{result?.rows.map(row => {
      let payload: Record<string,string> = {}; try {payload=JSON.parse(row.payload);} catch {payload={observacao:"Dados antigos sem formato estruturado."};}
      const links = contactLinks(payload);
      return <article key={row.id} className="panel admin-submission"><div className="admin-submission-head flex flex-wrap justify-between gap-4"><div><span className="admin-badge">{row.event_name || kindLabels[row.kind] || row.kind}</span><h3 className="mt-3 text-xl font-bold">{payload.nome || payload.email || `Cadastro #${row.id}`}</h3><p className="mt-2 text-sm text-zinc-600">#{row.id} · {new Date(row.created_at.replace(" ","T")+"Z").toLocaleString("pt-BR",{timeZone:"America/Fortaleza"})}{row.ticket_code && row.event_id ? <> · Inscrição nº <strong className="font-mono">{String(row.event_id).padStart(2,"0")}-{String(row.id).padStart(5,"0")}</strong> · <a className="underline" href={`/inscricao/${row.ticket_code}`} target="_blank" rel="noreferrer">comprovante</a></> : null}</p></div><Field label="Situação"><select className="field-control" value={row.status} disabled={busy!==null || loading} onChange={async e=>{
        setBusy(row.id);setError("");setMessage("");try {await api("submissions",json({id:row.id,status:e.target.value},"PATCH"));setRevision(value=>value+1);await onChanged();setMessage(`Cadastro #${row.id} atualizado.`);}catch(error){setError((error as Error).message);}finally{setBusy(null);}
      }}>{!statusLabels[row.status] && <option value={row.status}>{row.status}</option>}{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field></div>{(links.whatsapp || links.phone || links.email) && <div className="admin-contact-actions">{links.whatsapp && <a className="is-whatsapp" href={links.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>}{links.phone && <a href={links.phone}>Ligar</a>}{links.email && <a href={links.email}>E-mail</a>}</div>}<details className="mt-5"><summary className="admin-text-button">Ver dados enviados</summary><dl className="admin-details">{Object.entries(payload).map(([key,value])=><div key={key}><dt>{key.replaceAll("_"," ")}</dt><dd>{String(value) || "Não informado"}</dd></div>)}</dl></details></article>;
    })}</div>
    {result && result.total > 30 && <div className="mt-6 flex flex-wrap items-center gap-4"><button className="btn-secondary" disabled={filters.page<=1 || loading} onClick={()=>setFilters({...filters,page:filters.page-1})}>Anterior</button><span>Página {result.page} de {Math.ceil(result.total/30)}</span><button className="btn-secondary" disabled={filters.page*30>=result.total || loading} onClick={()=>setFilters({...filters,page:filters.page+1})}>Próxima</button></div>}
  </>;
}

function GalleryEditor({gallery,onSaved,onUpdated}: {gallery?:GalleryRecord;onSaved:(id:number)=>Promise<void>;onUpdated:()=>Promise<void>}) {
  const [photos,setPhotos]=useState<PhotoRecord[]>([]);
  const [files,setFiles]=useState<File[]>([]);
  const [alt,setAlt]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [removeId,setRemoveId]=useState<number|null>(null);
  const loadPhotos=useCallback(async()=>{if(gallery){const data=await api<{photos:PhotoRecord[]}>(`photos?gallery=${gallery.id}`);setPhotos(data.photos);}},[gallery]);
  useEffect(()=>{loadPhotos().catch(error=>setError(error.message));},[loadPhotos]);
  async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setMessage("");const data=new FormData(e.currentTarget);try{const result=await api<{id:number}>("galleries",json({...Object.fromEntries(data),id:gallery?.id,published:data.get("published")==="on"}));await onSaved(result.id);setMessage("Álbum salvo.");}catch(error){setError((error as Error).message);}finally{setBusy(false);}}
  async function upload(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!gallery)return;setBusy(true);setError("");let sent=0;
    try {for(const file of files){setMessage(`Enviando foto ${sent+1} de ${files.length}…`);const data=new FormData();data.set("file",file);data.set("gallery_id",String(gallery.id));data.set("alt_text",alt.trim() || `${gallery.name} — ${file.name.replace(/\.[^.]+$/,"")}`);await api("photos",{method:"POST",body:data});sent++;setFiles(current=>current.filter(item=>item!==file));}setMessage(`${sent} foto(s) enviada(s).`);}
    catch(error){setError(`${sent} foto(s) enviada(s). ${(error as Error).message} As restantes continuam selecionadas.`);setMessage("");}
    finally{try{await loadPhotos();await onUpdated();}catch(error){setError((error as Error).message);}setBusy(false);}
  }
  return <div className="panel admin-editor" id="admin-editor"><form onSubmit={save}><h3 className="text-xl font-bold">{gallery?"Editar álbum":"Novo álbum"}</h3><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Nome do álbum *" full><input name="name" required maxLength={160} className="field-control" defaultValue={gallery?.name}/></Field><Field label="Categoria *"><select name="category" className="field-control" defaultValue={gallery?.category ?? "Cultos"}>{["Cultos","Batismos","Eventos","Células","Jovens","Crianças","Projetos"].map(value=><option key={value}>{value}</option>)}</select></Field><Field label="Data do culto ou evento"><input name="event_date" type="date" className="field-control" defaultValue={gallery?.event_date ?? ""}/></Field></div><label className="admin-checkbox mt-6"><input type="checkbox" name="published" defaultChecked={Boolean(gallery?.published)}/><span>Publicar este álbum na galeria</span></label><p className="mt-2 text-sm text-zinc-600">Fotos de álbuns em rascunho ficam visíveis apenas para administradores.</p><button disabled={busy} className="btn-primary mt-5">{busy?"Aguarde…":"Salvar álbum"}</button></form>
    <Notice error={error} message={message}/>
    {gallery ? <><form onSubmit={upload} className="mt-8 border-t border-zinc-200 pt-7"><h3 className="text-xl font-bold">Adicionar fotos</h3><p className="body-copy mt-2">JPG, PNG ou WebP, até 8 MB por foto. Selecione até 20 por envio.</p><div className="mt-5 grid gap-5"><Field label="Selecione as fotos"><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} className="field-control" onChange={e=>{const selected=Array.from(e.target.files??[]);if(selected.length>20 || selected.some(file=>file.size>8*1024*1024)){setError("Selecione até 20 imagens de no máximo 8 MB cada.");setFiles([]);e.target.value="";return;}setFiles(selected);setError("");}}/></Field><Field label="Descrição das fotos (opcional)"><input value={alt} onChange={e=>setAlt(e.target.value)} maxLength={200} placeholder={gallery.name} className="field-control"/></Field></div><p className="mt-3 text-sm text-zinc-600">{files.length} foto(s) aguardando envio</p><button disabled={busy || !files.length} className="btn-primary mt-4">Enviar fotos</button></form><div className="admin-photo-grid mt-7">{photos.map(photo=><figure key={photo.id}><img src={photo.image_url} alt={photo.alt_text} loading="lazy"/><figcaption><p>{photo.alt_text}</p>{removeId===photo.id?<div><p className="my-2 font-semibold">Remover esta foto do álbum?</p><button type="button" disabled={busy} className="admin-text-button" onClick={async()=>{setBusy(true);setError("");try{await api("photos",json({id:photo.id},"DELETE"));setRemoveId(null);await loadPhotos();await onUpdated();setMessage("Foto removida do álbum.");}catch(error){setError((error as Error).message);}finally{setBusy(false);}}}>Confirmar remoção</button><button type="button" className="admin-text-button ml-4" onClick={()=>setRemoveId(null)}>Cancelar</button></div>:<button type="button" disabled={busy} className="admin-text-button mt-2" onClick={()=>setRemoveId(photo.id)}>Remover foto</button>}</figcaption></figure>)}</div>{Boolean(gallery.published)&&<a className="btn-secondary mt-5" href="/galeria">Ver galeria no site</a>}</> : <p className="body-copy mt-6">Salve o álbum primeiro para adicionar as fotos.</p>}
  </div>;
}

function Settings({data,onSaved}:{data:{schedule:Schedule;contact:Contact;email:EmailConfig};onSaved:()=>Promise<void>}) {
  const [schedule,setSchedule]=useState(data.schedule);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  async function save(key:string,value:unknown){setBusy(true);setError("");setMessage("");try{await api("settings",json({key,value}));await onSaved();setMessage("Informações salvas e aplicadas no site.");}catch(error){setError((error as Error).message);}finally{setBusy(false);}}
  return <><div className="admin-section-heading"><h2>Programação e contato</h2></div><Notice error={error} message={message}/><form className="panel admin-editor" onSubmit={e=>{e.preventDefault();save("schedule",schedule);}}><h3 className="text-xl font-bold">Programação semanal</h3><div className="mt-6 grid gap-5">{schedule.map((row,index)=><div key={index} className="admin-schedule-row">{([['name','Nome'],['day','Dia'],['time','Horário']] as const).map(([key,label])=><Field key={key} label={label}><input required type={key==="time"?"time":"text"} maxLength={key==="name"?160:60} className="field-control" value={row[key]} onChange={e=>setSchedule(current=>current.map((item,i)=>i===index?{...item,[key]:e.target.value}:item))}/></Field>)}<button type="button" aria-label={`Remover horário ${index+1}`} className="admin-text-button" onClick={()=>setSchedule(current=>current.filter((_,i)=>i!==index))}>Remover</button></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={schedule.length>=30} className="btn-secondary" onClick={()=>setSchedule([...schedule,{name:"",day:"",time:""}])}>Adicionar horário</button><button disabled={busy} className="btn-primary">Salvar programação</button></div></form>
    <form className="panel admin-editor mt-6" onSubmit={e=>{e.preventDefault();save("contact",Object.fromEntries(new FormData(e.currentTarget)));}}><h3 className="text-xl font-bold">Informações de contato</h3><div className="mt-6 grid gap-5 sm:grid-cols-2">{([['address','Endereço','text'],['whatsapp','WhatsApp','tel'],['email','E-mail','email'],['instagram','Link do Instagram','url'],['youtube','Link do YouTube','url']] as const).map(([key,label,type])=><Field key={key} label={label} full={key==='address'}><input name={key} type={type} maxLength={300} className="field-control" defaultValue={data.contact[key]}/></Field>)}</div><button disabled={busy} className="btn-primary mt-6">Salvar contato</button></form>
    <form className="panel admin-editor mt-6" onSubmit={e=>{e.preventDefault();const form=e.currentTarget;save("email",Object.fromEntries(new FormData(form))).then(()=>form.reset());}}><h3 className="text-xl font-bold">E-mail de confirmação de inscrição</h3><p className="body-copy mt-2">Enviado pelo Brevo quando alguém se inscreve em um evento, com o link do comprovante e o QR code.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="E-mail remetente (verificado no Brevo)"><input name="sender_email" type="email" maxLength={254} className="field-control" defaultValue={data.email.sender_email}/></Field><Field label="Nome do remetente"><input name="sender_name" type="text" maxLength={120} className="field-control" defaultValue={data.email.sender_name}/></Field><Field label={data.email.has_api_key?"Chave da API do Brevo (já configurada; preencha só para trocar)":"Chave da API do Brevo"} full><input name="brevo_api_key" type="password" autoComplete="off" maxLength={200} placeholder={data.email.has_api_key?"••••••••••••":"xkeysib-..."} className="field-control"/></Field></div><button disabled={busy} className="btn-primary mt-6">Salvar e-mail</button></form><AdminPassword/></>;
}
