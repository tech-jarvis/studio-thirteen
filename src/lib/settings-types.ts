/**
 * Admin-editable storefront settings: types and defaults.
 * Safe to import from client components (no server-only code).
 */
import { SITE } from "@/lib/site-config";

export type SectionToggle = { show: boolean; title: string };

export type HomeSettings = {
  hero: {
    image: string;
    eyebrow: string;
    /** Line breaks are kept. */
    title: string;
    subtitle: string;
    primaryLabel: string;
    primaryLink: string;
    secondaryLabel: string;
    secondaryLink: string;
  };
  sections: {
    seasons: SectionToggle;
    types: SectionToggle;
    latest: SectionToggle;
    featured: SectionToggle;
    newArrivals: SectionToggle;
  };
  promo: {
    show: boolean;
    title: string;
    text: string;
    buttonLabel: string;
    buttonLink: string;
  };
};

export type StoreSettings = {
  businessName: string;
  /** Short blurb shown in the footer. */
  tagline: string;
  email: string;
  phone: string;
  /** WhatsApp number in international format, digits only (e.g. 923001234567). */
  whatsapp: string;
  address: string;
  hours: string;
  deliveryDays: string;
  announcement: { show: boolean; text: string };
  social: { instagram: string; facebook: string; tiktok: string };
  seo: { title: string; description: string };
};

export type PageContent = { title: string; body: string };

export type PagesSettings = {
  shipping: PageContent;
  returns: PageContent;
};

export type SiteSettings = {
  home: HomeSettings;
  store: StoreSettings;
  pages: PagesSettings;
};

export type SettingsSection = keyof SiteSettings;
export const SETTINGS_SECTIONS: SettingsSection[] = ["home", "store", "pages"];

export const DEFAULT_SETTINGS: SiteSettings = {
  home: {
    hero: {
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80",
      eyebrow: "We Deal in Brands Only",
      title: "Premium Branded\nLawn & Suits",
      subtitle:
        "Unstitched 2pc & 3pc, embroidered collections, and patches. Minimum order Rs. 1,000. Cash on delivery, or pay by bank transfer for 5% off.",
      primaryLabel: "Shop Now",
      primaryLink: "/shop",
      secondaryLabel: "View Sale",
      secondaryLink: "/shop?tag=sale",
    },
    sections: {
      seasons: { show: true, title: "Shop by Season" },
      types: { show: true, title: "Product Type" },
      latest: { show: true, title: "Latest Products" },
      featured: { show: true, title: "Featured" },
      newArrivals: { show: true, title: "New Arrivals" },
    },
    promo: {
      show: true,
      title: "5% Off on Bank Transfer",
      text: "Transfer to our account and upload your payment screenshot to save 5%. Prefer cash on delivery? That works too — choose at checkout.",
      buttonLabel: "Start Shopping",
      buttonLink: "/shop",
    },
  },
  store: {
    businessName: SITE.businessName,
    tagline: "Premium branded lawn, embroidered suits, and patches at honest prices. We deal in brands only.",
    email: SITE.email,
    phone: SITE.phone,
    whatsapp: SITE.phoneWhatsApp,
    address: SITE.address,
    hours: SITE.hours,
    deliveryDays: SITE.deliveryDays,
    announcement: {
      show: true,
      text: `Minimum order Rs. 1,000 · Delivery ${SITE.deliveryDays} · 5% off on bank transfer`,
    },
    social: { instagram: "", facebook: "", tiktok: "" },
    seo: {
      title: "Studio Thirteen — Premium Branded Fashion",
      description:
        "Shop branded lawn, embroidered 2pc & 3pc suits, patches, and more. Cash on delivery or bank transfer with 5% off.",
    },
  },
  pages: {
    shipping: {
      title: "Shipping Policy",
      body: `## Delivery Time
Orders are delivered within {deliveryDays} across Pakistan, depending on your city and courier availability.

## Shipping Fee
A flat shipping fee of {shippingFee} applies to all orders. This is added at checkout.

## Minimum Order
Minimum order value is {minOrder}. Orders below this amount cannot be placed.

## Order Processing
Once your order is confirmed (and payment verified for bank transfer orders), we prepare and dispatch your parcel. You can track your order anytime using your order number on our Track Order page.

## Cash on Delivery
COD is available nationwide. Please keep the exact amount ready when the courier arrives.

## Contact
Questions about your delivery? WhatsApp us at {phone} or email {email}.`,
    },
    returns: {
      title: "Returns & Exchanges",
      body: `## Our Policy
At {businessName}, we deal in branded unstitched and ready-to-wear fashion. Because of the nature of fabric and suit products, we handle returns and exchanges on a case-by-case basis.

## Eligible for Return / Exchange
- Wrong item received (different product than ordered)
- Damaged or defective product on arrival
- Significant difference from product description or images

## Not Eligible
- Change of mind after order is confirmed
- Minor colour variation due to screen settings
- Products that have been cut, stitched, or altered
- Sale items marked as final sale

## How to Request
Contact us within 48 hours of receiving your order via WhatsApp ({phone}) or email ({email}). Include your order number and photos of the issue.

## Refunds
Approved refunds are processed within 5–7 working days to your original payment method (bank transfer) or as store credit, depending on the situation.`,
    },
  },
};

export function whatsAppUrl(number: string, text?: string) {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
