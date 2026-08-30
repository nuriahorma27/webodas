"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/panel", label: "Inicio" },
  { href: "/panel/webs", label: "Web e invitaciones" },
  { href: "/panel/regalos", label: "Lista de regalos" },
  { href: "/panel/gestion", label: "Gestión" },
];

export function PanelNav() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const activo = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
  const cerrarSesion = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* escritorio */}
      <nav className="hidden gap-6 text-sm text-muted sm:flex">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={activo(n.href) ? "text-foreground" : "hover:text-foreground"}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {/* móvil */}
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Menú"
        className="grid h-9 w-9 place-items-center rounded-md border border-line sm:hidden"
      >
        <span className="text-lg leading-none">{abierto ? "✕" : "☰"}</span>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 top-[57px] z-50 bg-black/30 sm:hidden"
          onClick={() => setAbierto(false)}
        >
          <div className="border-b border-line bg-surface" onClick={(e) => e.stopPropagation()}>
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setAbierto(false)}
                className={`block px-5 py-3 text-sm ${
                  activo(n.href) ? "bg-accent-soft/40 font-medium text-foreground" : "text-muted"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={cerrarSesion}
              className="block w-full border-t border-line px-5 py-3 text-left text-sm font-medium text-[#7a4038]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
