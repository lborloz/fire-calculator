"use client";

import { useState } from "react";

interface InfoTooltipProps {
  content: string;
}

export default function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
        aria-label="More information"
      >
        i
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 text-xs text-white bg-gray-900 rounded shadow-lg left-6 top-0 dark:bg-gray-700">
          <div className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 -left-1 top-1"></div>
          {content}
        </div>
      )}
    </div>
  );
}
