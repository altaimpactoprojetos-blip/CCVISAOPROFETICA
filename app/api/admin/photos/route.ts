import { database } from "../../../../lib/database";
import { deleteMedia, imageType, uploadMedia } from "../../../../lib/media";
import { requireAdminRequest, privateJson, requestFailure, RequestError } from "../../../../lib/admin-auth";
import { body, text, id } from "../../../../lib/validation";
export async function POST(request: Request) {
  let uploadedKey: string | null = null;
  try {
    const user = await requireAdminRequest(request);
    if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024) throw new RequestError("Use uma imagem de até 8 MB.", 413);
    const reader = request.body?.getReader();
    if (!reader) throw new RequestError("Envie uma imagem.");
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 9 * 1024 * 1024) { await reader.cancel(); throw new RequestError("Use uma imagem de até 8 MB.", 413); }
      chunks.push(value);
    }
    const bytesForm = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytesForm.set(chunk, offset); offset += chunk.byteLength; }
    const data = await new Response(bytesForm, {headers: {"Content-Type": request.headers.get("content-type") ?? ""}}).formData();
    const file = data.get("file");
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) throw new RequestError("Envie uma imagem de até 8 MB.", 413);
    const bytes = await file.arrayBuffer();
    const type = imageType(new Uint8Array(bytes));
    if (!type) throw new RequestError("Use imagens JPG, PNG ou WebP.");
    const galleryId = data.get("gallery_id") ? id(data.get("gallery_id")) : null;
    const alt = text(data.get("alt_text") ?? "", "descrição da foto", 300, Boolean(galleryId));
    const db = database();
    if (galleryId) {
      const gallery = await db.from("galleries").select("id").eq("id", galleryId).maybeSingle();
      if (gallery.error) throw gallery.error;
      if (!gallery.data) throw new RequestError("Álbum não encontrado.", 404);
    }
    const key = crypto.randomUUID();
    await uploadMedia(key, bytes, type);
    uploadedKey = key;
    const asset = await db.from("media_assets").insert({key, content_type: type, size: file.size, created_by: user.email}).select("key").single();
    if (asset.error) throw asset.error;
    if (galleryId) {
      const lastPhoto = await db.from("gallery_photos").select("position").eq("gallery_id", galleryId).order("position", {ascending: false}).order("id", {ascending: false}).limit(1);
      if (lastPhoto.error) throw lastPhoto.error;
      const position = (lastPhoto.data?.[0]?.position ?? -1) + 1;
      const photo = await db.from("gallery_photos").insert({gallery_id: galleryId, image_url: `/api/media/${key}`, alt_text: alt, position}).select("id").single();
      if (photo.error) throw photo.error;
    }
    uploadedKey = null;
    return privateJson({ok: true, url: `/api/media/${key}`}, 201);
  } catch (error) {
    if (uploadedKey) {
      try { await database().from("media_assets").delete().eq("key", uploadedKey); } catch (cleanupError) { console.error("Media metadata cleanup failed", cleanupError); }
      try { await deleteMedia(uploadedKey); } catch (cleanupError) { console.error("Upload cleanup failed", cleanupError); }
    }
    return requestFailure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    await requireAdminRequest(request);
    const data = await body(request);
    const result = await database().from("gallery_photos").delete().eq("id", id(data.id)).select("id").maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) throw new RequestError("Foto não encontrada.", 404);
    return privateJson({ok: true});
  } catch (error) { return requestFailure(error); }
}
export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const galleryId = id(new URL(request.url).searchParams.get("gallery"));
    const result = await database().from("gallery_photos").select("*").eq("gallery_id", galleryId).order("position", {ascending: true}).order("id", {ascending: true});
    if (result.error) throw result.error;
    return privateJson({photos: result.data ?? []});
  } catch (error) { return requestFailure(error); }
}
