import PolicyPage from "@/components/PolicyPage";
import { getSettings } from "@/lib/settings";

export default async function ShippingPage() {
  const { pages, store } = await getSettings();
  return <PolicyPage page={pages.shipping} store={store} />;
}
