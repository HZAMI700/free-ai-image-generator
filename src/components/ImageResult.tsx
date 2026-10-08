"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Download, Copy, Check, Maximize2, Trash2, RotateCcw, Cpu, Zap, Layers } from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";

interface ImageResultProps {
  item: GenerationHistoryItem;
  onGenerateAgain?: () => void;
  onClear?: () => void;
  onOpenLightbox?: (item: GenerationHistoryItem) => void;
  canGenerateAgain: boolean;
}

export function ImageResult({
  item,
  onGenerateAgain,
  onClear,
  onOpenLightbox,
  canGenerateAgain,
}: ImageResultProps) {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Clipboard write failed", e);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.imageBase64 || item.imageUrl;
    // Clean safe filename from prompt
    const slug = item.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    link.download = `prism-ai-${slug || "image"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto my-8"
    >
      <div className="relative rounded-[28px] overflow-hidden glass-panel border border-white/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 sm:p-6 shadow-2xl">
        {/* Top Bar with actions */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-4 gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span className="capitalize">{item.providerUsed}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px]">
              {item.modelUsed}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onOpenLightbox && onOpenLightbox(item)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            {onClear && (
              <button
                onClick={onClear}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Clear current view"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Generated Image Container */}
        <div className="relative group rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center border border-zinc-200/30 dark:border-zinc-800/30">
          <img
            src={item.imageBase64 || item.imageUrl}
            alt={item.prompt}
            className="w-full h-auto max-h-[620px] object-contain rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-[1.01]"
            loading="lazy"
          />

          {/* Quick floating hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button
              onClick={() => onOpenLightbox && onOpenLightbox(item)}
              className="px-4 py-2 rounded-xl bg-white/90 text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:bg-white transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        {/* Prompt Caption & Details */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-800/40">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
              "{item.prompt}"
            </p>
            <button
              onClick={handleCopyPrompt}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 shrink-0 transition-colors"
              title="Copy prompt"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-zinc-200/30 dark:border-zinc-700/30 text-[11px] text-zinc-500 dark:text-zinc-400">
            {item.style && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-700/60 font-medium">
                Style: {item.style}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-700/60 font-medium">
              Ratio: {item.aspectRatio}
            </span>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyPrompt}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm flex items-center justify-center gap-2 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy Prompt"}</span>
            </button>

            {onGenerateAgain && (
              <button
                onClick={onGenerateAgain}
                disabled={!canGenerateAgain}
                className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  canGenerateAgain
                    ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-dashed border-zinc-300 dark:border-zinc-700"
                }`}
                title={canGenerateAgain ? "Generate another image" : "Cooldown active"}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Generate Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
