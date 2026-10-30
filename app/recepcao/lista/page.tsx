import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {PrintButton} from "../../../components/PrintButton";
import {getStaff} from "../../../lib/admin-auth";
import {checkInEvents, defaultEvent, registrants, sortKey, type Registrant} from "../../../lib/checkin";
import {formatDate} from "../../../lib/content";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Lista de inscritas", robots: {index: false, follow: false}};

const initial = (name: string) => sortKey(name).charAt(0).toUpperCase() || "#";
const clock = (value: string) => new Date(value).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza"});

/** Divide a lista em partes de tamanho parecido, sem separar uma mesma letra inicial. */
function split(list: Registrant[], parts: number) {
  if (parts <= 1 || list.length < 2) return [list];
  const result: Registrant[][] = [];
  let start = 0;
  for (let part = 1; part < parts; part++) {
    let cut = Math.round(list.length * part / parts);
    let before = cut, after = cut;
    while (before > start && initial(list[before - 1].name) === initial(list[before]?.name ?? "")) before--;
    while (after < list.length && initial(list[after - 1].name) === initial(list[after].name)) after++;
    cut = before > start && cut - before <= after - cut ? before : after;
    result.push(list.slice(start, cut)); start = cut;
  }
  result.push(list.slice(start));
  return result.filter(part => part.length);
}

export default async function PrintList({searchParams}: {searchParams: Promise<{evento?: string; partes?: string}>}) {
  const staff = await getStaff().catch(() => null);
  if (!staff) redirect("/recepcao");
  const params = await searchParams;
  const events = await checkInEvents();
  const event = events.find(item => String(item.id) === params.evento) ?? defaultEvent(events);
  if (!event) return <main className="print-list"><p>Nenhum evento cadastrado.</p></main>;
  const list = await registrants(event.id);
  const partsCount = params.partes === "2" ? 2 : params.partes === "3" ? 3 : 1;
  const parts = list.length ? split(list, partsCount) : [list];
  const generated = new Date().toLocaleString("pt-BR", {dateStyle: "short", timeStyle: "short", timeZone: "America/Fortaleza"});
  const when = `${formatDate(event.event_date)}${event.time ? ` às ${event.time}` : ""}`;
  const validated = list.filter(person => person.checked_in_at).length;
  let counter = 0;
  return <main className="print-list">
    <div className="print-toolbar">
      <a href="/recepcao" className="btn-secondary">Voltar</a>
      <form className="print-options">
        <label><span>Evento</span><select name="evento" defaultValue={event.id} className="field-control">{events.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label><span>Dividir a lista</span><select name="partes" defaultValue={String(partsCount)} className="field-control"><option value="1">Lista única</option><option value="2">Em 2 partes (2 recepcionistas)</option><option value="3">Em 3 partes</option></select></label>
        <button className="btn-secondary">Aplicar</button>
      </form>
      <PrintButton label="Imprimir lista"/>
    </div>
    {parts.map((part, index) => {
      const range = part.length ? `${initial(part[0].name)} a ${initial(part[part.length - 1].name)}` : "";
      let letter = "";
      return <section key={index} className="print-page">
        <header className="print-header">
          <img src="/logo-oficial.webp" alt="" width={56} height={56}/>
          <div>
            <p className="print-church">Comunidade Cristã Visão Profética</p>
            <h1>{event.name}</h1>
            <p>{when} · {event.location}</p>
          </div>
          <dl>
            <div><dt>Inscritas</dt><dd>{list.length}</dd></div>
            {parts.length > 1 && <div><dt>Recepção {index + 1}</dt><dd>{range}</dd></div>}
          </dl>
        </header>
        <p className="print-meta">Lista em ordem alfabética{parts.length > 1 ? ` · parte ${index + 1} de ${parts.length}: nomes de ${range} (${part.length})` : ""} · gerada em {generated}{validated ? ` · ${validated} já validada(s) no sistema` : ""}. Marque a coluna “Presença” ao validar a entrada.</p>
        <table className="print-table">
          <thead><tr><th>#</th><th>Nome</th><th>WhatsApp</th><th>Nº inscrição</th><th>Presença</th></tr></thead>
          <tbody>{part.map(person => {
            counter++;
            const head = initial(person.name) !== letter;
            letter = initial(person.name);
            return [
              head && <tr key={`letter-${letter}`} className="print-letter"><td colSpan={5}>{letter}</td></tr>,
              <tr key={person.id}>
                <td className="print-index">{counter}</td>
                <td className="print-name">{person.name}</td>
                <td>{person.whatsapp}</td>
                <td className="print-number">{person.number}</td>
                <td className="print-check">{person.checked_in_at ? <span>✓ {clock(person.checked_in_at)}</span> : <span className="print-box" aria-label="não validada"/>}</td>
              </tr>,
            ];
          })}</tbody>
        </table>
        {list.length === 0 && <p className="print-meta">Nenhuma inscrição ativa neste evento.</p>}
      </section>;
    })}
  </main>;
}
