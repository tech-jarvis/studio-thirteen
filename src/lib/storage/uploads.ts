import { randomUUID } from "crypto";
import { getPool } from "@/lib/db/neon";

export type UploadKind = "product" | "payment";

/** Raster image types we accept. SVG is intentionally excluded — stored SVGs
 *  served from our own origin can carry executable script (stored XSS). */
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export class UploadError extends Error {}

/**
 * Persist an uploaded image in Postgres and return a URL that serves it back
 * via /api/uploads/[id]. Durable across deploys and works on serverless hosts
 * where the filesystem is read-only.
 */
export async function saveUpload(
  file: File,
  kind: UploadKind
): Promise<{ url: string; id: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError("Unsupported image type (use JPEG, PNG, WEBP, or GIF)");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new UploadError("File is empty");
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new UploadError("Max file size is 5MB");
  }

  const id = randomUUID();
  const pool = getPool();
  await pool.query(
    `INSERT INTO uploads (id, mime, kind, data, size) VALUES ($1, $2, $3, $4, $5)`,
    [id, file.type, kind, buffer, buffer.length]
  );

  return { url: `/api/uploads/${id}`, id };
}

export async function getUpload(
  id: string
): Promise<{ mime: string; data: Buffer } | null> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT mime, data FROM uploads WHERE id = $1 LIMIT 1`,
    [id]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { mime: row.mime as string, data: row.data as Buffer };
}
