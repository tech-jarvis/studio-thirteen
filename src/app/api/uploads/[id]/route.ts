import { NextResponse } from "next/server";
import { getUpload } from "@/lib/storage/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const upload = await getUpload(id);
    if (!upload) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(upload.data), {
      headers: {
        "Content-Type": upload.mime,
        "Content-Length": String(upload.data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Failed to load image", { status: 500 });
  }
}
