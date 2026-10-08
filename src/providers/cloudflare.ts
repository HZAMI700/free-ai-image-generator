import { ImageProvider, ImageGenerationOptions, ProviderResponse, ProviderStatus, ProviderQuota } from "./types";

/**
 * Cloudflare Workers AI Provider
 * Uses Cloudflare Workers AI REST API.
 * Free tier gives 10,000 daily neurons on standard accounts, and model cost varies by neurons.
 */
export class CloudflareProvider implements ImageProvider {
  readonly name = "cloudflare";
  readonly isFree = true;
  readonly basePriority = 10; // High priority for free tier

  private accountId: string;
  private apiToken: string;
  private model: string;
  private neuronsUsedToday: number = 0;
  private dailyNeuronLimit: number = 10000;

  // Neuron pricing / consumption per model according to Cloudflare docs
  private modelNeuronWeights: Record<string, number> = {
    "@cf/black-forest-labs/flux-1-schnell": 22000,
    "@cf/stabilityai/stable-diffusion-xl-base-1.0": 14000,
    "@cf/bytedance/stable-diffusion-xl-lightning": 7000,
    "@cf/lykon/dreamshaper-8-lcm": 5000,
  };

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
    this.model = process.env.CLOUDFLARE_AI_MODEL || "@cf/stabilityai/stable-diffusion-xl-base-1.0";
    this.dailyNeuronLimit = Number(process.env.CLOUDFLARE_DAILY_NEURONS || 10000);
  }

  private getNeuronCost(model: string): number {
    return this.modelNeuronWeights[model] || 14000;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const startTime = Date.now();

    if (!this.accountId || !this.apiToken) {
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: "Cloudflare Workers AI credentials (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN) not configured",
      };
    }

    const neuronCost = this.getNeuronCost(this.model);
    if (this.neuronsUsedToday + neuronCost > this.dailyNeuronLimit) {
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Cloudflare neuron limit reached (${this.neuronsUsedToday}/${this.dailyNeuronLimit} neurons used)`,
      };
    }

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`;
      const payload: Record<string, unknown> = {
        prompt: options.prompt,
      };

      if (options.negativePrompt) {
        payload.negative_prompt = options.negativePrompt;
      }
      if (options.steps) {
        payload.num_steps = options.steps;
      }
      if (options.seed) {
        payload.seed = options.seed;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
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
          error: `Cloudflare Workers AI returned ${response.status}: ${errorText.slice(0, 150)}`,
        };
      }

      const contentType = response.headers.get("content-type") || "image/png";
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      this.neuronsUsedToday += neuronCost;

      return {
        success: true,
        imageBase64: base64,
        mimeType: contentType,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0, // Free tier neurons
        quotaUsed: neuronCost,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        modelUsed: this.model,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        costEstimated: 0,
        error: `Cloudflare generation error: ${message}`,
      };
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isConfigured = Boolean(this.accountId && this.apiToken);
    return {
      provider: this.name,
      isHealthy: isConfigured,
      latencyMs: 0,
      lastChecked: Date.now(),
      message: isConfigured ? "Ready (Neurons tracked)" : "Missing credentials",
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      provider: this.name,
      remaining: Math.max(0, this.dailyNeuronLimit - this.neuronsUsedToday),
      limit: this.dailyNeuronLimit,
      unit: "neurons",
      isExhausted: this.neuronsUsedToday >= this.dailyNeuronLimit,
    };
  }

  estimateCost(_options?: ImageGenerationOptions): number {
    return 0; // Free within daily neuron budget
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.accountId && this.apiToken);
  }
}
