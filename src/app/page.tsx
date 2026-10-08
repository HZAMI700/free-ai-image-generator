"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Clock, AlertCircle } from "lucide-react";

import { StudioHeader } from "@/components/StudioHeader";
import { StudioSidebar, StudioToolId } from "@/components/StudioSidebar";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { PromptControlPanel } from "@/components/PromptControlPanel";
import { RecentCreationsGrid } from "@/components/RecentCreationsGrid";
import { LightboxModal } from "@/components/LightboxModal";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { HelpAboutModal } from "@/components/HelpAboutModal";
import { ToolWorkspaces } from "@/components/ToolWorkspaces";
import { InspirationGallery } from "@/components/InspirationGallery";
import { FeatureSteps } from "@/components/FeatureSteps";
import { Footer } from "@/components/Footer";

import { AspectRatio } from "@/lib/constants";
import {
  GenerationHistoryItem,
  getHistoryItems,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from "@/lib/db";
import { getOrCreateDeviceId } from "@/lib/device";

export default function VheerStyleStudioPage() {
  const shouldReduceMotion = useReducedMotion();

  // Active Tool & Navigation Tab
  const [activeTool, setActiveTool] = useState<StudioToolId>("text-to-image");
  const [activeNavTab, setActiveNavTab] = useState<"create" | "tools" | "explore">("create");

  // Generator State
  const [promptValue, setPromptValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatusText, setGenerationStatusText] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Server-Side Rate Limiter & Cooldown State (Strict 3-minute lock)
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Results & History
  const [currentResult, setCurrentResult] = useState<GenerationHistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<GenerationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GenerationHistoryItem | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // 1. Sync Cooldown status with server on mount & window focus
  const syncCooldown = async () => {
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch("/api/cooldown/status", {
        headers: { "x-device-id": deviceId },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inCooldown && data.remainingSeconds > 0) {
          setInCooldown(true);
          setCooldownSeconds(data.remainingSeconds);
        } else {
          setInCooldown(false);
          setCooldownSeconds(0);
        }
      }
    } catch {
      // server check fallback
    }
  };

  // Cooldown local tick-down timer
  useEffect(() => {
    if (!inCooldown || cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setInCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [inCooldown, cooldownSeconds]);

  // 2. Load IndexedDB history
  const loadHistory = async () => {
    try {
      const items = await getHistoryItems();
      setHistoryItems(items);
      if (items.length > 0 && !currentResult) {
        setCurrentResult(items[0]);
      }
    } catch (e) {
      console.warn("Failed to load local history", e);
    }
  };

  useEffect(() => {
    syncCooldown();
    loadHistory();

    const handleFocus = () => syncCooldown();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // 3. Generation Trigger
  const handleGenerate = async (options: {
    prompt: string;
    negativePrompt?: string;
    aspectRatio: AspectRatio;
    style?: string;
    quality?: "standard" | "hd";
    seed?: number;
    model?: string;
  }) => {
    setIsGenerating(true);
    setGenerationStatusText("Creating your image...");
    setGlobalError(null);

    const deviceId = getOrCreateDeviceId();

    // Smooth status transitions
    const timer1 = setTimeout(() => {
      setGenerationStatusText("Routing to optimal AI cluster...");
    }, 2200);

    const timer2 = setTimeout(() => {
      setGenerationStatusText("Rendering neural pixels...");
    }, 5500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
        body: JSON.stringify({
          ...options,
          deviceId,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (res.status === 429) {
        // Cooldown active on server
        setInCooldown(true);
        setCooldownSeconds(data.remainingSeconds || 180);
        setGlobalError(data.message || "Fair usage cooldown active. Next image available shortly.");
        setIsGenerating(false);
        return;
      }

      if (!res.ok || !data.success) {
        // Friendly shielded error
        setGlobalError(
          data.error || "That generation service is busy right now. We're switching to another one."
        );
        setIsGenerating(false);
        return;
      }

      // Success
      setGenerationStatusText("Image generated.");

      const newItem: GenerationHistoryItem = {
        id: data.id,
        imageUrl: data.imageUrl,
        imageBase64: data.imageBase64,
        prompt: data.prompt,
        style: data.style,
        aspectRatio: data.aspectRatio,
        providerUsed: data.providerUsed,
        modelUsed: data.modelUsed,
        createdAt: Date.now(),
      };

      setCurrentResult(newItem);

      // Save to IndexedDB
      await saveHistoryItem(newItem);
      loadHistory();

      // Enforce 3-minute cooldown from server
      if (data.cooldown) {
        setInCooldown(true);
        setCooldownSeconds(data.cooldown.remainingSeconds || 180);
      }
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGlobalError("Connection interrupted. Please verify your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (inCooldown || !currentResult) return;
    handleGenerate({
      prompt: currentResult.prompt,
      aspectRatio: (currentResult.aspectRatio as AspectRatio) || "1:1",
      style: currentResult.style,
    });
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteHistoryItem(id);
    loadHistory();
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (confirm("Clear all locally saved creations on this device?")) {
      await clearAllHistory();
      setHistoryItems([]);
      setCurrentResult(null);
    }
  };

  const handleSelectFromHistory = (item: GenerationHistoryItem) => {
    setCurrentResult(item);
    setPromptValue(item.prompt);
    setActiveTool("text-to-image");
  };

  const handleSelectPromptSuggestion = (suggestion: string) => {
    setPromptValue(suggestion);
    setActiveTool("text-to-image");
  };

  const handleNavTabChange = (tab: "create" | "tools" | "explore") => {
    setActiveNavTab(tab);
    if (tab === "create") {
      setActiveTool("text-to-image");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "tools") {
      setActiveTool("image-to-image");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "explore") {
      exploreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const minutes = Math.floor(cooldownSeconds / 60);
  const seconds = cooldownSeconds % 60;
  const formattedCooldown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] dark:bg-[#09090C] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Vheer-style Glass Header */}
      <StudioHeader
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
        inCooldown={inCooldown}
        cooldownSeconds={cooldownSeconds}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeNavTab={activeNavTab}
        setActiveNavTab={handleNavTabChange}
      />

      {/* Main Studio Body: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Slim Left Sidebar */}
        <StudioSidebar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (tool === "text-to-image") {
              setActiveNavTab("create");
            } else {
              setActiveNavTab("tools");
            }
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />

        {/* Central Creative Workspace Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 flex flex-col justify-between overflow-x-hidden min-w-0">
          <div className="w-full space-y-4">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
                  {activeTool === "text-to-image"
                    ? "Create an image"
                    : activeTool.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  {activeTool === "text-to-image"
                    ? "Describe your idea and bring it to life with multi-provider AI."
                    : "Creative studio tools powered by high-speed neural models."}
                </p>
              </div>

              {/* Cooldown Status Badge */}
              {inCooldown && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
                  <span>
                    Next image available in{" "}
                    <strong className="font-mono text-amber-800 dark:text-amber-200">
                      {formattedCooldown}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Error Banner if any */}
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{globalError}</span>
              </motion.div>
            )}

            {/* WORKSPACE VIEW: TEXT TO IMAGE OR TOOL WORKSPACE */}
            {activeTool === "text-to-image" ? (
              <div ref={canvasRef} className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
                {/* Large Canvas (Left 7 cols on desktop, Top on mobile) */}
                <div className="lg:col-span-7 xl:col-span-8 order-1">
                  <GenerationCanvas
                    currentResult={currentResult}
                    isGenerating={isGenerating}
                    generationStatusText={generationStatusText}
                    onOpenLightbox={(item) => setLightboxItem(item)}
                    onRegenerate={handleRegenerate}
                    canRegenerate={!inCooldown}
                    onSelectPromptSuggestion={handleSelectPromptSuggestion}
                  />
                </div>

                {/* Prompt + Controls Panel (Right 5 cols on desktop, Bottom on mobile) */}
                <div className="lg:col-span-5 xl:col-span-4 order-2">
                  <PromptControlPanel
                    promptValue={promptValue}
                    setPromptValue={setPromptValue}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    inCooldown={inCooldown}
                    cooldownSeconds={cooldownSeconds}
                  />
                </div>
              </div>
            ) : (
              <ToolWorkspaces
                activeTool={activeTool}
                onSwitchToTextToImageWithPrompt={(p) => {
                  setPromptValue(p);
                  setActiveTool("text-to-image");
                }}
              />
            )}

            {/* Recent Creations Masonry / Grid */}
            <RecentCreationsGrid
              items={historyItems}
              onSelect={(item) => {
                setCurrentResult(item);
                setPromptValue(item.prompt);
                setActiveTool("text-to-image");
                canvasRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              onOpenLightbox={(item) => setLightboxItem(item)}
              onDelete={handleDeleteHistoryItem}
            />

            {/* Explore / Inspiration Showcase */}
            <div ref={exploreRef}>
              <InspirationGallery
                onSelectPrompt={(p) => {
                  setPromptValue(p);
                  setActiveTool("text-to-image");
                  canvasRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            {/* Workflow Steps */}
            <FeatureSteps />
          </div>
        </main>
      </div>

      {/* History Slide-Out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelect={handleSelectFromHistory}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />

      {/* Help / About Modal */}
      <HelpAboutModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Minimal Studio Footer */}
      <Footer />
    </div>
  );
}
