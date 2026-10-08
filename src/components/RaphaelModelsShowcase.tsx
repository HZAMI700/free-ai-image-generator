"use client";

import React from "react";
import { AVAILABLE_MODELS } from "@/lib/constants";
import { Zap, Sparkles, Check, ArrowUpRight } from "lucide-react";

interface RaphaelModelsShowcaseProps {
  onSelectModel: (modelId: string) => void;
  selectedModelId: string;
}

export function RaphaelModelsShowcase({
  onSelectModel,
  selectedModelId,
}: RaphaelModelsShowcaseProps) {
  return (
    <section className="w-full max-w-[1128px] mx-auto py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Featured AI Image Generation Models
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Select a specialized neural architecture or let our smart router optimize automatically
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = selectedModelId === model.id;
          return (
            <div
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`group p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                  : "bg-white dark:bg-[#201913] border-stone-200/80 dark:border-stone-800 hover:border-amber-500/30 hover:shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{model.icon || "⚡"}</span>
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {model.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-amber-600 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    {model.badge}
                  </span>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-medium">
                  <span>Latency: <strong className="text-stone-900 dark:text-stone-200">{model.speed}</strong></span>
                  <span>•</span>
                  <span>{model.quality}</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <span>Select</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
