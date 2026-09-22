import { database } from "./database";
export type StoredObject = {body: ReadableStream<Uint8Array>; httpMetadata?: {contentType?: string}};
const defaultBucket = "cc-visao-profetica-media";
export function mediaBucketName() { return String(process.env.SUPABASE_STORAGE_BUCKET ?? defaultBucket).trim() || defaultBucket; }
export async function uploadMedia(key: string, bytes: ArrayBuffer, contentType: string) {
  const {error} = await database().storage.from(mediaBucketName()).upload(key, new Blob([bytes], {type: contentType}), {contentType, cacheControl: "31536000", upsert: false});
  if (error) throw error;
}
export async function getMedia(key: string): Promise<StoredObject | null> {
  const {data, error} = await database().storage.from(mediaBucketName()).download(key);
  if (error || !data) return null;
  return {body: data.stream(), httpMetadata: {contentType: data.type || undefined}};
}
export async function deleteMedia(key: string) {
  const {error} = await database().storage.from(mediaBucketName()).remove([key]);
  if (error) throw error;
}
export function imageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if ([137,80,78,71,13,10,26,10].every((byte,index) => bytes[index] === byte)) return "image/png";
  if (String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "image/webp";
  return null;
}
