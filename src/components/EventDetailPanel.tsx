import type { ScheduleEvent } from "../types/event";
import { formatTime } from "../utils/time";

interface EventDetailPanelProps {
  event: ScheduleEvent;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onClose: () => void;
}

/**
 * Fills the bottom half of the layout once an event block in the grid
 * gets clicked. Grid blocks are too small to show a full description,
 * so this is where the "click for details" interaction actually pays off.
 */
export function EventDetailPanel({ event, isFavorite, onToggleFavorite, onClose }: EventDetailPanelProps) {
  return (
    <div className="event-detail-panel">
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        ✕
      </button>

      <p className="detail-time">
        {formatTime(event.startTime)} – {formatTime(event.endTime)}
      </p>
      <h2 className="detail-title">{event.name}</h2>
      <p className="detail-location">{event.locationLabel}</p>

      <button
        className={`favorite-button ${isFavorite ? "active" : ""}`}
        onClick={() => onToggleFavorite(event.eventId)}
      >
        {isFavorite ? "★ In My Schedule" : "☆ Add to My Schedule"}
      </button>

      {event.description && <p className="detail-description">{event.description}</p>}

      {event.mapImageUrl && (
        <img className="detail-map" src={event.mapImageUrl} alt={`Map showing ${event.locationLabel}`} />
      )}
    </div>
  );
}