"use client";

import React, { useState } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface RaphaelBannerProps {
  onScrollToTools?: () => void;
}

export function RaphaelBanner({ onScrollToTools }: RaphaelBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 dark:from-[#3A2A1A] dark:via-[#4A3622] dark:to-[#3A2A1A] text-amber-950 dark:text-amber-100 border-b border-amber-300/40 dark:border-amber-800/40 z-50 text-xs transition-all">
      <div className="max-w-[1280px] mx-auto px-4 py-2 sm:py-1.5 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            100% Free AI Studio:
          </span>
          <span className="text-amber-900/90 dark:text-amber-100/90 font-medium">
            No signup, no subscription, 0 credits required · Multi-model neural generation
          </span>
          {onScrollToTools && (
            <button
              onClick={onScrollToTools}
              className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer ml-1"
            >
              <span>Explore AI Tools</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-md text-amber-800/60 dark:text-amber-300/60 hover:text-amber-950 dark:hover:text-white hover:bg-amber-300/30 dark:hover:bg-amber-700/30 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
