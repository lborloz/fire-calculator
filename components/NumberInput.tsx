"use client";

import { ChangeEvent } from "react";

interface NumberInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export default function NumberInput({
  value,
  onChange,
  className = "",
  min,
  max,
  step = 1,
  placeholder,
}: NumberInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(undefined);
    } else {
      const parsed = parseFloat(val);
      onChange(isNaN(parsed) ? undefined : parsed);
    }
  };

  // Helper to round to avoid floating point precision issues
  const roundToStep = (num: number): number => {
    const decimals = (step.toString().split('.')[1] || '').length;
    return Number(num.toFixed(decimals));
  };

  const increment = () => {
    const currentValue = value ?? (min !== undefined ? min : 0);
    const newValue = roundToStep(currentValue + step);
    onChange(max !== undefined ? Math.min(max, newValue) : newValue);
  };

  const decrement = () => {
    const currentValue = value ?? (min !== undefined ? min : 0);
    const newValue = roundToStep(currentValue - step);
    onChange(min !== undefined ? Math.max(min, newValue) : newValue);
  };

  return (
    <div className="relative">
      <input
        type="number"
        value={value ?? ""}
        onChange={handleChange}
        className={`${className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
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
