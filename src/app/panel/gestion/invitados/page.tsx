import { Card, Stat, Badge, Button } from "@/components/ui";
import { invitados } from "@/lib/mock";

const tono = (estado: string) =>
  estado === "Confirmado" ? "green" : estado === "Pendiente" ? "amber" : "red";

export default function InvitadosPage() {
  const personas = invitados.reduce((s, i) => s + i.personas, 0);
  const confirmadas = invitados
    .filter((i) => i.estado === "Confirmado")
    .reduce((s, i) => s + i.personas, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invitaciones" value={`${invitados.length}`} sub="grupos" />
        <Stat label="Personas" value={`${personas}`} sub="en total" />
        <Stat label="Confirmadas" value={`${confirmadas}`} sub={`${personas - confirmadas} sin respuesta`} />
      </div>

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex gap-2 text-sm">
            <button className="rounded-full bg-foreground px-3 py-1 text-white">Todos</button>
            <button className="rounded-full border border-line px-3 py-1 text-muted">Confirmados</button>
            <button className="rounded-full border border-line px-3 py-1 text-muted">Pendientes</button>
          </div>
          <Button variant="ghost">Añadir invitado</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5">Invitación</th>
                <th className="px-5 py-2.5">Grupo</th>
                <th className="px-5 py-2.5 text-center">Personas</th>
                <th className="px-5 py-2.5">Mesa</th>
                <th className="px-5 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invitados.map((i) => (
                <tr key={i.nombre}>
                  <td className="px-5 py-3 font-medium">{i.nombre}</td>
                  <td className="px-5 py-3 text-muted">{i.grupo}</td>
                  <td className="px-5 py-3 text-center">{i.personas}</td>
                  <td className="px-5 py-3 text-muted">{i.mesa ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={tono(i.estado)}>{i.estado}</Badge>
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
