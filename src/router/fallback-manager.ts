import { ImageProvider, ImageGenerationOptions, ProviderResponse } from "../providers/types";
import { healthChecker } from "./health-checker";
import { quotaManager } from "./quota-manager";

export interface FallbackLogEntry {
  timestamp: number;
  prompt: string;
  failedProvider: string;
  nextProvider: string;
  reason: string;
}

class FallbackManager {
  private fallbackLogs: FallbackLogEntry[] = [];

  logFallback(prompt: string, failedProvider: string, nextProvider: string, reason: string): void {
    const entry: FallbackLogEntry = {
      timestamp: Date.now(),
      prompt: prompt.slice(0, 50),
      failedProvider,
      nextProvider,
      reason,
    };
    this.fallbackLogs.unshift(entry);
    if (this.fallbackLogs.length > 100) {
      this.fallbackLogs.pop();
    }
    console.warn(`[Provider Fallback] Switched from ${failedProvider} to ${nextProvider}. Reason: ${reason}`);
  }

  getRecentFallbacks(): FallbackLogEntry[] {
    return this.fallbackLogs;
  }

  /**
   * Executes a generation attempt with temporary retry handling
   */
  async executeWithRetry(
    provider: ImageProvider,
    options: ImageGenerationOptions,
    maxRetries: number = 1
  ): Promise<ProviderResponse> {
    let attempt = 0;
    let lastResponse: ProviderResponse | null = null;

    while (attempt <= maxRetries) {
      const response = await provider.generateImage(options);
      lastResponse = response;

      if (response.success) {
        healthChecker.recordSuccess(provider.name, response.latencyMs);
        quotaManager.recordUsage(provider.name, response.costEstimated, true);
        return response;
      }

      // Check if temporary or fatal error
      const isTemporary = response.error?.includes("loading") ||
        response.error?.includes("timeout") ||
        response.error?.includes("fetch failed");

      if (isTemporary && attempt < maxRetries) {
        attempt++;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }

      break;
    }

    // Failed
    if (lastResponse) {
      healthChecker.recordFailure(provider.name, lastResponse.error || "Generation failed");
      quotaManager.recordUsage(provider.name, 0, false);
      return lastResponse;
    }

    return {
      success: false,
      modelUsed: "unknown",
      provider: provider.name,
      latencyMs: 0,
      costEstimated: 0,
      error: "Unexpected provider failure",
    };
  }
}

export const fallbackManager = new FallbackManager();
