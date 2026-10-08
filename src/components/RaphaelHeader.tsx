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
  Wand2,
  Cpu,
  Layers,
  ChevronDown,
} from "lucide-react";

interface RaphaelHeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  inCooldown: boolean;
  cooldownSeconds: number;
  onOpenHelp: () => void;
  activeNavTab: "image" | "video" | "tools" | "models";
  setActiveNavTab: (tab: "image" | "video" | "tools" | "models") => void;
}

export function RaphaelHeader({
  onOpenHistory,
  historyCount,
  inCooldown,
  cooldownSeconds,
  onOpenHelp,
  activeNavTab,
  setActiveNavTab,
}: RaphaelHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Light mode is default. Check if user explicitly chose dark mode.
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const minutes = Math.floor(cooldownSeconds / 60);
  const seconds = cooldownSeconds % 60;
  const formattedCooldown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#191410]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-[1280px] h-16 mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand identity + Nav items */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-stone-900 dark:text-stone-50 font-sans">
                Raphael AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Free
              </span>
            </div>
          </Link>

          {/* Navigation Links (Matching Raphael.app) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveNavTab("image")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeNavTab === "image"
                  ? "text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <span>AI Image</span>
            </button>

            <button
              onClick={() => setActiveNavTab("video")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeNavTab === "video"
                  ? "text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <span>AI Video</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white">
                Free
              </span>
            </button>

            <button
              onClick={() => setActiveNavTab("tools")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeNavTab === "tools"
                  ? "text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <span>AI Tools</span>
            </button>

            <button
              onClick={() => setActiveNavTab("models")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                activeNavTab === "models"
                  ? "text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <span>AI Models</span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Cooldown pill */}
          {inCooldown && (
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" style={{ animationDuration: "3s" }} />
              <span className="hidden sm:inline">Next image in</span>
              <strong className="font-mono">{formattedCooldown}</strong>
            </div>
          )}

          {/* 100% Free Status Pill */}
          <div className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Free · 0 credits</span>
          </div>

          {/* Library Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700/80"
            title="Locally saved creations"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Library</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help / About Modal */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="About Raphael Studio"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle (Light mode default) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* Admin Telemetry Link */}
          <Link
            href="/admin"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Admin Telemetry"
          >
            <Activity className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#191410] px-4 py-3 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveNavTab("image");
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-xl text-center cursor-pointer ${
                activeNavTab === "image"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              AI Image
            </button>
            <button
              onClick={() => {
                setActiveNavTab("video");
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-xl text-center cursor-pointer ${
                activeNavTab === "video"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              AI Video (Free)
            </button>
            <button
              onClick={() => {
                setActiveNavTab("tools");
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-xl text-center cursor-pointer ${
                activeNavTab === "tools"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              AI Tools
            </button>
            <button
              onClick={() => {
                setActiveNavTab("models");
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-xl text-center cursor-pointer ${
                activeNavTab === "models"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              AI Models
            </button>
          </div>
          {inCooldown && (
            <div className="text-xs p-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-200 flex items-center justify-between border border-amber-500/20">
              <span>Next generation available in:</span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-100">{formattedCooldown}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
