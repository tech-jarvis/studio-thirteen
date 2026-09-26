import PolicyPage from "@/components/PolicyPage";
import { getSettings } from "@/lib/settings";

export default async function ReturnsPage() {
  const { pages, store } = await getSettings();
  return <PolicyPage page={pages.returns} store={store} />;
}
