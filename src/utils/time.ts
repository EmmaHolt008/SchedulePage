import type { ScheduleEvent } from "../types/event";

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

/** A stable key for grouping events that share a calendar day. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10); // "2026-02-27"
}

export function isHappeningNow(event: ScheduleEvent, now: Date): boolean {
  return event.startTime <= now && now <= event.endTime;
}

export interface DayGroup {
  key: string;
  label: string;
  events: ScheduleEvent[];
}

/** Buckets a flat, time-sorted event list into one group per day. */
export function groupByDay(events: ScheduleEvent[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const event of events) {
    const key = dayKey(event.startTime);
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatDayLabel(event.startTime), events: [] });
    }
    groups.get(key)!.events.push(event);
  }

  return [...groups.values()];
}