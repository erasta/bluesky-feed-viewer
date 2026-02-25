const FILTERS: [string, string][] = [
  ['posts_and_author_threads', 'Posts'],
  ['posts_with_replies', 'With Replies'],
  ['posts_with_media', 'Media'],
  ['posts_no_replies', 'No Replies'],
];

interface FilterBarProps {
  current: string;
  onChange: (filter: string) => void;
}

export function FilterBar({ current, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {FILTERS.map(([value, label]) => (
        <button
          key={value}
          className={`filter-btn${current === value ? ' active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
