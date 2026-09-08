import { database } from "./database";
export const defaultSchedule = [
  {day: "Terça", name: "Células de Adultos", time: "19:00"},
  {day: "Quarta", name: "Célula de Jovens", time: "19:30"},
  {day: "Quinta", name: "Quinta Profética", time: "19:30"},
  {day: "Domingo", name: "Dom de Adoração", time: "18:30"},
];
export const defaultContact = {address: "", whatsapp: "", email: "", instagram: "", youtube: ""};
export async function siteContent() {
  const {data, error} = await database().from("content_items").select("key, value").eq("section", "site");
  if (error) throw error;
  const items = Object.fromEntries((data ?? []).map(row => [row.key, row.value]));
  return {schedule: items.schedule ? JSON.parse(items.schedule) as typeof defaultSchedule : defaultSchedule, contact: items.contact ? {...defaultContact, ...JSON.parse(items.contact)} as typeof defaultContact : defaultContact};
}
export function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {day: "2-digit", month: "long", year: "numeric"}); }
