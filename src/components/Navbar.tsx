"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Moon, Sun, History, Shield, Activity } from "lucide-react";

interface NavbarProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export function Navbar({ onOpenHistory, historyCount }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Prism AI</span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                100% Free
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:block">
              No account • Instant access
            </div>
          </div>
        </Link>

        {/* Center Status (Desktop) */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 px-3 py-1.5 rounded-full bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200/40 dark:border-zinc-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Multi-Provider Engine Online</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-200/50 dark:border-zinc-700/50"
            title="Local generations history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-semibold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color mode"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-200/50 dark:border-zinc-700/50"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
            title="Internal Admin Monitoring"
          >
            <Activity className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
