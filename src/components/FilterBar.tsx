// Same pattern as EventCard: display + report clicks upward. The
// actual filtering decisions live in SchedulePage, not here.
import type { EventCategory } from "../types/event";
import { CATEGORY_COLORS } from "../utils/categoryColors";

const CATEGORY_LABELS: EventCategory[] = [
  "WORKSHOP",
  "SPEAKER",
  "MEAL",
  "SOCIAL",
  "MINIEVENT",
  "CHECKIN",
  "OTHER",
];

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

// Controlled input: value comes from props, not the DOM's own internal
// state. Every keystroke flows up via onSearchChange, then back down
// as the new value — this keeps the parent as the single source of truth.
export function FilterBar({
  searchTerm,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}: FilterBarProps) {
  return (
    <>
      <div className="search-and-toggle">
        <input
          className="search-input"
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button
  className={`my-schedule-toggle ${showFavoritesOnly ? "active" : ""}`}
  onClick={onToggleFavoritesOnly}
>
  ★ Favorites Only
</button>
      </div>

      <div className="category-chips">
        {CATEGORY_LABELS.map((category) => (
          <button
  key={category}
  className={`chip ${activeCategories.has(category) ? "active" : ""}`}
  style={
    activeCategories.has(category)
      ? { backgroundColor: CATEGORY_COLORS[category], borderColor: CATEGORY_COLORS[category] }
      : undefined
  }
  onClick={() => onToggleCategory(category)}
>
  {category}
</button>
        ))}
      </div>
    </>
  );
}