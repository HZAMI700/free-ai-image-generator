"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Shield, Clock, Zap, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GeneratorCard } from "@/components/GeneratorCard";
import { CountdownCard } from "@/components/CountdownCard";
import { ImageResult } from "@/components/ImageResult";
import { LightboxModal } from "@/components/LightboxModal";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { InspirationGallery } from "@/components/InspirationGallery";
import { FeatureSteps } from "@/components/FeatureSteps";
import { Footer } from "@/components/Footer";
import { AspectRatio } from "@/providers/types";
import {
  GenerationHistoryItem,
  getHistoryItems,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from "@/lib/db";
import { getOrCreateDeviceId } from "@/lib/device";

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();

  // Generator State
  const [promptValue, setPromptValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatusText, setGenerationStatusText] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Rate Limiter / Cooldown State
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Results & History
  const [currentResult, setCurrentResult] = useState<GenerationHistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<GenerationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GenerationHistoryItem | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // 1. Sync Cooldown status with server on mount and window focus
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

  // 2. Load IndexedDB history
  const loadHistory = async () => {
    try {
      const items = await getHistoryItems();
      setHistoryItems(items);
    } catch (e) {
      console.warn("Failed to load local history", e);
    }
  };

  useEffect(() => {
    syncCooldown();
    loadHistory();

    const handleFocus = () => {
      syncCooldown();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // 3. Generation Execution
  const handleGenerate = async (options: {
    prompt: string;
    negativePrompt?: string;
    aspectRatio: AspectRatio;
    style?: string;
    quality?: "standard" | "hd";
    seed?: number;
  }) => {
    setIsGenerating(true);
    setGenerationStatusText("Creating your image...");
    setGlobalError(null);

    const deviceId = getOrCreateDeviceId();

    // Friendly progressive status updates
    const timer1 = setTimeout(() => {
      setGenerationStatusText("Routing to optimal AI cluster...");
    }, 2500);

    const timer2 = setTimeout(() => {
      setGenerationStatusText("Rendering neural pixels...");
    }, 6000);

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
        // Shielded user-friendly error
        setGlobalError(
          data.error || "That generation service is busy right now. Please try again shortly."
        );
        setIsGenerating(false);
        return;
      }

      // Success!
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

      // Activate 3-minute cooldown from server confirmation
      if (data.cooldown) {
        setInCooldown(true);
        setCooldownSeconds(data.cooldown.remainingSeconds || 180);
      }

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGlobalError("Network interruption. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCooldownExpire = () => {
    setInCooldown(false);
    setCooldownSeconds(0);
    setGlobalError(null);
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryItem(id);
    loadHistory();
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (confirm("Clear all locally saved images on this browser?")) {
      await clearAllHistory();
      setHistoryItems([]);
      setCurrentResult(null);
    }
  };

  const handleSelectFromHistory = (item: GenerationHistoryItem) => {
    setCurrentResult(item);
    setPromptValue(item.prompt);
    setIsHistoryOpen(false);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300">
      {/* Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          {/* Badge */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Multi-Cluster AI • 100% Free SaaS</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.1]"
          >
            Create anything with AI.
          </motion.h1>

          {/* Subtitle with core guarantees */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed font-normal"
          >
            Free AI image generation. No account required.
            <br className="hidden sm:inline" />
            <span className="text-zinc-400 dark:text-zinc-500 text-sm sm:text-base">
              {" "}No subscription. Generate again every 3 minutes.
            </span>
          </motion.p>
        </div>

        {/* Cooldown Timer (When active) */}
        {inCooldown && (
          <CountdownCard
            remainingSeconds={cooldownSeconds}
            onExpire={handleCooldownExpire}
          />
        )}

        {/* Global Error Banner (User-friendly) */}
        {globalError && !inCooldown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>{globalError}</p>
          </motion.div>
        )}

        {/* Primary Generator Card */}
        <GeneratorCard
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          generationStatusText={generationStatusText}
          inCooldown={inCooldown}
          cooldownSeconds={cooldownSeconds}
          promptValue={promptValue}
          setPromptValue={setPromptValue}
        />

        {/* Generated Image Result Area */}
        <div ref={resultRef}>
          {currentResult && (
            <ImageResult
              item={currentResult}
              onGenerateAgain={() => {
                if (!inCooldown) {
                  handleGenerate({
                    prompt: currentResult.prompt,
                    aspectRatio: currentResult.aspectRatio as AspectRatio,
                    style: currentResult.style,
                  });
                }
              }}
              onClear={() => setCurrentResult(null)}
              onOpenLightbox={(item) => setLightboxItem(item)}
              canGenerateAgain={!inCooldown}
            />
          )}
        </div>

        {/* Inspiration Gallery */}
        <InspirationGallery
          onSelectPrompt={(p) => {
            setPromptValue(p);
            window.scrollTo({ top: 120, behavior: "smooth" });
          }}
        />

        {/* 3 Step Workflow */}
        <FeatureSteps />
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelect={handleSelectFromHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
