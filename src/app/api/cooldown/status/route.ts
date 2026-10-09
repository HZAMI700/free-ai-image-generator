import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/router/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("__cooldown_token")?.value;
    const cooldownStatus = await rateLimiter.checkCooldownAsync(req.headers, cookieToken);

    return NextResponse.json({
      inCooldown: cooldownStatus.inCooldown,
      remainingSeconds: cooldownStatus.remainingSeconds,
      nextAvailableAt: cooldownStatus.nextAvailableAt,
      serverTime: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking cooldown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
