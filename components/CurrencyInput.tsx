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
  min = 0,
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
    const smartIncrement = getSmartIncrement(value);
    onChange(Math.min(max ?? Infinity, value + smartIncrement));
  };

  const decrement = () => {
    const smartIncrement = getSmartIncrement(value);
    onChange(Math.max(min, value - smartIncrement));
  };

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      step={getSmartIncrement(value)}
      className={className}
      min={min}
      max={max}
    />
  );
}
