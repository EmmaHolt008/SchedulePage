// Updates once a minute, not once a second — a schedule page doesn't
// need second-level precision for "is this happening now," and this
// keeps re-renders cheap.
import { useEffect, useState } from "react";

export function useNow(): Date {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
}