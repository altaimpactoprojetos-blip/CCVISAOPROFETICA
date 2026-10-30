import { requireStaffRequest, privateJson, requestFailure, RequestError } from "../../../lib/admin-auth";
import { checkIn, checkInEvents, defaultEvent, parseTicketInput, registrants } from "../../../lib/checkin";
import { body, id } from "../../../lib/validation";

export async function GET(request: Request) {
  try {
    await requireStaffRequest(request);
    const events = await checkInEvents();
    const param = new URL(request.url).searchParams.get("event");
    const event = param ? events.find(item => item.id === id(param)) : defaultEvent(events);
    if (param && !event) throw new RequestError("Evento não encontrado.", 404);
    return privateJson({events, event: event ?? null, registrants: event ? await registrants(event.id) : []});
  } catch (error) { return requestFailure(error); }
}

export async function POST(request: Request) {
  try {
    const staff = await requireStaffRequest(request);
    const data = await body(request);
    const eventId = data.event_id ? id(data.event_id) : undefined;
    const undo = data.undo === true;
    if (typeof data.ticket === "string") {
      const parsed = parseTicketInput(data.ticket.slice(0, 300));
      if (!parsed) throw new RequestError("QR code ou número de inscrição não reconhecido.");
      if ("code" in parsed) return privateJson(await checkIn(staff, {code: parsed.code, eventId, undo}));
      if (eventId && parsed.eventId !== eventId) throw new RequestError("Este número é de outro evento.", 409);
      return privateJson(await checkIn(staff, {id: parsed.id, eventId, undo}));
    }
    return privateJson(await checkIn(staff, {id: id(data.id), eventId, undo}));
  } catch (error) { return requestFailure(error); }
}
