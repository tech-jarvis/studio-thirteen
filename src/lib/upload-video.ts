/**
 * Browser-only: upload a product video straight to Supabase Storage.
 * 1. Ask our server (admin-only) for a one-time upload URL.
 * 2. PUT the file to Supabase directly, reporting progress (0–100).
 * Returns the public URL to save on the product.
 */
export const MAX_VIDEO_MB = 50;

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(
      `Video is ${(file.size / 1024 / 1024).toFixed(0)} MB — the limit is ${MAX_VIDEO_MB} MB. Trim it or export at 720p.`
    );
  }

  const res = await fetch("/api/admin/upload/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not start upload");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status})`;
      try {
        message = JSON.parse(xhr.responseText).message || message;
      } catch {
        // keep the generic message
      }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection and try again"));
    xhr.send(file);
  });

  return data.url as string;
}
