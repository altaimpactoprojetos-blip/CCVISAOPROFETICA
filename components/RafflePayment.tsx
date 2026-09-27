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

// Diminui fotos grandes (prints e fotos da câmera) para ~1600 px em JPEG antes do envio.
async function shrinkImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size < 400 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch { return file; }
}

export function ReceiptUpload({code, sent}: {code: string; sent: boolean}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(sent ? "done" : "idle");
  const [error, setError] = useState("");
  const [again, setAgain] = useState(false);
  async function send(file: File | undefined) {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !file.type.startsWith("image/")) { setError("Use uma foto ou um PDF do comprovante."); setState("error"); return; }
    setState("sending"); setError("");
    try {
      const body = isPdf ? file : await shrinkImage(file);
      if (body.size > 6 * 1024 * 1024) throw new Error("O arquivo passa de 6 MB. Envie um print do comprovante.");
      const form = new FormData();
      form.append("code", code);
      form.append("file", body, isPdf ? "comprovante.pdf" : "comprovante.jpg");
      const response = await fetch("/api/rifa/comprovante", {method: "POST", body: form});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar agora.");
      setState("done"); setAgain(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Confira sua conexão e tente novamente.");
      setState("error");
    }
  }
  if (state === "done" && !again) return <div className="raffle-receipt is-sent" role="status">
    <strong>Comprovante recebido!</strong>
    <span>Vamos conferir o pagamento e confirmar seus números. Você recebe um e-mail quando estiver tudo certo.</span>
    <button type="button" className="admin-text-button" onClick={() => setAgain(true)}>Enviar outro comprovante</button>
  </div>;
  return <div className="raffle-receipt">
    <p className="raffle-receipt-note"><strong>Depois de pagar, envie aqui o comprovante (foto ou PDF) para confirmarmos o pagamento e validarmos seus números.</strong></p>
    <label className={`btn-primary raffle-receipt-button ${state === "sending" ? "is-busy" : ""}`}>
      {state === "sending" ? "Enviando comprovante…" : "Enviar comprovante"}
      <input type="file" accept="image/*,application/pdf" disabled={state === "sending"} onChange={e => { void send(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }}/>
    </label>
    {state === "error" && <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>}
  </div>;
}
