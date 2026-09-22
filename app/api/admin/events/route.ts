import { database, rpcNumber } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, text, id, date, time, publication } from "../../../../lib/validation";
export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    const db = database();
    const eventId = data.id ? id(data.id) : null;
    const name = text(data.name, "nome", 160);
    const description = text(data.description, "descrição", 5000, false);
    const day = date(data.event_date);
    const hour = time(data.time);
    const location = text(data.location, "local", 300);
    const capacity = data.capacity === "" || data.capacity == null ? null : id(data.capacity);
    if (capacity !== null && capacity > 100000) throw new RequestError("Limite máximo de 100.000 vagas.");
    const status = data.registration_status;
    if (status !== "open" && status !== "closed") throw new RequestError("Situação das inscrições inválida.");
    const published = publication(data.published);
    const imageUrl = text(data.image_url ?? "", "imagem", 150, false) || null;
    const staticImage = Boolean(imageUrl && /^\/eventos\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp)$/.test(imageUrl));
    if (imageUrl && !staticImage && !/^\/api\/media\/[a-f0-9-]{36}$/.test(imageUrl)) throw new RequestError("Envie a imagem pelo painel.");
    if (imageUrl && !staticImage) {
      const key = imageUrl.split("/").pop();
      const asset = await db.from("media_assets").select("key").eq("key", key).maybeSingle();
      if (asset.error) throw asset.error;
      if (!asset.data) throw new RequestError("Imagem não encontrada.");
    }
    if (eventId) {
      const existing = await db.from("events").select("id").eq("id", eventId).maybeSingle();
      if (existing.error) throw existing.error;
      if (!existing.data) throw new RequestError("Evento não encontrado.", 404);
      const updated = await db.rpc("update_event_if_capacity", {
        p_event_id: eventId,
        p_name: name,
        p_description: description,
        p_event_date: day,
        p_time: hour,
        p_location: location,
        p_capacity: capacity,
        p_registration_status: status,
        p_published: published,
        p_image_url: imageUrl,
      });
      if (updated.error) throw updated.error;
      if (rpcNumber(updated.data) !== 1) throw new RequestError("Novas inscrições chegaram. Atualize os números antes de reduzir as vagas.", 409);
      return privateJson({ok: true, id: eventId});
    }
    const result = await db.from("events").insert({name, description, event_date: day, time: hour, location, capacity, registration_status: status, published, image_url: imageUrl}).select("id").single();
    if (result.error) throw result.error;
    return privateJson({ok: true, id: result.data.id}, 201);
  } catch (error) { return requestFailure(error); }
}
