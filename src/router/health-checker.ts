import { ImageProvider, ProviderStatus } from "../providers/types";

export interface ProviderHealthRecord {
  provider: string;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: number;
  consecutiveFailures: number;
  totalSuccesses: number;
  totalFailures: number;
  lastErrorMessage?: string;
}

class HealthChecker {
  private healthRecords: Map<string, ProviderHealthRecord> = new Map();
  private maxConsecutiveFailuresBeforeTrip: number = 3;

  recordSuccess(providerName: string, latencyMs: number): void {
    const existing = this.healthRecords.get(providerName) || {
      provider: providerName,
      isHealthy: true,
      latencyMs,
      lastChecked: Date.now(),
      consecutiveFailures: 0,
      totalSuccesses: 0,
      totalFailures: 0,
    };

    existing.isHealthy = true;
    existing.latencyMs = Math.round((existing.latencyMs + latencyMs) / 2);
    existing.consecutiveFailures = 0;
    existing.totalSuccesses++;
    existing.lastChecked = Date.now();
    delete existing.lastErrorMessage;

    this.healthRecords.set(providerName, existing);
  }

  recordFailure(providerName: string, error: string): void {
    const existing = this.healthRecords.get(providerName) || {
      provider: providerName,
      isHealthy: true,
      latencyMs: 0,
      lastChecked: Date.now(),
      consecutiveFailures: 0,
      totalSuccesses: 0,
      totalFailures: 0,
    };

    existing.consecutiveFailures++;
    existing.totalFailures++;
    existing.lastChecked = Date.now();
    existing.lastErrorMessage = error;

    // Circuit breaker trip if too many consecutive failures
    if (existing.consecutiveFailures >= this.maxConsecutiveFailuresBeforeTrip) {
      existing.isHealthy = false;
    }

    this.healthRecords.set(providerName, existing);
  }

  isProviderHealthy(providerName: string): boolean {
    const record = this.healthRecords.get(providerName);
    if (!record) return true; // optimistic default
    return record.isHealthy;
  }

  getHealthRecord(providerName: string): ProviderHealthRecord | undefined {
    return this.healthRecords.get(providerName);
  }

  getAllRecords(): ProviderHealthRecord[] {
    return Array.from(this.healthRecords.values());
  }

  async runHealthCheck(provider: ImageProvider): Promise<ProviderStatus> {
    const start = Date.now();
    try {
      const isHealthy = await provider.healthCheck();
      const latencyMs = Date.now() - start;

      if (isHealthy) {
        this.recordSuccess(provider.name, latencyMs);
      } else {
        this.recordFailure(provider.name, "Health check probe returned negative");
      }

      return {
        provider: provider.name,
        isHealthy,
        latencyMs,
        lastChecked: Date.now(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.recordFailure(provider.name, msg);
      return {
        provider: provider.name,
        isHealthy: false,
        latencyMs: Date.now() - start,
        lastChecked: Date.now(),
        message: msg,
      };
    }
  }
}

export const healthChecker = new HealthChecker();
