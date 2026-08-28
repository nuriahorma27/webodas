"use client";

import { use, useEffect, useState } from "react";
import type { Data } from "@measured/puck";
import { PublicSite } from "@/components/public-site";
import { plantillaEditorial } from "@/lib/puck/config";
import { setBodaOverride } from "@/lib/boda";
import { setFormularioOverride } from "@/lib/formulario";
import { setListaOverride } from "@/lib/regalos";
import {
  fetchBundlePublico,
  pickBundle,
  setPublicWeddingId,
  type BundlePublico,
} from "@/lib/wedding";

export default function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [estado, setEstado] = useState<"cargando" | "ok" | "404">("cargando");
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      // Compatibilidad: el prototipo usaba "ana-y-leo" leyendo este navegador.
      if ((slug === "ana-y-leo" || slug === "demo") && localStorage.getItem("webodas:site:demo")) {
        try {
          setData(JSON.parse(localStorage.getItem("webodas:site:demo")!) as Data);
          setEstado("ok");
          return;
        } catch {
          /* sigue al servidor */
        }
      }
      const res = await fetchBundlePublico(slug);
      if (!vivo) return;
      if (!res || !res.found) {
        setEstado("404");
        return;
      }
      setPublicWeddingId(res.id, slug);
      const b = res.data as BundlePublico;
      setBodaOverride(pickBundle(b, "webodas:boda", null));
      setFormularioOverride(pickBundle(b, "webodas:formulario", null));
      setListaOverride(pickBundle(b, "webodas:regalos", null));
      setData(pickBundle<Data>(b, "webodas:site:demo", plantillaEditorial as Data));
      setEstado("ok");
    })();
    return () => {
      vivo = false;
      setPublicWeddingId(null);
      setBodaOverride(null);
      setFormularioOverride(null);
      setListaOverride(null);
    };
  }, [slug]);

  if (estado === "cargando") return null;
  if (estado === "404")
    return (
      <div className="grid min-h-screen place-items-center p-8 text-center text-sm text-neutral-500">
        Esta web de boda no existe o todavía no se ha publicado.
      </div>
    );
  return <PublicSite data={data ?? undefined} />;
}
