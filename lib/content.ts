import { database } from "./database";
export const defaultSchedule = [
  {day: "Terça", name: "Células de Adultos", time: "19:00"},
  {day: "Quarta", name: "Célula de Jovens", time: "19:30"},
  {day: "Quinta", name: "Quinta Profética", time: "19:30"},
  {day: "Domingo", name: "Dom de Adoração", time: "18:30"},
];
export const defaultContact = {address: "", whatsapp: "", email: "", instagram: "", youtube: ""};
export type EmailSettings = {sender_email: string; sender_name: string; brevo_api_key: string};
export const defaultEmail: EmailSettings = {sender_email: "", sender_name: "Comunidade Cristã Visão Profética", brevo_api_key: ""};
/** Configuração completa do e-mail, incluindo a chave. Uso exclusivo no servidor. */
export async function emailSettings(): Promise<EmailSettings> {
  const {data, error} = await database().from("content_items").select("value").eq("section", "site").eq("key", "email").maybeSingle();
  if (error) throw error;
  if (!data?.value) return defaultEmail;
  try { return {...defaultEmail, ...JSON.parse(data.value)}; } catch { return defaultEmail; }
}
export async function siteContent() {
  const {data, error} = await database().from("content_items").select("key, value").eq("section", "site");
  if (error) throw error;
  const items = Object.fromEntries((data ?? []).map(row => [row.key, row.value]));
  const email = items.email ? {...defaultEmail, ...JSON.parse(items.email)} as EmailSettings : defaultEmail;
  return {
    schedule: items.schedule ? JSON.parse(items.schedule) as typeof defaultSchedule : defaultSchedule,
    contact: items.contact ? {...defaultContact, ...JSON.parse(items.contact)} as typeof defaultContact : defaultContact,
    // A chave nunca é devolvida ao navegador; o painel só sabe se ela existe.
    email: {sender_email: email.sender_email, sender_name: email.sender_name, has_api_key: Boolean(email.brevo_api_key)},
  };
}
export function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {day: "2-digit", month: "long", year: "numeric"}); }
