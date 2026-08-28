"use client";

import { use, useEffect, useState } from "react";
import { SaveTheDateView } from "@/components/save-the-date-view";
import { loadStd, setStdOverride, type SaveTheDate } from "@/lib/savethedate";
import { setBodaOverride } from "@/lib/boda";
import { fetchBundlePublico, pickBundle } from "@/lib/wedding";

export default function StdPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [estado, setEstado] = useState<"cargando" | "ok" | "404">("cargando");
  const [std, setStd] = useState<SaveTheDate | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if ((slug === "ana-y-leo" || slug === "demo") && localStorage.getItem("webodas:savethedate")) {
        setStd(loadStd());
        setEstado("ok");
        return;
      }
      const res = await fetchBundlePublico(slug);
      if (!vivo) return;
      if (!res || !res.found) return setEstado("404");
      const s = pickBundle<SaveTheDate | null>(res.data, "webodas:savethedate", null);
      if (!s || !s.publicada) return setEstado("404");
      setBodaOverride(pickBundle(res.data, "webodas:boda", null));
      setStdOverride(s);
      setStd(loadStd());
      setEstado("ok");
    })();
    return () => {
      vivo = false;
      setStdOverride(null);
      setBodaOverride(null);
    };
  }, [slug]);

  if (estado === "cargando") return null;
  if (estado === "404" || !std)
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-100 p-8 text-center text-sm text-neutral-500">
        Este Save the date no existe o todavía no está publicado.
      </div>
    );

  return (
    <div className="grid min-h-screen place-items-center p-6" style={{ backgroundColor: std.colorBg }}>
      <div className="w-full max-w-md">
        <SaveTheDateView std={std} />
      </div>
    </div>
  );
}
