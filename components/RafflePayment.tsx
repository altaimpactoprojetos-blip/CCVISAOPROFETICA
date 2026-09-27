"use client";

import { useState } from "react";

export function CopyPix({code}: {code: string}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { window.prompt("Copie o código Pix:", code); }
  }
  return <div className="raffle-pix-copy">
    <textarea readOnly value={code} rows={3} aria-label="Código Pix copia e cola" onFocus={e => e.currentTarget.select()}/>
    <button type="button" className="btn-primary w-full" onClick={copy}>{copied ? "Código copiado" : "Copiar código Pix"}</button>
  </div>;
}

export function ShareRaffle({url, prize}: {url: string; prize: string}) {
  const [copied, setCopied] = useState(false);
  const message = `Estou participando da rifa solidária do ${prize} da Comunidade Cristã Visão Profética para comprar o telão da igreja. Participe também!`;
  async function share() {
    const invite = url.replace(/\/pedido\/.*$/, "");
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await navigator.share({title: `Rifa do ${prize}`, text: message, url: invite}); return; } catch { /* usuário cancelou */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${message} ${invite}`)}`, "_blank", "noopener");
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Copie o link:", url); }
  }
  return <div className="ticket-actions">
    <button type="button" className="btn-secondary" onClick={copy}>{copied ? "Link copiado" : "Copiar link do pedido"}</button>
    <button type="button" className="btn-secondary" onClick={share}>Convidar amigos</button>
  </div>;
}
