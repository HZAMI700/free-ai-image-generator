// End-to-end test runner for Free AI Image Generator SaaS
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING FULL END-TO-END TEST SUITE ===");

  // TEST 1: Initial Cooldown Status
  console.log("\n[Test 1] Checking initial cooldown status...");
  const res1 = await fetch(`${BASE_URL}/api/cooldown/status`);
  const status1 = await res1.json();
  console.log("Initial status:", status1);
  if (status1.inCooldown !== false) {
    throw new Error("Expected inCooldown to be false initially");
  }
  console.log("✓ Initial cooldown status test passed.");

  // TEST 2: First Image Generation
  console.log("\n[Test 2] Generating first image...");
  const startTime = Date.now();
  const genRes = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": "test-device-uuid-12345",
      "cf-connecting-ip": "203.0.113.195", // Mock client IP 1
    },
    body: JSON.stringify({
      prompt: "A beautiful golden sunset over Mount Fuji with sakura blossoms",
      aspectRatio: "1:1",
      style: "Cinematic",
      quality: "standard",
    }),
  });

  const cookieHeader = genRes.headers.get("set-cookie");
  console.log("Status:", genRes.status);
  console.log("Set-Cookie header received:", cookieHeader ? "Yes (HMAC signed token present)" : "No");

  const genData = await genRes.json();
  if (genRes.status !== 200 || !genData.success) {
    console.error("Generation failed:", genData);
    throw new Error(`Generation failed with status ${genRes.status}`);
  }

  console.log("Generation succeeded in", Date.now() - startTime, "ms!");
  console.log("Provider used:", genData.providerUsed);
  console.log("Model used:", genData.modelUsed);
  console.log("Image URL:", genData.imageUrl);
  console.log("Cooldown info:", genData.cooldown);
  console.log("Image base64 length:", genData.imageBase64?.length);

  // TEST 3: Verify Image Serving Endpoint
  console.log("\n[Test 3] Verifying image serving endpoint...");
  const imgRes = await fetch(`${BASE_URL}${genData.imageUrl}`);
  console.log("Image fetch status:", imgRes.status);
  console.log("Content-Type:", imgRes.headers.get("content-type"));
  console.log("Cache-Control:", imgRes.headers.get("cache-control"));
  if (imgRes.status !== 200) {
    throw new Error(`Image serving returned ${imgRes.status}`);
  }
  console.log("✓ Image serving test passed.");

  // TEST 4: Second Generation Before 3 Minutes (Should be BLOCKED with 429)
  console.log("\n[Test 4] Attempting second generation immediately (before 3 minutes)...");
  const secondGenRes = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": "test-device-uuid-12345",
      "cf-connecting-ip": "203.0.113.195",
      "Cookie": cookieHeader || "",
    },
    body: JSON.stringify({
      prompt: "Another prompt right away",
    }),
  });

  console.log("Second attempt status:", secondGenRes.status);
  const secondGenData = await secondGenRes.json();
  console.log("Second attempt payload:", secondGenData);

  if (secondGenRes.status !== 429) {
    throw new Error(`Expected HTTP 429, got ${secondGenRes.status}`);
  }
  if (!secondGenData.remainingSeconds || secondGenData.remainingSeconds <= 0) {
    throw new Error("Expected positive remainingSeconds in 429 response");
  }
  console.log("✓ Server-side 3-minute rate limit strictly enforced (HTTP 429, " + secondGenData.remainingSeconds + "s remaining).");

  // TEST 5: Anti-Bypass Check (Cleared cookie, changed device ID, but same IP)
  console.log("\n[Test 5] Anti-bypass test (Incognito / cleared cookies with same IP)...");
  const bypassRes = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": "different-device-attacker-999", // changed device ID
      "cf-connecting-ip": "203.0.113.195", // same IP!
      // NO COOKIE sent!
    },
    body: JSON.stringify({
      prompt: "Bypass attempt prompt",
    }),
  });

  console.log("Bypass attempt status:", bypassRes.status);
  const bypassData = await bypassRes.json();
  console.log("Bypass attempt response:", bypassData);

  if (bypassRes.status !== 429) {
    throw new Error(`Anti-bypass failed: IP rate limiter should have blocked with 429, but got ${bypassRes.status}`);
  }
  console.log("✓ Anti-bypass successfully caught unauthorized attempt via IP layer.");

  // TEST 6: Cooldown Status Endpoint during cooldown
  console.log("\n[Test 6] Checking /api/cooldown/status during active cooldown...");
  const statusRes2 = await fetch(`${BASE_URL}/api/cooldown/status`, {
    headers: {
      "cf-connecting-ip": "203.0.113.195",
      "x-device-id": "test-device-uuid-12345",
    },
  });
  const statusData2 = await statusRes2.json();
  console.log("Active cooldown status payload:", statusData2);
  if (statusData2.inCooldown !== true) {
    throw new Error("Expected inCooldown to be true on status check");
  }
  console.log("✓ /api/cooldown/status accurately reports active cooldown of " + statusData2.remainingSeconds + "s.");

  // TEST 7: Input Validation (Empty prompt, >1000 char prompt)
  console.log("\n[Test 7] Testing input validation...");
  const emptyRes = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-connecting-ip": "198.51.100.5", // Different clean IP
      "x-device-id": "clean-device-1",
    },
    body: JSON.stringify({ prompt: "" }),
  });
  if (emptyRes.status !== 400) {
    throw new Error(`Expected 400 for empty prompt, got ${emptyRes.status}`);
  }
  console.log("✓ Empty prompt rejected with 400 Bad Request.");

  const longPromptRes = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-connecting-ip": "198.51.100.5",
      "x-device-id": "clean-device-1",
    },
    body: JSON.stringify({ prompt: "A".repeat(1005) }),
  });
  if (longPromptRes.status !== 400) {
    throw new Error(`Expected 400 for >1000 char prompt, got ${longPromptRes.status}`);
  }
  console.log("✓ Overly long prompt (>1000 chars) rejected with 400 Bad Request.");

  // TEST 8: Admin Metrics Telemetry Verification
  console.log("\n[Test 8] Checking Admin Telemetry for recorded generations & abuse attempts...");
  const adminRes = await fetch(`${BASE_URL}/api/admin/metrics?key=admin123`);
  const adminData = await adminRes.json();
  console.log("Active Cooldowns recorded:", adminData.metrics.activeCooldowns);
  console.log("Blocked abuse attempts intercepted:", adminData.metrics.blockedAbuseAttempts);
  console.log("Active cached images:", adminData.metrics.activeCachedImages);

  if (adminData.metrics.blockedAbuseAttempts < 2) {
    throw new Error("Expected at least 2 blocked abuse attempts recorded in metrics");
  }
  console.log("✓ Admin Telemetry correctly records live abuse and cooldown counts.");

  console.log("\n==============================================");
  console.log("🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("==============================================\n");
}

runTests().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
