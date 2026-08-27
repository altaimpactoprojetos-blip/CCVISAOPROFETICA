"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  full?: boolean;
};

export function SubmissionForm({ kind, fields, buttonLabel, successMessage, intro }: { kind: string; fields: Field[]; buttonLabel: string; successMessage: string; intro?: ReactNode }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });
    if (response.ok) {
      form.reset();
      setState("success");
    } else {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="panel grid min-h-72 place-items-center p-8 text-center" role="status">
        <div><p className="eyebrow text-zinc-500">Tudo certo</p><h3 className="mt-3 text-2xl font-bold">Enviado com sucesso</h3><p className="mt-3 max-w-lg text-sm leading-7 text-zinc-600">{successMessage}</p><button className="btn-secondary mt-7" onClick={() => setState("idle")}>Enviar outro cadastro</button></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel p-6 sm:p-8">
      {intro && <div className="mb-7 text-sm leading-7 text-zinc-600">{intro}</div>}
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className={`field-label ${field.full || field.type === "textarea" ? "sm:col-span-2" : ""}`}>
            <span>{field.label}{field.required && " *"}</span>
            {field.type === "textarea" ? (
              <textarea name={field.name} required={field.required} placeholder={field.placeholder} rows={5} className="field-control resize-y" />
            ) : field.type === "select" ? (
              <select name={field.name} required={field.required} defaultValue="" className="field-control">
                <option value="" disabled>Selecione</option>
                {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : field.type === "checkbox" ? (
              <span className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4"><input name={field.name} type="checkbox" value="Sim" className="h-5 w-5 accent-black"/><span className="font-normal">Sim</span></span>
            ) : (
              <input name={field.name} type={field.type ?? "text"} required={field.required} placeholder={field.placeholder} className="field-control" />
            )}
          </label>
        ))}
      </div>
      <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button disabled={state === "sending"} className="btn-primary disabled:cursor-wait disabled:opacity-60">{state === "sending" ? "Enviando..." : buttonLabel}</button>
        <p className="text-xs leading-5 text-zinc-500">Seus dados serão usados somente para o atendimento solicitado, conforme a LGPD.</p>
      </div>
      {state === "error" && <p className="mt-4 text-sm font-semibold text-red-700" role="alert">Não foi possível enviar agora. Tente novamente em instantes.</p>}
    </form>
  );
}
