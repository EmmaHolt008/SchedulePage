import { buildMonthGrid } from "../utils/time";
import type { DayGroup } from "../utils/time";

interface MiniCalendarProps {
  days: DayGroup[];
  activeDayKey: string | null;
  onSelectDay: (key: string) => void;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function MiniCalendar({ days, activeDayKey, onSelectDay }: MiniCalendarProps) {
// Anchor the grid on whichever month the first real event falls in.
const anchorDate = days[0]?.events[0]?.startTime ?? new Date();
const eventDates = days.map((day) => day.events[0]?.startTime).filter((d): d is Date => Boolean(d));

// Quick lookup so each cell can check "is this actually an event day?"
const eventDaysByKey = new Map(days.map((day) => [day.key, day]));
const cells = buildMonthGrid(anchorDate, eventDates);

  return (
    <div className="mini-calendar">
      <p className="mini-calendar-month">
        {anchorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      </p>

      <div className="mini-calendar-grid">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="mini-calendar-weekday-label">
            {label}
          </span>
        ))}

        {cells.map((cell) => {
          const matchingDay = eventDaysByKey.get(cell.dayKey);
          const isEventDay = Boolean(matchingDay);
          const isActive = cell.dayKey === activeDayKey;

          return (
            <button
              key={cell.dayKey}
              className={[
                "mini-calendar-day",
                !cell.inCurrentMonth && "outside-month",
                isEventDay && "has-event",
                isActive && "active",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!isEventDay}
              onClick={() => matchingDay && onSelectDay(matchingDay.key)}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}