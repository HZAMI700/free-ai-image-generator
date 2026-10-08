"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Heart } from "lucide-react";

export function RaphaelFooter() {
  return (
    <footer className="w-full border-t border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-[#18130E]/50 backdrop-blur-xs py-10 transition-colors">
      <div className="max-w-[1128px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Raphael AI
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Free SaaS
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              High-fidelity neural image generation · No account required
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-stone-600 dark:text-stone-400 font-medium">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            AI Image Generator
          </Link>
          <Link href="/admin" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Cluster Telemetry
          </Link>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="text-stone-500">1 Image / 3 Mins Cooldown</span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="inline-flex items-center gap-1 text-stone-500">
            Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for creators
          </span>
        </div>
      </div>

      <div className="max-w-[1128px] mx-auto px-4 mt-6 pt-4 border-t border-stone-200/50 dark:border-stone-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
        <p>© {new Date().getFullYear()} Raphael AI Studio. All rights reserved.</p>
        <p>100% Free · Privacy First · Local Storage IndexedDB</p>
      </div>
    </footer>
  );
}
