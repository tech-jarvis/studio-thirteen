import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSettings, saveSettingsSection } from "@/lib/settings";
import { SETTINGS_SECTIONS, SettingsSection } from "@/lib/settings-types";
import { refreshStorefront } from "@/lib/revalidate";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSettings());
}

/** Body: { section: "home" | "store" | "pages", value: {...} } */
export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { section, value } = await request.json();
    if (!SETTINGS_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Unknown settings section" }, { status: 400 });
    }
    const saved = await saveSettingsSection(section as SettingsSection, value);
    refreshStorefront();
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
