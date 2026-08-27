"use client";

import { useEffect, useState } from "react";
import { OnboardingBoda } from "@/components/onboarding-boda";
import { loadBoda, nombrePareja, type BodaPerfil } from "@/lib/boda";

export function PerfilBoda() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setBoda(loadBoda());
    sync();
    window.addEventListener("webodas:boda", sync);
    return () => window.removeEventListener("webodas:boda", sync);
  }, []);

  const inicial = boda
    ? nombrePareja(boda)
        .split("&")
        .map((s) => s.trim()[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Editar datos de la boda"
        className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft font-display text-sm text-accent"
      >
        {inicial || "AL"}
      </button>
      {open && boda && <OnboardingBoda inicial={boda} onClose={() => setOpen(false)} />}
    </>
  );
}
