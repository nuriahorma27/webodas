"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Navegación entre secciones.
// - Móvil: un desplegable (patrón recomendado para >5 secciones equivalentes).
// - Escritorio: pestañas.
export function TabsNav({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const actual = tabs.find((t) => t.href === pathname) ?? tabs[0];

  return (
    <>
      {/* Móvil */}
      <label className="block sm:hidden">
        <span className="sr-only">Sección de gestión</span>
        <div className="relative">
          <select
            value={actual.href}
            onChange={(e) => router.push(e.target.value)}
            className="w-full appearance-none rounded-lg border border-line bg-surface py-2.5 pl-3 pr-9 text-sm font-medium text-foreground outline-none focus:border-accent"
          >
            {tabs.map((t) => (
              <option key={t.href} value={t.href}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            ▾
          </span>
        </div>
      </label>

      {/* Escritorio */}
      <div className="hidden gap-1 overflow-x-auto border-b border-line sm:flex">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition ${
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
