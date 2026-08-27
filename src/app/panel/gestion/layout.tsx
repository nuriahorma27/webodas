import { PageTitle } from "@/components/ui";
import { TabsNav } from "@/components/tabs-nav";

const tabs = [
  { href: "/panel/gestion", label: "Resumen" },
  { href: "/panel/gestion/presupuesto", label: "Presupuesto" },
  { href: "/panel/gestion/tiempos", label: "Tareas" },
  { href: "/panel/gestion/invitados", label: "Invitados" },
  { href: "/panel/gestion/confirmaciones", label: "Confirmaciones" },
  { href: "/panel/gestion/mesas", label: "Mesas" },
  { href: "/panel/gestion/proveedores", label: "Proveedores" },
];

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Servicio" title="Gestión de la boda" />
      <TabsNav tabs={tabs} />
      <div>{children}</div>
    </div>
  );
}
