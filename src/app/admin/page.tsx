"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Clock,
  DollarSign,
  HardDrive,
  Lock,
  Zap,
  Cpu,
} from "lucide-react";

interface ProviderData {
  name: string;
  isFree: boolean;
  priority: number;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: number;
  totalSuccesses: number;
  totalFailures: number;
  lastError?: string;
  quota: {
    remaining: number;
    limit: number;
    unit: string;
    isExhausted: boolean;
  };
  estimatedCostPerImage: number;
}

interface MetricsData {
  timestamp: number;
  providers: ProviderData[];
  metrics: {
    activeCooldowns: number;
    blockedAbuseAttempts: number;
    totalCostUsd: number;
    activeCachedImages: number;
  };
  fallbackLogs: Array<{
    timestamp: number;
    prompt: string;
    failedProvider: string;
    nextProvider: string;
    reason: string;
  }>;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("admin123");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const fetchMetrics = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/metrics?key=${encodeURIComponent(key)}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        setError("Invalid Admin Key. Please check the secret key.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(`Failed to fetch metrics (HTTP ${res.status})`);
        setLoading(false);
        return;
      }

      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt auto-login with default key if valid
    fetchMetrics(adminKey);
  }, []);

  const handleTestProvider = async (providerName: string) => {
    setTestingProvider(providerName);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ action: "test_provider", providerName }),
      });
      if (res.ok) {
        await fetchMetrics(adminKey);
      }
    } catch (e) {
      console.warn("Probe failed", e);
    } finally {
      setTestingProvider(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFC] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full p-8 rounded-[28px] glass-panel border border-white/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-1">Internal System Monitoring</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
            Admin access is restricted to operations. Enter your secret administration key.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchMetrics(adminKey);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter ADMIN_SECRET_KEY..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              {loading ? "Authenticating..." : "Access Monitoring"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              ← Back to Public Generator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              title="Return to Public App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-bold tracking-tight">System & Provider Monitor</h1>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Live multi-provider routing telemetry & rate-limiter enforcement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMetrics(adminKey)}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Active Cooldowns</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold font-mono">
                {data.metrics.activeCooldowns}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Users currently in 3m lock</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Blocked Abuse Attempts</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {data.metrics.blockedAbuseAttempts}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Rate limit bypass prevented</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Estimated Provider Spend</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ${data.metrics.totalCostUsd.toFixed(4)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Free tier prioritised ($0.00)</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Storage Cache</span>
                <HardDrive className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-mono">
                {data.metrics.activeCachedImages}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Active images (2h TTL cleanup)</p>
            </div>
          </div>
        )}

        {/* Provider Status Table */}
        {data && (
          <div className="rounded-2xl glass-panel border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 overflow-hidden">
            <div className="p-5 border-b border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  AI Provider Clusters
                </h2>
                <p className="text-xs text-zinc-400">
                  Dynamic routing score evaluates health, latency, and quota before dispatching
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                {data.providers.length} Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/60 dark:border-zinc-800 font-medium">
                  <tr>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Health</th>
                    <th className="p-4">Latency</th>
                    <th className="p-4">Quota Remaining</th>
                    <th className="p-4">Success / Fail</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {data.providers.map((p) => (
                    <tr key={p.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-semibold capitalize flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <Cpu className="w-4 h-4 text-zinc-400" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-4">
                        {p.isFree ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                            Free Tier
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                            Paid Fallback (${p.estimatedCostPerImage})
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.isHealthy ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Online</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-500 font-medium" title={p.lastError}>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Degraded</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-zinc-600 dark:text-zinc-400">
                        {p.latencyMs > 0 ? `${p.latencyMs}ms` : "—"}
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono">
                        {p.quota.remaining} {p.quota.unit}
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400">
                        <span className="text-emerald-600 font-medium">{p.totalSuccesses}</span>
                        <span> / </span>
                        <span className="text-red-500 font-medium">{p.totalFailures}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleTestProvider(p.name)}
                          disabled={testingProvider === p.name}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          {testingProvider === p.name ? "Probing..." : "Test Probe"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fallback & Routing Logs */}
        {data && data.fallbackLogs && (
          <div className="rounded-2xl glass-panel border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-5">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
              Automatic Failover Event Log
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Real-time audit log of fallback events triggered by provider timeouts, queues, or limits
            </p>

            {data.fallbackLogs.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 italic text-center">
                No recent fallback events recorded. Primary providers performing nominally.
              </p>
            ) : (
              <div className="space-y-2">
                {data.fallbackLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-mono font-medium">{log.failedProvider}</span>
                      <span>→</span>
                      <span className="text-emerald-500 font-mono font-medium">{log.nextProvider}</span>
                      <span className="text-zinc-400">| Reason: {log.reason}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
