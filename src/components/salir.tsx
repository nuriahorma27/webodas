import { signout } from "@/lib/auth-actions";

export function Salir() {
  return (
    <form action={signout}>
      <button className="hidden text-muted hover:text-foreground sm:inline">Salir</button>
    </form>
  );
}
