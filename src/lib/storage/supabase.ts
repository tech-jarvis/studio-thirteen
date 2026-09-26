/**
 * Minimal Supabase Storage client over its REST API (server-only).
 * Uses the project's secret key, so never import this from client code.
 */

export type Bucket = "products" | "payments" | "product-videos";

function getConfig() {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isStorageConfigured() {
  return getConfig() !== null;
}

function authHeaders(key: string): Record<string, string> {
  // New-style secret keys (sb_secret_…) go in `apikey` only; legacy JWT keys
  // are also sent as a bearer token.
  return key.startsWith("eyJ")
    ? { apikey: key, Authorization: `Bearer ${key}` }
    : { apikey: key };
}

function requireConfig() {
  const config = getConfig();
  if (!config) throw new Error("Supabase Storage is not configured");
  return config;
}

export async function uploadObject(
  bucket: Bucket,
  path: string,
  data: Buffer,
  contentType: string
) {
  const { url, key } = requireConfig();
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      ...authHeaders(key),
      "Content-Type": contentType,
      "Cache-Control": "max-age=31536000",
      "x-upsert": "false",
    },
    body: new Uint8Array(data),
  });
  if (!res.ok) {
    throw new Error(`Storage upload failed (${res.status}): ${await res.text()}`);
  }
}

export function getPublicUrl(bucket: Bucket, path: string) {
  const { url } = requireConfig();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

/** Short-lived URL for reading an object from a private bucket. */
export async function createSignedUrl(bucket: Bucket, path: string, expiresIn = 300) {
  const { url, key } = requireConfig();
  const res = await fetch(`${url}/storage/v1/object/sign/${bucket}/${path}`, {
    method: "POST",
    headers: { ...authHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn }),
  });
  if (!res.ok) {
    throw new Error(`Could not sign storage URL (${res.status}): ${await res.text()}`);
  }
  const { signedURL } = (await res.json()) as { signedURL: string };
  return `${url}/storage/v1${signedURL}`;
}

/**
 * One-time URL the browser can PUT a file to directly, bypassing our server
 * (serverless request bodies are too small for videos). Valid for 2 hours.
 */
export async function createSignedUploadUrl(bucket: Bucket, path: string) {
  const { url, key } = requireConfig();
  const res = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: "POST",
    headers: { ...authHeaders(key), "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(`Could not create upload URL (${res.status}): ${await res.text()}`);
  }
  const { url: signedPath } = (await res.json()) as { url: string };
  return `${url}/storage/v1${signedPath}`;
}
