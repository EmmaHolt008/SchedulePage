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