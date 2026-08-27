import Link from "next/link";
import { PageTitle, Card, Stat } from "@/components/ui";
import { TareasResumen } from "@/components/tareas-resumen";
import { boda, presupuesto, eur } from "@/lib/mock";

const servicios = [
  {
    href: "/panel/webs",
    titulo: "Web de boda",
    desc: "Editor visual para montar tu página: portada, historia, agenda, galería y RSVP.",
    accion: "Abrir editor",
  },
  {
    href: "/panel/regalos",
    titulo: "Lista de regalos",
    desc: "Comparte tu lista y deja que los invitados hagan regalos y aportaciones online.",
    accion: "Ver lista",
  },
  {
    href: "/panel/gestion",
    titulo: "Gestión de la boda",
    desc: "Presupuesto, tiempos, invitados, mesas y proveedores en un solo panel.",
    accion: "Abrir panel",
  },
];

export default function PanelPage() {
  return (
    <div className="space-y-8">
      <PageTitle eyebrow={boda.fechaLarga} title={`Hola, Ana`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Cuenta atrás" value={`${boda.diasRestantes} días`} sub={boda.lugar} />
        <Stat
          label="Invitados"
          value={`${boda.invitadosConfirmados}/${boda.invitadosTotales}`}
          sub="confirmados"
        />
        <Stat
          label="Presupuesto"
          value={eur(presupuesto.gastado)}
          sub={`de ${eur(presupuesto.total)}`}
        />
      </div>

      <div>
        <h2 className="font-display text-xl">Tus servicios</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {servicios.map((s) => (
            <Link key={s.titulo} href={s.href} className="group">
              <Card className="flex h-full flex-col transition group-hover:border-accent">
                <h3 className="font-display text-lg">{s.titulo}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{s.desc}</p>
                <span className="mt-4 text-sm font-medium text-accent">
                  {s.accion} →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <TareasResumen />
    </div>
  );
}
