import { database } from "../../../../lib/database";
import { getMedia } from "../../../../lib/media";
import { getAdmin } from "../../../../lib/admin-auth";
export async function GET(_request: Request, {params}: {params: Promise<{key: string}>}) {
  try {
    const {key} = await params;
    if (!/^[a-f0-9-]{36}$/.test(key)) return new Response("Não encontrado", {status: 404});
    const url = `/api/media/${key}`;
    const db = database();
    const eventImage = await db.from("events").select("id").eq("image_url", url).eq("published", true).limit(1);
    if (eventImage.error) throw eventImage.error;
    let published = Boolean(eventImage.data?.length);
    if (!published) {
      const photo = await db.from("gallery_photos").select("gallery_id").eq("image_url", url).limit(1);
      if (photo.error) throw photo.error;
      const galleryId = photo.data?.[0]?.gallery_id;
      if (galleryId) {
        const gallery = await db.from("galleries").select("id").eq("id", galleryId).eq("published", true).limit(1);
        if (gallery.error) throw gallery.error;
        published = Boolean(gallery.data?.length);
      }
    }
    if (!published && !await getAdmin()) return new Response("Não encontrado", {status: 404, headers: {"Cache-Control": "no-store"}});
    const object = await getMedia(key);
    if (!object) return new Response("Não encontrado", {status: 404});
    return new Response(object.body, {headers: {"Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'"}});
  } catch (error) { console.error("Media unavailable", error); return new Response("Imagem temporariamente indisponível", {status: 503}); }
}
