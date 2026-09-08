import { database } from "./database";
import type { EventRecord, GalleryRecord, PhotoRecord } from "./admin-types";

type EventRow = Omit<EventRecord, "registrations">;
type GalleryRow = Omit<GalleryRecord, "photos">;

async function registrationCounts(eventIds: number[]) {
  const counts = new Map<number, number>();
  if (!eventIds.length) return counts;
  const {data, error} = await database()
    .from("submissions")
    .select("event_id")
    .in("event_id", eventIds)
    .neq("status", "cancelado");
  if (error) throw error;
  for (const row of data ?? []) {
    const eventId = Number(row.event_id);
    counts.set(eventId, (counts.get(eventId) ?? 0) + 1);
  }
  return counts;
}

export async function eventsWithRegistrations(publishedOnly: boolean) {
  const result = publishedOnly
    ? await database().from("events").select("*").eq("published", true).order("event_date", {ascending: false}).order("time", {ascending: true}).limit(100)
    : await database().from("events").select("*").order("event_date", {ascending: false}).order("id", {ascending: false}).limit(500);
  if (result.error) throw result.error;
  const rows = (result.data ?? []) as EventRow[];
  const counts = await registrationCounts(rows.map(row => row.id));
  return rows.map(row => ({...row, registrations: counts.get(row.id) ?? 0}));
}

export async function eventWithRegistrations(id: number, publishedOnly: boolean) {
  const result = publishedOnly
    ? await database().from("events").select("*").eq("id", id).eq("published", true).maybeSingle()
    : await database().from("events").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  const counts = await registrationCounts([id]);
  return {...result.data as EventRow, registrations: counts.get(id) ?? 0};
}

export async function galleriesWithPhotos(publishedOnly: boolean) {
  const result = publishedOnly
    ? await database().from("galleries").select("*").eq("published", true).order("event_date", {ascending: false, nullsFirst: false}).order("id", {ascending: false}).limit(100)
    : await database().from("galleries").select("*").order("id", {ascending: false}).limit(500);
  if (result.error) throw result.error;
  const albums = (result.data ?? []) as GalleryRow[];
  const galleryIds = albums.map(album => album.id);
  if (!galleryIds.length) return {albums: albums.map(album => ({...album, photos: 0})), photos: [] as (PhotoRecord & {gallery_id: number})[]};

  const photosResult = await database()
    .from("gallery_photos")
    .select("*")
    .in("gallery_id", galleryIds)
    .order("position", {ascending: true})
    .order("id", {ascending: true});
  if (photosResult.error) throw photosResult.error;
  const photos = (photosResult.data ?? []) as (PhotoRecord & {gallery_id: number})[];
  const photoCounts = new Map<number, number>();
  for (const photo of photos) photoCounts.set(photo.gallery_id, (photoCounts.get(photo.gallery_id) ?? 0) + 1);
  return {albums: albums.map(album => ({...album, photos: photoCounts.get(album.id) ?? 0})), photos};
}
