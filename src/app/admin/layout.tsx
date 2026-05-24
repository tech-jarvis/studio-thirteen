import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import Link from "next/link";
import { Package, FolderOpen, ShoppingCart } from "lucide-react";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-stone-100">
      {authed ? (
        <>
          <header className="bg-stone-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/admin" className="font-semibold text-lg">Studio Thirteen Admin</Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link href="/admin/products" className="hover:text-rose-300 flex items-center gap-1">
                  <Package size={16} /> Products
                </Link>
                <Link href="/admin/categories" className="hover:text-rose-300 flex items-center gap-1">
                  <FolderOpen size={16} /> Categories
                </Link>
                <Link href="/admin/orders" className="hover:text-rose-300 flex items-center gap-1">
                  <ShoppingCart size={16} /> Orders
                </Link>
                <Link href="/" className="text-stone-400 hover:text-white">Storefront</Link>
                <AdminLogoutButton />
              </nav>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
