export interface StyleOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const STYLES: StyleOption[] = [
  { id: "None", label: "Natural", icon: "✨", description: "Default model aesthetic" },
  { id: "Photorealistic", label: "Photorealistic", icon: "📸", description: "High-end 35mm DSLR photography" },
  { id: "Cinematic", label: "Cinematic", icon: "🎬", description: "Movie still with dramatic lighting" },
  { id: "Anime", label: "Anime / Manga", icon: "🌸", description: "Makoto Shinkai vibrant anime art" },
  { id: "Digital Art", label: "Digital Art", icon: "🎨", description: "Concept art, ArtStation trending" },
  { id: "3D Render", label: "3D Render", icon: "💎", description: "Octane render, Pixar CGI style" },
  { id: "Cyberpunk", label: "Cyberpunk", icon: "🌆", description: "Neon drenched futuristic cityscape" },
  { id: "Watercolor", label: "Watercolor", icon: "🖌️", description: "Soft dreamy fluid wash on paper" },
  { id: "Minimalist", label: "Minimalist", icon: "⚪", description: "Clean lines, negative space, elegance" },
];

export const ASPECT_RATIOS = [
  { id: "1:1", label: "Square", sub: "1:1", width: 1024, height: 1024, iconClass: "w-5 h-5" },
  { id: "16:9", label: "Landscape", sub: "16:9", width: 1024, height: 576, iconClass: "w-6 h-3.5" },
  { id: "9:16", label: "Portrait", sub: "9:16", width: 576, height: 1024, iconClass: "w-3.5 h-6" },
  { id: "4:3", label: "Classic", sub: "4:3", width: 1024, height: 768, iconClass: "w-5 h-4" },
  { id: "3:2", label: "Photo", sub: "3:2", width: 1080, height: 720, iconClass: "w-6 h-4" },
] as const;

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
