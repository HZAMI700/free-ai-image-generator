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
  icon?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "auto-router",
    name: "Auto Smart Router",
    badge: "Recommended",
    description: "Intelligently routes to the highest-scoring live AI cluster with auto-fallback",
    provider: "multi-provider",
    speed: "Instant (~2s)",
    quality: "Ultra HD",
    icon: "✨",
  },
  {
    id: "cloudflare-flux",
    name: "Cloudflare FLUX.1-schnell",
    badge: "Official Fast",
    description: "Black Forest Labs flow transformer via Cloudflare Workers AI edge",
    provider: "cloudflare",
    speed: "~2.2s",
    quality: "Ultra HD",
    icon: "⚡",
  },
  {
    id: "cloudflare-sdxl",
    name: "Cloudflare SDXL Lightning",
    badge: "1024px High-Res",
    description: "ByteDance accelerated 1024px photorealistic rendering via Cloudflare Workers AI",
    provider: "cloudflare",
    speed: "~2.5s",
    quality: "1024px Crisp",
    icon: "⚡",
  },
  {
    id: "cloudflare-sdxl-base",
    name: "Cloudflare SDXL Base 1.0",
    badge: "Artistic Deep",
    description: "Stability AI base foundation model with comprehensive artistic styling",
    provider: "cloudflare",
    speed: "~4.5s",
    quality: "Fine Arts",
    icon: "🎨",
  },
  {
    id: "huggingface-flux",
    name: "Hugging Face FLUX.1",
    badge: "HF Router",
    description: "Hugging Face Inference router for FLUX.1-schnell high-fidelity generation",
    provider: "huggingface",
    speed: "~3-5s",
    quality: "Photoreal",
    icon: "🤗",
  },
  {
    id: "pollinations-flux",
    name: "Pollinations FLUX",
    badge: "Community Free",
    description: "Community distributed inference cluster with vibrant creative rendering",
    provider: "pollinations",
    speed: "~3-4s",
    quality: "Creative",
    icon: "🌸",
  },
  {
    id: "aihorde",
    name: "AI Horde Distributed",
    badge: "Decentralized",
    description: "Distributed volunteer GPU cluster with automatic queue fallback",
    provider: "aihorde",
    speed: "~10-30s",
    quality: "Standard",
    icon: "🌐",
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
