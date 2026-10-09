"use client";

import React from "react";
import { Download, Maximize2, Trash2, HardDrive } from "lucide-react";
import { GenerationHistoryItem } from "@/lib/db";
import { formatModelName } from "@/lib/constants";

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
    link.download = `raphael-ai-${slug || "generation"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="w-full max-w-[1128px] mx-auto py-8 border-t border-stone-200/80 dark:border-stone-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Recent Creations
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span>Saved privately in this browser's local IndexedDB. 100% private.</span>
          </p>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          {items.length} {items.length === 1 ? "creation" : "creations"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#201913] border border-stone-200/80 dark:border-stone-800 cursor-pointer aspect-square shadow-2xs hover:shadow-md transition-all duration-300"
          >
            <img
              src={item.imageBase64 || item.imageUrl}
              alt={item.prompt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-between">
              <div className="flex justify-end gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(item);
                  }}
                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDownload(e, item)}
                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  title="Delete from local device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <p className="text-[11px] text-white line-clamp-2 font-medium">
                  "{item.prompt}"
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-stone-300 mt-1">
                  <span>{item.aspectRatio}</span>
                  <span>•</span>
                  <span>{formatModelName(item.modelUsed || item.providerUsed)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
