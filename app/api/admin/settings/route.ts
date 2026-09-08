import { database } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, text, time } from "../../../../lib/validation";
export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    if (!["schedule", "contact"].includes(String(data.key))) throw new RequestError("Seção inválida.");
    let value: unknown;
    if (data.key === "schedule") {
      if (!Array.isArray(data.value) || data.value.length > 30) throw new RequestError("Use no máximo 30 horários.");
      value = data.value.map(row => ({name: text(row.name, "nome", 160), day: text(row.day, "dia", 60), time: time(row.time)}));
    } else {
      const contact = data.value as Record<string, unknown>;
      if (!contact || typeof contact !== "object") throw new RequestError("Contato inválido.");
      value = Object.fromEntries(["address", "whatsapp", "email", "instagram", "youtube"].map(key => [key, text(contact[key] ?? "", key, 300, false)]));
      const obj = value as Record<string,string>;
      if (obj.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email)) throw new RequestError("Confira o e-mail.");
      for (const key of ["instagram", "youtube"]) {
        if (!obj[key]) continue;
        let url: URL; try { url = new URL(obj[key]); } catch { throw new RequestError(`Informe o link completo de ${key}.`); }
        if (url.protocol !== "https:" || url.username || url.password) throw new RequestError("Use links seguros começando com https://.");
      }
    }
    const updatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
    const result = await database().from("content_items").upsert({section: "site", key: String(data.key), value: JSON.stringify(value), updated_at: updatedAt}, {onConflict: "section,key"}).select("id").maybeSingle();
    if (result.error) throw result.error;
    return privateJson({ok: true});
  } catch (error) { return requestFailure(error); }
}
