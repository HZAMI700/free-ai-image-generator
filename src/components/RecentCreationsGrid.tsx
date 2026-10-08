"use client";

import React from "react";
import { Download, Maximize2, Trash2, ArrowUpRight, HardDrive, Info } from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";

interface RecentCreationsGridProps {
  items: GenerationHistoryItem[];
  onSelect: (item: GenerationHistoryItem) => void;
  onOpenLightbox: (item: GenerationHistoryItem) => void;
  onDelete: (id: string) => void;
}

export function RecentCreationsGrid({
  items,
  onSelect,
  onOpenLightbox,
  onDelete,
}: RecentCreationsGridProps) {
  if (items.length === 0) return null;

  const handleDownload = (e: React.MouseEvent, item: GenerationHistoryItem) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = item.imageBase64 || item.imageUrl;
    const slug = item.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    link.download = `prism-ai-${slug || "generation"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="w-full mt-12 pt-8 border-t border-black/[0.08] dark:border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Recent creations
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
            <span>Saved privately in this browser's IndexedDB. Not cloud-synced.</span>
          </p>
        </div>
        <span className="text-xs text-zinc-400 font-medium">
          {items.length} {items.length === 1 ? "creation" : "creations"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.06] cursor-pointer aspect-square shadow-2xs hover:shadow-md transition-all duration-300"
          >
            <img
              src={item.imageBase64 || item.imageUrl}
              alt={item.prompt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-between">
              <div className="flex justify-end gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(item);
                  }}
                  className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDownload(e, item)}
                  className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-500 transition-colors"
                  title="Delete from local device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <p className="text-[11px] text-white line-clamp-2 font-medium">
                  "{item.prompt}"
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-300 mt-1">
                  <span>{item.aspectRatio}</span>
                  <span>•</span>
                  <span className="capitalize">{item.providerUsed}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
