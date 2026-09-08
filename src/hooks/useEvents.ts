import { useEffect, useState } from "react";
import { fetchEvents } from "../api/hackIllinoisApi";
import type { ScheduleEvent } from "../types/event";

interface UseEventsResult {
  events: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads the schedule once when a component mounts and exposes
 * loading/error state so the UI can show a spinner or a friendly
 * error message instead of a blank screen.
 */
export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchEvents()
      .then((data) => {
        if (isMounted) setEvents(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, isLoading, error };
}