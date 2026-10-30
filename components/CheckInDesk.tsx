"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import jsQR from "jsqr";
import type {CheckInEvent, CheckInResult, Registrant} from "../lib/checkin";

type DeskData = {events: CheckInEvent[]; event: CheckInEvent | null; registrants: Registrant[]};
type Outcome = {tone: "ok" | "warn" | "error"; title: string; detail: string};

const fold = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const clock = (value: string) => new Date(value).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza"});
const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");

async function post(value: Record<string, unknown>): Promise<CheckInResult> {
  const response = await fetch("/api/recepcao", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(value), cache: "no-store"});
  let data; try { data = await response.json(); } catch { throw new Error("Sem conexão. Confira a internet e tente de novo."); }
  if (!response.ok) throw new Error(data.error || "Não foi possível validar.");
  return data;
}

function describe(result: CheckInResult): Outcome {
  const {registrant: person} = result;
  const by = person.checked_in_at ? `às ${clock(person.checked_in_at)}${person.checked_in_by ? ` por ${person.checked_in_by}` : ""}` : "";
  if (result.status === "validada") return {tone: "ok", title: `Entrada validada: ${person.name}`, detail: `Inscrição nº ${person.number}. Pode entrar!`};
  if (result.status === "ja_validada") return {tone: "warn", title: `Já validada: ${person.name}`, detail: `Esta inscrição já entrou ${by}. Confira com a equipe antes de liberar.`};
  if (result.status === "cancelada") return {tone: "error", title: `Inscrição cancelada: ${person.name}`, detail: "Esta inscrição foi cancelada e não vale para entrada."};
  if (result.status === "outro_evento") return {tone: "error", title: `Inscrição de outro evento: ${person.name}`, detail: `Este QR code é do evento “${person.event_name}”.`};
  return {tone: "warn", title: `Validação desfeita: ${person.name}`, detail: "A inscrição voltou para “falta validar”."};
}

export function CheckInDesk({staffName}: {staffName: string}) {
  const [data, setData] = useState<DeskData | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<"todas" | "faltam" | "validadas">("todas");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastScan = useRef({text: "", at: 0});
  const eventRef = useRef<number | null>(null);
  useEffect(() => { eventRef.current = eventId; }, [eventId]);

  const load = useCallback(async (id: number | null) => {
    const response = await fetch(`/api/recepcao${id ? `?event=${id}` : ""}`, {cache: "no-store"});
    const value = await response.json().catch(() => ({error: "Sem conexão. Confira a internet."}));
    if (!response.ok) { setError(value.error || "Não foi possível carregar a lista."); return; }
    setData(value); setError("");
    if (!id && value.event) setEventId(value.event.id);
  }, []);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => active ? load(eventId) : undefined).catch(() => setError("Sem conexão. Confira a internet."));
    return () => { active = false; };
  }, [eventId, load]);
  // Atualiza sozinho para as duas recepcionistas verem as validações uma da outra.
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === "visible") load(eventRef.current).catch(() => {}); }, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const validate = useCallback(async (value: Record<string, unknown>) => {
    setError("");
    try {
      const result = await post({...value, event_id: eventRef.current});
      const next = describe(result);
      setOutcome(next);
      navigator.vibrate?.(next.tone === "ok" ? 120 : [80, 60, 80]);
      await load(eventRef.current);
    } catch (problem) {
      setOutcome({tone: "error", title: "Não validada", detail: (problem as Error).message});
      navigator.vibrate?.([80, 60, 80]);
    }
  }, [load]);

  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | null = null, frame = 0, stopped = false;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {willReadFrequently: true});
    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video && context && video.readyState >= 2) {
        const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const found = jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, {inversionAttempts: "dontInvert"});
        const now = Date.now();
        if (found?.data && (found.data !== lastScan.current.text || now - lastScan.current.at > 4000)) {
          lastScan.current = {text: found.data, at: now};
          validate({ticket: found.data});
        }
      }
      frame = requestAnimationFrame(tick);
    };
    navigator.mediaDevices?.getUserMedia({video: {facingMode: "environment"}, audio: false}).then(media => {
      if (stopped) { media.getTracks().forEach(track => track.stop()); return; }
      stream = media;
      if (videoRef.current) { videoRef.current.srcObject = media; videoRef.current.play().catch(() => {}); }
      frame = requestAnimationFrame(tick);
    }).catch(() => { setScanning(false); setError("Não foi possível abrir a câmera. Permita o acesso à câmera no navegador ou procure pelo nome."); });
    return () => { stopped = true; cancelAnimationFrame(frame); stream?.getTracks().forEach(track => track.stop()); };
  }, [scanning, validate]);

  if (!data) return <div className="panel p-8"><p role="status">{error || "Carregando inscrições…"}</p></div>;
  const list = data.registrants;
  const done = list.filter(person => person.checked_in_at).length;
  const terms = fold(query.trim());
  const digits = query.replace(/\D/g, "");
  const visible = list.filter(person => show === "todas" || (show === "validadas") === Boolean(person.checked_in_at)).filter(person => !terms ||
    fold(person.name).includes(terms) || person.code.toLowerCase() === terms || person.number.includes(query.trim()) ||
    (digits.length >= 4 && person.whatsapp.replace(/\D/g, "").includes(digits)));

  return <div className="checkin">
    <div className="checkin-top panel">
      <label className="field-label"><span>Evento</span><select className="field-control" value={eventId ?? ""} onChange={e => { setEventId(Number(e.target.value)); setOutcome(null); setQuery(""); }}>
        {data.events.map(event => <option key={event.id} value={event.id}>{event.name} · {dateLabel(event.event_date)}</option>)}
      </select></label>
      <div className="checkin-count" aria-live="polite"><strong>{done}</strong><span>de {list.length} validada(s)</span><span className="checkin-bar" aria-hidden="true"><span style={{width: `${list.length ? done / list.length * 100 : 0}%`}}/></span></div>
      {data.event && <a className="btn-secondary" href={`/recepcao/lista?evento=${data.event.id}`} target="_blank" rel="noreferrer">Imprimir lista</a>}
    </div>

    <div className="checkin-actions">
      <button type="button" className={scanning ? "btn-secondary" : "btn-primary"} onClick={() => {
        setError("");
        if (!scanning && !navigator.mediaDevices?.getUserMedia) { setError("Este navegador não abre a câmera. Use o Chrome ou o Safari atualizado, ou procure pelo nome."); return; }
        setScanning(value => !value);
      }}>{scanning ? "Fechar câmera" : "Ler QR code"}</button>
      <span className="text-sm text-zinc-600">Recepção: <strong>{staffName}</strong></span>
    </div>
    {scanning && <div className="checkin-camera"><video ref={videoRef} playsInline muted/><span aria-hidden="true"/><p>Aponte a câmera para o QR code do comprovante.</p></div>}
    {error && <p className="admin-notice admin-error" role="alert">{error}</p>}
    {outcome && <div className={`checkin-outcome is-${outcome.tone}`} role="status"><strong>{outcome.title}</strong><span>{outcome.detail}</span><button type="button" className="admin-text-button" onClick={() => setOutcome(null)}>Fechar</button></div>}

    <div className="panel checkin-search">
      <label className="field-label"><span>Procurar pelo nome, WhatsApp ou nº da inscrição</span><input className="field-control" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: Maria" autoComplete="off" enterKeyHint="search"/></label>
      <div className="checkin-filter" role="group" aria-label="Mostrar">
        {([["todas", `Todas (${list.length})`], ["faltam", `Faltam (${list.length - done})`], ["validadas", `Validadas (${done})`]] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={show === key} onClick={() => setShow(key)}>{label}</button>)}
      </div>
    </div>

    <ul className="checkin-list">
      {visible.length === 0 && <li className="panel p-6">Nenhuma inscrita encontrada{query ? ` para “${query}”` : ""}.</li>}
      {visible.map(person => <li key={person.id} className={`panel ${person.checked_in_at ? "is-done" : ""}`}>
        <div className="checkin-person"><strong>{person.name}</strong><span>Nº {person.number}{person.whatsapp ? ` · ${person.whatsapp}` : ""}</span>
          {person.checked_in_at && <span className="checkin-done">Validada às {clock(person.checked_in_at)}{person.checked_in_by ? ` por ${person.checked_in_by}` : ""}</span>}</div>
        {person.checked_in_at
          ? <button type="button" className="admin-text-button" disabled={busy !== null} onClick={async () => { if (!window.confirm(`Desfazer a validação de ${person.name}?`)) return; setBusy(person.id); await validate({id: person.id, undo: true}); setBusy(null); }}>Desfazer</button>
          : <button type="button" className="btn-primary" disabled={busy !== null} onClick={async () => { setBusy(person.id); await validate({id: person.id}); setBusy(null); }}>{busy === person.id ? "Validando…" : "Validar entrada"}</button>}
      </li>)}
    </ul>
  </div>;
}
