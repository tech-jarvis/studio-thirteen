import { promises as fs } from "fs";
import path from "path";

const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PAYMENT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "payments");

export async function uploadProductImageLocal(
  file: File
): Promise<{ url: string; path: string }> {
  await fs.mkdir(PRODUCT_UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return {
    url: `/uploads/products/${filename}`,
    path: filename,
  };
}

export async function uploadPaymentProofLocal(
  file: File
): Promise<{ url: string; path: string }> {
  await fs.mkdir(PAYMENT_UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(PAYMENT_UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return {
    url: `/uploads/payments/${filename}`,
    path: filename,
  };
}
