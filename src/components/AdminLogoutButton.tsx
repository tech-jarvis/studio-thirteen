"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 text-stone-400 hover:text-white"
    >
      <LogOut size={16} /> Logout
    </button>
  );
}
