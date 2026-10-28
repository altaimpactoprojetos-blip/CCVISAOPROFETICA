import { whatsappLink } from "./whatsapp";

export type ReminderInput = {
  name: string;
  number: string;
  url: string;
  event: {name: string; event_date: string; time: string; location: string};
};

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char] as string));
const weekday = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {weekday: "long", timeZone: "America/Fortaleza"});
const day = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {day: "2-digit", month: "long", timeZone: "America/Fortaleza"});
const hour = (value: string) => value ? ` às ${value.replace(/:00$/, "h").replace(":", "h")}` : "";

/** Data por extenso usada no lembrete: "sexta-feira, 30 de outubro às 19h". */
export function reminderWhen(event: ReminderInput["event"]) {
  return `${weekday(event.event_date)}, ${day(event.event_date)}${hour(event.time)}`;
}

/** E-mail de lembrete: mesmo visual do e-mail de confirmação da inscrição. */
export function reminderEmail(input: ReminderInput) {
  const when = reminderWhen(input.event);
  const first = input.name.trim().split(/\s+/)[0] || input.name;
  const subject = `Lembrete: ${input.event.name} é ${weekday(input.event.event_date)}${hour(input.event.time)}`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f5f7;font-family:Inter,Segoe UI,Arial,sans-serif;color:#17191c">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#fff;border:1px solid #e3e6ea;border-radius:16px;padding:32px">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;font-weight:700">Lembrete · Falta pouco</p>
    <h1 style="margin:0 0 16px;font-size:24px">${escape(input.event.name)}</h1>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.6">Olá, <strong>${escape(first)}</strong>! Estamos te esperando. Prepare o coração: existe uma mensagem para este tempo.</p>
    <table style="margin:20px 0;border-collapse:collapse;font-size:15px">
      <tr><td style="padding:6px 16px 6px 0;color:#6b7280">Quando</td><td style="padding:6px 0"><strong>${escape(when)}</strong></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#6b7280">Local</td><td style="padding:6px 0">${escape(input.event.location)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#6b7280">Nº da inscrição</td><td style="padding:6px 0"><strong style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:17px">${escape(input.number)}</strong></td></tr>
    </table>
    <a href="${escape(input.url)}" style="display:inline-block;background:#17191c;color:#fff;text-decoration:none;font-weight:600;padding:14px 22px;border-radius:10px">Abrir meu comprovante com QR code</a>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#6b7280">Apresente o QR code na entrada. Chegue com antecedência e, se quiser, convide uma amiga para viver esse tempo com você.</p>
  </div>
  <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#9ca3af">Comunidade Cristã Visão Profética · ${escape(input.event.location)}</p>
</div></body></html>`;
  const text = `Olá, ${first}! Lembrete: ${input.event.name} é ${when}.\nLocal: ${input.event.location}\nNº da inscrição: ${input.number}\nComprovante com QR code: ${input.url}\nApresente o QR code na entrada. Estamos te esperando!`;
  return {subject, html, text};
}

/** Mensagem pronta para o botão de WhatsApp do painel de lembretes. */
export function reminderWhatsapp(input: ReminderInput & {whatsapp: string}) {
  const first = input.name.trim().split(/\s+/)[0] || input.name;
  const message = `Olá, ${first}! 💜 Passando para lembrar: *${input.event.name}* é ${reminderWhen(input.event)}.\n📍 ${input.event.location}\n\nSeu comprovante com QR code (apresente na entrada): ${input.url}\n\nEstamos te esperando!`;
  return whatsappLink(input.whatsapp, message);
}
