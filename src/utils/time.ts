// Plain functions, no React here on purpose — makes this easy to
// reason about (and unit test) independent of any component.

// dayKey: slicing the ISO string to 10 chars gives a clean, sortable
// "YYYY-MM-DD" string to group same-day events under.
import type { ScheduleEvent } from "../types/event";

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
export interface GridRange {
  startHour: number; // e.g. 8 (8:00 AM)
  endHour: number; // e.g. 23 (11:00 PM)
}

export interface CalendarCell {
  date: Date;
  dayKey: string;
  inCurrentMonth: boolean;
}

/**
 * Builds a full calendar grid (always complete weeks, Sunday-first) for
 * the month containing `anchorDate`. Includes the trailing days from
 * the next month needed to fill out the last week -- this is what
 * naturally shows "March 1" right after "Feb 28" without any special
 * casing for the event crossing a month boundary.
 */
export function buildMonthGrid(anchorDate: Date, mustInclude: Date[] = []): CalendarCell[] {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  // Normally the grid just needs to complete the anchor month's last
  // week. But if an event (like March 1st here) falls later than that,
  // push the grid's end out far enough to include it too.
  let latestNeeded = monthEnd;
  for (const date of mustInclude) {
    if (date > latestNeeded) latestNeeded = date;
  }

  const gridEnd = new Date(latestNeeded);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const cells: CalendarCell[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    cells.push({
      date: new Date(cursor),
      dayKey: dayKey(cursor),
      inCurrentMonth: cursor.getMonth() === month,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}

/**
 * Finds a sensible hour range to display, based on the events actually
 * scheduled -- so the grid doesn't waste vertical space on hours
 * (like 3-6 AM) when nothing's happening. Pads by an hour on each end.
 */
export function getGridRange(events: ScheduleEvent[]): GridRange {
  if (events.length === 0) return { startHour: 8, endHour: 22 };

  let earliest = 24;
  let latest = 0;

  for (const event of events) {
    earliest = Math.min(earliest, event.startTime.getHours());
    const endHour = event.endTime.getHours() + (event.endTime.getMinutes() > 0 ? 1 : 0);
    latest = Math.max(latest, endHour);
  }

  return {
    startHour: Math.max(0, earliest - 1),
    endHour: Math.min(24, latest + 1),
  };
}

function minutesFromGridStart(date: Date, gridStartHour: number): number {
  return (date.getHours() - gridStartHour) * 60 + date.getMinutes();
}

export interface EventPosition {
  topPercent: number;
  heightPercent: number;
}

/**
 * Computes where an event should sit vertically inside an hour-marked
 * grid, as PERCENTAGES rather than pixels -- this lets the grid
 * container be resized (or be a different height on mobile) without
 * this math needing to change at all.
 */
export function getEventPosition(event: ScheduleEvent, range: GridRange): EventPosition {
  const totalMinutes = (range.endHour - range.startHour) * 60;
  const startMinutes = Math.max(0, minutesFromGridStart(event.startTime, range.startHour));
  const endMinutes = Math.min(totalMinutes, minutesFromGridStart(event.endTime, range.startHour));

  const topPercent = (startMinutes / totalMinutes) * 100;
  // 2% floor so very short events (like a 15-min check-in slot) don't
  // collapse to an unclickable sliver.
  const heightPercent = Math.max(2, ((endMinutes - startMinutes) / totalMinutes) * 100);

  return { topPercent, heightPercent };
}

export interface PositionedEvent {
  event: ScheduleEvent;
  position: EventPosition;
  indentPercent: number;
  stackIndex: number;
}

const INDENT_STEP_PERCENT = 14;

/**
 * Groups a day's events into clusters of events that overlap in time
 * (transitively -- if A overlaps B and B overlaps C, all three cluster
 * together even if A and C don't directly overlap). Within a cluster,
 * later-starting events get indented further from the left and stacked
 * on top visually, so overlapping events read as a "tabbed" fan rather
 * than sitting exactly on top of one another.
 */
export function layoutDayEvents(events: ScheduleEvent[], range: GridRange): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const positioned: PositionedEvent[] = [];
  let cluster: ScheduleEvent[] = [];
  let clusterEnd = -Infinity;

  function flushCluster() {
    cluster.forEach((event, i) => {
      positioned.push({
        event,
        position: getEventPosition(event, range),
        indentPercent: i * INDENT_STEP_PERCENT,
        stackIndex: i,
      });
    });
    cluster = [];
  }

  for (const event of sorted) {
    if (cluster.length === 0) {
      cluster.push(event);
      clusterEnd = event.endTime.getTime();
      continue;
    }
    if (event.startTime.getTime() < clusterEnd) {
      cluster.push(event);
      clusterEnd = Math.max(clusterEnd, event.endTime.getTime());
    } else {
      flushCluster();
      cluster = [event];
      clusterEnd = event.endTime.getTime();
    }
  }
  flushCluster();

  return positioned;
}

/** Hour labels to render down the side of the grid, e.g. ["8 AM", "9 AM", ...] */
export function getHourLabels(range: GridRange): string[] {
  const labels: string[] = [];
  for (let hour = range.startHour; hour < range.endHour; hour++) {
    const labelDate = new Date();
    labelDate.setHours(hour, 0, 0, 0);
    labels.push(labelDate.toLocaleTimeString(undefined, { hour: "numeric" }));
  }
  return labels;
}