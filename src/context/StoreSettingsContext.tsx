"use client";

import { createContext, useContext, ReactNode } from "react";
import { DEFAULT_SETTINGS, StoreSettings } from "@/lib/settings-types";

const StoreSettingsContext = createContext<StoreSettings>(DEFAULT_SETTINGS.store);

/** Makes admin-edited store info (contact, WhatsApp…) available to client pages. */
export function StoreSettingsProvider({
  value,
  children,
}: {
  value: StoreSettings;
  children: ReactNode;
}) {
  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
