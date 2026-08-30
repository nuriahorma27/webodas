"use client";

import { use, useEffect, useState } from "react";
import { InvitacionView } from "@/components/invitacion-view";
import { loadInvitacion, setInvitacionOverride, type Invitacion } from "@/lib/invitacion";
import { setBodaOverride } from "@/lib/boda";
import { fetchBundlePublico, pickBundle } from "@/lib/wedding";

export default function InvitacionPublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [estado, setEstado] = useState<"cargando" | "ok" | "404">("cargando");
  const [inv, setInv] = useState<Invitacion | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if ((slug === "ana-y-leo" || slug === "demo") && localStorage.getItem("webodas:invitacion")) {
        setInv(loadInvitacion());
        setEstado("ok");
        return;
      }
      const res = await fetchBundlePublico(slug);
      if (!vivo) return;
      if (!res || !res.found) return setEstado("404");
      const i = pickBundle<Invitacion | null>(res.data, "webodas:invitacion", null);
      if (!i || !i.publicada) return setEstado("404");
      setBodaOverride(pickBundle(res.data, "webodas:boda", null));
      setInvitacionOverride(i);
      setInv(loadInvitacion());
      setEstado("ok");
    })();
    return () => {
      vivo = false;
      setInvitacionOverride(null);
      setBodaOverride(null);
    };
  }, [slug]);

  if (estado === "cargando") return null;
  if (estado === "404" || !inv)
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-100 p-8 text-center text-sm text-neutral-500">
        Esta invitación no existe o todavía no está publicada.
      </div>
    );

  return (
    <div className="grid min-h-screen place-items-center p-6" style={{ backgroundColor: inv.colorBg }}>
      <div className="w-full max-w-md">
        <InvitacionView inv={inv} />
      </div>
    </div>
  );
}
