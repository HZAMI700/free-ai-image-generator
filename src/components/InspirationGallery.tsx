"use client";

import React from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface InspirationGalleryProps {
  onSelectPrompt: (prompt: string) => void;
}

const GALLERY_ITEMS = [
  {
    title: "Celestial Botanical",
    prompt: "A floating glass orb terrarium inside a deep space nebula, luminescent crystal flora, octane 3d render, cinematic violet glow",
    style: "3D Render",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Himalayan Solitude",
    prompt: "Snow leopard on a razor-sharp mountain summit in the Himalayas at sunrise, 8k nature photography, crisp detail",
    style: "Photorealistic",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Neo-Kyoto Rain",
    prompt: "Cyberpunk lantern street in Neo-Kyoto after rain, neon kanji reflections in puddles, cinematic film grain",
    style: "Cyberpunk",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Floating Sanctuary",
    prompt: "Minimalist concrete pavilion resting on a tranquil mirror lake at dawn, soft mist, Zen aesthetic, neutral tones",
    style: "Minimalist",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  },
];

export function InspirationGallery({ onSelectPrompt }: InspirationGalleryProps) {
  return (
    <div className="w-full max-w-5xl mx-auto my-16 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Created with Prism AI
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
          Click any prompt below to automatically load it into your prompt box.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GALLERY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative rounded-2xl overflow-hidden glass-card border border-zinc-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Visual Cover */}
            <div className="h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white">
                {item.style}
              </div>
            </div>

            {/* Prompt preview */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  "{item.prompt}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                <span>Use prompt</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
