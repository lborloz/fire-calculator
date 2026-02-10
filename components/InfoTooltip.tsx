"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  content: string;
}

// Tooltip width must match the w-64 Tailwind class (16rem = 256px)
const TOOLTIP_WIDTH = 256;
const TOOLTIP_GAP = 8;

export default function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<"right" | "left">("right");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Check if tooltip would overflow on the right
      const wouldOverflowRight = rect.right + TOOLTIP_GAP + TOOLTIP_WIDTH > viewportWidth;

      // Check if there's enough space on the left
      const enoughSpaceOnLeft = rect.left - TOOLTIP_GAP - TOOLTIP_WIDTH >= 0;

      // Decide placement
      const newPlacement = wouldOverflowRight && enoughSpaceOnLeft ? "left" : "right";
      setPlacement(newPlacement);

      // Calculate position
      if (newPlacement === "left") {
        setPosition({
          top: rect.top,
          left: rect.left - TOOLTIP_WIDTH - TOOLTIP_GAP,
        });
      } else {
        setPosition({
          top: rect.top,
          left: rect.right + TOOLTIP_GAP,
        });
      }
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block ml-1">
      <button
        ref={buttonRef}
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
      {isVisible &&
        createPortal(
          <div
            className="fixed z-[9999] w-64 p-2 text-xs text-white bg-gray-900 rounded shadow-lg dark:bg-gray-700"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div
              className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 top-1 ${
                placement === "left" ? "-right-1" : "-left-1"
              }`}
            ></div>
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
