"use client";

import { useRef, useState } from "react";
import { copyText } from "../lib/copy";

export function CopyPix({code}: {code: string}) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const field = useRef<HTMLTextAreaElement>(null);
  async function copy() {
    if (await copyText(code)) { setState("copied"); setTimeout(() => setState("idle"), 2500); return; }
    // Sem acesso à área de transferência: deixa o código selecionado para copiar à mão.
    field.current?.focus();
    field.current?.setSelectionRange(0, code.length);
    setState("manual");
  }
  return <div className="raffle-pix-copy">
    <textarea ref={field} readOnly value={code} rows={3} aria-label="Código Pix copia e cola" onFocus={e => e.currentTarget.setSelectionRange(0, code.length)}/>
    <button type="button" className="btn-primary w-full" onClick={copy}>{state === "copied" ? "Código copiado" : "Copiar código Pix"}</button>
    {state === "manual" && <p className="text-sm text-zinc-600">Não foi possível copiar automaticamente. O código está selecionado acima: toque e segure sobre ele e escolha &quot;Copiar&quot;.</p>}
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
    if (await copyText(url)) { setCopied(true); setTimeout(() => setCopied(false), 2000); } else window.prompt("Copie o link:", url);
  }
  return <div className="ticket-actions">
    <button type="button" className="btn-secondary" onClick={copy}>{copied ? "Link copiado" : "Copiar link do pedido"}</button>
    <button type="button" className="btn-secondary" onClick={share}>Convidar amigos</button>
  </div>;
}
