// "Dumb" component: no fetching, no state of its own. Everything it
// needs comes in as props, and clicks get reported upward via
// onToggleFavorite rather than handled locally. Same input props
// always produce the same rendered output.
import type { ScheduleEvent } from "../types/event";
import { formatTime, isHappeningNow } from "../utils/time";

interface EventCardProps {
  event: ScheduleEvent;
  now: Date;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
}

export function EventCard({ event, now, isFavorite, onToggleFavorite }: EventCardProps) {
  const live = isHappeningNow(event, now);

  return (
    <article className={`event-card ${live ? "live" : ""}`}>
      <div className="event-top-row">
        <div>
          <p className="event-time">
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </p>
          <h3 className="event-title">{event.name}</h3>
          <p className="event-meta">{event.locationLabel}</p>
        </div>
        <button
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          onClick={() => onToggleFavorite(event.eventId)}
          aria-label={isFavorite ? "Remove from My Schedule" : "Add to My Schedule"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      {event.description && <p className="event-description">{event.description}</p>}

      <div className="tag-row">
        <span className="category-tag">{event.eventType}</span>
        {live && <span className="live-badge">Happening now</span>}
      </div>
    </article>
  );
}