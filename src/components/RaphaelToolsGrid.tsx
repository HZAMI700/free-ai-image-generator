"use client";

import React from "react";
import {
  Sparkles,
  Scissors,
  Maximize,
  TrendingUp,
  Eraser,
  Palette,
  ArrowRight,
} from "lucide-react";

interface RaphaelToolsGridProps {
  onSelectTool?: (toolId: string) => void;
}

export function RaphaelToolsGrid({ onSelectTool }: RaphaelToolsGridProps) {
  const tools = [
    {
      id: "ai-image-editor",
      title: "AI Image Editor",
      description: "Edit, refine, and inpaint specific regions of your artwork with generative precision.",
      icon: Sparkles,
      color: "from-amber-500 to-orange-500",
      badge: "Popular",
    },
    {
      id: "remove-background",
      title: "Remove Background",
      description: "Instant neural background separation and transparent cutout with high edge detail.",
      icon: Scissors,
      color: "from-emerald-500 to-teal-500",
      badge: "Instant",
    },
    {
      id: "image-expand",
      title: "Image Expand / Uncrop",
      description: "Extend images beyond their borders with contextual generative neural outpainting.",
      icon: Maximize,
      color: "from-blue-500 to-indigo-500",
      badge: "HD",
    },
    {
      id: "image-upscaler",
      title: "Image Upscaler (4K)",
      description: "Enhance resolution up to 4096px while recovering texture, sharpness, and fine details.",
      icon: TrendingUp,
      color: "from-violet-500 to-purple-500",
      badge: "4K Clarity",
    },
    {
      id: "remove-watermark",
      title: "AI Watermark Remover",
      description: "Clean unwanted text, timestamps, and artifacts while reconstructing background patterns.",
      icon: Eraser,
      color: "from-rose-500 to-pink-500",
      badge: "Clean",
    },
    {
      id: "transform-style",
      title: "Transform Style",
      description: "Remix and transfer artistic aesthetics across photorealism, anime, cyberpunk, and 3D.",
      icon: Palette,
      color: "from-amber-600 to-red-500",
      badge: "Creative",
    },
  ];

  return (
    <section className="w-full max-w-[1128px] mx-auto py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            AI Image Tools
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Suite of neural image generation and editing utilities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="group p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#201913] hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
