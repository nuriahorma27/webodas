import { PageTitle } from "@/components/ui";
import { TabsNav } from "@/components/tabs-nav";

const tabs = [
  { href: "/panel/gestion", label: "Resumen" },
  { href: "/panel/gestion/presupuesto", label: "Presupuesto" },
  { href: "/panel/gestion/tiempos", label: "Tareas" },
  { href: "/panel/gestion/invitados", label: "Invitados" },
  { href: "/panel/gestion/formulario", label: "Formulario" },
  { href: "/panel/gestion/mesas", label: "Mesas" },
  { href: "/panel/gestion/proveedores", label: "Proveedores" },
];

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageTitle title="Gestión de la boda" />
      <div data-tour="gestion-nav">
        <TabsNav tabs={tabs} />
      </div>
      <div>{children}</div>
    </div>
  );
}
