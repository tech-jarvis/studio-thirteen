"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Invalid password");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 shadow-sm border border-stone-200">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Admin Login</h1>
        <p className="text-sm text-stone-500 mb-6">Manage products, categories, and orders.</p>
        <label className="block mb-4">
          <span className="text-sm text-stone-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
          />
        </label>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-xs text-stone-400 mt-4">Default password: admin123</p>
      </form>
    </main>
  );
}
