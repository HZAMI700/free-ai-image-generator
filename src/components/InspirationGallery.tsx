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
    <section className="w-full max-w-[1128px] mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Created with Raphael AI
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Click any prompt below to automatically populate the composer
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GALLERY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#201913] shadow-2xs hover:shadow-lg hover:border-amber-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Visual Cover */}
            <div className="h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-900 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                {item.style}
              </div>
            </div>

            {/* Prompt preview */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors" />
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  "{item.prompt}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                <span>Use this prompt</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
