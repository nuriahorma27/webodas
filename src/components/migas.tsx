"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Enlace "volver" según dónde estés dentro del panel.
const VUELTA: Record<string, { href: string; label: string }> = {
  "/panel/webs": { href: "/panel", label: "Panel" },
  "/panel/regalos": { href: "/panel", label: "Panel" },
  "/panel/save-the-date": { href: "/panel/webs", label: "Webs" },
  "/panel/invitacion": { href: "/panel/webs", label: "Webs" },
  "/panel/gestion": { href: "/panel", label: "Panel" },
};

export function Migas() {
  const pathname = usePathname();
  if (pathname === "/panel") return null;

  let destino = VUELTA[pathname];
  if (!destino && pathname.startsWith("/panel/gestion/")) {
    destino = { href: "/panel", label: "Panel" };
  }
  if (!destino) destino = { href: "/panel", label: "Panel" };

  return (
    <Link
      href={destino.href}
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
    >
      <span aria-hidden>←</span> {destino.label}
    </Link>
  );
}
