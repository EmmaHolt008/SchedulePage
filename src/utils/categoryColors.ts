import type { EventCategory } from "../types/event";

/** One color per category, reused everywhere an event's category shows
 * up -- the grid blocks, the card list tags, etc. Keeping it in one
 * file means changing a category's color is a one-line edit. */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  WORKSHOP: "#69d1b7",
  SPEAKER: "#568cef",
  MEAL: "#ff802b",
  SOCIAL: "#ff86e9",
  MINIEVENT: "#ffda52",
  CHECKIN: "#5eccff",
  OTHER: "#86d9ff",
};
