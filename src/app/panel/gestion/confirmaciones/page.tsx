import { redirect } from "next/navigation";

// Las confirmaciones ahora viven dentro de la Lista de invitados.
export default function ConfirmacionesPage() {
  redirect("/panel/gestion/invitados");
}
