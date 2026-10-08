import { ImageProvider, ProviderQuota, ImageGenerationOptions } from "../providers/types";

export interface ProviderUsageMetric {
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  totalCostUsd: number;
  lastUsedAt?: number;
}

class QuotaManager {
  private usageStats: Map<string, ProviderUsageMetric> = new Map();

  recordUsage(providerName: string, costUsd: number, success: boolean): void {
    const existing = this.usageStats.get(providerName) || {
      provider: providerName,
      totalRequests: 0,
      successfulRequests: 0,
      totalCostUsd: 0,
    };

    existing.totalRequests++;
    if (success) {
      existing.successfulRequests++;
      existing.totalCostUsd += costUsd;
    }
    existing.lastUsedAt = Date.now();

    this.usageStats.set(providerName, existing);
  }

  async checkQuota(provider: ImageProvider): Promise<ProviderQuota> {
    try {
      return await provider.getQuota();
    } catch {
      return {
        provider: provider.name,
        remaining: 0,
        limit: 0,
        unit: "unknown",
        isExhausted: true,
      };
    }
  }

  getCostEstimate(provider: ImageProvider, options: ImageGenerationOptions): number {
    return provider.estimateCost(options);
  }

  getAllUsageMetrics(): ProviderUsageMetric[] {
    return Array.from(this.usageStats.values());
  }

  getTotalSpendUsd(): number {
    let total = 0;
    for (const item of this.usageStats.values()) {
      total += item.totalCostUsd;
    }
    return Number(total.toFixed(4));
  }
}

export const quotaManager = new QuotaManager();
