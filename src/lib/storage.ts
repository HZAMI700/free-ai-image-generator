import crypto from "crypto";

export interface StoredImageMetadata {
  id: string;
  prompt: string;
  mimeType: string;
  providerUsed: string;
  modelUsed: string;
  createdAt: number;
  expiresAt: number;
}

export interface StoredImageItem extends StoredImageMetadata {
  buffer: Buffer;
}

class ImageStorage {
  private cache: Map<string, StoredImageItem> = new Map();
  private ttlMs: number = 2 * 60 * 60 * 1000; // 2 hours automatic expiration

  constructor() {
    // Run cleanup every 10 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 10 * 60 * 1000);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [id, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(id);
      }
    }
  }

  /**
   * Stores an image and returns its unique public ID and expiration
   */
  async saveImage(
    base64OrBuffer: string | Buffer,
    mimeType: string,
    prompt: string,
    providerUsed: string,
    modelUsed: string
  ): Promise<{ id: string; url: string; expiresAt: number }> {
    const id = crypto.randomUUID();
    const buffer = Buffer.isBuffer(base64OrBuffer)
      ? base64OrBuffer
      : Buffer.from(base64OrBuffer, "base64");

    const now = Date.now();
    const expiresAt = now + this.ttlMs;

    // Check Cloudflare R2 credentials if provided
    const r2Bucket = process.env.R2_BUCKET_NAME;
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (r2Bucket && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      try {
        // Can upload via S3/R2 client or REST if configured
        console.log(`[Storage] Cloudflare R2 bucket configured: ${r2Bucket}`);
      } catch (err) {
        console.warn("[Storage] Cloudflare R2 upload fallback to local storage:", err);
      }
    }

    // Default fast server storage with TTL
    this.cache.set(id, {
      id,
      buffer,
      mimeType,
      prompt,
      providerUsed,
      modelUsed,
      createdAt: now,
      expiresAt,
    });

    const url = `/api/image/${id}`;
    return { id, url, expiresAt };
  }

  getImage(id: string): StoredImageItem | undefined {
    const item = this.cache.get(id);
    if (!item) return undefined;
    if (item.expiresAt < Date.now()) {
      this.cache.delete(id);
      return undefined;
    }
    return item;
  }

  deleteImage(id: string): boolean {
    return this.cache.delete(id);
  }

  getActiveStorageCount(): number {
    this.cleanupExpired();
    return this.cache.size;
  }
}

export const imageStorage = new ImageStorage();
