"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Sparkles,
  Dices,
  Trash2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Wand2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  Cpu,
} from "lucide-react";
import {
  ASPECT_RATIOS,
  STYLES,
  AVAILABLE_MODELS,
  AspectRatio,
  ModelOption,
  INSPIRATION_PROMPTS,
} from "@/lib/constants";

interface PromptControlPanelProps {
  promptValue: string;
  setPromptValue: (val: string) => void;
  onGenerate: (data: {
    prompt: string;
    negativePrompt?: string;
    aspectRatio: AspectRatio;
    style?: string;
    quality?: "standard" | "hd";
    seed?: number;
    model?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  inCooldown: boolean;
  cooldownSeconds: number;
}

export function PromptControlPanel({
  promptValue,
  setPromptValue,
  onGenerate,
  isGenerating,
  inCooldown,
  cooldownSeconds,
}: PromptControlPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  // Settings State
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("1:1");
  const [selectedStyle, setSelectedStyle] = useState<string>("None");
  const [selectedModel, setSelectedModel] = useState<string>("auto-router");
  const [imageCount, setImageCount] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [seed, setSeed] = useState<string>("");
  const [steps, setSteps] = useState<number>(25);
  const [guidance, setGuidance] = useState<number>(7.5);
  const [localError, setLocalError] = useState<string>("");
  const [enhancedSuccess, setEnhancedSuccess] = useState<boolean>(false);

  // Prompt Enhancer
  const handleEnhancePrompt = () => {
    if (!promptValue.trim()) {
      setLocalError("Please enter a prompt to enhance.");
      return;
    }
    const enrichments = [
      "highly detailed, cinematic lighting, 8k resolution, award-winning photography, photorealistic texture",
      "volumetric atmospheric lighting, hyperrealistic, octane render, intricate details, pristine composition",
      "masterpiece, sharp focus, ray-traced reflections, professional studio lighting, depth of field",
    ];
    const picked = enrichments[Math.floor(Math.random() * enrichments.length)];
    setPromptValue(`${promptValue.trim()}, ${picked}`);
    setEnhancedSuccess(true);
    setLocalError("");
    setTimeout(() => setEnhancedSuccess(false), 2000);
  };

  // Surprise Me / Inspiration Dice
  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length);
    setPromptValue(INSPIRATION_PROMPTS[randomIndex]);
    setLocalError("");
  };

  // Clear Prompt
  const handleClear = () => {
    setPromptValue("");
    setLocalError("");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inCooldown || isGenerating) return;

    if (!promptValue.trim()) {
      setLocalError("Please describe the image you want to create.");
      return;
    }

    setLocalError("");
    onGenerate({
      prompt: promptValue.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      aspectRatio: selectedRatio,
      style: selectedStyle,
      quality,
      seed: seed ? parseInt(seed, 10) : undefined,
      model: selectedModel,
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
    <div className="w-full rounded-2xl md:rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#131318] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top Header: Label & Prompt Tools */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            Prompt
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              title="Surprise me with a random prompt"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Inspiration</span>
            </button>

            {promptValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Clear prompt"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea Box with Floating Action Controls */}
        <div className="relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-zinc-50/50 dark:bg-[#0D0D11]/60 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all p-3">
          <textarea
            rows={3}
            value={promptValue}
            onChange={(e) => {
              setPromptValue(e.target.value);
              if (localError) setLocalError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe the image you want to create..."
            maxLength={1000}
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none focus:outline-none min-h-[90px]"
          />

          {/* Bottom Prompt Toolbar */}
          <div className="pt-2 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.04] text-[11px] text-zinc-400">
            <span>{promptValue.length} / 1000</span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleEnhancePrompt}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 border transition-all cursor-pointer ${
                  enhancedSuccess
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-500"
                }`}
                title="Enhance prompt with artistic keywords"
              >
                {enhancedSuccess ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Enhanced</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 text-indigo-500" />
                    <span>Enhance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {localError && (
          <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {localError}
          </p>
        )}

        {/* Model Selector (Vheer style) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
            <span>AI Model</span>
            <span className="text-[10px] text-zinc-400">Multi-provider verified</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs"
                      : "bg-zinc-50 dark:bg-zinc-850/60 border-zinc-200/70 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-semibold">{model.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                        isSelected
                          ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-950"
                          : "bg-zinc-200/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {model.badge}
                    </span>
                  </div>
                  <span className={`text-[10px] line-clamp-1 ${isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                    {model.speed} • {model.quality}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector (Vheer compact segmented control) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {ASPECT_RATIOS.map((item) => {
              const isSelected = selectedRatio === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRatio(item.id)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-semibold shadow-xs"
                      : "bg-zinc-50 dark:bg-zinc-850/60 border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div
                    className={`border rounded-xs ${
                      isSelected
                        ? "border-white bg-white/20 dark:border-zinc-950 dark:bg-zinc-950/20"
                        : "border-zinc-400 dark:border-zinc-500"
                    } ${item.iconClass}`}
                  />
                  <span className="text-[11px] leading-none">{item.ratio}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Presets Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Style Presets
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {STYLES.map((st) => {
              const isSelected = selectedStyle === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60"
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Image Count Selector (Vheer 1, 2, 3, 4 with free rate note) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Image Count</span>
            <span className="text-[10px] text-zinc-400 font-normal">
              1 generation / 3 mins free limit
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((count) => {
              const isSelected = imageCount === count;
              const isAllowed = count === 1; // Service restriction: 1 image per 3-min cooldown
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    if (isAllowed) setImageCount(1);
                  }}
                  className={`py-1.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    isSelected && isAllowed
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white font-semibold cursor-pointer"
                      : "bg-zinc-50 dark:bg-zinc-850/40 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60"
                  }`}
                  title={
                    isAllowed
                      ? "1 image per generation on free tier"
                      : "Multi-generation disabled during free cooldown window"
                  }
                >
                  {count} {count === 1 ? "Image" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Settings (Progressive Disclosure) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer py-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced settings</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden space-y-3 pt-2"
              >
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-3">
                  {/* Negative Prompt */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Negative prompt
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, artifacts, watermark..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Quality */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Quality
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuality("standard")}
                          className={`flex-1 py-1 text-xs rounded-lg border font-medium cursor-pointer transition-colors ${
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
                          className={`flex-1 py-1 text-xs rounded-lg border font-medium cursor-pointer transition-colors ${
                            quality === "hd"
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          HD (1024)
                        </button>
                      </div>
                    </div>

                    {/* Seed */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Seed
                      </label>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        placeholder="Random"
                        className="w-full px-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DOMINANT GENERATE BUTTON */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isGenerating || inCooldown}
            className={`w-full py-3.5 px-6 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isGenerating
                ? "bg-indigo-600/80 text-white cursor-wait"
                : inCooldown
                ? "bg-zinc-100 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-dashed border-zinc-300 dark:border-zinc-700 shadow-none"
                : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your image...</span>
              </>
            ) : inCooldown ? (
              <>
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Available in {formattedCooldown}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate image</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                  Free
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Free AI Studio • 1 image / 3 mins fair cooldown • No signup
          </p>
        </div>
      </form>
    </div>
  );
}
