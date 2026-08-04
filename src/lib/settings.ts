"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export interface GlobalSettingsData {
  phoneNumber: string;
  whatsappNumber: string;
  instagramUrl: string;
  googleMapsUrl: string;
  address: string;
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettingsData = {
  phoneNumber: "+91 98475 98053",
  whatsappNumber: "919847598053",
  instagramUrl: "https://www.instagram.com/_anna_caters_events?igsh=MTFvcjJsNmRzNmpwaA==",
  googleMapsUrl: "https://www.google.com/maps/search/Anna+Caterers+Thiruvaniyoor+Kochi+Kerala",
  address: "Thiruvaniyoor, Kochi, Kerala",
};

/**
 * Async helper to fetch global master settings directly from Firestore once (useful for static or server utilities)
 */
export async function getGlobalSettings(): Promise<GlobalSettingsData> {
  try {
    const docRef = doc(db, "settings", "global");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { ...DEFAULT_GLOBAL_SETTINGS, ...snapshot.data() } as GlobalSettingsData;
    }
  } catch (err) {
    console.warn("Error fetching global settings from Firestore, using default fallback:", err);
  }
  return DEFAULT_GLOBAL_SETTINGS;
}

/**
 * Real-time React Hook for storefront components to continuously reflect Admin Suite updates without initial FOUC flicker
 */
export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "global");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings({ ...DEFAULT_GLOBAL_SETTINGS, ...(snapshot.data() as Partial<GlobalSettingsData>) });
        } else {
          setSettings(DEFAULT_GLOBAL_SETTINGS);
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn("Error subscribing to global settings in storefront, falling back:", err);
        setSettings(DEFAULT_GLOBAL_SETTINGS);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    settings,
    isLoading,
    loading: isLoading,
  };
}
