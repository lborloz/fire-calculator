"use client";

interface SegmentedControlOption {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string | null;
  onChange: (key: string) => void;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${value === option.key
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
