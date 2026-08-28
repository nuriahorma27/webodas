"use client";

import { useEffect, useState } from "react";

export function CompartirEnlace({ path, label }: { path: string; label?: string }) {
  const [url, setUrl] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    // El invitado usa el mismo dominio en el que está la pareja.
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "");
    setUrl(base + path);
  }, [path]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div>
      {label && <p className="text-xs font-medium text-muted">{label}</p>}
      <div className="mt-1 flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-muted outline-none"
        />
        <button
          onClick={copiar}
          className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          {copiado ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
