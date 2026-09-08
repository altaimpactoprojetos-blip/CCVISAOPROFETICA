import { database } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, text, id, date, publication } from "../../../../lib/validation";
export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    const db = database();
    const name = text(data.name, "nome do álbum", 160);
    const category = text(data.category, "categoria", 80);
    const day = date(data.event_date, false);
    const published = publication(data.published);
    if (data.id) {
      const albumId = id(data.id);
      const result = await db.from("galleries").update({name, category, event_date: day, published}).eq("id", albumId).select("id").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) throw new RequestError("Álbum não encontrado.", 404);
      return privateJson({ok: true, id: albumId});
    }
    const result = await db.from("galleries").insert({name, category, event_date: day, published}).select("id").single();
    if (result.error) throw result.error;
    return privateJson({ok: true, id: result.data.id}, 201);
  } catch (error) { return requestFailure(error); }
}
