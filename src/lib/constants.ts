export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface AspectRatioOption {
  id: AspectRatio;
  label: string;
  ratio: string;
  sub: string;
  width: number;
  height: number;
  iconClass: string;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "1:1", label: "Square", ratio: "1:1", sub: "1:1", width: 1024, height: 1024, iconClass: "w-4 h-4" },
  { id: "16:9", label: "Landscape", ratio: "16:9", sub: "16:9", width: 1024, height: 576, iconClass: "w-5 h-3" },
  { id: "9:16", label: "Story", ratio: "9:16", sub: "9:16", width: 576, height: 1024, iconClass: "w-3 h-5" },
  { id: "4:3", label: "Classic", ratio: "4:3", sub: "4:3", width: 1024, height: 768, iconClass: "w-4.5 h-3.5" },
  { id: "3:4", label: "Portrait", ratio: "3:4", sub: "3:4", width: 768, height: 1024, iconClass: "w-3.5 h-4.5" },
];

export interface StyleOption {
  id: string;
  label: string;
  icon: string;
  promptSuffix: string;
}

export const STYLES: StyleOption[] = [
  { id: "None", label: "General", icon: "✨", promptSuffix: "" },
  { id: "Realistic", label: "Realistic", icon: "📸", promptSuffix: "photorealistic, hyperrealistic 8k, natural lighting, award winning photography" },
  { id: "Cinematic", label: "Cinematic", icon: "🎬", promptSuffix: "cinematic still, dramatic composition, anamorphic lens, 35mm film grain, moody lighting" },
  { id: "Anime", label: "Anime", icon: "🌸", promptSuffix: "anime visual, makoto shinkai aesthetic, vibrant colors, clean linework, studio ghibli lighting" },
  { id: "Illustration", label: "Illustration", icon: "🎨", promptSuffix: "digital art illustration, trending on artstation, detailed concept art" },
  { id: "3D", label: "3D Render", icon: "💎", promptSuffix: "octane 3D render, raytracing, polished materials, pixar cgi character style" },
  { id: "Minimal", label: "Minimal", icon: "⚪", promptSuffix: "minimalist design, negative space, elegant composition, muted colors, zen aesthetic" },
  { id: "Fantasy", label: "Fantasy", icon: "🧙‍♂️", promptSuffix: "epic fantasy artwork, ethereal glow, magical ambiance, intricate details" },
  { id: "Cyberpunk", label: "Cyberpunk", icon: "🌆", promptSuffix: "cyberpunk city, neon reflections, rain soaked pavement, futuristic tech" },
];

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  provider: string;
  speed: string;
  quality: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "auto-router",
    name: "Prism Quality Engine",
    badge: "Recommended",
    description: "Intelligently routes to the highest-scoring AI cluster with auto-fallback",
    provider: "multi-provider",
    speed: "Fast (3-5s)",
    quality: "Ultra",
  },
  {
    id: "flux-schnell",
    name: "Flux.1 Schnell",
    badge: "Ultra Fast",
    description: "Next-gen flow transformer model with photorealistic accuracy",
    provider: "pollinations/hf",
    speed: "Instant (2-4s)",
    quality: "High",
  },
  {
    id: "sdxl-lightning",
    name: "SDXL Lightning",
    badge: "Detailed",
    description: "High-resolution 1024px photography and complex compositions",
    provider: "cloudflare/horde",
    speed: "Fast (4-6s)",
    quality: "High",
  },
  {
    id: "imagen-3",
    name: "Gemini Imagen 3",
    badge: "Pro",
    description: "Google state-of-the-art text fidelity and realistic lighting",
    provider: "gemini",
    speed: "Standard (5-8s)",
    quality: "Ultra",
  },
];

export const INSPIRATION_PROMPTS = [
  "A majestic snow leopard perched on crystalline ice peaks in the Himalayas, golden hour rim lighting, 8k documentary style",
  "An ethereal glass greenhouse suspended inside a giant nebula, bioluminescent alien flowers, cinematic volumetric light",
  "Futuristic electric vintage roadster cruising along the Amalfi coast at twilight, retro-modern luxury, reflections",
  "A cozy subterranean library carved into oak roots, glowing floating lanterns, miniature woodland creatures reading",
  "Cyberpunk tea house in Neo-Tokyo with translucent paper walls, neon kanji reflections on wet rain pavement",
  "Close-up portrait of an android artisan sculpting a ceramic vase with molten gold seams, tactile realism",
  "Minimalist architectural pavilion floating on calm mirrors of water at dawn, mist, Zen aesthetic, neutral tones",
  "Whimsical steampunk hot air balloon armada sailing above fluffy golden clouds, brass compasses and velvet sails",
];
