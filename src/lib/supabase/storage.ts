import { createSupabaseServerClient } from "./server";
import { PRODUCT_IMAGES_BUCKET } from "./config";

export async function uploadProductImage(
  file: File
): Promise<{ url: string; path: string }> {
  const supabase = createSupabaseServerClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function deleteProductImage(path: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([path]);
  if (error) throw new Error(error.message);
}
