import { database } from "../../../../lib/database";
import { requireAdminRequest, privateJson, requestFailure } from "../../../../lib/admin-auth";
import { siteContent } from "../../../../lib/content";
import { eventsWithRegistrations, galleriesWithPhotos } from "../../../../lib/site-data";

async function exactCount(query: PromiseLike<{count: number | null; error: unknown}>) {
  const result = await query;
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const db = database();
    const [submissions, newSubmissions, publishedEvents, photos, events, galleries, submissionKinds, content] = await Promise.all([
      exactCount(db.from("submissions").select("id", {count: "exact", head: true})),
      exactCount(db.from("submissions").select("id", {count: "exact", head: true}).eq("status", "novo")),
      exactCount(db.from("events").select("id", {count: "exact", head: true}).eq("published", true)),
      exactCount(db.from("gallery_photos").select("id", {count: "exact", head: true})),
      eventsWithRegistrations(false),
      galleriesWithPhotos(false),
      db.from("submissions").select("kind"),
      siteContent(),
    ]);
    if (submissionKinds.error) throw submissionKinds.error;
    const kindTotals = new Map<string, number>();
    for (const row of submissionKinds.data ?? []) kindTotals.set(row.kind, (kindTotals.get(row.kind) ?? 0) + 1);
    const kinds = [...kindTotals.entries()]
      .map(([kind, total]) => ({kind, total}))
      .sort((a, b) => b.total - a.total || a.kind.localeCompare(b.kind));
    return privateJson({
      stats: {submissions, new_submissions: newSubmissions, published_events: publishedEvents, photos},
      events,
      galleries: galleries.albums,
      kinds,
      content,
    });
  } catch (error) { return requestFailure(error); }
}
