"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Trash2, HardDrive, Info, ExternalLink } from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: GenerationHistoryItem[];
  onSelect: (item: GenerationHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClearAll,
}: HistoryDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Slide-out Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={{ x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-white/95 dark:bg-[#1E1712]/95 backdrop-blur-2xl border-l border-stone-200/80 dark:border-stone-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">
                  Local Library
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                  {items.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p>
                Stored privately in your browser's IndexedDB. History stays on this device only and is never stored on a personal cloud account.
              </p>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-stone-500">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3 text-stone-400">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No creations yet</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                    Your generated images will appear here automatically.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl p-3 border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#241C16] shadow-2xs hover:shadow-md transition-all flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => onSelect(item)}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0 cursor-pointer relative"
                    >
                      <img
                        src={item.imageBase64 || item.imageUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p
                          onClick={() => onSelect(item)}
                          className="text-xs font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          "{item.prompt}"
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-400">
                          <span>{item.aspectRatio}</span>
                          <span>•</span>
                          <span className="capitalize">{item.modelUsed || item.providerUsed}</span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onSelect(item)}
                            className="p-1 text-stone-400 hover:text-amber-600 rounded cursor-pointer"
                            title="Load in generator"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-500 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
