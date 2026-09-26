/**
 * Browser-only: shrink a photo before upload so it stays under the 5MB limit
 * and uses far less storage and bandwidth. Resizes the longest side to
 * `maxSize` and re-encodes as WebP. Returns the original file if the browser
 * can't decode it (e.g. HEIC outside Safari) or if compressing doesn't help.
 */
export async function compressImage(
  file: File,
  { maxSize = 1600, quality = 0.82 } = {}
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    // Safari may ignore the WebP request and return PNG; only keep a real win.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
