import Link from "next/link";
import { redirect } from "next/navigation";
import { Salir } from "@/components/salir";
import { PerfilBoda } from "@/components/perfil-boda";
import { CloudSync } from "@/components/cloud-sync";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/panel", label: "Inicio" },
  { href: "/panel/webs", label: "Web de boda" },
  { href: "/panel/regalos", label: "Lista de regalos" },
  { href: "/panel/gestion", label: "Gestión" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/inicio");

  return (
    <div className="min-h-screen bg-background">
      <CloudSync />
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/panel" className="font-display text-xl tracking-tight">
            webodas
          </Link>
          <nav className="hidden gap-6 text-sm text-muted sm:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Salir />
            <PerfilBoda />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
