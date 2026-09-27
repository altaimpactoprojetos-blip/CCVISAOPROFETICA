"use client";

import { useState, type FormEvent } from "react";

const formatBRL = (value: number) => value.toLocaleString("pt-BR", {style: "currency", currency: "BRL", minimumFractionDigits: 0});

export function RaffleForm({packages, price, max}: {packages: number[]; price: number; max: number}) {
  const [amount, setAmount] = useState(packages[1] ?? packages[0]);
  const [custom, setCustom] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const customValue = Number(custom);
  const value = custom ? customValue : amount;
  const valid = Number.isInteger(value) && value >= price && value <= max && value % price === 0;
  const quantity = valid ? value / price : 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) { setError(`Escolha um valor múltiplo de ${formatBRL(price)}, até ${formatBRL(max)}.`); setState("error"); return; }
    setState("sending"); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/rifa", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({...data, valor: value})});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível reservar agora.");
      if (typeof result.url === "string" && result.url.startsWith(window.location.origin + "/")) { window.location.assign(result.url); return; }
      throw new Error("Não foi possível abrir o pedido.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Confira sua conexão e tente novamente.");
      setState("error");
    }
  }

  return <form onSubmit={submit} className="raffle-form">
    <fieldset>
      <legend>Quanto você quer contribuir?</legend>
      <div className="raffle-packages">
        {packages.map(option => <button key={option} type="button" aria-pressed={!custom && amount === option} onClick={() => {setAmount(option); setCustom("");}}>
          <strong>{formatBRL(option)}</strong><span>{option / price} número{option / price > 1 ? "s" : ""}</span>
        </button>)}
      </div>
      <label className="field-label mt-4"><span>Ou coloque o seu valor (múltiplo de {formatBRL(price)})</span>
        <span className="raffle-custom"><span aria-hidden="true">R$</span><input inputMode="numeric" pattern="[0-9]*" className="field-control" placeholder="Ex.: 100" value={custom} onChange={e => setCustom(e.target.value.replace(/\D/g, "").slice(0, 5))} aria-invalid={Boolean(custom) && !valid}/></span>
      </label>
    </fieldset>
    <p className="raffle-summary" role="status">{valid ? <>Você recebe <strong>{quantity} número{quantity > 1 ? "s" : ""}</strong> por <strong>{formatBRL(value)}</strong></> : `Use um valor múltiplo de ${formatBRL(price)}, até ${formatBRL(max)}.`}</p>
    <div className="mt-6 grid gap-5">
      <label className="field-label"><span>Nome completo *</span><input name="nome" required maxLength={160} className="field-control" placeholder="Seu nome completo" autoComplete="name"/></label>
      <label className="field-label"><span>WhatsApp com DDD *</span><input name="whatsapp" type="tel" required maxLength={40} className="field-control" placeholder="(85) 90000-0000" autoComplete="tel"/></label>
      <label className="field-label"><span>E-mail *</span><input name="email" type="email" required maxLength={254} className="field-control" placeholder="seuemail@exemplo.com" autoComplete="email"/></label>
    </div>
    <button disabled={state === "sending" || !valid} className="btn-primary mt-7 w-full">{state === "sending" ? "Reservando seus números…" : valid ? `Reservar ${quantity} número${quantity > 1 ? "s" : ""} e pagar com Pix` : "Escolha um valor"}</button>
    <p className="mt-4 text-xs leading-5 text-zinc-500">Os números são sorteados automaticamente entre 00000 e 99999. Seus dados são usados somente para a rifa e o contato com o ganhador, conforme a LGPD.</p>
    {state === "error" && <p className="mt-4 text-sm font-semibold text-red-700" role="alert">{error}</p>}
  </form>;
}
