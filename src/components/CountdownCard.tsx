"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";

interface CountdownCardProps {
  remainingSeconds: number;
  onExpire?: () => void;
}

export function CountdownCard({ remainingSeconds, onExpire }: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalCooldownSeconds = 180;
  const progressPercent = Math.max(0, Math.min(100, ((totalCooldownSeconds - timeLeft) / totalCooldownSeconds) * 100));
  const strokeDashoffset = 100 - progressPercent;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto my-6"
    >
      <div className="relative overflow-hidden rounded-[24px] p-5 glass-panel border border-white/60 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 shadow-xl shadow-indigo-500/5">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-linear"
                  strokeWidth="3"
                  strokeDasharray="94.25"
                  strokeDashoffset={94.25 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Clock className="w-5 h-5 absolute text-indigo-600 dark:text-indigo-400" />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span>Fair Usage Cooldown</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <div className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Next image available in{" "}
                <span className="font-mono text-indigo-600 dark:text-indigo-400 tracking-normal">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Free
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Refreshes automatically
            </span>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="mt-4 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
