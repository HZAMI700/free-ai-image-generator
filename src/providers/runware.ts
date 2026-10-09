import {
  ImageProvider,
  ImageGenerationOptions,
  ProviderResponse,
  ProviderStatus,
  ProviderQuota,
  AspectRatio,
} from "./types";
import { randomUUID } from "crypto";

export interface RunwareModelDefinition {
  id: string; // AIR identifier (e.g. "runware:100@1")
  name: string;
  architecture: "flux" | "sdxl" | "sd1x";
  defaultWidth: number;
  defaultHeight: number;
  supportsNegativePrompt: boolean;
}

export const RUNWARE_MODELS: Record<string, RunwareModelDefinition> = {
  "runware:100@1": {
    id: "runware:100@1",
    name: "FLUX.1 [schnell]",
    architecture: "flux",
    defaultWidth: 1024,
    defaultHeight: 1024,
    supportsNegativePrompt: false,
  },
  "runware:101@1": {
    id: "runware:101@1",
    name: "FLUX.1 [dev]",
    architecture: "flux",
    defaultWidth: 1024,
    defaultHeight: 1024,
    supportsNegativePrompt: false,
  },
  "rundiffusion:110@101": {
    id: "rundiffusion:110@101",
    name: "Juggernaut Lightning Flux",
    architecture: "flux",
    defaultWidth: 1024,
    defaultHeight: 1024,
    supportsNegativePrompt: true,
  },
  "rundiffusion:130@100": {
    id: "rundiffusion:130@100",
    name: "Juggernaut Pro Flux",
    architecture: "flux",
    defaultWidth: 1024,
    defaultHeight: 1024,
    supportsNegativePrompt: true,
  },
  "civitai:156061@179087": {
    id: "civitai:156061@179087",
    name: "Devlish PhotoRealism SDXL",
    architecture: "sdxl",
    defaultWidth: 1024,
    defaultHeight: 1024,
    supportsNegativePrompt: true,
  },
  "civitai:260267@293564": {
    id: "civitai:260267@293564",
    name: "Animagine XL 3.1",
    architecture: "sdxl",
    defaultWidth: 1024,
    defaultHeight: 1024,
    supportsNegativePrompt: true,
  },
  "civitai:25694@143906": {
    id: "civitai:25694@143906",
    name: "EpicRealism",
    architecture: "sd1x",
    defaultWidth: 768,
    defaultHeight: 768,
    supportsNegativePrompt: true,
  },
  "civitai:4384@128713": {
    id: "civitai:4384@128713",
    name: "DreamShaper 8",
    architecture: "sd1x",
    defaultWidth: 768,
    defaultHeight: 768,
    supportsNegativePrompt: true,
  },
};

export class RunwareProvider implements ImageProvider {
  readonly name = "runware";
  readonly isFree = true;
  readonly basePriority = 0; // Highest priority

  private getApiKey(): string {
    return (process.env.RUNWARE_API_KEY || "hhyXv8xj17f7WPAB62Yq7MezdTmLj4EZ").trim();
  }

  private getDefaultModel(): string {
    return (process.env.RUNWARE_DEFAULT_MODEL || "runware:100@1").trim();
  }

  /**
   * Resolves dimension according to aspect ratio and model architecture.
   * Dimensions must be multiples of 64.
   */
  private resolveDimensions(
    aspectRatio?: AspectRatio,
    architecture: "flux" | "sdxl" | "sd1x" = "flux"
  ): { width: number; height: number } {
    if (architecture === "sd1x") {
      switch (aspectRatio) {
        case "16:9":
          return { width: 896, height: 512 };
        case "9:16":
          return { width: 512, height: 896 };
        case "4:3":
          return { width: 768, height: 576 };
        case "3:4":
          return { width: 576, height: 768 };
        case "3:2":
          return { width: 768, height: 512 };
        case "1:1":
        default:
          return { width: 512, height: 512 };
      }
    }

    // High resolution for FLUX & SDXL (1024px baseline, multiples of 64)
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
        return { width: 1024, height: 640 };
      case "1:1":
      default:
        return { width: 1024, height: 1024 };
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        success: false,
        provider: this.name,
        modelUsed: "none",
        latencyMs: 0,
        costEstimated: 0,
        error: "RUNWARE_API_KEY is not configured",
        errorCode: "AUTH_CONFIG_MISSING",
      };
    }

    // Select model AIR identifier
    const targetModel = (options.preferredModel || this.getDefaultModel()).trim();
    const modelSpec = RUNWARE_MODELS[targetModel];
    const architecture = modelSpec?.architecture || "flux";

    const { width, height } = this.resolveDimensions(options.aspectRatio, architecture);

    const taskPayload: Record<string, unknown> = {
      taskType: "imageInference",
      taskUUID: randomUUID(),
      model: targetModel,
      positivePrompt: options.prompt,
      width,
      height,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "JPEG",
    };

    if (options.seed && Number.isInteger(options.seed)) {
      taskPayload.seed = options.seed;
    }

    if (
      options.negativePrompt &&
      options.negativePrompt.trim() &&
      (!modelSpec || modelSpec.supportsNegativePrompt)
    ) {
      taskPayload.negativePrompt = options.negativePrompt.trim();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch("https://api.runware.ai/v1", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([taskPayload]),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        let errorMsg = `Runware API returned HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.errors && parsed.errors.length > 0) {
            errorMsg = parsed.errors[0].message || errorMsg;
          } else if (parsed.errorMessage) {
            errorMsg = parsed.errorMessage;
          }
        } catch {
          if (errorText) errorMsg += `: ${errorText.slice(0, 200)}`;
        }

        // If a specific submodel errors, gracefully fallback to FLUX.1 schnell within Runware
        if (targetModel !== "runware:100@1") {
          console.warn(`[Runware] Model ${targetModel} returned status ${response.status}. Falling back to FLUX.1 [schnell]...`);
          return this.generateImage({
            ...options,
            preferredModel: "runware:100@1",
          });
        }

        return {
          success: false,
          provider: this.name,
          modelUsed: targetModel,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: errorMsg,
          errorCode: `HTTP_${response.status}`,
        };
      }

      const json = await response.json();

      if (json.errors && json.errors.length > 0) {
        if (targetModel !== "runware:100@1") {
          console.warn(`[Runware] Model ${targetModel} returned error: ${json.errors[0].message}. Falling back to FLUX.1 [schnell]...`);
          return this.generateImage({
            ...options,
            preferredModel: "runware:100@1",
          });
        }

        return {
          success: false,
          provider: this.name,
          modelUsed: targetModel,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: json.errors[0].message || "Runware inference error",
          errorCode: "INFERENCE_ERROR",
        };
      }

      const imageTask = json.data?.find(
        (t: { taskType: string }) => t.taskType === "imageInference"
      ) || json.data?.[0];

      if (!imageTask || !imageTask.imageURL) {
        if (targetModel !== "runware:100@1") {
          console.warn(`[Runware] No image URL for ${targetModel}. Falling back to FLUX.1 [schnell]...`);
          return this.generateImage({
            ...options,
            preferredModel: "runware:100@1",
          });
        }

        return {
          success: false,
          provider: this.name,
          modelUsed: targetModel,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "Runware response did not include a valid image URL",
          errorCode: "NO_IMAGE_DATA",
        };
      }

      const imageUrl = imageTask.imageURL;

      // Download image and convert to data URI for robust local storage & client caching
      let imageBase64: string | undefined = undefined;
      try {
        const imgFetch = await fetch(imageUrl);
        if (imgFetch.ok) {
          const arrayBuffer = await imgFetch.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mime = imgFetch.headers.get("content-type") || "image/jpeg";
          imageBase64 = `data:${mime};base64,${buffer.toString("base64")}`;
        }
      } catch (err) {
        console.warn("[Runware] Could not convert image to base64, returning URL directly:", err);
      }

      const latency = Date.now() - startTime;

      return {
        success: true,
        imageUrl,
        imageBase64: imageBase64 || imageUrl,
        mimeType: "image/jpeg",
        modelUsed: targetModel,
        provider: this.name,
        latencyMs: latency,
        costEstimated: this.estimateCost(options),
        metadata: {
          imageUUID: imageTask.imageUUID,
          seed: imageTask.seed,
          model: targetModel,
          dimensions: `${width}x${height}`,
        },
      };
    } catch (err: unknown) {
      const isAbort = (err as Error)?.name === "AbortError";
      return {
        success: false,
        provider: this.name,
        modelUsed: targetModel,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: isAbort ? "Runware generation timed out after 45 seconds" : ((err as Error)?.message || "Unknown Runware network error"),
        errorCode: isAbort ? "TIMEOUT" : "NETWORK_ERROR",
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const hasKey = Boolean(this.getApiKey());
    return {
      provider: this.name,
      isHealthy: hasKey,
      latencyMs: 1500,
      lastChecked: Date.now(),
      message: hasKey ? "Ready" : "RUNWARE_API_KEY not configured",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: 999999,
      limit: 1000000,
      unit: "images",
      isExhausted: false,
    };
  }

  estimateCost(_options: ImageGenerationOptions): number {
    return 0.001;
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.getApiKey());
  }
}
