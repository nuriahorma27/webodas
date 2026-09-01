import { GestionNav } from "@/components/tabs-nav";
import { GestionHeader } from "@/components/gestion-header";

const tabs = [
  { href: "/panel/gestion/presupuesto", label: "Presupuesto", group: "Planificación" },
  { href: "/panel/gestion/tiempos", label: "Tareas", group: "Planificación" },
  { href: "/panel/gestion/proveedores", label: "Proveedores", group: "Planificación" },
  { href: "/panel/gestion/regalos", label: "Regalos", group: "Planificación" },
  { href: "/panel/gestion/invitados", label: "Lista de invitados", group: "Invitados" },
  { href: "/panel/gestion/formulario", label: "Formulario", group: "Invitados" },
  { href: "/panel/gestion/mesas", label: "Mesas", group: "Invitados" },
];

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gestion-shell lg:grid lg:grid-cols-[12rem_1fr] lg:gap-10">
      <div data-tour="gestion-nav" className="mb-6 lg:mb-0">
        <GestionNav tabs={tabs} />
      </div>
      <div className="min-w-0 space-y-5 sm:space-y-6">
        <GestionHeader />
        <div className="gestion-content">{children}</div>
      </div>
    </div>
  );
}
