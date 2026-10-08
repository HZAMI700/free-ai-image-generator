import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * Google Gemini API (Imagen 3) Provider
 * Configurable image models through environment variables.
 */
export class GeminiProvider implements ImageProvider {
  readonly name = "gemini";
  readonly isFree = true;
  readonly basePriority = 15;

  private apiKey: string;
  private model: string;
  private requestsToday: number = 0;
  private dailyFreeLimit: number = 50;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-002";
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
        error: "Google Gemini API key (GEMINI_API_KEY) not configured",
      };
    }

    try {
      // Map aspect ratio for Imagen
      const aspectMap: Record<string, string> = {
        "1:1": "1:1",
        "16:9": "16:9",
        "9:16": "9:16",
        "4:3": "4:3",
        "3:2": "3:2",
      };
      const requestedAspect = options.aspectRatio ? (aspectMap[options.aspectRatio] || "1:1") : "1:1";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:predict?key=${this.apiKey}`;
      const payload = {
        instances: [
          {
            prompt: options.prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: requestedAspect,
          outputMimeType: "image/jpeg",
          ...(options.negativePrompt ? { negativePrompt: options.negativePrompt } : {}),
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        return {
          success: false,
          modelUsed: this.model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `Gemini returned ${response.status}: ${errorText.slice(0, 150)}`,
        };
      }

      const data = await response.json();
      const predictions = data.predictions || [];
      if (!predictions.length || !predictions[0]?.bytesBase64Encoded) {
        return {
          success: false,
          modelUsed: this.model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "Gemini did not return image bytes in response",
        };
      }

      this.requestsToday++;

      return {
        success: true,
        imageBase64: predictions[0].bytesBase64Encoded,
        mimeType: predictions[0].mimeType || "image/jpeg",
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Gemini generation error: ${message}`,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isConfigured = Boolean(this.apiKey);
    return {
      provider: this.name,
      isHealthy: isConfigured,
      latencyMs: 0,
      lastChecked: Date.now(),
      message: isConfigured ? "Ready" : "Missing GEMINI_API_KEY",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: Math.max(0, this.dailyFreeLimit - this.requestsToday),
      limit: this.dailyFreeLimit,
      unit: "images",
      isExhausted: this.requestsToday >= this.dailyFreeLimit,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0; // Free tier
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.apiKey);
  }
}
