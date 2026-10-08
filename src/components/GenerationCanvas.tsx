"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Download,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Cpu,
  Layers,
  Wand2,
  ImageIcon,
  Share2,
} from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";

interface GenerationCanvasProps {
  currentResult: GenerationHistoryItem | null;
  isGenerating: boolean;
  generationStatusText: string;
  onOpenLightbox: (item: GenerationHistoryItem) => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  onSelectPromptSuggestion: (prompt: string) => void;
}

export function GenerationCanvas({
  currentResult,
  isGenerating,
  generationStatusText,
  onOpenLightbox,
  onRegenerate,
  canRegenerate,
  onSelectPromptSuggestion,
}: GenerationCanvasProps) {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopyPrompt = async () => {
    if (!currentResult) return;
    try {
      await navigator.clipboard.writeText(currentResult.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleDownload = () => {
    if (!currentResult) return;
    const link = document.createElement("a");
    link.href = currentResult.imageBase64 || currentResult.imageUrl;
    const slug = currentResult.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    link.download = `prism-ai-${slug || "generation"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suggestions = [
    "Snow leopard on a Himalayan summit at sunrise, 8k documentary photograph",
    "Bioluminescent greenhouse inside a cosmic nebula, volumetric lighting",
    "Cyberpunk street in Neo-Tokyo reflecting neon rain on asphalt",
  ];

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[580px] rounded-2xl md:rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#131318] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xs">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Creative Canvas
          </span>
          {currentResult && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-mono text-[11px] uppercase">{currentResult.aspectRatio}</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="capitalize">{currentResult.providerUsed}</span>
            </>
          )}
        </div>

        {currentResult && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenLightbox(currentResult)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyPrompt}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Copy prompt"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 my-3 flex items-center justify-center min-h-[320px] rounded-2xl overflow-hidden bg-zinc-50 dark:bg-[#0D0D11] border border-black/[0.04] dark:border-white/[0.04] checker-pattern">
        {/* STATE 1: GENERATING SKELETON */}
        {isGenerating && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900/10 dark:bg-zinc-950/40 backdrop-blur-sm z-20"
          >
            {/* Shimmer Box */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 shadow-xl flex items-center justify-center border border-white/20">
              <div className="absolute inset-0 animate-shimmer" />

              {/* Pulsing rings */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Status message */}
            <div className="mt-6 space-y-1">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {generationStatusText || "Creating your image..."}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Multi-cluster neural synthesis in progress
              </p>
            </div>
          </motion.div>
        )}

        {/* STATE 2: IMAGE RESULT PRESENTATION */}
        {!isGenerating && currentResult && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="group relative max-w-full max-h-full flex items-center justify-center p-2"
          >
            <img
              src={currentResult.imageBase64 || currentResult.imageUrl}
              alt={currentResult.prompt}
              className="max-h-[460px] lg:max-h-[500px] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-[1.01]"
            />

            {/* Subtle Hover Action Bar */}
            <div className="absolute bottom-4 inset-x-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/75 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl pointer-events-auto border border-white/10">
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => onOpenLightbox(currentResult)}
                  className="px-3 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen</span>
                </button>
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 3: EMPTY CANVAS / IDLE */}
        {!isGenerating && !currentResult && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4 border border-black/[0.04] dark:border-white/[0.04]">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No image generated yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Enter a description in the prompt box and click Generate to bring your vision to life.
            </p>

            {/* Quick Inspiration Tags */}
            <div className="w-full space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Quick Inspirations:
              </span>
              <div className="flex flex-col gap-1.5 text-left">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPromptSuggestion(s)}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 text-left line-clamp-1 transition-colors cursor-pointer"
                  >
                    ✨ "{s}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Bottom Action & Metadata Bar */}
      {currentResult && !isGenerating && (
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 flex-1 min-w-[200px]">
            "{currentResult.prompt}"
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={!canRegenerate}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                canRegenerate
                  ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  : "bg-zinc-100/50 dark:bg-zinc-800/30 text-zinc-400 cursor-not-allowed"
              }`}
              title={canRegenerate ? "Regenerate with same settings" : "Cooldown active"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
