import type { EventCategory } from "../types/event";

const CATEGORY_LABELS: EventCategory[] = [
  "WORKSHOP",
  "SPEAKER",
  "MEAL",
  "SOCIAL",
  "MINIEVENT",
  "QNA",
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
          ★ My Schedule
        </button>
      </div>

      <div className="category-chips">
        {CATEGORY_LABELS.map((category) => (
          <button
            key={category}
            className={`chip ${activeCategories.has(category) ? "active" : ""}`}
            onClick={() => onToggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </>
  );
}