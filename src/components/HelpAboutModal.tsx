"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ShieldCheck, Clock, Cpu, Sparkles, HardDrive, CheckCircle2 } from "lucide-react";

interface HelpAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpAboutModal({ isOpen, onClose }: HelpAboutModalProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-lg w-full rounded-3xl bg-white dark:bg-[#16161B] border border-black/[0.08] dark:border-white/[0.08] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  About Prism AI Studio
                </h3>
                <p className="text-xs text-zinc-500">Free, no-account creative studio</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Principles */}
          <div className="py-4 space-y-4 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-white block font-semibold">
                  100% Free Forever
                </strong>
                <span>
                  No registration, no subscriptions, and no credit card required. Anyone can create high-resolution visuals instantly.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-white block font-semibold">
                  Fair Usage: 1 Image Every 3 Minutes
                </strong>
                <span>
                  To prevent automated abuse and keep the service free for everyone, the server strictly allows one image generation every 3 minutes. The timer persists across reloads and tab restarts.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-white block font-semibold">
                  Multi-Provider Fallback Engine
                </strong>
                <span>
                  Requests are intelligently routed across Cloudflare Workers AI, Gemini Imagen, Pollinations, AI Horde, and Hugging Face with automatic seamless failover.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-white block font-semibold">
                  Device Privacy (IndexedDB)
                </strong>
                <span>
                  Your previous creations are saved privately on this browser's IndexedDB. We never track your personal identity or cloud-sync your history.
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
