import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * AI Horde Provider (Free / Community Distributed Network)
 * Implements async job creation, queue polling, queue timeout,
 * and automatic bailing if the queue is too long.
 */
export class AIHordeProvider implements ImageProvider {
  readonly name = "aihorde";
  readonly isFree = true;
  readonly basePriority = 30;

  private apiKey: string;
  private maxQueueWaitSeconds: number = 40;
  private maxQueuePosition: number = 10;

  constructor() {
    this.apiKey = process.env.AI_HORDE_API_KEY || "0000000000"; // 0000000000 is default anonymous key
    this.maxQueueWaitSeconds = Number(process.env.AI_HORDE_MAX_WAIT_SECONDS || 40);
  }

  private calculateDimensions(aspectRatio?: string): { width: number; height: number } {
    // Horde models work best at multiples of 64, standard 512x512 / 768x512
    switch (aspectRatio) {
      case "16:9":
        return { width: 768, height: 448 };
      case "9:16":
        return { width: 448, height: 768 };
      case "4:3":
        return { width: 640, height: 480 };
      case "3:2":
        return { width: 768, height: 512 };
      case "1:1":
      default:
        return { width: 512, height: 512 };
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    const { width, height } = this.calculateDimensions(options.aspectRatio);

    try {
      // 1. Submit async generation job
      const submitPayload = {
        prompt: options.prompt + (options.negativePrompt ? ` ### ${options.negativePrompt}` : ""),
        params: {
          sampler_name: "k_euler_a",
          cfg_scale: 7.5,
          steps: options.steps || 20,
          width,
          height,
        },
        nsfw: false,
        censor_nsfw: true,
        trusted_workers: false,
      };

      const submitRes = await fetch("https://aihorde.net/api/v2/generate/async", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": this.apiKey,
          "Client-Agent": "FreeAISaaS:1.0:admin@local",
        },
        body: JSON.stringify(submitPayload),
      });

      if (!submitRes.ok) {
        const errorText = await submitRes.text().catch(() => "");
        return {
          success: false,
          modelUsed: "aihorde-distributed",
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: `AI Horde job submission failed (${submitRes.status}): ${errorText.slice(0, 100)}`,
        };
      }

      const submitData = await submitRes.json();
      const jobId = submitData.id;
      if (!jobId) {
        return {
          success: false,
          modelUsed: "aihorde-distributed",
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "AI Horde did not return a valid job ID",
        };
      }

      // 2. Poll queue with timeout and queue position check
      let isDone = false;
      const pollStart = Date.now();
      const maxPollTimeMs = 45000;

      while (!isDone && (Date.now() - pollStart) < maxPollTimeMs) {
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const checkRes = await fetch(`https://aihorde.net/api/v2/generate/check/${jobId}`, {
          headers: {
            "apikey": this.apiKey,
            "Client-Agent": "FreeAISaaS:1.0:admin@local",
          },
        });

        if (!checkRes.ok) continue;

        const checkData = await checkRes.json();

        // Check if queue is too long -> fail fast and let router fallback
        if (checkData.wait_time && checkData.wait_time > this.maxQueueWaitSeconds) {
          return {
            success: false,
            modelUsed: "aihorde-distributed",
            provider: this.name,
            latencyMs: Date.now() - startTime,
            costEstimated: 0,
            error: `AI Horde queue too long: wait time estimated at ${checkData.wait_time}s (max ${this.maxQueueWaitSeconds}s). Falling back.`,
          };
        }

        if (checkData.queue_position && checkData.queue_position > this.maxQueuePosition) {
          return {
            success: false,
            modelUsed: "aihorde-distributed",
            provider: this.name,
            latencyMs: Date.now() - startTime,
            costEstimated: 0,
            error: `AI Horde queue position too deep (${checkData.queue_position}). Falling back.`,
          };
        }

        if (checkData.done) {
          isDone = true;
          break;
        }

        if (checkData.is_possible === false) {
          return {
            success: false,
            modelUsed: "aihorde-distributed",
            provider: this.name,
            latencyMs: Date.now() - startTime,
            costEstimated: 0,
            error: "AI Horde reported job cannot be completed by available workers",
          };
        }
      }

      if (!isDone) {
        return {
          success: false,
          modelUsed: "aihorde-distributed",
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "AI Horde generation timed out in queue. Falling back to next provider.",
        };
      }

      // 3. Fetch completed image
      const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${jobId}`, {
        headers: {
          "apikey": this.apiKey,
          "Client-Agent": "FreeAISaaS:1.0:admin@local",
        },
      });

      if (!statusRes.ok) {
        return {
          success: false,
          modelUsed: "aihorde-distributed",
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "Failed to retrieve final image from AI Horde status endpoint",
        };
      }

      const statusData = await statusRes.json();
      const generation = statusData.generations?.[0];
      if (!generation || !generation.img) {
        return {
          success: false,
          modelUsed: "aihorde-distributed",
          provider: this.name,
          latencyMs: Date.now() - startTime,
          costEstimated: 0,
          error: "AI Horde completed job but returned no image",
        };
      }

      // Generation image might be a webp URL or raw base64 string
      let base64 = generation.img;
      if (generation.img.startsWith("http")) {
        const imgFetch = await fetch(generation.img);
        const buffer = await imgFetch.arrayBuffer();
        base64 = Buffer.from(buffer).toString("base64");
      }

      return {
        success: true,
        imageBase64: base64,
        mimeType: "image/webp",
        modelUsed: generation.model || "aihorde-sd",
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: "aihorde-distributed",
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `AI Horde error: ${message}`,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isHealthy = await this.healthCheck();
    return {
      provider: this.name,
      isHealthy,
      latencyMs: 800,
      lastChecked: Date.now(),
      message: isHealthy ? "Community cluster connected" : "Cluster unreachable",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: 9999, // Community distributed kudos/free
      limit: 10000,
      unit: "kudos",
      isExhausted: false,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0; // Free / Kudos
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://aihorde.net/api/v2/status/heartbeat", {
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);
      return res !== null && res.ok;
    } catch {
      return false;
    }
  }
}
