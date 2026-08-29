import Link from "next/link";
import { redirect } from "next/navigation";
import { Salir } from "@/components/salir";
import { PerfilBoda } from "@/components/perfil-boda";
import { PanelNav } from "@/components/panel-nav";
import { Migas } from "@/components/migas";
import { CloudSync } from "@/components/cloud-sync";
import { createClient } from "@/lib/supabase/server";

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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
          <Link href="/panel" className="font-display text-lg tracking-tight sm:text-xl">
            webodas
          </Link>
          <PanelNav />
          <div className="ml-auto flex items-center gap-2 text-sm sm:gap-3">
            <Salir />
            <PerfilBoda />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <Migas />
        {children}
      </main>
    </div>
  );
}
