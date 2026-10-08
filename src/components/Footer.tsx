"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Cpu, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/50 dark:border-zinc-800/50 mt-20 py-10 px-4 sm:px-8 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Prism AI Studio</span>
            <p className="text-[11px] text-zinc-400">Open & Free Image Generation Platform</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            No account required
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            7 Intelligent AI Providers
          </span>
          <span>Fair cooldown: 1 image / 3 mins</span>
          <Link
            href="/admin"
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Admin status</span>
          </Link>
        </div>

        <div className="text-[11px] text-zinc-400">
          Designed with Apple HIG & Liquid Glass principles
        </div>
      </div>
    </footer>
  );
}
