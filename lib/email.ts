import { formatDate } from "./content";
import type { Ticket } from "./tickets";

/**
 * Confirmação de inscrição por e-mail via Brevo. Silencioso quando a chave
 * não está configurada: a inscrição nunca depende do envio do e-mail.
 */
export async function sendTicketEmail(ticket: Ticket, url: string) {
  const apiKey = String(process.env.BREVO_API_KEY ?? "").trim();
  const senderEmail = String(process.env.BREVO_SENDER_EMAIL ?? "").trim();
  const senderName = String(process.env.BREVO_SENDER_NAME ?? "Comunidade Cristã Visão Profética").trim();
  if (!apiKey || !senderEmail || !ticket.email) return false;
  const when = `${formatDate(ticket.event.event_date)}${ticket.event.time ? ` às ${ticket.event.time}` : ""}`;
  const escape = (value: string) => value.replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char] as string));
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f5f7;font-family:Inter,Segoe UI,Arial,sans-serif;color:#17191c">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#fff;border:1px solid #e3e6ea;border-radius:16px;padding:32px">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;font-weight:700">Inscrição confirmada</p>
    <h1 style="margin:0 0 16px;font-size:24px">${escape(ticket.event.name)}</h1>
    <p style="margin:0 0 4px;font-size:16px">Olá, <strong>${escape(ticket.name)}</strong>! Sua inscrição foi registrada.</p>
    <table style="margin:20px 0;border-collapse:collapse;font-size:15px">
      <tr><td style="padding:6px 16px 6px 0;color:#6b7280">Data</td><td style="padding:6px 0"><strong>${escape(when)}</strong></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#6b7280">Local</td><td style="padding:6px 0">${escape(ticket.event.location)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#6b7280">Nº da inscrição</td><td style="padding:6px 0"><strong style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:17px">${escape(ticket.number)}</strong></td></tr>
    </table>
    <a href="${escape(url)}" style="display:inline-block;background:#17191c;color:#fff;text-decoration:none;font-weight:600;padding:14px 22px;border-radius:10px">Abrir meu comprovante com QR code</a>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#6b7280">Apresente o QR code na entrada do evento. Você pode compartilhar o link do comprovante ou salvá-lo no celular.</p>
  </div>
  <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#9ca3af">Comunidade Cristã Visão Profética · ${escape(ticket.event.location)}</p>
</div></body></html>`;
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {"api-key": apiKey, "content-type": "application/json", accept: "application/json"},
    body: JSON.stringify({
      sender: {email: senderEmail, name: senderName},
      to: [{email: ticket.email, name: ticket.name || undefined}],
      subject: `Inscrição confirmada: ${ticket.event.name} (nº ${ticket.number})`,
      htmlContent: html,
      textContent: `Olá, ${ticket.name}! Sua inscrição em ${ticket.event.name} foi registrada.\nData: ${when}\nLocal: ${ticket.event.location}\nNº da inscrição: ${ticket.number}\nComprovante com QR code: ${url}`,
      tags: ["inscricao-evento"],
    }),
  });
  if (!response.ok) { console.error("Brevo email failed", response.status, await response.text().catch(() => "")); return false; }
  return true;
}
