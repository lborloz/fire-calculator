"use client";

import { ChangeEvent } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function CurrencyInput({
  value,
  onChange,
  className = "",
  min,
  max,
  step = 1,
}: CurrencyInputProps) {
  // Format number with commas
  const formatWithCommas = (num: number): string => {
    return num.toLocaleString("en-US");
  };

  // Remove commas and parse to number
  const parseFromFormatted = (str: string): number => {
    const cleaned = str.replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate smart increment based on magnitude
  const getSmartIncrement = (val: number): number => {
    if (val >= 1000000) return 10000; // Millions: increment by 10k
    if (val >= 100000) return 10000;  // 100k+: increment by 10k
    if (val >= 10000) return 1000;    // 10k+: increment by 1k
    if (val >= 1000) return 1000;     // 1k+: increment by 1k
    if (val >= 100) return 100;       // 100+: increment by 100
    return 10;                         // Below 100: increment by 10
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFromFormatted(e.target.value);
    onChange(parsed);
  };

  const increment = () => {
    const smartIncrement = getSmartIncrement(Math.abs(value));
    const newValue = value + smartIncrement;
    onChange(max !== undefined ? Math.min(max, newValue) : newValue);
  };

  const decrement = () => {
    const smartIncrement = getSmartIncrement(Math.abs(value));
    const newValue = value - smartIncrement;
    onChange(min !== undefined ? Math.max(min, newValue) : newValue);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={formatWithCommas(value)}
        onChange={handleChange}
        className={className}
        inputMode="numeric"
      />
      <div className="absolute right-0 top-0 bottom-0 flex flex-col w-6 border-l border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={increment}
          className="flex-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
          style={{ fontSize: '10px', lineHeight: '1' }}
          aria-label="Increment"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={decrement}
          className="flex-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600"
          style={{ fontSize: '10px', lineHeight: '1' }}
          aria-label="Decrement"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
