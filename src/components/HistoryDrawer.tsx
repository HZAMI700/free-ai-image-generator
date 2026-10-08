"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Trash2, Download, Copy, ExternalLink, HardDrive, Info } from "lucide-react";
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Slide-out Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={{ x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-l border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Local History
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                  {items.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="px-5 py-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Stored privately in your browser's IndexedDB. History stays on this device only and is never stored on a personal cloud account.
              </p>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-400 dark:text-zinc-500">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No creations yet</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Your generated images will appear here automatically.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl p-3 border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 shadow-sm hover:shadow-md transition-all flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => onSelect(item)}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0 cursor-pointer relative"
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
                          className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          "{item.prompt}"
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
                          <span>{item.aspectRatio}</span>
                          <span>•</span>
                          <span className="capitalize">{item.providerUsed}</span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onSelect(item)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
                            title="Open in generator"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1 text-zinc-400 hover:text-red-500 rounded"
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
