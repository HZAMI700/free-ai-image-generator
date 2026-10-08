"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  ChevronDown,
  Dices,
  Trash2,
  Check,
  Clock,
  Loader2,
  Sliders,
  ImageIcon,
  Upload,
  Cpu,
  Layers,
  Wand2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  ASPECT_RATIOS,
  STYLES,
  AVAILABLE_MODELS,
  AspectRatio,
  ModelOption,
  INSPIRATION_PROMPTS,
} from "@/lib/constants";

interface RaphaelComposerProps {
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

export function RaphaelComposer({
  promptValue,
  setPromptValue,
  onGenerate,
  isGenerating,
  inCooldown,
  cooldownSeconds,
}: RaphaelComposerProps) {
  // Tabs: Image vs Video
  const [activeMediaTab, setActiveMediaTab] = useState<"image" | "video">("image");
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Composer Form Settings
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("1:1");
  const [selectedStyle, setSelectedStyle] = useState<string>("None");
  const [selectedModelId, setSelectedModelId] = useState<string>("auto-router");
  const [isFastMode, setIsFastMode] = useState<boolean>(true);
  const [isAiEnhance, setIsAiEnhance] = useState<boolean>(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [seed, setSeed] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");
  const [enhancedFlash, setEnhancedFlash] = useState<boolean>(false);

  // Reference image upload simulation
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

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
    setEnhancedFlash(true);
    setLocalError("");
    setTimeout(() => setEnhancedFlash(false), 2000);
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length);
    setPromptValue(INSPIRATION_PROMPTS[randomIndex]);
    setLocalError("");
  };

  const handleClearPrompt = () => {
    setPromptValue("");
    setLocalError("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && referenceImages.length < 6) {
          setReferenceImages([...referenceImages, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = (idx: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inCooldown || isGenerating) return;

    if (!promptValue.trim()) {
      setLocalError("Please describe the image you want to create.");
      return;
    }

    setLocalError("");
    setIsModelDropdownOpen(false);
    setIsStyleDropdownOpen(false);

    onGenerate({
      prompt: promptValue.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      aspectRatio: selectedRatio,
      style: selectedStyle,
      quality: "hd",
      seed: seed ? parseInt(seed, 10) : undefined,
      model: selectedModelId,
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
    <div className="w-full max-w-[1128px] mx-auto relative z-30">
      {/* Outer Card: Clean, crisp light mode surface with subtle stone borders */}
      <div className="bg-white dark:bg-[#201913] rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-[0_24px_64px_-30px_rgba(0,0,0,0.08)] dark:shadow-[0_28px_72px_-42px_rgba(0,0,0,0.72)] overflow-hidden transition-all">
        {/* Top Header Bar: Media Tabs & AI Enhance switch */}
        <div className="flex items-center justify-between px-4 sm:px-6 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-[#261E18]/80">
          {/* Tabs */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setActiveMediaTab("image")}
              className={`relative py-3.5 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMediaTab === "image"
                  ? "text-amber-700 dark:text-amber-400 after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:bg-amber-600 dark:after:bg-amber-500 after:rounded-full"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>AI Image</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="relative py-3.5 text-sm font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>AI Video</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                Free
              </span>
            </button>
          </div>

          {/* AI Enhance Switch & Inspiration */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                AI Enhance
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAiEnhance}
                onClick={() => {
                  const nextVal = !isAiEnhance;
                  setIsAiEnhance(nextVal);
                  if (nextVal) handleEnhancePrompt();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAiEnhance ? "bg-amber-600" : "bg-stone-300 dark:bg-stone-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isAiEnhance ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Composer Main Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Reference Images Box + Prompt Box */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            {/* Reference Upload Box (Optional) */}
            <div className="md:w-36 shrink-0">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Reference Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {referenceImages.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 md:h-[110px] rounded-xl border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-1 text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all cursor-pointer p-2 text-center"
                >
                  <span className="text-xl font-light text-amber-600 dark:text-amber-400">+</span>
                  <span className="text-[10px] font-semibold">Reference</span>
                  <span className="text-[9px] text-stone-400">Optional</span>
                </button>
              ) : (
                <div className="relative w-full h-24 md:h-[110px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 group">
                  <img
                    src={referenceImages[0]}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeReferenceImage(0)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Textarea */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Prompt
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Inspiration</span>
                  </button>

                  {promptValue && (
                    <button
                      type="button"
                      onClick={handleClearPrompt}
                      className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                      title="Clear prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#18130E] focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/50 transition-all p-3 pb-8">
                <textarea
                  rows={3}
                  value={promptValue}
                  onChange={(e) => {
                    setPromptValue(e.target.value);
                    if (localError) setLocalError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the image you want to generate in detail (e.g. A serene mountain sanctuary in autumn mist, golden hour photography)..."
                  maxLength={1000}
                  className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 resize-none focus:outline-none min-h-[75px]"
                />

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{promptValue.length} / 1000</span>
                  {enhancedFlash && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enhanced!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {localError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {/* TOOLBAR CONTROLS (Vheer & Raphael Studio layout) */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* 1. Model Selector Dropdown (Desktop: 4 cols) */}
            <div className="md:col-span-4 relative">
              <label className="block text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
                AI Generation Model
              </label>

              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#18130E] hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer flex items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{selectedModel.icon || "⚡"}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {selectedModel.name}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      {selectedModel.badge} • {selectedModel.speed}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Model Dropdown Menu */}
              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 bottom-full mb-2 w-full sm:w-[360px] max-h-[380px] overflow-y-auto bg-white dark:bg-[#241C16] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-2 space-y-1.5"
                  >
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Choose AI Generation Model
                    </div>
                    {AVAILABLE_MODELS.map((model) => {
                      const isSelected = selectedModelId === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(model.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? "bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-100"
                              : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0">{model.icon || "⚡"}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold truncate">{model.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                                  {model.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                                {model.description}
                              </p>
                              <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                                Latency: {model.speed} • {model.quality}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Aspect Ratio Segmented (Desktop: 3 cols) */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1 bg-stone-50 dark:bg-[#18130E] p-1 rounded-xl border border-stone-200 dark:border-stone-800 h-11 items-center">
                {ASPECT_RATIOS.map((item) => {
                  const isSelected = selectedRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRatio(item.id)}
                      className={`h-9 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-600 text-white font-bold shadow-xs"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                      }`}
                      title={`${item.label} (${item.ratio})`}
                    >
                      <span className="text-[10px] leading-none">{item.ratio}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Style Presets (Desktop: 2 cols) */}
            <div className="md:col-span-2 relative">
              <label className="block text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
                Style Preset
              </label>
              <button
                type="button"
                onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#18130E] hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-stone-200"
              >
                <span className="truncate">
                  {STYLES.find((s) => s.id === selectedStyle)?.icon}{" "}
                  {STYLES.find((s) => s.id === selectedStyle)?.label || "Style"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <AnimatePresence>
                {isStyleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-[#241C16] rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl z-50 p-1 space-y-0.5"
                  >
                    {STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStyle(st.id);
                          setIsStyleDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center gap-2 cursor-pointer ${
                          selectedStyle === st.id
                            ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold"
                            : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        <span>{st.icon}</span>
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. DOMINANT GENERATE BUTTON (Desktop: 3 cols) */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-medium uppercase tracking-wider text-transparent select-none mb-1">
                Action
              </label>
              <button
                type="submit"
                disabled={isGenerating || inCooldown}
                className={`w-full h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isGenerating
                    ? "bg-amber-600/80 text-white cursor-wait"
                    : inCooldown
                    ? "bg-stone-100 dark:bg-stone-850 text-stone-400 dark:text-stone-500 cursor-not-allowed border border-dashed border-stone-300 dark:border-stone-700 shadow-none"
                    : "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 active:scale-[0.99] text-white shadow-amber-500/25 hover:shadow-amber-500/40"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : inCooldown ? (
                  <>
                    <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
                    <span className="font-mono">Next in {formattedCooldown}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                      Free
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: Advanced Settings */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Parameters (Negative prompt, Seed)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-2"
                >
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#18130E] border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Negative Prompt
                      </label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurry, distorted, artifacts, low resolution..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#201913] text-stone-900 dark:text-stone-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Seed (Optional for reproducibility)
                      </label>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        placeholder="Random seed"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#201913] text-stone-900 dark:text-stone-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* Video Modal Notification */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#241C16] max-w-md w-full rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                AI Video Generator Coming Soon!
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                We are actively integrating free text-to-video neural models into our multi-cluster routing pipeline. In the meantime, enjoy unlimited 100% free AI Image Generations with FLUX.1 & SDXL!
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
              >
                Back to Image Generator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
