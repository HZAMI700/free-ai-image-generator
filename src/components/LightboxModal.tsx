"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Download, Copy, Check } from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";
import { formatModelName } from "@/lib/constants";

interface LightboxModalProps {
  item: GenerationHistoryItem | null;
  onClose: () => void;
}

export function LightboxModal({ item, onClose }: LightboxModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.imageBase64 || item.imageUrl;
    const slug = item.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    link.download = `raphael-ai-${slug || "image"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Copy error", e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl w-full max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-stone-950 border border-white/10 shadow-2xl z-10"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between p-4 bg-stone-900/80 border-b border-stone-800 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="font-bold text-white">{formatModelName(item.modelUsed || item.providerUsed)}</span>
              <span>•</span>
              <span>{item.aspectRatio}</span>
              {item.style && (
                <>
                  <span>•</span>
                  <span>{item.style}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPrompt}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Copy prompt"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image */}
          <div className="relative flex-1 min-h-[300px] flex items-center justify-center p-2 sm:p-6 bg-stone-950 overflow-auto">
            <img
              src={item.imageBase64 || item.imageUrl}
              alt={item.prompt}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Prompt Subtitle */}
          <div className="p-4 bg-stone-900/90 border-t border-stone-800 text-xs text-stone-300">
            <p className="line-clamp-2">"{item.prompt}"</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
