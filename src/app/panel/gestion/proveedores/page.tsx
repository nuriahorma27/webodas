import { Card, Badge, Button } from "@/components/ui";
import { proveedores } from "@/lib/mock";

export default function ProveedoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{proveedores.length} proveedores</p>
        <Button variant="ghost">Añadir proveedor</Button>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5">Proveedor</th>
                <th className="px-5 py-2.5">Categoría</th>
                <th className="px-5 py-2.5">Contacto</th>
                <th className="px-5 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {proveedores.map((p) => (
                <tr key={p.nombre}>
                  <td className="px-5 py-3 font-medium">{p.nombre}</td>
                  <td className="px-5 py-3 text-muted">{p.categoria}</td>
                  <td className="px-5 py-3 text-muted">{p.contacto}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.estado === "Contratado" ? "green" : "amber"}>{p.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
