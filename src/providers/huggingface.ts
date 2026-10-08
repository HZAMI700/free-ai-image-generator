import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * Hugging Face Provider
 * Uses Serverless Inference API with configurable models.
 */
export class HuggingFaceProvider implements ImageProvider {
  readonly name = "huggingface";
  readonly isFree = true;
  readonly basePriority = 25;

  private apiToken: string;
  private model: string;

  constructor() {
    this.apiToken = process.env.HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY || "";
    this.model = process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      const endpoints = [
        `https://router.huggingface.co/hf-inference/models/${this.model}`,
        `https://api-inference.huggingface.co/models/${this.model}`,
      ];

      const payload: Record<string, unknown> = {
        inputs: options.prompt,
        parameters: {
          negative_prompt: options.negativePrompt,
          num_inference_steps: options.steps || 25,
          guidance_scale: 7.5,
        },
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.apiToken) {
        headers["Authorization"] = `Bearer ${this.apiToken}`;
      }

      let lastError = "";

      for (const url of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000);

          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.status === 503) {
            const data = await response.json().catch(() => ({}));
            lastError = `Hugging Face model loading (${data.estimated_time || 20}s wait)`;
            continue;
          }

          if (response.status === 429) {
            return {
              success: false,
              modelUsed: this.model,
              provider: this.name,
              latencyMs: Date.now() - startTime,
              costEstimated: 0,
              error: "Hugging Face rate limit exceeded (429)",
            };
          }

          if (!response.ok) {
            const text = await response.text().catch(() => "");
            lastError = `Status ${response.status}: ${text.slice(0, 100)}`;
            continue;
          }

          const contentType = response.headers.get("content-type") || "image/jpeg";
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");

          return {
            success: true,
            imageBase64: base64,
            mimeType: contentType,
            modelUsed: this.model,
            provider: this.name,
            latencyMs: Date.now() - startTime,
            costEstimated: 0,
          };
        } catch (innerErr: unknown) {
          lastError = innerErr instanceof Error ? innerErr.message : String(innerErr);
        }
      }

      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Hugging Face failed: ${lastError || "Endpoints unreachable"}`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Hugging Face generation error: ${message}`,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isHealthy = Boolean(this.apiToken) || (await this.healthCheck());
    return {
      provider: this.name,
      isHealthy,
      latencyMs: 300,
      lastChecked: Date.now(),
      message: isHealthy ? `Active (${this.model})` : "Unconfigured / unreachable",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: this.apiToken ? 500 : 30,
      limit: this.apiToken ? 1000 : 50,
      unit: "requests/day",
      isExhausted: false,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0; // Free / Included community tier
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://huggingface.co/api/models/${this.model}`, {
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
