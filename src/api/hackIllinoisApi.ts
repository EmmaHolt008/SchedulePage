import type { ApiEvent, ScheduleEvent } from "../types/event";

const BASE_URL = "https://adonix.hackillinois.org";

/**
 * Converts a raw API event into the shape the UI wants to render.
 * Isolating this conversion means the rest of the app never has to think
 * about unix timestamps or raw location arrays.
 */
function toScheduleEvent(raw: ApiEvent): ScheduleEvent {
  return {
    ...raw,
    startTime: new Date(raw.startTime * 1000),
    endTime: new Date(raw.endTime * 1000),
    locationLabel: raw.locations.map((loc) => loc.description).join(", ") || "TBA",
  };
}

/**
 * Fetches every public event and returns it already sorted by start time.
 * Throws on a non-OK response so the calling hook can show an error state.
 */
export async function fetchEvents(): Promise<ScheduleEvent[]> {
  const response = await fetch(`${BASE_URL}/event/`);

  if (!response.ok) {
    throw new Error(`HackIllinois API returned ${response.status}`);
  }

  const data = await response.json();

  // The API nests the array under an "events" key; fall back to the raw
  // payload in case that ever changes to a bare array.
  const rawEvents: ApiEvent[] = data.events ?? data;

  return rawEvents.map(toScheduleEvent).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}