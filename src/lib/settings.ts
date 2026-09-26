import { cache } from "react";
import { getSql } from "@/lib/db/client";
import {
  DEFAULT_SETTINGS,
  SETTINGS_SECTIONS,
  SettingsSection,
  SiteSettings,
} from "@/lib/settings-types";

const MAX_TEXT = 5000;

/** Allow site-relative links and http(s)/mailto/tel URLs; anything else
 *  (e.g. javascript:) is dropped. */
function safeUrl(value: string) {
  if (value === "") return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return /^(https?:\/\/|mailto:|tel:)/i.test(value) ? value : "";
}

const URL_KEYS = /(Link|image|instagram|facebook|tiktok)$/;

/**
 * Shape `input` like `defaults`: keep only known keys, coerce to the default's
 * type, and fall back to the default for anything missing or wrong.
 */
function conform<T>(defaults: T, input: unknown, key = ""): T {
  if (typeof defaults === "boolean") {
    return (typeof input === "boolean" ? input : defaults) as T;
  }
  if (typeof defaults === "string") {
    if (typeof input !== "string") return defaults;
    let value = input.trim().slice(0, MAX_TEXT);
    if (URL_KEYS.test(key)) value = safeUrl(value);
    if (key === "whatsapp") value = value.replace(/\D/g, "");
    return value as T;
  }
  if (defaults && typeof defaults === "object") {
    const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const [k, d] of Object.entries(defaults)) {
      out[k] = conform(d, source[k], k);
    }
    return out as T;
  }
  return defaults;
}

export function parseSettingsSection<S extends SettingsSection>(
  section: S,
  input: unknown
): SiteSettings[S] {
  return conform(DEFAULT_SETTINGS[section], input);
}

/** All storefront settings, merged over defaults. Deduped per request. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const settings = structuredClone(DEFAULT_SETTINGS);
  try {
    const sql = getSql();
    const rows = await sql<{ key: string; value: unknown }[]>`
      SELECT key, value FROM site_settings
    `;
    for (const row of rows) {
      if ((SETTINGS_SECTIONS as string[]).includes(row.key)) {
        const section = row.key as SettingsSection;
        (settings as Record<SettingsSection, unknown>)[section] = parseSettingsSection(
          section,
          row.value
        );
      }
    }
  } catch (error) {
    // Never take the storefront down over settings; defaults still render.
    console.error("Failed to load site settings", error);
  }
  return settings;
});

export async function saveSettingsSection<S extends SettingsSection>(
  section: S,
  input: unknown
): Promise<SiteSettings[S]> {
  const value = parseSettingsSection(section, input);
  const sql = getSql();
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${section}, ${sql.json(value as never)}, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
  return value;
}
