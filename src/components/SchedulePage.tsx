import { useMemo, useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { useFavorites } from "../hooks/useFavorites";
import { useNow } from "../hooks/useNow";
import type { EventCategory } from "../types/event";
import { groupByDay } from "../utils/time";
import { DayTabs } from "./DayTabs";
import { FilterBar } from "./FilterBar";
import { EventCard } from "./EventCard";
import { StatusMessage } from "./StatusMessage";

export function SchedulePage() {
  const { events, isLoading, error } = useEvents();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const now = useNow();

  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

  const visibleEvents = useMemo(() => {
    const day = days.find((d) => d.key === currentDayKey);
    if (!day) return [];

    return day.events.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategories.size === 0 || activeCategories.has(event.eventType);
      const matchesFavorite = !showFavoritesOnly || favoriteIds.has(event.eventId);
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [days, currentDayKey, searchTerm, activeCategories, showFavoritesOnly, favoriteIds]);

  return (
    <div className="page">
      <h1>HackIllinois Schedule</h1>

      {isLoading && <StatusMessage>Loading the schedule...</StatusMessage>}
      {error && <StatusMessage>Couldn't load the schedule ({error}). Try refreshing.</StatusMessage>}

      {!isLoading && !error && (
        <>
          <DayTabs days={days} activeDayKey={currentDayKey} onSelectDay={setActiveDayKey} />
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={() => setShowFavoritesOnly((v) => !v)}
          />

          <div className="timeline">
            {visibleEvents.length === 0 && <StatusMessage>No events match your filters.</StatusMessage>}
            {visibleEvents.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                now={now}
                isFavorite={favoriteIds.has(event.eventId)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}