"use client";

import { useEffect, useState } from "react";
import { Render, type Data } from "@measured/puck";
import { puckConfig, plantillaEditorial } from "@/lib/puck/config";

// La web publicada. Si se le pasa `data` (páginas públicas por slug) usa eso;
// si no, cae a lo guardado en este navegador (vista previa del panel).
export function PublicSite({ weddingId, data }: { weddingId?: string; data?: Data }) {
  const [d, setD] = useState<Data | null>(data ?? null);

  useEffect(() => {
    if (data) {
      setD(data);
      return;
    }
    try {
      const saved = weddingId ? localStorage.getItem(`webodas:site:${weddingId}`) : null;
      setD(saved ? (JSON.parse(saved) as Data) : (plantillaEditorial as Data));
    } catch {
      setD(plantillaEditorial as Data);
    }
  }, [weddingId, data]);

  if (!d) return null;
  return <Render config={puckConfig} data={d} />;
}
