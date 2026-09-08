import type { DayGroup } from "../utils/time";

interface DayTabsProps {
  days: DayGroup[];
  activeDayKey: string | null;
  onSelectDay: (key: string) => void;
}

export function DayTabs({ days, activeDayKey, onSelectDay }: DayTabsProps) {
  return (
    <div className="day-tabs">
      {days.map((day) => (
        <button
          key={day.key}
          className={`day-tab ${day.key === activeDayKey ? "active" : ""}`}
          onClick={() => onSelectDay(day.key)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}