import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ONLINE_DISCOUNT_PERCENT } from "@/lib/pricing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Studio Thirteen — Premium Branded Fashion",
  description: `Shop branded lawn, embroidered 2pc & 3pc suits, patches, and more. Cash on delivery or bank transfer with ${ONLINE_DISCOUNT_PERCENT}% off.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-stone-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
