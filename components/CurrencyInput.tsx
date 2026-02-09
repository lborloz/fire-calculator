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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFromFormatted(e.target.value);
    onChange(parsed);
  };

  return (
    <input
      type="text"
      value={formatWithCommas(value)}
      onChange={handleChange}
      className={className}
      min={min}
      max={max}
      step={step}
    />
  );
}
