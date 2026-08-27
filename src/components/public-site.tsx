"use client";

import { useEffect, useState } from "react";
import { Render, type Data } from "@measured/puck";
import { puckConfig, plantillaEditorial } from "@/lib/puck/config";

// Prototipo: la web publicada muestra lo último guardado en este navegador,
// o la plantilla de ejemplo si no hay nada.
export function PublicSite({ weddingId }: { weddingId: string }) {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`webodas:site:${weddingId}`);
      setData(saved ? (JSON.parse(saved) as Data) : (plantillaEditorial as Data));
    } catch {
      setData(plantillaEditorial as Data);
    }
  }, [weddingId]);

  if (!data) return null;
  return <Render config={puckConfig} data={data} />;
}
