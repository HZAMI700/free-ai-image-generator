export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2";

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  aspectRatio?: AspectRatio;
  style?: string;
  quality?: "standard" | "hd";
  seed?: number;
  steps?: number;
  preferredModel?: string;
  preferredProvider?: string;
}

export interface ProviderResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  modelUsed: string;
  provider: string;
  latencyMs: number;
  costEstimated: number; // in USD
  quotaUsed?: number; // e.g. Neurons or credits
  error?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderStatus {
  provider: string;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: number;
  message?: string;
}

export interface ProviderQuota {
  provider: string;
  remaining: number;
  limit: number;
  unit: string; // e.g. "neurons", "images", "requests", "usd"
  resetAt?: number;
  isExhausted: boolean;
}

export interface ImageProvider {
  readonly name: string;
  readonly isFree: boolean;
  readonly basePriority: number; // lower number or higher rank for router scoring
  
  generateImage(options: ImageGenerationOptions): Promise<ProviderResponse>;
  getStatus(): Promise<ProviderStatus>;
  getQuota(): Promise<ProviderQuota>;
  estimateCost(options: ImageGenerationOptions): number;
  healthCheck(): Promise<boolean>;
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  style?: string;
  quality?: string;
  providerUsed: string;
  modelUsed: string;
  latencyMs: number;
  createdAt: number;
  expiresAt: number;
}
