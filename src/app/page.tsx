"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Clock, AlertCircle } from "lucide-react";

import { RaphaelBanner } from "@/components/RaphaelBanner";
import { RaphaelHeader } from "@/components/RaphaelHeader";
import { RaphaelHero } from "@/components/RaphaelHero";
import { RaphaelComposer } from "@/components/RaphaelComposer";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { RaphaelModelsShowcase } from "@/components/RaphaelModelsShowcase";
import { RaphaelToolsGrid } from "@/components/RaphaelToolsGrid";
import { RecentCreationsGrid } from "@/components/RecentCreationsGrid";
import { InspirationGallery } from "@/components/InspirationGallery";
import { RaphaelFAQ } from "@/components/RaphaelFAQ";
import { RaphaelFooter } from "@/components/RaphaelFooter";
import { LightboxModal } from "@/components/LightboxModal";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { HelpAboutModal } from "@/components/HelpAboutModal";

import { AspectRatio } from "@/lib/constants";
import {
  GenerationHistoryItem,
  getHistoryItems,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from "@/lib/db";
import { getOrCreateDeviceId } from "@/lib/device";

export default function RaphaelAppPage() {
  const shouldReduceMotion = useReducedMotion();

  // Navigation tab state
  const [activeNavTab, setActiveNavTab] = useState<"image" | "video" | "tools" | "models">("image");

  // Generator State
  const [promptValue, setPromptValue] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("auto-router");
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

  // Section references for smooth scrolling
  const canvasRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const modelsRef = useRef<HTMLDivElement>(null);

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
    }, 2000);

    const timer2 = setTimeout(() => {
      setGenerationStatusText("Rendering neural pixels...");
    }, 4500);

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
        setGlobalError(
          data.error || "Generation service is currently busy. Please try again shortly."
        );
        setIsGenerating(false);
        return;
      }

      // Success
      setGenerationStatusText("Image generated successfully!");

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

      // Scroll to canvas to show result
      canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGlobalError("Connection interrupted. Please verify your internet connection and try again.");
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
      model: selectedModelId,
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
    canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSelectPromptSuggestion = (suggestion: string) => {
    setPromptValue(suggestion);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavTabChange = (tab: "image" | "video" | "tools" | "models") => {
    setActiveNavTab(tab);
    if (tab === "image") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "tools") {
      toolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tab === "models") {
      modelsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-[#191410] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* 1. Top Announcement Banner */}
      <RaphaelBanner onScrollToTools={() => toolsRef.current?.scrollIntoView({ behavior: "smooth" })} />

      {/* 2. Raphael.app Header */}
      <RaphaelHeader
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
        inCooldown={inCooldown}
        cooldownSeconds={cooldownSeconds}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeNavTab={activeNavTab}
        setActiveNavTab={handleNavTabChange}
      />

      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4 space-y-6">
        {/* Global Error Notice if any */}
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1128px] mx-auto p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{globalError}</span>
          </motion.div>
        )}

        {/* 3. Hero Section (Title, Subtitle, Badges) */}
        <RaphaelHero />

        {/* 4. Central Composer Widget (Interactive Model Selection, Ratio, Styles, Generate) */}
        <RaphaelComposer
          promptValue={promptValue}
          setPromptValue={setPromptValue}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          inCooldown={inCooldown}
          cooldownSeconds={cooldownSeconds}
        />

        {/* 5. Generation Canvas / Results Stage */}
        <div ref={canvasRef} className="pt-2">
          <GenerationCanvas
            currentResult={currentResult}
            isGenerating={isGenerating}
            generationStatusText={generationStatusText}
            onOpenLightbox={(item) => setLightboxItem(item)}
            onRegenerate={handleRegenerate}
            canRegenerate={!inCooldown}
            onSelectPromptSuggestion={handleSelectPromptSuggestion}
            inCooldown={inCooldown}
            cooldownSeconds={cooldownSeconds}
          />
        </div>

        {/* 6. Featured AI Models Showcase */}
        <div ref={modelsRef}>
          <RaphaelModelsShowcase
            onSelectModel={(id) => {
              setSelectedModelId(id);
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
            selectedModelId={selectedModelId}
          />
        </div>

        {/* 7. AI Image Tools Grid */}
        <div ref={toolsRef}>
          <RaphaelToolsGrid
            onSelectTool={(toolId) => {
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
          />
        </div>

        {/* 8. Recent Creations Grid (IndexedDB) */}
        <RecentCreationsGrid
          items={historyItems}
          onSelect={(item) => {
            setCurrentResult(item);
            setPromptValue(item.prompt);
            canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          onOpenLightbox={(item) => setLightboxItem(item)}
          onDelete={handleDeleteHistoryItem}
        />

        {/* 9. Inspiration Gallery */}
        <InspirationGallery
          onSelectPrompt={(p) => {
            setPromptValue(p);
            window.scrollTo({ top: 120, behavior: "smooth" });
          }}
        />

        {/* 10. Raphael FAQ Accordion */}
        <RaphaelFAQ />
      </main>

      {/* 11. Minimal Raphael Footer */}
      <RaphaelFooter />

      {/* Slide-Out History Drawer */}
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
    </div>
  );
}
