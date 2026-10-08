import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * Replicate Provider
 * Paid fallback provider for models like FLUX Schnell or SDXL.
 */
export class ReplicateProvider implements ImageProvider {
  readonly name = "replicate";
  readonly isFree = false;
  readonly basePriority = 90; // Secondary paid fallback

  private apiToken: string;
  private versionId: string;

  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN || "";
    // Default to Black Forest Labs Flux Schnell model on Replicate
    this.versionId = process.env.REPLICATE_MODEL_VERSION || "black-forest-labs/flux-schnell";
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();

    if (!this.apiToken) {
      return {
        success: false,
        modelUsed: this.versionId,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: "Replicate API token (REPLICATE_API_TOKEN) not configured",
      };
    }

    try {
      // 1. Create prediction
      const createRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          "Prefer": "wait=25",
        },
        body: JSON.stringify({
          input: {
            prompt: options.prompt,
            aspect_ratio: options.aspectRatio || "1:1",
            num_outputs: 1,
            output_format: "webp",
          },
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text().catch(() => "");
        return {
          success: false,
          modelUsed: this.versionId,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `Replicate returned ${createRes.status}: ${errText.slice(0, 100)}`,
        };
      }

      let prediction = await createRes.json();

      // If prediction is still processing, poll
      const pollStart = Date.now();
      while (["starting", "processing"].includes(prediction.status) && (Date.now() - pollStart) < 30000) {
        await new Promise((r) => setTimeout(r, 1500));
        const pollRes = await fetch(prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
          },
        });
        if (pollRes.ok) {
          prediction = await pollRes.json();
        }
      }

      if (prediction.status !== "succeeded" || !prediction.output) {
        return {
          success: false,
          modelUsed: this.versionId,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `Replicate prediction did not succeed: ${prediction.error || prediction.status}`,
        };
      }

      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imgRes.headers.get("content-type") || "image/webp";

      return {
        success: true,
        imageUrl,
        imageBase64: base64,
        mimeType,
        modelUsed: this.versionId,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: this.estimateCost(options),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: this.versionId,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Replicate generation error: ${message}`,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isConfigured = Boolean(this.apiToken);
    return {
      provider: this.name,
      isHealthy: isConfigured,
      latencyMs: 200,
      lastChecked: Date.now(),
      message: isConfigured ? "Ready (Paid fallback)" : "Missing REPLICATE_API_TOKEN",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: this.apiToken ? 50 : 0,
      limit: 50,
      unit: "predictions",
      isExhausted: !this.apiToken,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0.003;
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.apiToken);
  }
}
