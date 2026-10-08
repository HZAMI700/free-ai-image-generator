"use client";

import React from "react";
import { Sparkles, Shield, Cpu, Zap, Lock } from "lucide-react";

export function RaphaelHero() {
  return (
    <section className="relative pt-6 pb-4 sm:pt-8 sm:pb-6 text-center max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 font-sans">
          Free AI Image Generator <span className="text-stone-400 dark:text-stone-600 font-light">-</span>{" "}
          <span className="text-amber-600 dark:text-amber-400">Raphael AI</span>
        </h1>
      </div>

      <p className="text-xs sm:text-sm lg:text-base text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-medium">
        Create stunning images in seconds · No login · Unlimited free generations · High-fidelity multi-provider cluster
      </p>

      {/* Feature Pills (Matching Raphael.app) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 shadow-2xs">
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          100% Free
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs">
          <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Powered by FLUX.1 & SDXL
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          No Login Required
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs">
          <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Multi-Model Router
        </span>
      </div>
    </section>
  );
}
