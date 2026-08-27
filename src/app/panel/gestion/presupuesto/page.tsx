import { Card, Stat, Progress, Button } from "@/components/ui";
import { presupuesto, eur } from "@/lib/mock";

export default function PresupuestoPage() {
  const estimado = presupuesto.partidas.reduce((s, p) => s + p.estimado, 0);
  const pagado = presupuesto.partidas.reduce((s, p) => s + p.pagado, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Presupuesto total" value={eur(presupuesto.total)} />
        <Stat label="Estimado (partidas)" value={eur(estimado)} sub={`${eur(presupuesto.total - estimado)} sin asignar`} />
        <Stat label="Pagado" value={eur(pagado)} sub={`${eur(estimado - pagado)} pendiente`} />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display text-lg">Partidas</h2>
          <Button variant="ghost">Añadir partida</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5">Concepto</th>
                <th className="px-5 py-2.5">Proveedor</th>
                <th className="px-5 py-2.5 text-right">Estimado</th>
                <th className="px-5 py-2.5 text-right">Pagado</th>
                <th className="px-5 py-2.5 w-40">Avance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {presupuesto.partidas.map((p) => (
                <tr key={p.concepto}>
                  <td className="px-5 py-3 font-medium">{p.concepto}</td>
                  <td className="px-5 py-3 text-muted">{p.proveedor}</td>
                  <td className="px-5 py-3 text-right">{eur(p.estimado)}</td>
                  <td className="px-5 py-3 text-right">{eur(p.pagado)}</td>
                  <td className="px-5 py-3">
                    <Progress value={p.estimado ? (p.pagado / p.estimado) * 100 : 0} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-line font-medium">
              <tr>
                <td className="px-5 py-3" colSpan={2}>Total</td>
                <td className="px-5 py-3 text-right">{eur(estimado)}</td>
                <td className="px-5 py-3 text-right">{eur(pagado)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
