import Link from "next/link";
import { Card, Stat, Progress } from "@/components/ui";
import { boda, presupuesto, tareas, invitados, eur } from "@/lib/mock";

export default function ResumenPage() {
  const pendientes = tareas.filter((t) => !t.hecho);
  const sinConfirmar = invitados.filter((i) => i.estado === "Pendiente").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Días" value={`${boda.diasRestantes}`} sub="para la boda" />
        <Stat label="Presupuesto" value={eur(presupuesto.gastado)} sub={`de ${eur(presupuesto.total)}`} />
        <Stat label="Confirmados" value={`${boda.invitadosConfirmados}`} sub={`de ${boda.invitadosTotales}`} />
        <Stat label="Tareas" value={`${pendientes.length}`} sub="pendientes" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Próximas tareas</h2>
            <Link href="/panel/gestion/tiempos" className="text-sm text-accent">
              Ver todas →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {pendientes.slice(0, 4).map((t) => (
              <li key={t.titulo} className="flex items-center justify-between py-2.5 text-sm">
                <span>{t.titulo}</span>
                <span className="text-muted">{t.fecha}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-lg">Necesita tu atención</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
              {sinConfirmar} grupos de invitados sin confirmar asistencia
            </li>
            <li className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
              Transporte de invitados sin pagar ({eur(1200)})
            </li>
            <li className="rounded-md bg-neutral-100 px-3 py-2 text-muted">
              Presupuesto de la tarta pendiente de recibir
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Presupuesto consumido</h2>
          <span className="text-sm text-muted">
            {Math.round((presupuesto.gastado / presupuesto.total) * 100)}%
          </span>
        </div>
        <div className="mt-3">
          <Progress value={(presupuesto.gastado / presupuesto.total) * 100} />
        </div>
      </Card>
    </div>
  );
}
