import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrders, getProducts, getCategories } from "@/lib/store";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const [orders, products, categories] = await Promise.all([
    getOrders(),
    getProducts(),
    getCategories(),
  ]);

  const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentMethod === "cod")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Products", value: products.length, href: "/admin/products" },
          { label: "Categories", value: categories.length, href: "/admin/categories" },
          { label: "Total Orders", value: orders.length, href: "/admin/orders" },
          { label: "Pending Orders", value: pendingOrders, href: "/admin/orders" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white p-6 border border-stone-200 hover:border-stone-400 transition-colors">
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="text-3xl font-semibold text-stone-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 p-6 mb-8">
        <p className="text-sm text-stone-500">Estimated Revenue</p>
        <p className="text-2xl font-semibold text-stone-900">{formatPrice(totalRevenue)}</p>
      </div>

      <div className="bg-white border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-rose-600 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="p-6 text-stone-400 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-stone-50">
                    <td className="px-6 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-3">{order.customerName}</td>
                    <td className="px-6 py-3">{formatPrice(order.total)}</td>
                    <td className="px-6 py-3 capitalize">{order.paymentMethod}</td>
                    <td className="px-6 py-3 capitalize">{order.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
