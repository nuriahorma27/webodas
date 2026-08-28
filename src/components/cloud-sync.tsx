"use client";

import { useEffect } from "react";
import { startCloudSync } from "@/lib/cloud-sync";

// Monta esto en las zonas privadas: arranca la sincronización con la nube.
export function CloudSync() {
  useEffect(() => {
    startCloudSync();
  }, []);
  return null;
}
