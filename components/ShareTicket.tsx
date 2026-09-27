"use client";
import { useState } from "react";
import { copyText } from "../lib/copy";
export function ShareTicket({url, eventName, when}: {url: string; eventName: string; when: string}) {
  const [copied, setCopied] = useState(false);
  const message = `Minha inscrição está confirmada: ${eventName}, ${when}. Comprovante: ${url}`;
  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await navigator.share({title: `Inscrição: ${eventName}`, text: message, url}); return; } catch { /* usuário cancelou */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }
  async function copy() {
    if (await copyText(url)) { setCopied(true); setTimeout(() => setCopied(false), 2000); } else window.prompt("Copie o link:", url);
  }
  return <div className="ticket-actions">
    <button type="button" className="btn-primary" onClick={share}>Compartilhar</button>
    <button type="button" className="btn-secondary" onClick={copy}>{copied ? "Link copiado" : "Copiar link"}</button>
    <button type="button" className="btn-secondary" onClick={() => window.print()}>Salvar em PDF</button>
  </div>;
}
