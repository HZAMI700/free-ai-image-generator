import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * Fal.ai Provider
 * Premium high-speed fallback provider when free providers are unavailable or congested.
 */
export class FalProvider implements ImageProvider {
  readonly name = "fal";
  readonly isFree = false;
  readonly basePriority = 80; // Lower priority (fallback after free tiers)

  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.FAL_KEY || process.env.FAL_API_KEY || "";
    this.model = process.env.FAL_MODEL || "fal-ai/flux/schnell";
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();

    if (!this.apiKey) {
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: "Fal.ai API key (FAL_KEY) not configured",
      };
    }

    try {
      const url = `https://fal.run/${this.model}`;
      const payload: Record<string, unknown> = {
        prompt: options.prompt,
        image_size: this.getFalImageSize(options.aspectRatio),
        num_inference_steps: options.steps || 4,
        enable_safety_checker: true,
      };

      if (options.seed) {
        payload.seed = options.seed;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        return {
          success: false,
          modelUsed: this.model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `Fal.ai returned status ${response.status}: ${errText.slice(0, 100)}`,
        };
      }

      const data = await response.json();
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) {
        return {
          success: false,
          modelUsed: this.model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "Fal.ai returned no image URL in payload",
        };
      }

      // Fetch image buffer to convert to base64 so it can be served reliably without expiring CDN URLs
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

      return {
        success: true,
        imageUrl,
        imageBase64: base64,
        mimeType,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: this.estimateCost(options),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Fal.ai generation error: ${message}`,
      };
    }
  }

  private getFalImageSize(aspectRatio?: string): string {
    switch (aspectRatio) {
      case "16:9":
        return "landscape_16_9";
      case "9:16":
        return "portrait_16_9";
      case "4:3":
        return "landscape_4_3";
      case "1:1":
      default:
        return "square_hd";
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isConfigured = Boolean(this.apiKey);
    return {
      provider: this.name,
      isHealthy: isConfigured,
      latencyMs: 150,
      lastChecked: Date.now(),
      message: isConfigured ? "Ready (Paid fallback)" : "Missing FAL_KEY",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: this.apiKey ? 100 : 0,
      limit: 100,
      unit: "credits",
      isExhausted: !this.apiKey,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0.003; // ~$0.003 per Flux Schnell image
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.apiKey);
  }
}
