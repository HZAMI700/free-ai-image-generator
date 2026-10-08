import { NextRequest, NextResponse } from "next/server";
import { imageStorage } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = imageStorage.getImage(id);

    if (!item) {
      return new NextResponse("Image not found or expired", { status: 404 });
    }

    return new NextResponse(new Uint8Array(item.buffer), {
      status: 200,
      headers: {
        "Content-Type": item.mimeType || "image/jpeg",
        "Cache-Control": "public, max-age=7200, immutable",
        "Content-Disposition": `inline; filename="generated-${id.slice(0, 8)}.png"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Image retrieval error";
    return new NextResponse(message, { status: 500 });
  }
}
