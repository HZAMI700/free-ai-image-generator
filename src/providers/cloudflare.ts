import {
  ImageProvider,
  ImageGenerationOptions,
  ProviderResponse,
  ProviderStatus,
  ProviderQuota,
  AspectRatio,
} from "./types";

/**
 * Model specification defining parameters accepted by each Cloudflare Workers AI model.
 * Cloudflare returns strict 400 Bad Request errors if unsupported keys are sent.
 */
export interface CloudflareModelSpec {
  id: string;
  name: string;
  supportsNegativePrompt: boolean;
  supportsDimensions: boolean;
  supportsSteps: boolean;
  stepsParamName?: "steps" | "num_steps";
  defaultSteps?: number;
  maxSteps?: number;
  supportsGuidance: boolean;
  supportsSeed: boolean;
  neuronWeight: number; // Cost in Cloudflare Neurons per generation
}

/**
 * Registry of well-known Cloudflare Workers AI Image Generation models.
 */
export const CLOUDFLARE_SUPPORTED_MODELS: Record<string, CloudflareModelSpec> = {
  "@cf/black-forest-labs/flux-1-schnell": {
    id: "@cf/black-forest-labs/flux-1-schnell",
    name: "FLUX.1-schnell",
    supportsNegativePrompt: false,
    supportsDimensions: false,
    supportsSteps: true,
    stepsParamName: "steps",
    defaultSteps: 4,
    maxSteps: 8,
    supportsGuidance: false,
    supportsSeed: false,
    neuronWeight: 2000,
  },
  "@cf/bytedance/stable-diffusion-xl-lightning": {
    id: "@cf/bytedance/stable-diffusion-xl-lightning",
    name: "SDXL Lightning",
    supportsNegativePrompt: true,
    supportsDimensions: true,
    supportsSteps: true,
    stepsParamName: "num_steps",
    defaultSteps: 4,
    maxSteps: 20,
    supportsGuidance: true,
    supportsSeed: true,
    neuronWeight: 1000,
  },
  "@cf/stabilityai/stable-diffusion-xl-base-1.0": {
    id: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    name: "SDXL Base 1.0",
    supportsNegativePrompt: true,
    supportsDimensions: true,
    supportsSteps: true,
    stepsParamName: "num_steps",
    defaultSteps: 20,
    maxSteps: 20,
    supportsGuidance: true,
    supportsSeed: true,
    neuronWeight: 1500,
  },
  "@cf/lykon/dreamshaper-8-lcm": {
    id: "@cf/lykon/dreamshaper-8-lcm",
    name: "DreamShaper 8 LCM",
    supportsNegativePrompt: true,
    supportsDimensions: true,
    supportsSteps: true,
    stepsParamName: "num_steps",
    defaultSteps: 8,
    maxSteps: 12,
    supportsGuidance: true,
    supportsSeed: true,
    neuronWeight: 800,
  },
};

/**
 * Dynamic Provider/Model configuration layer.
 */
export function getCloudflareConfig() {
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const apiToken = (process.env.CLOUDFLARE_API_TOKEN || "").trim();
  const model = (
    process.env.CLOUDFLARE_IMAGE_MODEL ||
    process.env.CLOUDFLARE_AI_MODEL ||
    "@cf/black-forest-labs/flux-1-schnell"
  ).trim();
  const dailyNeuronLimit = Number(process.env.CLOUDFLARE_DAILY_NEURONS || 10000);

  return {
    provider: "cloudflare" as const,
    accountId,
    apiToken,
    model,
    dailyNeuronLimit,
    isConfigured: Boolean(accountId && apiToken),
  };
}

/**
 * Aspect Ratio to Pixel Dimensions (max 1024x1024 for standard SDXL models)
 */
function getDimensionsFromAspectRatio(ratio?: AspectRatio): { width: number; height: number } {
  switch (ratio) {
    case "16:9":
      return { width: 1024, height: 576 };
    case "9:16":
      return { width: 576, height: 1024 };
    case "4:3":
      return { width: 1024, height: 768 };
    case "3:4":
      return { width: 768, height: 1024 };
    case "3:2":
      return { width: 1024, height: 680 };
    case "1:1":
    default:
      return { width: 1024, height: 1024 };
  }
}

/**
 * Cloudflare Workers AI Provider
 * Fully implements the official Cloudflare Workers AI REST API:
 * POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL_NAME}
 */
export class CloudflareProvider implements ImageProvider {
  readonly name = "cloudflare";
  readonly isFree = true;
  readonly basePriority = 1; // Highest priority provider when configured

  private neuronsUsedToday: number = 0;
  private lastResetDay: number = new Date().getUTCDate();

  constructor() {
    this.checkDailyNeuronReset();
  }

  private checkDailyNeuronReset(): void {
    const today = new Date().getUTCDate();
    if (today !== this.lastResetDay) {
      this.neuronsUsedToday = 0;
      this.lastResetDay = today;
    }
  }

  /**
   * Retrieves current model specification or constructs a safe default for unknown models.
   */
  private getModelSpec(modelId: string): CloudflareModelSpec {
    if (CLOUDFLARE_SUPPORTED_MODELS[modelId]) {
      return CLOUDFLARE_SUPPORTED_MODELS[modelId];
    }

    // Default heuristic for unknown/newly-added models
    const isFlux = modelId.toLowerCase().includes("flux");
    return {
      id: modelId,
      name: modelId.split("/").pop() || modelId,
      supportsNegativePrompt: !isFlux,
      supportsDimensions: !isFlux,
      supportsSteps: true,
      stepsParamName: isFlux ? "steps" : "num_steps",
      defaultSteps: isFlux ? 4 : 8,
      maxSteps: isFlux ? 8 : 20,
      supportsGuidance: !isFlux,
      supportsSeed: !isFlux,
      neuronWeight: isFlux ? 22000 : 10000,
    };
  }

  /**
   * Builds a strictly validated request payload adhering only to properties supported by the active model.
   */
  private buildPayload(spec: CloudflareModelSpec, options: ImageGenerationOptions): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      prompt: options.prompt.trim(),
    };

    // 1. Negative Prompt
    if (spec.supportsNegativePrompt && options.negativePrompt?.trim()) {
      payload.negative_prompt = options.negativePrompt.trim();
    }

    // 2. Width and Height
    if (spec.supportsDimensions) {
      if (options.width && options.height) {
        payload.width = Math.min(1024, Math.max(256, options.width));
        payload.height = Math.min(1024, Math.max(256, options.height));
      } else if (options.aspectRatio) {
        const dims = getDimensionsFromAspectRatio(options.aspectRatio);
        payload.width = dims.width;
        payload.height = dims.height;
      }
    }

    // 3. Steps
    if (spec.supportsSteps && spec.stepsParamName) {
      const requestedSteps = options.steps ?? spec.defaultSteps;
      if (requestedSteps !== undefined) {
        const clampedSteps = Math.min(spec.maxSteps || 20, Math.max(1, requestedSteps));
        payload[spec.stepsParamName] = clampedSteps;
      }
    }

    // 4. Seed
    if (spec.supportsSeed && typeof options.seed === "number") {
      payload.seed = options.seed;
    }

    return payload;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    const config = getCloudflareConfig();

    // 1. Verify Configuration
    if (!config.accountId || !config.apiToken) {
      return {
        success: false,
        errorCode: "AUTHENTICATION_ERROR",
        error: "Cloudflare Workers AI credentials (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN) not configured.",
        provider: this.name,
        modelUsed: config.model,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    }

    // 2. Neuron Quota Check
    this.checkDailyNeuronReset();
    const activeModel = (options.preferredModel && options.preferredModel.startsWith("@cf/"))
      ? options.preferredModel
      : config.model;
    const spec = this.getModelSpec(activeModel);
    if (config.dailyNeuronLimit > 0 && this.neuronsUsedToday >= config.dailyNeuronLimit) {
      return {
        success: false,
        errorCode: "QUOTA_EXHAUSTED",
        error: `Daily Cloudflare neuron limit reached (${this.neuronsUsedToday}/${config.dailyNeuronLimit} neurons).`,
        provider: this.name,
        modelUsed: activeModel,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    }

    // 3. Prepare Payload
    const payload = this.buildPayload(spec, options);
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${activeModel}`;

    // 4. Execute REST API with timeout controller
    const controller = new AbortController();
    const timeoutSeconds = 45;
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 5. Handle HTTP Errors cleanly
      if (!response.ok) {
        const status = response.status;
        const rawBody = await response.text().catch(() => "");
        let cleanErrorCode = "PROVIDER_TEMPORARILY_UNAVAILABLE";
        let cleanMessage = "Image generation is temporarily busy. Please try again.";

        if (status === 401 || status === 403) {
          cleanErrorCode = "AUTHENTICATION_ERROR";
          cleanMessage = "Cloudflare Workers AI authentication failed. Please check your API token.";
        } else if (status === 404) {
          cleanErrorCode = "INVALID_MODEL";
          cleanMessage = `The Cloudflare AI model "${config.model}" was not found or is unavailable.`;
        } else if (status === 400) {
          cleanErrorCode = "INVALID_PARAMETERS";
          cleanMessage = "Invalid image parameters for the selected Cloudflare model.";
        } else if (status === 429) {
          cleanErrorCode = "RATE_LIMIT_EXCEEDED";
          cleanMessage = "Cloudflare Workers AI rate limit exceeded. Please try again shortly.";
        } else if (status >= 500) {
          cleanErrorCode = "PROVIDER_TEMPORARILY_UNAVAILABLE";
          cleanMessage = "Cloudflare Workers AI is temporarily unavailable. Switching to fallback provider.";
        }

        console.warn(`[CloudflareProvider] HTTP ${status} error: ${rawBody.slice(0, 200)}`);

        return {
          success: false,
          errorCode: cleanErrorCode,
          error: cleanMessage,
          provider: this.name,
          modelUsed: config.model,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
        };
      }

      // 6. Handle Successful Response (JSON vs Binary)
      const contentType = response.headers.get("content-type") || "";
      let base64Image = "";
      let mimeType = "image/png";

      if (contentType.includes("application/json")) {
        const json = await response.json();

        // Check for Cloudflare envelope error in JSON
        if (json.success === false || json.errors?.length > 0) {
          const firstErr = json.errors?.[0]?.message || "Cloudflare returned an error";
          return {
            success: false,
            errorCode: "PROVIDER_TEMPORARILY_UNAVAILABLE",
            error: firstErr,
            provider: this.name,
            modelUsed: config.model,
            latencyMs: Date.now() - startTime,
            costEstimated: 0,
          };
        }

        // Extract base64 image from result
        const rawImage = json.result?.image || json.result?.output || "";
        if (!rawImage || typeof rawImage !== "string") {
          return {
            success: false,
            errorCode: "INVALID_RESPONSE",
            error: "Cloudflare Workers AI did not return image data.",
            provider: this.name,
            modelUsed: config.model,
            latencyMs: Date.now() - startTime,
            costEstimated: 0,
          };
        }

        // Clean base64 if it has data URL prefix
        if (rawImage.startsWith("data:")) {
          const parts = rawImage.split(",");
          const mimeMatch = parts[0].match(/data:(.*?);base64/);
          if (mimeMatch) mimeType = mimeMatch[1];
          base64Image = parts[1] || "";
        } else {
          base64Image = rawImage;
          mimeType = "image/jpeg";
        }
      } else {
        // Direct Binary PNG / JPEG response (SDXL Lightning, etc.)
        const arrayBuffer = await response.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString("base64");
        mimeType = contentType.split(";")[0] || "image/png";
      }

      // Record neuron consumption
      this.neuronsUsedToday += spec.neuronWeight;

      return {
        success: true,
        imageBase64: base64Image,
        mimeType,
        modelUsed: config.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0, // Free tier neurons
        quotaUsed: spec.neuronWeight,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const latencyMs = Date.now() - startTime;

      return {
        success: false,
        errorCode: isAbort ? "PROVIDER_TIMEOUT" : "PROVIDER_TEMPORARILY_UNAVAILABLE",
        error: isAbort
          ? "Cloudflare Workers AI request timed out. Trying fallback provider."
          : "Could not connect to Cloudflare Workers AI.",
        provider: this.name,
        modelUsed: config.model,
        latencyMs,
        costEstimated: 0,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const config = getCloudflareConfig();
    return {
      provider: this.name,
      isHealthy: config.isConfigured,
      latencyMs: 0,
      lastChecked: Date.now(),
      message: config.isConfigured
        ? `Ready (${specName(config.model)})`
        : "Missing Cloudflare credentials",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    const config = getCloudflareConfig();
    this.checkDailyNeuronReset();
    const remaining = Math.max(0, config.dailyNeuronLimit - this.neuronsUsedToday);

    return {
      provider: this.name,
      remaining,
      limit: config.dailyNeuronLimit,
      unit: "neurons",
      isExhausted: config.dailyNeuronLimit > 0 && remaining <= 0,
    };
  }

  estimateCost(_options: ImageGenerationOptions): number {
    return 0; // Free within daily neuron allocation
  }

  async healthCheck(): Promise<boolean> {
    const config = getCloudflareConfig();
    if (!config.accountId || !config.apiToken) return false;

    // Fast probe to verify token validity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
        headers: {
          "Authorization": `Bearer ${config.apiToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) return false;
      const json = await res.json().catch(() => null);
      return json?.success === true && json?.result?.status === "active";
    } catch {
      return false;
    }
  }
}

function specName(model: string): string {
  const match = CLOUDFLARE_SUPPORTED_MODELS[model];
  return match ? match.name : model.split("/").pop() || model;
}
