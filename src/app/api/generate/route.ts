import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/router/rate-limiter";
import { providerRouter } from "@/router/provider-router";
import { imageStorage } from "@/lib/storage";
import { AspectRatio, ImageGenerationOptions } from "@/providers/types";

export const maxDuration = 60; // Allow sufficient time for provider failover

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return NextResponse.json(
        { error: "Please enter a description for the image you want to create." },
        { status: 400 }
      );
    }

    const prompt = body.prompt.trim();
    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: "Prompt exceeds maximum allowed length of 1000 characters." },
        { status: 400 }
      );
    }

    const negativePrompt = typeof body.negativePrompt === "string" ? body.negativePrompt.trim().slice(0, 500) : undefined;
    const style = typeof body.style === "string" ? body.style : undefined;
    const validAspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2"];
    const aspectRatio: AspectRatio = validAspectRatios.includes(body.aspectRatio) ? body.aspectRatio : "1:1";
    const quality = body.quality === "hd" ? "hd" : "standard";
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : req.headers.get("x-device-id") || undefined;

    // 1. Strict Server-Side Rate Limiter Check (3-minute cooldown)
    const cookieToken = req.cookies.get("__cooldown_token")?.value;
    const cooldownStatus = rateLimiter.checkCooldown(req.headers, cookieToken);

    if (cooldownStatus.inCooldown) {
      const minutes = Math.floor(cooldownStatus.remainingSeconds / 60);
      const seconds = cooldownStatus.remainingSeconds % 60;
      const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      return NextResponse.json(
        {
          error: "Rate limit active",
          message: `Next image available in ${formatted}`,
          remainingSeconds: cooldownStatus.remainingSeconds,
          nextAvailableAt: cooldownStatus.nextAvailableAt,
          reason: cooldownStatus.reason,
        },
        { status: 429 }
      );
    }

    // 2. Prepare generation prompt with style if specified
    let finalPrompt = prompt;
    if (style && style !== "None" && style !== "Default") {
      finalPrompt = `${prompt}, ${style} style, high quality, 8k resolution, detailed`;
    }

    const generationOptions: ImageGenerationOptions = {
      prompt: finalPrompt,
      negativePrompt,
      aspectRatio,
      quality,
      seed: typeof body.seed === "number" ? body.seed : undefined,
    };

    // 3. Multi-Provider Router Execution with Dynamic Fallback
    const response = await providerRouter.routeAndGenerate(generationOptions);

    if (!response.success || !response.imageBase64) {
      // User-friendly shielded error message
      return NextResponse.json(
        {
          error: response.error || "That generation service is busy right now. Please try again shortly.",
          details: "All available provider pipelines were attempted.",
        },
        { status: 503 }
      );
    }

    // 4. Save generated image to storage cache
    const { id, url, expiresAt: imageExpiresAt } = await imageStorage.saveImage(
      response.imageBase64,
      response.mimeType || "image/jpeg",
      prompt,
      response.provider,
      response.modelUsed
    );

    // 5. Enforce 3-minute cooldown on server and generate cryptographic token
    const cooldownRecord = rateLimiter.recordGeneration(req.headers, deviceId);

    const minutes = Math.floor(180 / 60);
    const seconds = 180 % 60;
    const formattedTimer = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const res = NextResponse.json({
      success: true,
      id,
      imageUrl: url,
      imageBase64: `data:${response.mimeType || "image/jpeg"};base64,${response.imageBase64}`,
      prompt,
      style,
      aspectRatio,
      providerUsed: response.provider,
      modelUsed: response.modelUsed,
      latencyMs: response.latencyMs,
      expiresAt: imageExpiresAt,
      cooldown: {
        remainingSeconds: 180,
        nextAvailableAt: cooldownRecord.expiresAt,
        message: `Next image available in ${formattedTimer}`,
        token: cooldownRecord.token,
      },
    });

    // 6. Set Signed Cooldown Cookie (HttpOnly, SameSite=Lax, 180 seconds TTL)
    res.cookies.set("__cooldown_token", cooldownRecord.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 180,
    });

    return res;
  } catch (err: unknown) {
    console.error("[API Generate Error]:", err);
    return NextResponse.json(
      {
        error: "Image generation is temporarily busy. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
