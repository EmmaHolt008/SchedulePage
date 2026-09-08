// Lazy initializer (the () => {...} passed to useState) — this runs
// ONCE on first render, not on every re-render. Without the wrapper
// function, localStorage would get read on every single render.

// try/catch guards against corrupted localStorage content (e.g. if
// someone hand-edits it) crashing the whole app on load.
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hackillinois-favorite-events";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favoriteIds]));
  }, [favoriteIds]);

  const toggleFavorite = useCallback((eventId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  return { favoriteIds, toggleFavorite };
}