/**
 * SchedulePage owns all the state for the app -- which day is active,
 * search text, category filters, favorites, view mode -- and computes
 * what should currently be visible. It renders that data using smaller
 * components that don't hold any state of their own.
 *
 * Data flow through the app, top to bottom:
 *
 *   types/event.ts          defines what an event looks like
 *         |
 *   api/hackIllinoisApi.ts  fetches it and converts it to that shape
 *         |
 *   hooks/useEvents.ts      holds it in React state (loading/error/data)
 *         |
 *   SchedulePage (this file) decides what's currently visible
 *         |
 *   TimeGrid, MiniCalendar, etc.  just render whatever they're handed
 *
 * No layer skips the one below it -- TimeGrid never fetches anything,
 * and the API file never imports React. That separation is what keeps
 * this readable as it grows.
 */
import { useMemo, useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { useFavorites } from "../hooks/useFavorites";
import { useNow } from "../hooks/useNow";
import type { EventCategory, ScheduleEvent } from "../types/event";
import { groupByDay, type DayGroup } from "../utils/time";
import { MiniCalendar } from "./MiniCalendar";
import { FilterBar } from "./FilterBar";
import { TimeGrid } from "./TimeGrid";
import { EventCard } from "./EventCard";
import { EventDetailPanel } from "./EventDetailPanel";
import { StatusMessage } from "./StatusMessage";

// "oneDay"/"threeDay" show every event; "myEventsGrid" is the same
// grid layout but pre-filtered to favorites only; "mySchedule" is a
// flat, scannable list of favorites instead of a grid.
type ViewMode = "oneDay" | "threeDay" | "myScheduleGrid" | "myEvents";

export function SchedulePage() {
  const { events, isLoading, error } = useEvents();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const now = useNow();

  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("threeDay");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const days = useMemo(() => groupByDay(events), [events]);
  const currentDayKey = activeDayKey ?? days[0]?.key ?? null;

  function toggleCategory(category: EventCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function handleSelectDay(key: string) {
  setActiveDayKey(key);
  setViewMode("oneDay");
}

  // Search and category apply everywhere -- every grid mode AND the list.
  function matchesSearchAndCategory(event: ScheduleEvent): boolean {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategories.size === 0 || activeCategories.has(event.eventType);
    return matchesSearch && matchesCategory;
  }

  // Adds the "Favorites Only" toggle on top -- only meaningful for the
  // regular 1-day/3-day grids, since myEventsGrid is already favorites-only.
  function matchesFilters(event: ScheduleEvent): boolean {
    const matchesFavorite = !showFavoritesOnly || favoriteIds.has(event.eventId);
    return matchesSearchAndCategory(event) && matchesFavorite;
  }

  const visibleDays: DayGroup[] = useMemo(() => {
    if (viewMode === "myScheduleGrid") {
      return days.map((day) => ({
        ...day,
        events: day.events.filter((e) => favoriteIds.has(e.eventId) && matchesSearchAndCategory(e)),
      }));
    }
    const source = viewMode === "oneDay" ? days.filter((d) => d.key === currentDayKey) : days;
    return source.map((day) => ({ ...day, events: day.events.filter(matchesFilters) }));
  }, [days, viewMode, currentDayKey, searchTerm, activeCategories, showFavoritesOnly, favoriteIds]);

  const hasVisibleEvents = visibleDays.some((day) => day.events.length > 0);

  const favoriteEvents = useMemo(() => {
    return events.filter((event) => favoriteIds.has(event.eventId) && matchesSearchAndCategory(event));
  }, [events, favoriteIds, searchTerm, activeCategories]);

  return (
    <div className="page">
      <h1>HackIllinois Schedule</h1>

      {isLoading && <StatusMessage>Loading the schedule...</StatusMessage>}
      {error && <StatusMessage>Couldn't load the schedule ({error}). Try refreshing.</StatusMessage>}

      {!isLoading && !error && (
        <div className="layout">
          <div className="schedule-column">
            <div className="view-toggle">
              <button className={viewMode === "threeDay" ? "active" : ""} onClick={() => setViewMode("threeDay")}>
                All Days
              </button>
              <button
                className={viewMode === "myScheduleGrid" ? "active" : ""}
                onClick={() => setViewMode("myScheduleGrid")}
              >
                My Schedule
              </button>
              <button
                className={viewMode === "myEvents" ? "active" : ""}
                onClick={() => setViewMode("myEvents")}
              >
                My Events
              </button>
            </div>

            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              activeCategories={activeCategories}
              onToggleCategory={toggleCategory}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={() => setShowFavoritesOnly((v) => !v)}
            />

            {viewMode === "myEvents" ? (
              <div className="favorites-list">
                {favoriteEvents.length === 0 && (
                  <StatusMessage>You haven't favorited anything yet.</StatusMessage>
                )}
                {favoriteEvents.map((event) => (
                  <EventCard
                    key={event.eventId}
                    event={event}
                    now={now}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <>
                {!hasVisibleEvents && <StatusMessage>No events match your filters.</StatusMessage>}
                {hasVisibleEvents && (
                  <TimeGrid
  days={visibleDays}
  now={now}
  favoriteIds={favoriteIds}
  onSelectEvent={setSelectedEvent}
  onSelectDayHeader={handleSelectDay}
/>
                )}
              </>
            )}
          </div>

          <div className="side-column">
            <div className="mini-calendar-panel">
              <MiniCalendar days={days} activeDayKey={currentDayKey} onSelectDay={handleSelectDay} />
            </div>

            <div className="detail-panel-slot">
              {selectedEvent ? (
                <EventDetailPanel
                  event={selectedEvent}
                  isFavorite={favoriteIds.has(selectedEvent.eventId)}
                  onToggleFavorite={toggleFavorite}
                  onClose={() => setSelectedEvent(null)}
                />
              ) : (
                <StatusMessage>Click an event to see its details here.</StatusMessage>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}