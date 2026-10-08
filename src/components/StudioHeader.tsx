"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Moon,
  Sun,
  History,
  Activity,
  HelpCircle,
  Menu,
  X,
  Clock,
  ShieldCheck,
  Layers,
  Wand2,
} from "lucide-react";

interface StudioHeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  inCooldown: boolean;
  cooldownSeconds: number;
  onOpenHelp: () => void;
  activeNavTab: "create" | "tools" | "explore";
  setActiveNavTab: (tab: "create" | "tools" | "explore") => void;
}

export function StudioHeader({
  onOpenHistory,
  historyCount,
  inCooldown,
  cooldownSeconds,
  onOpenHelp,
  activeNavTab,
  setActiveNavTab,
}: StudioHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
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

  const minutes = Math.floor(cooldownSeconds / 60);
  const seconds = cooldownSeconds % 60;
  const formattedCooldown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/80 dark:bg-[#111115]/80 backdrop-blur-md border-b border-black/[0.08] dark:border-white/[0.08] transition-colors">
      <div className="max-w-[1600px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
                Prism AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Free Studio
              </span>
            </div>
          </Link>

          {/* Minimal Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <button
              onClick={() => setActiveNavTab("create")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeNavTab === "create"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                  : "hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setActiveNavTab("tools")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeNavTab === "tools"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                  : "hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => setActiveNavTab("explore")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeNavTab === "explore"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                  : "hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Explore
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Cooldown Banner pill in header */}
          {inCooldown && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
              <span>Next in <strong className="font-mono">{formattedCooldown}</strong></span>
            </div>
          )}

          {/* History Library Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
            title="Local generations library"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Library</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-semibold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help / About */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="About Free Studio"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Internal Admin link */}
          <Link
            href="/admin"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Admin Telemetry"
          >
            <Activity className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111115] px-4 py-3 flex flex-col gap-2 shadow-lg">
          <div className="flex gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => {
                setActiveNavTab("create");
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-center ${
                activeNavTab === "create"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              Create
            </button>
            <button
              onClick={() => {
                setActiveNavTab("tools");
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-center ${
                activeNavTab === "tools"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => {
                setActiveNavTab("explore");
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-center ${
                activeNavTab === "explore"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              Explore
            </button>
          </div>
          {inCooldown && (
            <div className="text-xs p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>Next Generation in:</span>
              <span className="font-mono font-bold">{formattedCooldown}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
