import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createSignedUploadUrl,
  getPublicUrl,
  isStorageConfigured,
} from "@/lib/storage/supabase";

export const runtime = "nodejs";

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** Supabase free plan's per-file upload limit. */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/**
 * Admin-only: returns a one-time upload URL so the browser can send the video
 * straight to Supabase Storage, plus the public URL to save on the product.
 * Body: { contentType: string, size: number }
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Video uploads need Supabase Storage (set SUPABASE_URL and SUPABASE_SECRET_KEY)" },
      { status: 500 }
    );
  }

  try {
    const { contentType, size } = await request.json();
    const ext = VIDEO_TYPES[contentType];
    if (!ext) {
      return NextResponse.json({ error: "Use an MP4, WebM, or MOV video" }, { status: 400 });
    }
    if (typeof size !== "number" || size <= 0) {
      return NextResponse.json({ error: "Video file is empty" }, { status: 400 });
    }
    if (size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Video is larger than 50 MB. Trim it or export at a lower quality (720p works well)." },
        { status: 400 }
      );
    }

    const path = `${randomUUID()}.${ext}`;
    const uploadUrl = await createSignedUploadUrl("product-videos", path);
    return NextResponse.json({ uploadUrl, url: getPublicUrl("product-videos", path) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
