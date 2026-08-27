"use client";

import { createClient } from "@/lib/supabase/client";

export function Salir() {
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        window.location.href = "/";
      }}
      className="hidden text-muted hover:text-foreground sm:inline"
    >
      Salir
    </button>
  );
}
