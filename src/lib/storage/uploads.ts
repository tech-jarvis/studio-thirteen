import { randomUUID } from "crypto";
import { getSql } from "@/lib/db/client";
import {
  createSignedUrl,
  getPublicUrl,
  isStorageConfigured,
  uploadObject,
} from "@/lib/storage/supabase";

export type UploadKind = "product" | "payment";

/** Raster image types we accept. SVG is intentionally excluded — stored SVGs
 *  served from our own origin can carry executable script (stored XSS). */
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Prefix for payment proofs kept in the private Supabase bucket. */
const PAYMENT_PREFIX = "payments/";

export class UploadError extends Error {}

/**
 * Persist an uploaded image and return the value to store on the record.
 * - product → public Supabase Storage URL (served from Supabase's CDN)
 * - payment → "payments/<file>" path in the private bucket; view it through
 *   paymentProofUrl(), which signs a short-lived URL
 * Falls back to the Postgres `uploads` table when Storage isn't configured.
 */
export async function saveUpload(
  file: File,
  kind: UploadKind
): Promise<{ url: string; id: string }> {
  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
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

  if (isStorageConfigured()) {
    const path = `${id}.${ext}`;
    if (kind === "product") {
      await uploadObject("products", path, buffer, file.type);
      return { url: getPublicUrl("products", path), id };
    }
    await uploadObject("payments", path, buffer, file.type);
    return { url: `${PAYMENT_PREFIX}${path}`, id };
  }

  const sql = getSql();
  await sql`
    INSERT INTO uploads (id, mime, kind, data, size)
    VALUES (${id}, ${file.type}, ${kind}, ${buffer}, ${buffer.length})
  `;
  return { url: `/api/uploads/${id}`, id };
}

/** Resolve a stored payment screenshot value to a URL an admin can open. */
export async function paymentProofUrl(stored: string) {
  if (stored.startsWith(PAYMENT_PREFIX)) {
    return createSignedUrl("payments", stored.slice(PAYMENT_PREFIX.length));
  }
  return stored;
}

export async function getUpload(
  id: string
): Promise<{ mime: string; data: Buffer } | null> {
  const sql = getSql();
  const rows = await sql`SELECT mime, data FROM uploads WHERE id = ${id} LIMIT 1`;
  const row = rows[0];
  if (!row) return null;
  return { mime: row.mime as string, data: row.data as Buffer };
}
