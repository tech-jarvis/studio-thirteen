import { revalidatePath } from "next/cache";

/**
 * Mark every storefront page stale after an admin change (settings,
 * categories, products) so visitors see it on their next page load instead
 * of waiting for the page's revalidate interval.
 */
export function refreshStorefront() {
  revalidatePath("/", "layout");
}
