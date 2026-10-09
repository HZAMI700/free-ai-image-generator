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
    description: "Intelligently routes to the fastest live Runware cluster with auto-fallback",
    provider: "runware",
    speed: "Instant (~1.8s)",
    quality: "Ultra HD",
    icon: "✨",
  },
  {
    id: "runware:100@1",
    name: "FLUX.1 [schnell]",
    badge: "Ultra Fast",
    description: "Black Forest Labs next-gen 12B flow transformer with photorealistic fidelity",
    provider: "runware",
    speed: "~1.9s",
    quality: "Ultra HD",
    icon: "⚡",
  },
  {
    id: "runware:101@1",
    name: "FLUX.1 [dev]",
    badge: "Studio Pro",
    description: "Full 28-step flow transformer open weights for maximum compositional nuance",
    provider: "runware",
    speed: "~3.8s",
    quality: "Photoreal+",
    icon: "💎",
  },
  {
    id: "rundiffusion:110@101",
    name: "Juggernaut Lightning Flux",
    badge: "Rapid Realism",
    description: "Accelerated photorealistic rendering tuned by RunDiffusion for instantaneous results",
    provider: "runware",
    speed: "~1.5s",
    quality: "Hyperreal",
    icon: "🔥",
  },
  {
    id: "rundiffusion:130@100",
    name: "Juggernaut Pro Flux",
    badge: "Master Photoreal",
    description: "State-of-the-art cinematic lighting, skin textures, and architectural precision",
    provider: "runware",
    speed: "~3.2s",
    quality: "8K Cinema",
    icon: "📸",
  },
  {
    id: "civitai:156061@179087",
    name: "Devlish PhotoRealism SDXL",
    badge: "SDXL Precision",
    description: "Premier SDXL checkpoint specialized for authentic human portraits and scenes",
    provider: "runware",
    speed: "~2.4s",
    quality: "DSLR Crisp",
    icon: "🎯",
  },
  {
    id: "civitai:260267@293564",
    name: "Animagine XL 3.1",
    badge: "Anime & Manga",
    description: "Industry-leading anime artwork generator with clean linework and studio vibrance",
    provider: "runware",
    speed: "~2.5s",
    quality: "Studio Art",
    icon: "🌸",
  },
  {
    id: "civitai:25694@143906",
    name: "EpicRealism",
    badge: "Classic Realism",
    description: "Acclaimed neural checkpoint for natural daylight photography and documentary realism",
    provider: "runware",
    speed: "~2.1s",
    quality: "True Life",
    icon: "🌟",
  },
  {
    id: "civitai:4384@128713",
    name: "DreamShaper 8",
    badge: "Art & Fantasy",
    description: "Legendary versatile checkpoint for fantasy illustrations, digital art, and concepts",
    provider: "runware",
    speed: "~2.0s",
    quality: "Fine Art",
    icon: "🎨",
  },
];

export function formatModelName(modelOrProvider?: string): string {
  if (!modelOrProvider) return "AI Model";
  const found = AVAILABLE_MODELS.find(
    (m) =>
      m.id === modelOrProvider ||
      m.name.toLowerCase() === modelOrProvider.toLowerCase()
  );
  if (found) return found.name;

  if (modelOrProvider.includes("100@1") || modelOrProvider.includes("schnell")) {
    return "FLUX.1 [schnell]";
  }
  if (modelOrProvider.includes("101@1") || modelOrProvider.includes("dev")) {
    return "FLUX.1 [dev]";
  }
  if (modelOrProvider.includes("110@101")) {
    return "Juggernaut Lightning Flux";
  }
  if (modelOrProvider.includes("130@100")) {
    return "Juggernaut Pro Flux";
  }
  if (modelOrProvider.includes("156061")) {
    return "Devlish PhotoRealism SDXL";
  }
  if (modelOrProvider.includes("260267")) {
    return "Animagine XL 3.1";
  }
  if (modelOrProvider.includes("25694")) {
    return "EpicRealism";
  }
  if (modelOrProvider.includes("4384")) {
    return "DreamShaper 8";
  }
  return modelOrProvider.replace("runware:", "").replace("rundiffusion:", "").replace("civitai:", "");
}

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
