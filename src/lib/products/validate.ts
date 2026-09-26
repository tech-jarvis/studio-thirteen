import { Product } from "@/lib/types";

export class ProductValidationError extends Error {}

const MAX_IMAGES = 8;
export const MAX_VIDEOS = 3;

function toInt(value: unknown, field: string, min: number): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < min) {
    throw new ProductValidationError(`${field} must be a whole number of at least ${min}`);
  }
  return n;
}

function toStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
    throw new ProductValidationError(`${field} must be a list`);
  }
  return value.map((v: string) => v.trim()).filter(Boolean);
}

/**
 * Validate admin product input. With `partial`, only the fields present are
 * checked and returned (for PATCH); otherwise all required fields must be set.
 * `originalPrice` of null/"" means "no sale price".
 */
export function parseProductInput(
  body: Record<string, unknown>,
  { partial = false } = {}
): Partial<Product> {
  const out: Partial<Product> = {};
  const has = (k: string) => k in body && body[k] !== undefined;

  if (!partial || has("name")) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new ProductValidationError("Name is required");
    out.name = name.slice(0, 200);
  }
  if (!partial || has("description")) {
    out.description = typeof body.description === "string" ? body.description.trim() : "";
  }
  if (!partial || has("price")) {
    out.price = toInt(body.price, "Price", 1);
  }
  if (!partial || has("stock")) {
    out.stock = toInt(body.stock ?? 0, "Stock", 0);
  }
  if (has("originalPrice")) {
    const raw = body.originalPrice;
    out.originalPrice =
      raw === null || raw === "" ? undefined : toInt(raw, "Original price", 1);
    // Keep the key so an explicit clear reaches the database.
    if (out.originalPrice === undefined) (out as Record<string, unknown>).originalPrice = null;
  }
  if (has("brand")) {
    const brand = typeof body.brand === "string" ? body.brand.trim() : "";
    (out as Record<string, unknown>).brand = brand || null;
  }
  if (!partial || has("images")) {
    const images = toStringArray(body.images ?? [], "Images");
    if (images.length === 0) throw new ProductValidationError("Add at least one image");
    if (images.length > MAX_IMAGES) {
      throw new ProductValidationError(`At most ${MAX_IMAGES} images per product`);
    }
    out.images = images;
  }
  if (!partial || has("videos")) {
    const videos = toStringArray(body.videos ?? [], "Videos");
    if (videos.length > MAX_VIDEOS) {
      throw new ProductValidationError(`At most ${MAX_VIDEOS} videos per product`);
    }
    if (videos.some((v) => !/^https:\/\//.test(v))) {
      throw new ProductValidationError("Videos must be uploaded files or https:// links");
    }
    out.videos = videos;
  }
  if (!partial || has("categoryIds")) {
    out.categoryIds = toStringArray(body.categoryIds ?? [], "Categories");
  }
  if (!partial || has("tags")) {
    out.tags = toStringArray(body.tags ?? [], "Tags");
  }
  if (has("active")) out.active = body.active === true;
  for (const flag of ["featured", "isNew", "isLatest"] as const) {
    if (has(flag)) out[flag] = body[flag] === true;
    else if (!partial) out[flag] = false;
  }

  const price = out.price;
  const original = out.originalPrice;
  if (typeof price === "number" && typeof original === "number" && original <= price) {
    throw new ProductValidationError("Original price must be higher than the sale price");
  }

  return out;
}
