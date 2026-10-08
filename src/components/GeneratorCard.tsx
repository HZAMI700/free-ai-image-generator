"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Sparkles,
  Dices,
  ChevronDown,
  ChevronUp,
  Sliders,
  AlertCircle,
  Loader2,
  Clock,
  Layers,
  Wand2,
} from "lucide-react";
import { ASPECT_RATIOS, STYLES, INSPIRATION_PROMPTS } from "@/lib/constants";
import { AspectRatio } from "@/providers/types";

interface GeneratorCardProps {
  onGenerate: (data: {
    prompt: string;
    negativePrompt?: string;
    aspectRatio: AspectRatio;
    style?: string;
    quality?: "standard" | "hd";
    seed?: number;
  }) => Promise<void>;
  isGenerating: boolean;
  generationStatusText: string;
  inCooldown: boolean;
  cooldownSeconds: number;
  promptValue: string;
  setPromptValue: (val: string) => void;
}

export function GeneratorCard({
  onGenerate,
  isGenerating,
  generationStatusText,
  inCooldown,
  cooldownSeconds,
  promptValue,
  setPromptValue,
}: GeneratorCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("1:1");
  const [selectedStyle, setSelectedStyle] = useState<string>("None");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [seed, setSeed] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length);
    setPromptValue(INSPIRATION_PROMPTS[randomIndex]);
    setLocalError("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inCooldown) return;

    if (!promptValue.trim()) {
      setLocalError("Please enter a description for the image you want to create.");
      return;
    }

    setLocalError("");
    await onGenerate({
      prompt: promptValue.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      aspectRatio: selectedRatio,
      style: selectedStyle,
      quality,
      seed: seed ? parseInt(seed, 10) : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const minutes = Math.floor(cooldownSeconds / 60);
  const seconds = cooldownSeconds % 60;
  const formattedCooldown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="relative rounded-[28px] overflow-hidden glass-panel border border-white/80 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 p-5 sm:p-7 shadow-2xl shadow-indigo-500/5">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Prompt Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <label htmlFor="prompt-input" className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Describe your image</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer font-medium transition-colors"
                  title="Random creative prompt"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Surprise me</span>
                </button>
                <span className="text-[11px] text-zinc-400">
                  {promptValue.length}/1000
                </span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/70 shadow-sm">
              <textarea
                id="prompt-input"
                rows={3}
                value={promptValue}
                onChange={(e) => {
                  setPromptValue(e.target.value);
                  if (localError) setLocalError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="A glass pavilion floating above a misty mountain lake at dawn, soft cinematic morning light, photorealistic, 8k..."
                className="w-full p-4 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 bg-transparent resize-none focus:outline-none"
                maxLength={1000}
                disabled={isGenerating}
              />
              <div className="px-4 pb-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex justify-between items-center">
                <span>Tip: Press ⌘ + Enter or Ctrl + Enter to generate</span>
              </div>
            </div>

            {localError && (
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {localError}
              </p>
            )}
          </div>

          {/* Aspect Ratio Selector (Apple HIG Segmented Style) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.id as AspectRatio)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 font-semibold"
                        : "bg-zinc-100/80 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="h-6 flex items-center justify-center mb-1">
                      <div
                        className={`border rounded-xs transition-all ${
                          isSelected ? "border-white bg-white/20" : "border-zinc-400 dark:border-zinc-500"
                        } ${ratio.iconClass}`}
                      />
                    </div>
                    <span className="text-[11px]">{ratio.label}</span>
                    <span className={`text-[9px] ${isSelected ? "text-indigo-200" : "text-zinc-400"}`}>
                      {ratio.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Selector Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>Aesthetic Style</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((st) => {
                const isSelected = selectedStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-sm"
                        : "bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 border border-zinc-200/50 dark:border-zinc-800"
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progressive Disclosure: Advanced Settings */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer py-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Settings</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden space-y-4 pt-3"
                >
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
                    {/* Negative Prompt */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Negative Prompt (What to exclude)
                      </label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurry, distorted, low quality, artifacts, watermark..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Quality Selector */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                          Output Quality
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setQuality("standard")}
                            className={`flex-1 py-1.5 text-xs rounded-xl border font-medium cursor-pointer transition-colors ${
                              quality === "standard"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            Standard
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuality("hd")}
                            className={`flex-1 py-1.5 text-xs rounded-xl border font-medium cursor-pointer transition-colors ${
                              quality === "hd"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            High Definition
                          </button>
                        </div>
                      </div>

                      {/* Random Seed */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                          Seed (Optional)
                        </label>
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          placeholder="Random if empty"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action / Generate Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || inCooldown}
              className={`w-full py-4 px-6 rounded-2xl text-base font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg duration-200 cursor-pointer ${
                isGenerating
                  ? "bg-indigo-600/80 text-white cursor-wait"
                  : inCooldown
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-dashed border-zinc-300 dark:border-zinc-700 shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-indigo-500/25 hover:shadow-indigo-500/35"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{generationStatusText || "Creating your image..."}</span>
                </>
              ) : inCooldown ? (
                <>
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <span>Cooldown active: {formattedCooldown}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate image</span>
                </>
              )}
            </button>

            {/* Core Product Subtext Guarantee */}
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-3 font-medium">
              Free • No account • One generation every 3 minutes
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
