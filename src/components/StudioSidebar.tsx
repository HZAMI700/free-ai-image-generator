"use client";

import React from "react";
import {
  ImagePlus,
  Layers,
  Wand2,
  Maximize2,
  Eraser,
  Sparkles,
  FileText,
  History,
  Shield,
  ChevronRight,
} from "lucide-react";

export type StudioToolId =
  | "text-to-image"
  | "image-to-image"
  | "image-editor"
  | "image-upscaler"
  | "background-remover"
  | "image-enhancer"
  | "image-to-prompt";

interface StudioSidebarProps {
  activeTool: StudioToolId;
  onSelectTool: (tool: StudioToolId) => void;
  onOpenHistory: () => void;
}

export function StudioSidebar({
  activeTool,
  onSelectTool,
  onOpenHistory,
}: StudioSidebarProps) {
  const createTools = [
    {
      id: "text-to-image" as StudioToolId,
      label: "Text to Image",
      icon: ImagePlus,
      badge: "Core",
    },
    {
      id: "image-to-image" as StudioToolId,
      label: "Image to Image",
      icon: Layers,
      badge: "Ref",
    },
    {
      id: "image-editor" as StudioToolId,
      label: "Image Editor",
      icon: Wand2,
    },
  ];

  const utilityTools = [
    {
      id: "image-upscaler" as StudioToolId,
      label: "Image Upscaler",
      icon: Maximize2,
    },
    {
      id: "background-remover" as StudioToolId,
      label: "Background Remover",
      icon: Eraser,
    },
    {
      id: "image-enhancer" as StudioToolId,
      label: "Image Enhancer",
      icon: Sparkles,
    },
    {
      id: "image-to-prompt" as StudioToolId,
      label: "Image to Prompt",
      icon: FileText,
    },
  ];

  return (
    <>
      {/* Desktop Persistent Slim Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col justify-between border-r border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-[#111115]/70 backdrop-blur-md p-3 select-none">
        <div className="space-y-6">
          {/* Section: CREATE */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Create
            </div>
            <nav className="space-y-1">
              {createTools.map((t) => {
                const Icon = t.icon;
                const isActive = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTool(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400 dark:text-indigo-600" : "text-zinc-400"}`} />
                      <span>{t.label}</span>
                    </div>
                    {t.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          isActive
                            ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-950"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: TOOLS */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Tools
            </div>
            <nav className="space-y-1">
              {utilityTools.map((t) => {
                const Icon = t.icon;
                const isActive = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTool(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400 dark:text-indigo-600" : "text-zinc-400"}`} />
                      <span>{t.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] space-y-2">
          <button
            onClick={onOpenHistory}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <span>Recent Library</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200 mb-0.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Free SaaS</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              1 image / 3 mins fair cooldown. No login required.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Horizontal Tool Navigation Ribbon */}
      <div className="lg:hidden w-full overflow-x-auto py-2.5 px-4 bg-white/90 dark:bg-[#111115]/90 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center gap-2 shrink-0 no-scrollbar">
        {[...createTools, ...utilityTools].map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
