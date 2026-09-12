import type { DayGroup } from "../utils/time";
import { getGridRange, getHourLabels, layoutDayEvents, isHappeningNow } from "../utils/time";
import type { ScheduleEvent } from "../types/event";
import { CATEGORY_COLORS } from "../utils/categoryColors";

interface TimeGridProps {
  // Pass one DayGroup for the single-day view, several for the
  // multi-day view -- this component doesn't know or care which mode
  // it's in, it just renders one column per day it's given.
  days: DayGroup[];
  now: Date;
  favoriteIds: Set<string>;
  onSelectEvent: (event: ScheduleEvent) => void;
  // Called when someone clicks a day's header -- lets a multi-day grid
  // act as its own day-picker, without needing a separate "1 Day" tab.
  onSelectDayHeader?: (key: string) => void;
}

export function TimeGrid({ days, now, favoriteIds, onSelectEvent, onSelectDayHeader }: TimeGridProps) {
  // Look at every event across every visible day so all day-columns
  // share the same hour range and their rows actually line up.
  const allEvents = days.flatMap((day) => day.events);
  const range = getGridRange(allEvents);
  const hourLabels = getHourLabels(range);

  return (
    <div className="time-grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
      <div className="time-grid-corner" />

      {days.map((day) => (
        <button key={day.key} className="time-grid-day-header" onClick={() => {
  console.log("header clicked:", day.key);
  onSelectDayHeader?.(day.key);
}}>
  {day.label}
</button>
      ))}

      <div className="time-grid-hours">
        {hourLabels.map((label) => (
          <div key={label} className="hour-label">
            {label}
          </div>
        ))}
      </div>

      {days.map((day) => (
        <div key={day.key} className="time-grid-column">
          {hourLabels.map((_, i) => (
            <div key={i} className="hour-line" />
          ))}

          {layoutDayEvents(day.events, range).map(({ event, position, indentPercent, stackIndex }) => {
            const live = isHappeningNow(event, now);

            return (
              <button
                key={event.eventId}
                className={`grid-event ${live ? "live" : ""} ${favoriteIds.has(event.eventId) ? "favorite" : ""}`}
                style={{
                  top: `${position.topPercent}%`,
                  height: `${position.heightPercent}%`,
                  left: `${indentPercent}%`,
                  zIndex: 10 + stackIndex,
                  backgroundColor: CATEGORY_COLORS[event.eventType],
                }}
                onClick={() => onSelectEvent(event)}
              >
                {favoriteIds.has(event.eventId) && <span className="grid-event-star">★</span>}
                {event.name}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}