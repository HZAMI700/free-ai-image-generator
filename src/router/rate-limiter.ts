import crypto from "crypto";

export interface CooldownStatus {
  inCooldown: boolean;
  remainingSeconds: number;
  nextAvailableAt: number; // timestamp in ms
  reason?: string;
}

export interface CooldownTokenPayload {
  ipHash: string;
  deviceId: string;
  expiresAt: number;
  nonce: string;
}

const COOLDOWN_DURATION_MS = 180 * 1000; // 3 minutes = 180 seconds
const SECRET = process.env.COOLDOWN_SECRET || "cooldown-secret-salt-free-ai-schnell-2025";

class RateLimiter {
  private ipStore: Map<string, number> = new Map();
  private deviceStore: Map<string, number> = new Map();
  private abuseAttemptCount: number = 0;

  constructor() {
    // Periodic garbage collection for memory management
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, ts] of this.ipStore.entries()) {
      if (now - ts > COOLDOWN_DURATION_MS * 2) {
        this.ipStore.delete(ip);
      }
    }
    for (const [device, ts] of this.deviceStore.entries()) {
      if (now - ts > COOLDOWN_DURATION_MS * 2) {
        this.deviceStore.delete(device);
      }
    }
  }

  private hashIp(ip: string): string {
    return crypto.createHash("sha256").update(ip + SECRET).digest("hex").slice(0, 16);
  }

  /**
   * Generates a cryptographically signed HMAC cooldown token
   */
  signCooldownToken(ip: string, deviceId: string, expiresAt: number): string {
    const payload: CooldownTokenPayload = {
      ipHash: this.hashIp(ip),
      deviceId: deviceId || "unknown",
      expiresAt,
      nonce: crypto.randomUUID(),
    };

    const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const hmac = crypto.createHmac("sha256", SECRET).update(serialized).digest("base64url");
    return `${serialized}.${hmac}`;
  }

  /**
   * Verifies and unpacks a signed cooldown token
   */
  verifyCooldownToken(token: string): CooldownTokenPayload | null {
    if (!token || !token.includes(".")) return null;
    const [serialized, signature] = token.split(".");
    if (!serialized || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", SECRET).update(serialized).digest("base64url");
    
    // Constant time comparison
    try {
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSignature);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return null;
      }

      const decoded = JSON.parse(Buffer.from(serialized, "base64url").toString("utf8"));
      return decoded as CooldownTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Extracts client IP safely from standard headers
   */
  extractIp(headers: Headers): string {
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      const ips = forwarded.split(",");
      return (ips[0] || "").trim();
    }

    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "127.0.0.1";
  }

  /**
   * Checks whether the user is currently in the 3-minute cooldown.
   * Multi-layered server authority:
   * 1. Server-side IP timestamp
   * 2. Server-side device timestamp
   * 3. Signed HMAC token
   */
  checkCooldown(headers: Headers, cookieToken?: string): CooldownStatus {
    const now = Date.now();
    const ip = this.extractIp(headers);
    const deviceId = headers.get("x-device-id") || "";

    let maxExpiresAt = 0;
    let reason = "";

    // 1. Check IP store
    const ipTimestamp = this.ipStore.get(ip);
    if (ipTimestamp && (now - ipTimestamp) < COOLDOWN_DURATION_MS) {
      const exp = ipTimestamp + COOLDOWN_DURATION_MS;
      if (exp > maxExpiresAt) {
        maxExpiresAt = exp;
        reason = "IP cooldown active";
      }
    }

    // 2. Check Device store
    if (deviceId) {
      const deviceTimestamp = this.deviceStore.get(deviceId);
      if (deviceTimestamp && (now - deviceTimestamp) < COOLDOWN_DURATION_MS) {
        const exp = deviceTimestamp + COOLDOWN_DURATION_MS;
        if (exp > maxExpiresAt) {
          maxExpiresAt = exp;
          reason = "Device cooldown active";
        }
      }
    }

    // 3. Check Signed Token (from cookie or header)
    const token = cookieToken || headers.get("x-cooldown-token");
    if (token) {
      const payload = this.verifyCooldownToken(token);
      if (payload && payload.expiresAt > now) {
        if (payload.expiresAt > maxExpiresAt) {
          maxExpiresAt = payload.expiresAt;
          reason = "Signed token active";
        }
      }
    }

    if (maxExpiresAt > now) {
      const remainingSeconds = Math.ceil((maxExpiresAt - now) / 1000);
      this.abuseAttemptCount++;
      return {
        inCooldown: true,
        remainingSeconds,
        nextAvailableAt: maxExpiresAt,
        reason,
      };
    }

    return {
      inCooldown: false,
      remainingSeconds: 0,
      nextAvailableAt: 0,
    };
  }

  /**
   * Registers a successful generation and locks cooldown for 3 minutes (180s)
   */
  recordGeneration(headers: Headers, deviceIdFromClient?: string): { token: string; expiresAt: number } {
    const now = Date.now();
    const expiresAt = now + COOLDOWN_DURATION_MS;
    const ip = this.extractIp(headers);
    const deviceId = deviceIdFromClient || headers.get("x-device-id") || crypto.randomUUID();

    // Set server-side timestamps
    this.ipStore.set(ip, now);
    this.deviceStore.set(deviceId, now);

    // Create cryptographically signed token
    const token = this.signCooldownToken(ip, deviceId, expiresAt);

    return {
      token,
      expiresAt,
    };
  }

  getAbuseAttemptsCount(): number {
    return this.abuseAttemptCount;
  }

  getActiveCooldownCount(): number {
    const now = Date.now();
    let count = 0;
    for (const ts of this.ipStore.values()) {
      if (now - ts < COOLDOWN_DURATION_MS) count++;
    }
    return count;
  }
}

// Global singleton instance
export const rateLimiter = new RateLimiter();
