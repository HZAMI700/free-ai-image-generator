import { NextRequest, NextResponse } from "next/server";
import { providerRouter } from "@/router/provider-router";
import { healthChecker } from "@/router/health-checker";
import { quotaManager } from "@/router/quota-manager";
import { fallbackManager } from "@/router/fallback-manager";
import { rateLimiter } from "@/router/rate-limiter";
import { imageStorage } from "@/lib/storage";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "admin123";

function isAuthorized(req: NextRequest): boolean {
  const headerKey = req.headers.get("x-admin-key");
  const queryKey = req.nextUrl.searchParams.get("key");
  return (headerKey === ADMIN_KEY) || (queryKey === ADMIN_KEY);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const providers = providerRouter.getProviders();
  const providerData = await Promise.all(
    providers.map(async (p) => {
      const health = healthChecker.getHealthRecord(p.name);
      const status = await p.getStatus();
      const quota = await p.getQuota();
      const estCost = p.estimateCost({ prompt: "test" });

      return {
        name: p.name,
        isFree: p.isFree,
        priority: p.basePriority,
        isHealthy: health ? health.isHealthy : status.isHealthy,
        latencyMs: health ? health.latencyMs : status.latencyMs,
        lastChecked: health ? health.lastChecked : status.lastChecked,
        totalSuccesses: health ? health.totalSuccesses : 0,
        totalFailures: health ? health.totalFailures : 0,
        lastError: health?.lastErrorMessage,
        quota,
        estimatedCostPerImage: estCost,
      };
    })
  );

  return NextResponse.json({
    timestamp: Date.now(),
    providers: providerData,
    metrics: {
      activeCooldowns: rateLimiter.getActiveCooldownCount(),
      blockedAbuseAttempts: rateLimiter.getAbuseAttemptsCount(),
      totalCostUsd: quotaManager.getTotalSpendUsd(),
      activeCachedImages: imageStorage.getActiveStorageCount(),
      usageStats: quotaManager.getAllUsageMetrics(),
    },
    fallbackLogs: fallbackManager.getRecentFallbacks(),
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, providerName } = body;

    if (action === "test_provider" && providerName) {
      const provider = providerRouter.getProviderByName(providerName);
      if (!provider) {
        return NextResponse.json({ error: `Provider ${providerName} not found` }, { status: 404 });
      }

      const res = await healthChecker.runHealthCheck(provider);
      return NextResponse.json({ success: true, result: res });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error executing admin action";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
