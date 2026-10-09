import { ImageProvider, ImageGenerationOptions, ProviderResponse } from "../providers/types";
import { RunwareProvider } from "../providers/runware";
import { CloudflareProvider } from "../providers/cloudflare";
import { GeminiProvider } from "../providers/gemini";
import { PollinationsProvider } from "../providers/pollinations";
import { AIHordeProvider } from "../providers/aihorde";
import { HuggingFaceProvider } from "../providers/huggingface";
import { FalProvider } from "../providers/fal";
import { ReplicateProvider } from "../providers/replicate";
import { healthChecker } from "./health-checker";
import { quotaManager } from "./quota-manager";
import { fallbackManager } from "./fallback-manager";

export interface ProviderScoreDetail {
  provider: string;
  score: number;
  isFree: boolean;
  isHealthy: boolean;
  costEstimated: number;
  quotaRemaining: number;
  reason: string;
}

export class ProviderRouter {
  private providers: ImageProvider[] = [];

  constructor() {
    // Register all providers in modular architecture with Runware prioritized
    this.providers = [
      new RunwareProvider(),
      new CloudflareProvider(),
      new GeminiProvider(),
      new PollinationsProvider(),
      new AIHordeProvider(),
      new HuggingFaceProvider(),
      new FalProvider(),
      new ReplicateProvider(),
    ];
  }

  getProviders(): ImageProvider[] {
    return this.providers;
  }

  getProviderByName(name: string): ImageProvider | undefined {
    return this.providers.find((p) => p.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Calculates dynamic Intelligent Provider Score:
   * Score = Availability + FreeQuotaBonus - CostPenalty - LatencyPenalty + Reliability
   */
  async calculateScore(provider: ImageProvider, options: ImageGenerationOptions): Promise<ProviderScoreDetail> {
    const isHealthy = healthChecker.isProviderHealthy(provider.name);
    const healthRecord = healthChecker.getHealthRecord(provider.name);
    const quota = await quotaManager.checkQuota(provider);
    const estimatedCost = quotaManager.getCostEstimate(provider, options);

    let score = 100;
    const reasons: string[] = [];

    // 1. Health & Availability (Heaviest filter)
    const status = await provider.getStatus();
    if (!isHealthy || !status.isHealthy) {
      score -= 800;
      reasons.push("Unhealthy or unconfigured");
    } else {
      score += 150;
    }

    // 2. Free Tier & Cloudflare Primary Priority
    if (provider.isFree) {
      score += 300;
      reasons.push("Free provider");
    } else {
      score -= 100; // Paid provider lower priority
      reasons.push(`Paid ($${estimatedCost}/img)`);
    }

    // Runware AI primary priority boost when configured
    if (provider.name === "runware" && status.isHealthy) {
      score += 400;
      reasons.push("Primary Runware engine");
    }

    // Official Cloudflare Workers AI priority boost when configured
    if (provider.name === "cloudflare" && status.isHealthy) {
      score += 200;
      reasons.push("Backup official provider");
    }

    // User explicitly selected provider
    if (options.preferredProvider && provider.name.toLowerCase() === options.preferredProvider.toLowerCase()) {
      score += 1500;
      reasons.push("User selected provider");
    }

    // 3. Quota Status
    if (quota.isExhausted) {
      score -= 1000;
      reasons.push("Quota exhausted");
    } else {
      score += 50;
    }

    // 4. Base Priority Order
    score -= provider.basePriority * 2;

    // 5. Historical Latency
    if (healthRecord && healthRecord.latencyMs > 0) {
      const latencyPenalty = Math.min(100, Math.floor(healthRecord.latencyMs / 100));
      score -= latencyPenalty;
    }

    // 6. Reliability Bonus
    if (healthRecord && (healthRecord.totalSuccesses + healthRecord.totalFailures > 0)) {
      const rate = healthRecord.totalSuccesses / (healthRecord.totalSuccesses + healthRecord.totalFailures);
      score += Math.round(rate * 100);
    }

    return {
      provider: provider.name,
      score,
      isFree: provider.isFree,
      isHealthy,
      costEstimated: estimatedCost,
      quotaRemaining: quota.remaining,
      reason: reasons.join(", "),
    };
  }

  /**
   * Sorts providers dynamically by highest score
   */
  async getRankedProviders(options: ImageGenerationOptions): Promise<{ provider: ImageProvider; scoreDetail: ProviderScoreDetail }[]> {
    const scored = await Promise.all(
      this.providers.map(async (provider) => {
        const scoreDetail = await this.calculateScore(provider, options);
        return { provider, scoreDetail };
      })
    );

    return scored.sort((a, b) => b.scoreDetail.score - a.scoreDetail.score);
  }

  /**
   * Intelligently routes generation to best available provider with automatic fallback
   */
  async routeAndGenerate(options: ImageGenerationOptions): Promise<ProviderResponse> {
    const ranked = await this.getRankedProviders(options);
    const failureLogs: string[] = [];

    for (let i = 0; i < ranked.length; i++) {
      const { provider } = ranked[i];

      console.log(`[ProviderRouter] Attempting provider: ${provider.name} (rank ${i + 1}/${ranked.length})`);
      const response = await fallbackManager.executeWithRetry(provider, options);

      if (response.success && response.imageBase64) {
        console.log(`[ProviderRouter] Image generated successfully using ${provider.name} in ${response.latencyMs}ms`);
        return response;
      }

      const reason = response.error || "Unknown provider error";
      failureLogs.push(`${provider.name}: ${reason}`);

      // Log fallback to next available provider if there's one
      if (i + 1 < ranked.length) {
        const nextProvider = ranked[i + 1].provider;
        fallbackManager.logFallback(options.prompt, provider.name, nextProvider.name, reason);
      }
    }

    // All providers failed
    console.error("[ProviderRouter] All providers exhausted:", failureLogs);
    return {
      success: false,
      modelUsed: "none",
      provider: "none",
      latencyMs: 0,
      costEstimated: 0,
      error: "Image generation is temporarily busy across all providers. Please try again shortly.",
    };
  }
}

export const providerRouter = new ProviderRouter();
