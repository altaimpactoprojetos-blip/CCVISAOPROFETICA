"use client";
import {useState} from "react";

/** Botão que aparece no comprovante só para quem está logado como recepção ou administração. */
export function TicketCheckIn({id, checkedInAt, checkedInBy}: {id: number; checkedInAt: string | null; checkedInBy: string | null}) {
  const [state, setState] = useState<{tone: "ok" | "warn" | "error"; text: string} | null>(checkedInAt ? {tone: "warn", text: `Entrada já validada às ${new Date(checkedInAt).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza"})}${checkedInBy ? ` por ${checkedInBy}` : ""}.`} : null);
  const [busy, setBusy] = useState(false);
  return <div className="ticket-checkin">
    <p className="eyebrow text-zinc-500">Recepção</p>
    {state && <div className={`checkin-outcome is-${state.tone}`} role="status"><strong>{state.text}</strong></div>}
    {!state && <button type="button" className="btn-primary" disabled={busy} onClick={async () => {
      setBusy(true);
      try {
        const response = await fetch("/api/recepcao", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({id})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível validar.");
        setState(data.status === "validada" ? {tone: "ok", text: "Entrada validada. Pode entrar!"} : data.status === "ja_validada" ? {tone: "warn", text: "Esta inscrição já foi validada antes."} : {tone: "error", text: "Inscrição cancelada."});
      } catch (error) { setState({tone: "error", text: (error as Error).message}); } finally { setBusy(false); }
    }}>{busy ? "Validando…" : "Validar entrada"}</button>}
    <a className="admin-text-button" href="/recepcao">Voltar para a recepção</a>
  </div>;
}
