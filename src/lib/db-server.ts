import { Pool, PoolConfig } from "pg";

export interface DatabaseHealth {
  isConnected: boolean;
  latencyMs: number;
  tablesInitialized: boolean;
  error?: string;
}

export interface GeneratedImageRecord {
  id: string;
  prompt: string;
  negativePrompt?: string;
  modelUsed: string;
  providerUsed?: string;
  aspectRatio?: string;
  imageUrl: string;
  latencyMs?: number;
  expiresAt: number;
}

class DatabaseManager {
  private pool: Pool | null = null;
  private isInitialized = false;
  private hasReportedConfigWarning = false;

  private getConnectionString(): string | null {
    const directUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (directUrl && !directUrl.includes("[YOUR-PASSWORD]")) {
      return directUrl.trim();
    }

    const password = process.env.POSTGRES_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
    if (password && password.trim()) {
      const host = process.env.POSTGRES_HOST || "db.lqmwpfdstacnhqkdivya.supabase.co";
      const port = process.env.POSTGRES_PORT || "5432";
      const database = process.env.POSTGRES_DATABASE || "postgres";
      const user = process.env.POSTGRES_USER || "postgres";
      const encodedPassword = encodeURIComponent(password.trim());
      return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}`;
    }

    return null;
  }

  private getPool(): Pool | null {
    if (this.pool) return this.pool;

    const connectionString = this.getConnectionString();
    if (!connectionString) {
      if (!this.hasReportedConfigWarning) {
        console.info(
          "[Supabase Database] Running in decoupled zero-account mode with in-memory caching. To link persistent Supabase PostgreSQL, set DATABASE_URL or POSTGRES_PASSWORD in .env.local."
        );
        this.hasReportedConfigWarning = true;
      }
      return null;
    }

    try {
      const config: PoolConfig = {
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };

      this.pool = new Pool(config);

      this.pool.on("error", (err) => {
        console.warn("[Supabase Database] Unexpected client error:", err.message);
      });

      return this.pool;
    } catch (err: unknown) {
      console.warn("[Supabase Database] Failed to initialize connection pool:", (err as Error)?.message);
      return null;
    }
  }

  /**
   * Initializes schema tables automatically if connected to Supabase
   */
  async initializeSchema(): Promise<boolean> {
    if (this.isInitialized) return true;
    const pool = this.getPool();
    if (!pool) return false;

    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS cooldowns (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            ip_hash TEXT NOT NULL,
            device_id TEXT NOT NULL,
            next_available_at BIGINT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_cooldowns_lookup ON cooldowns (ip_hash, device_id);
          CREATE INDEX IF NOT EXISTS idx_cooldowns_next_avail ON cooldowns (next_available_at);

          CREATE TABLE IF NOT EXISTS generated_images (
            id TEXT PRIMARY KEY,
            prompt TEXT NOT NULL,
            negative_prompt TEXT,
            model_used TEXT NOT NULL,
            provider_used TEXT NOT NULL DEFAULT 'runware',
            aspect_ratio TEXT NOT NULL DEFAULT '1:1',
            image_url TEXT NOT NULL,
            latency_ms INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            expires_at BIGINT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_generated_images_created ON generated_images (created_at DESC);

          CREATE TABLE IF NOT EXISTS generation_logs (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            provider TEXT NOT NULL DEFAULT 'runware',
            model TEXT NOT NULL,
            latency_ms INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'success',
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_generation_logs_created ON generation_logs (created_at DESC);
        `);
        this.isInitialized = true;
        console.log("[Supabase Database] Schema verified & initialized successfully.");
        return true;
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      console.warn("[Supabase Database] Schema initialization skipped or failed:", (err as Error)?.message);
      return false;
    }
  }

  /**
   * Records or updates active cooldown in Supabase
   */
  async saveCooldown(ipHash: string, deviceId: string, nextAvailableAt: number): Promise<void> {
    const pool = this.getPool();
    if (!pool) return;

    try {
      await this.initializeSchema();
      await pool.query(
        `INSERT INTO cooldowns (ip_hash, device_id, next_available_at)
         VALUES ($1, $2, $3)`,
        [ipHash, deviceId, nextAvailableAt]
      );
    } catch (err: unknown) {
      console.warn("[Supabase Database] Could not save cooldown to DB:", (err as Error)?.message);
    }
  }

  /**
   * Checks for active cooldown in Supabase
   */
  async getActiveCooldown(ipHash: string, deviceId: string): Promise<number | null> {
    const pool = this.getPool();
    if (!pool) return null;

    try {
      await this.initializeSchema();
      const now = Date.now();
      const res = await pool.query(
        `SELECT next_available_at FROM cooldowns 
         WHERE (ip_hash = $1 OR device_id = $2) AND next_available_at > $3
         ORDER BY next_available_at DESC 
         LIMIT 1`,
        [ipHash, deviceId, now]
      );

      if (res.rows.length > 0) {
        return Number(res.rows[0].next_available_at);
      }
      return null;
    } catch (err: unknown) {
      console.warn("[Supabase Database] Could not query cooldown from DB:", (err as Error)?.message);
      return null;
    }
  }

  /**
   * Stores generated image record in Supabase
   */
  async recordGeneratedImage(record: GeneratedImageRecord): Promise<void> {
    const pool = this.getPool();
    if (!pool) return;

    try {
      await this.initializeSchema();
      await pool.query(
        `INSERT INTO generated_images (id, prompt, negative_prompt, model_used, provider_used, aspect_ratio, image_url, latency_ms, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           image_url = EXCLUDED.image_url,
           expires_at = EXCLUDED.expires_at`,
        [
          record.id,
          record.prompt,
          record.negativePrompt || null,
          record.modelUsed,
          record.providerUsed || "runware",
          record.aspectRatio || "1:1",
          record.imageUrl,
          record.latencyMs || 0,
          record.expiresAt,
        ]
      );
    } catch (err: unknown) {
      console.warn("[Supabase Database] Could not record generated image to DB:", (err as Error)?.message);
    }
  }

  /**
   * Records performance log in Supabase
   */
  async recordLog(provider: string, model: string, latencyMs: number, status: string = "success"): Promise<void> {
    const pool = this.getPool();
    if (!pool) return;

    try {
      await this.initializeSchema();
      await pool.query(
        `INSERT INTO generation_logs (provider, model, latency_ms, status)
         VALUES ($1, $2, $3, $4)`,
        [provider, model, latencyMs, status]
      );
    } catch (err: unknown) {
      console.warn("[Supabase Database] Could not record log to DB:", (err as Error)?.message);
    }
  }

  /**
   * Health check for monitoring and admin dashboards
   */
  async checkHealth(): Promise<DatabaseHealth> {
    const pool = this.getPool();
    if (!pool) {
      return {
        isConnected: false,
        latencyMs: 0,
        tablesInitialized: false,
        error: "DATABASE_URL or POSTGRES_PASSWORD not set in environment",
      };
    }

    const start = Date.now();
    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
        const latency = Date.now() - start;
        return {
          isConnected: true,
          latencyMs: latency,
          tablesInitialized: this.isInitialized,
        };
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      return {
        isConnected: false,
        latencyMs: Date.now() - start,
        tablesInitialized: false,
        error: (err as Error)?.message || "Connection error",
      };
    }
  }
}

export const serverDb = new DatabaseManager();
