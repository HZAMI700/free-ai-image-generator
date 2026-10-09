"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Cpu,
  Layers,
  Clock,
  ShieldCheck,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";
import { formatModelName } from "@/lib/constants";

interface GenerationCanvasProps {
  currentResult: GenerationHistoryItem | null;
  isGenerating: boolean;
  generationStatusText: string;
  onOpenLightbox: (item: GenerationHistoryItem) => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  onSelectPromptSuggestion: (prompt: string) => void;
  inCooldown: boolean;
  cooldownSeconds: number;
}

export function GenerationCanvas({
  currentResult,
  isGenerating,
  generationStatusText,
  onOpenLightbox,
  onRegenerate,
  canRegenerate,
  onSelectPromptSuggestion,
  inCooldown,
  cooldownSeconds,
}: GenerationCanvasProps) {
  const [copied, setCopied] = useState(false);
  const primarySrc = currentResult?.imageUrl || currentResult?.imageBase64 || "";
  const [imgSrc, setImgSrc] = useState<string>(primarySrc);
  const [imgError, setImgError] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentResult) {
      setImgSrc(currentResult.imageUrl || currentResult.imageBase64 || "");
      setImgError(false);
    }
  }, [currentResult]);

  const handleImageError = () => {
    if (currentResult) {
      if (
        imgSrc === currentResult.imageUrl &&
        currentResult.imageBase64 &&
        currentResult.imageBase64 !== currentResult.imageUrl
      ) {
        setImgSrc(currentResult.imageBase64);
        return;
      }
      if (
        imgSrc === currentResult.imageBase64 &&
        currentResult.imageUrl &&
        currentResult.imageUrl !== currentResult.imageBase64
      ) {
        setImgSrc(currentResult.imageUrl);
        return;
      }
    }
    setImgError(true);
  };

  const handleCopyPrompt = async () => {
    if (!currentResult) return;
    try {
      await navigator.clipboard.writeText(currentResult.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore error
    }
  };

  const handleDownload = () => {
    if (!currentResult) return;
    const target = currentResult.imageUrl || currentResult.imageBase64;
    if (!target) return;
    const slug = currentResult.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const filename = `raphael-ai-${slug || "artwork"}.jpg`;

    if (target.startsWith("http")) {
      fetch(target)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          window.open(target, "_blank");
        });
    } else {
      const link = document.createElement("a");
      link.href = target;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const minutes = Math.floor(cooldownSeconds / 60);
  const seconds = cooldownSeconds % 60;
  const formattedCooldown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const suggestions = [
    "Snow leopard on a Himalayan summit at sunrise, 8k documentary photograph",
    "Bioluminescent greenhouse inside a cosmic nebula, volumetric lighting",
    "Cyberpunk street in Neo-Tokyo reflecting neon rain on asphalt, 35mm photograph",
  ];

  return (
    <div className="w-full max-w-[1128px] mx-auto space-y-3">
      {/* Active Cooldown Banner / Countdown Card */}
      {inCooldown && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-900 dark:text-stone-100 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                  Fair Usage Cooldown Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold uppercase">
                  Server Enforced
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400">
                Next image available in{" "}
                <strong className="font-mono text-amber-800 dark:text-amber-300 text-sm">
                  {formattedCooldown}
                </strong>
                . Timer survives page refreshes and multi-tabs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-100 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Free · Anti-Abuse Protected</span>
          </div>
        </motion.div>
      )}

      {/* Main Canvas Card: Clean Light Mode */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#201913] p-4 sm:p-6 flex flex-col justify-between shadow-[0_24px_64px_-30px_rgba(0,0,0,0.06)] dark:shadow-[0_28px_72px_-42px_rgba(0,0,0,0.72)] min-h-[420px] sm:min-h-[500px]">
        {/* Canvas Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-stone-800 dark:text-stone-200 font-semibold">
              Canvas Output
            </span>
            {currentResult && (
              <>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="font-mono text-[11px] uppercase bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                  {currentResult.aspectRatio}
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  {formatModelName(currentResult.modelUsed || currentResult.providerUsed)}
                </span>
              </>
            )}
          </div>

          {currentResult && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenLightbox(currentResult)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Fullscreen Lightbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyPrompt}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Copy prompt"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Canvas Display Viewport */}
        <div className="relative flex-1 my-3 flex items-center justify-center min-h-[340px] rounded-2xl overflow-hidden bg-stone-50 dark:bg-[#18130E] border border-stone-200/60 dark:border-stone-800/60 checker-pattern">
          {/* STATE 1: GENERATING NEURAL PROGRESS */}
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-900/5 dark:bg-stone-950/40 backdrop-blur-xs z-20">
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden bg-gradient-to-tr from-stone-200 via-stone-100 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 shadow-xl flex items-center justify-center border border-white/40">
                <div className="absolute inset-0 animate-shimmer" />

                <div className="relative flex items-center justify-center">
                  <span className="absolute w-20 h-20 rounded-full bg-amber-500/20 animate-ping" />
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {generationStatusText || "Generating with AI..."}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Routing prompt through selected high-speed inference cluster
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: IMAGE RESULT PRESENTATION */}
          {!isGenerating && currentResult && (
            <div className="group relative max-w-full max-h-full flex items-center justify-center p-2">
              {imgError ? (
                <div className="p-6 text-center max-w-md bg-stone-100 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <ImageIcon className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    Image rendered. Direct access link:
                  </p>
                  <a
                    href={currentResult.imageUrl || currentResult.imageBase64}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open High-Res Artwork</span>
                  </a>
                </div>
              ) : (
                <img
                  src={imgSrc || currentResult.imageUrl || currentResult.imageBase64}
                  alt={currentResult.prompt}
                  onError={handleImageError}
                  className="max-h-[460px] lg:max-h-[520px] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-[1.01]"
                />
              )}

              {/* Hover Quick Action Ribbon */}
              <div className="absolute bottom-4 inset-x-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-900/85 backdrop-blur-md shadow-xl pointer-events-auto border border-white/10">
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HD</span>
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
            </div>
          )}

          {/* STATE 3: EMPTY CANVAS / IDLE */}
          {!isGenerating && !currentResult && (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                No image generated yet
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-5">
                Type your prompt in the box above, choose your preferred AI model, and click Generate.
              </p>

              {/* Quick Inspiration Prompts */}
              <div className="w-full space-y-1.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Quick Ideas:
                </span>
                <div className="flex flex-col gap-1.5 text-left">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectPromptSuggestion(s)}
                      className="text-xs text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 p-2.5 rounded-xl bg-white dark:bg-[#201913] border border-stone-200/80 dark:border-stone-800 text-left line-clamp-1 transition-colors cursor-pointer shadow-2xs"
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
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 flex-1 min-w-[200px]">
              "{currentResult.prompt}"
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={onRegenerate}
                disabled={!canRegenerate}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  canRegenerate
                    ? "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer"
                    : "bg-stone-100/50 dark:bg-stone-800/30 text-stone-400 cursor-not-allowed"
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
    </div>
  );
}
