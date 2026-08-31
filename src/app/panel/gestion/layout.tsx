import { TabsNav } from "@/components/tabs-nav";
import { GestionHeader } from "@/components/gestion-header";

const tabs = [
  { href: "/panel/gestion/presupuesto", label: "Presupuesto", group: "Planificación" },
  { href: "/panel/gestion/tiempos", label: "Tareas", group: "Planificación" },
  { href: "/panel/gestion/proveedores", label: "Proveedores", group: "Planificación" },
  { href: "/panel/gestion/regalos", label: "Regalos", group: "Planificación" },
  { href: "/panel/gestion/invitados", label: "Lista", group: "Invitados" },
  { href: "/panel/gestion/confirmaciones", label: "Confirmaciones", group: "Invitados" },
  { href: "/panel/gestion/formulario", label: "Formulario", group: "Invitados" },
  { href: "/panel/gestion/mesas", label: "Mesas", group: "Invitados" },
];

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gestion-shell space-y-5 sm:space-y-6">
      <GestionHeader />
      <div data-tour="gestion-nav">
        <TabsNav tabs={tabs} />
      </div>
      <div className="gestion-content">{children}</div>
    </div>
  );
}
