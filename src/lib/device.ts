/**
 * Manages privacy-preserving browser/device identifier for cooldown syncing
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server-placeholder";

  const STORAGE_KEY = "_device_id_token";
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId || deviceId.length < 16) {
    // Generate UUIDv4 compliant random ID
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    deviceId = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    try {
      localStorage.setItem(STORAGE_KEY, deviceId);
    } catch {
      // ignore storage failure (e.g. strict private mode)
    }
  }

  return deviceId;
}
