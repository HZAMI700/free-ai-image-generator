"use client";

import React from "react";
import { PenLine, Cpu, ArrowDownToLine, Zap, Shield, Sparkles } from "lucide-react";

export function FeatureSteps() {
  const steps = [
    {
      step: "01",
      icon: PenLine,
      title: "1. Describe",
      desc: "Type anything you imagine. Choose aspect ratio, visual styles, and optional negative constraints.",
    },
    {
      step: "02",
      icon: Cpu,
      title: "2. Generate",
      desc: "Our multi-provider engine intelligently routes to the best available AI cluster with automatic failover.",
    },
    {
      step: "03",
      icon: ArrowDownToLine,
      title: "3. Download",
      desc: "Instantly download your high-resolution image in full quality. No watermark, no signup barrier.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-16 px-4">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Effortless Creation
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Zero barriers. No credentials or subscriptions needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="relative rounded-2xl p-6 glass-card border border-zinc-200/60 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-300 dark:text-zinc-700">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Free Access</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
