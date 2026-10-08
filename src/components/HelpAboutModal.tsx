"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ShieldCheck, Clock, Cpu, Sparkles, HardDrive } from "lucide-react";

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
          className="relative max-w-lg w-full rounded-3xl bg-white dark:bg-[#201913] border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  About Raphael AI Studio
                </h3>
                <p className="text-xs text-stone-500">Free, no-account creative studio</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Principles */}
          <div className="py-4 space-y-4 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-stone-900 dark:text-white block font-bold">
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
                <strong className="text-stone-900 dark:text-white block font-bold">
                  Fair Usage: 1 Image Every 3 Minutes
                </strong>
                <span>
                  To prevent automated abuse and keep the service free for everyone, the server strictly allows one image generation every 3 minutes. The timer persists across reloads and tab restarts.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-stone-900 dark:text-white block font-bold">
                  Multi-Provider Intelligent Routing
                </strong>
                <span>
                  Requests are dynamically routed across Cloudflare Workers AI (FLUX.1-schnell & SDXL), Hugging Face, Pollinations, and AI Horde with automatic failover.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-stone-900 dark:text-white block font-bold">
                  Local Storage Privacy (IndexedDB)
                </strong>
                <span>
                  Your previous creations are saved privately on this browser's IndexedDB. We never track your identity or sell your prompts.
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
