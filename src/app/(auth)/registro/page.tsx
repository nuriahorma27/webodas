import { AuthForm } from "@/components/auth-form";
import { registro } from "@/lib/auth-actions";

export default function RegistroPage() {
  return <AuthForm mode="registro" action={registro} />;
}
