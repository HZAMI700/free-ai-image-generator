import {
  ImageProvider,
  ImageGenerationOptions,
  ProviderResponse,
  ProviderStatus,
  ProviderQuota,
} from "./types";
import { InferenceClient } from "@huggingface/inference";

/**
 * Hugging Face Provider
 * Uses official Hugging Face Inference Client & Router APIs with dynamic model configuration.
 */
export class HuggingFaceProvider implements ImageProvider {
  readonly name = "huggingface";
  readonly isFree = true;
  readonly basePriority = 15; // Placed after Cloudflare in free tiers

  private get apiToken(): string {
    return (process.env.HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY || "").trim();
  }

  private get model(): string {
    return (process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell").trim();
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    const token = this.apiToken;
    const model = this.model;

    if (!token) {
      return {
        success: false,
        errorCode: "AUTHENTICATION_ERROR",
        error: "Hugging Face API token (HF_API_TOKEN) not configured.",
        provider: this.name,
        modelUsed: model,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    }

    // 1. Primary Strategy: Use official @huggingface/inference InferenceClient
    try {
      const client = new InferenceClient(token);

      const blob = await client.textToImage({
        model,
        inputs: options.prompt.trim(),
        parameters: options.negativePrompt
          ? {
              negative_prompt: options.negativePrompt.trim(),
            }
          : undefined,
      });

      if (typeof blob === "string" && blob.length > 0) {
        const base64 = blob.startsWith("data:") ? blob.split(",")[1] : blob;
        return {
          success: true,
          imageBase64: base64,
          mimeType: "image/jpeg",
          modelUsed: model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
        };
      }

      if (blob && typeof blob === "object" && "arrayBuffer" in blob) {
        const arrayBuffer = await (blob as unknown as Blob).arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = (blob as unknown as { type?: string }).type || "image/jpeg";

        return {
          success: true,
          imageBase64: base64,
          mimeType,
          modelUsed: model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
        };
      }
    } catch (sdkError: unknown) {
      const errMsg = sdkError instanceof Error ? sdkError.message : String(sdkError);
      console.warn(`[HuggingFaceProvider] SDK attempt failed: ${errMsg}`);

      // Handle known Hugging Face specific scenarios
      if (errMsg.includes("no remaining credits") || errMsg.includes("402")) {
        return {
          success: false,
          errorCode: "QUOTA_EXHAUSTED",
          error: "Hugging Face account has no remaining credits. Switching to fallback provider.",
          provider: this.name,
          modelUsed: model,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
        };
      }

      if (errMsg.includes("rate limit") || errMsg.includes("429")) {
        return {
          success: false,
          errorCode: "RATE_LIMIT_EXCEEDED",
          error: "Hugging Face rate limit reached. Switching to fallback provider.",
          provider: this.name,
          modelUsed: model,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
        };
      }
    }

    // 2. Secondary Strategy: Direct Router HTTP call
    try {
      const routerUrl = `https://router.huggingface.co/hf-inference/models/${model}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(routerUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: options.prompt.trim(),
          parameters: options.negativePrompt
            ? { negative_prompt: options.negativePrompt.trim() }
            : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        return {
          success: true,
          imageBase64: base64,
          mimeType: contentType,
          modelUsed: model,
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
        };
      }

      const status = response.status;
      const rawText = await response.text().catch(() => "");
      console.warn(`[HuggingFaceProvider] HTTP ${status} error: ${rawText.slice(0, 150)}`);

      let cleanCode = "PROVIDER_TEMPORARILY_UNAVAILABLE";
      let cleanMsg = "Hugging Face image generation is currently busy.";

      if (status === 401 || status === 403) {
        cleanCode = "AUTHENTICATION_ERROR";
        cleanMsg = "Hugging Face API token authentication failed.";
      } else if (status === 429) {
        cleanCode = "RATE_LIMIT_EXCEEDED";
        cleanMsg = "Hugging Face rate limit exceeded. Please wait a moment.";
      } else if (status === 503) {
        cleanCode = "MODEL_LOADING";
        cleanMsg = "Hugging Face model is currently loading into memory.";
      }

      return {
        success: false,
        errorCode: cleanCode,
        error: cleanMsg,
        provider: this.name,
        modelUsed: model,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        errorCode: "PROVIDER_TEMPORARILY_UNAVAILABLE",
        error: `Hugging Face generation service unreachable: ${message}`,
        provider: this.name,
        modelUsed: model,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isConfigured = Boolean(this.apiToken);
    return {
      provider: this.name,
      isHealthy: isConfigured,
      latencyMs: 350,
      lastChecked: Date.now(),
      message: isConfigured ? `Configured (${this.model})` : "Missing HF_API_TOKEN",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: this.apiToken ? 500 : 0,
      limit: 1000,
      unit: "requests/day",
      isExhausted: !this.apiToken,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0; // Free / included tier
  }

  async healthCheck(): Promise<boolean> {
    const token = this.apiToken;
    if (!token) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch("https://huggingface.co/api/whoami-v2", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }
}
