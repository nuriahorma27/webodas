import { Card, Progress, Button } from "@/components/ui";
import { mesas, invitados } from "@/lib/mock";

export default function MesasPage() {
  const sinAsignar = invitados.filter((i) => i.estado === "Confirmado" && !i.mesa);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {mesas.length} mesas · {mesas.reduce((s, m) => s + m.asientos, 0)} asientos
        </p>
        <Button variant="ghost">Añadir mesa</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mesas.map((m) => (
          <Card key={m.id}>
            <p className="font-display text-lg">{m.nombre}</p>
            <p className="mt-1 text-sm text-muted">
              {m.ocupados} / {m.asientos} asientos
            </p>
            <div className="mt-3">
              <Progress value={(m.ocupados / m.asientos) * 100} />
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {invitados
                .filter((i) => i.mesa === m.id)
                .map((i) => (
                  <p key={i.nombre} className="text-muted">
                    {i.nombre} ({i.personas})
                  </p>
                ))}
              {m.ocupados === 0 && <p className="text-muted">Vacía</p>}
            </div>
          </Card>
        ))}
      </div>

      {sinAsignar.length > 0 && (
        <Card>
          <p className="font-display text-lg">Sin asignar mesa</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sinAsignar.map((i) => (
              <span key={i.nombre} className="rounded-full bg-accent-soft px-3 py-1 text-sm">
                {i.nombre}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
