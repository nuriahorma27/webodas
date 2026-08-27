import Link from "next/link";

const nav = [
  { href: "/panel", label: "Inicio" },
  { href: "/panel/webs", label: "Web de boda" },
  { href: "/panel/regalos", label: "Lista de regalos" },
  { href: "/panel/gestion", label: "Gestión" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
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
            <span className="hidden text-muted sm:inline">Ana</span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft font-display text-accent">
              A
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
