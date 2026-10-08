import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * Pollinations AI Provider
 * High quality free/community image generation.
 * Handles rate limits, authentication tokens when available, and image verification.
 */
export class PollinationsProvider implements ImageProvider {
  readonly name = "pollinations";
  readonly isFree = true;
  readonly basePriority = 20;

  private apiKey: string;
  private defaultModel: string;
  private requestsTracked: number = 0;
  private estimatedRateLimitRemaining: number = 30; // conservative rolling limit

  constructor() {
    this.apiKey = process.env.POLLINATIONS_API_KEY || "";
    this.defaultModel = process.env.POLLINATIONS_MODEL || "flux";
  }

  private calculateDimensions(aspectRatio?: string): { width: number; height: number } {
    switch (aspectRatio) {
      case "16:9":
        return { width: 1024, height: 576 };
      case "9:16":
        return { width: 576, height: 1024 };
      case "4:3":
        return { width: 1024, height: 768 };
      case "3:4":
        return { width: 768, height: 1024 };
      case "3:2":
        return { width: 1080, height: 720 };
      case "1:1":
      default:
        return { width: 1024, height: 1024 };
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    const { width, height } = this.calculateDimensions(options.aspectRatio);

    try {
      const encodedPrompt = encodeURIComponent(options.prompt);
      const seed = options.seed || Math.floor(Math.random() * 1000000);
      const model = this.defaultModel;

      let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true&enhance=false`;

      if (options.negativePrompt) {
        url += `&negative_prompt=${encodeURIComponent(options.negativePrompt)}`;
      }

      const headers: Record<string, string> = {
        "User-Agent": "FreeAISaaS/1.0",
        "Accept": "image/webp,image/png,image/jpeg,*/*",
      };

      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        return {
          success: false,
          modelUsed: model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "Pollinations rate limit reached (429 Too Many Requests)",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          modelUsed: model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `Pollinations returned status ${response.status}`,
        };
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("image")) {
        return {
          success: false,
          modelUsed: model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `Pollinations returned non-image response (${contentType})`,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      this.requestsTracked++;

      return {
        success: true,
        imageBase64: base64,
        mimeType: contentType || "image/jpeg",
        modelUsed: model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: this.defaultModel,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Pollinations request failed: ${message}`,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isHealthy = await this.healthCheck();
    return {
      provider: this.name,
      isHealthy,
      latencyMs: 120,
      lastChecked: Date.now(),
      message: isHealthy ? "Online" : "Unreachable or slow",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: Math.max(0, this.estimatedRateLimitRemaining),
      limit: 60,
      unit: "requests/hr",
      isExhausted: false,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0; // Free
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://image.pollinations.ai/prompt/ping?width=64&height=64&nologo=true", {
        method: "HEAD",
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);
      return res !== null && res.status < 500;
    } catch {
      return false;
    }
  }
}
