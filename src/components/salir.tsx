"use client";

import { useRouter } from "next/navigation";

export function Salir() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        document.cookie = "wb_session=; path=/; max-age=0";
        router.push("/");
      }}
      className="hidden text-muted hover:text-foreground sm:inline"
    >
      Salir
    </button>
  );
}
