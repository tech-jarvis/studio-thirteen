/**
 * next/image only optimizes hosts listed in next.config.ts; any other remote
 * URL throws at render time. Admins can paste image URLs from anywhere, so
 * serve unknown hosts unoptimized instead of crashing the page.
 */
export function isOptimizableImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const { hostname, pathname } = new URL(src);
    return (
      hostname === "images.unsplash.com" ||
      (hostname.endsWith(".supabase.co") && pathname.startsWith("/storage/v1/object/public/"))
    );
  } catch {
    return false;
  }
}
