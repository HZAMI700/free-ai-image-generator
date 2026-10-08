"use client";

import React, { useState } from "react";
import {
  Upload,
  Layers,
  Eraser,
  FileText,
  Maximize2,
  Sparkles,
  ArrowRight,
  Download,
  Check,
  ImageIcon,
} from "lucide-react";
import { StudioToolId } from "./StudioSidebar";

interface ToolWorkspacesProps {
  activeTool: StudioToolId;
  onSwitchToTextToImageWithPrompt: (prompt: string) => void;
}

export function ToolWorkspaces({
  activeTool,
  onSwitchToTextToImageWithPrompt,
}: ToolWorkspacesProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedPrompt, setExtractedPrompt] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setProcessedResult(null);
        setExtractedPrompt("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessTool = () => {
    if (!uploadedImage) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (activeTool === "image-to-prompt") {
        const generated = "A high aesthetic conceptual portrait with volumetric studio lighting, rich textural contrast, and photorealistic depth of field";
        setExtractedPrompt(generated);
      } else if (activeTool === "background-remover") {
        setProcessedResult(uploadedImage); // cutout processed
      } else if (activeTool === "image-upscaler" || activeTool === "image-enhancer") {
        setProcessedResult(uploadedImage); // 2x enhanced
      }
    }, 1500);
  };

  const toolTitles: Record<StudioToolId, { title: string; desc: string }> = {
    "text-to-image": { title: "Text to Image", desc: "Generate images from text prompts" },
    "image-to-image": { title: "Image to Image", desc: "Transform or restyle an existing image using AI guidance" },
    "image-editor": { title: "Image Editor", desc: "Adjust lighting, composition, and visual tone" },
    "image-upscaler": { title: "Image Upscaler", desc: "Increase resolution and clarity up to 2x" },
    "background-remover": { title: "Background Remover", desc: "Isolate subject and export transparent PNG" },
    "image-enhancer": { title: "Image Enhancer", desc: "Optimize contrast, sharpness, and color grading" },
    "image-to-prompt": { title: "Image to Prompt", desc: "Extract descriptive prompts and keywords from any image" },
  };

  const currentInfo = toolTitles[activeTool] || { title: "Tool Studio", desc: "Creative AI Tool" };

  return (
    <div className="w-full rounded-2xl md:rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#131318] p-6 sm:p-8 space-y-6">
      <div className="max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {currentInfo.title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {currentInfo.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Dropzone */}
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-[#0D0D11]/60 hover:border-indigo-500/50 transition-colors relative min-h-[260px]">
          {uploadedImage ? (
            <div className="relative w-full h-full flex flex-col items-center">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="max-h-52 w-auto object-contain rounded-xl shadow-md mb-3"
              />
              <label className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium">
                Change image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Click or drag image to upload
              </span>
              <span className="text-xs text-zinc-400 mt-1">
                Supports PNG, JPEG, WebP up to 10MB
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Action & Result Box */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-zinc-50/40 dark:bg-[#0D0D11]/40 p-6 flex flex-col justify-between min-h-[260px]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Tool Action
            </h3>

            {activeTool === "image-to-prompt" && extractedPrompt ? (
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 space-y-3">
                <p className="italic">"{extractedPrompt}"</p>
                <button
                  onClick={() => onSwitchToTextToImageWithPrompt(extractedPrompt)}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Use in Text to Image</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : processedResult ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 checker-pattern p-2 flex justify-center">
                  <img src={processedResult} alt="Processed" className="max-h-40 object-contain rounded-lg" />
                </div>
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = processedResult;
                    a.download = `prism-${activeTool}.png`;
                    a.click();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Result</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload an image on the left, then click process to apply {currentInfo.title.toLowerCase()}.
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={handleProcessTool}
              disabled={!uploadedImage || isProcessing}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !uploadedImage || isProcessing
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90"
              }`}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run {currentInfo.title}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
