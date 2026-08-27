import Link from "next/link";

export const metadata = { title: "Privacidad · webodas" };

export default function Privacidad() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Link href="/" className="text-sm text-muted hover:underline">
        ← webodas
      </Link>
      <h1 className="mt-4 font-display text-3xl">Política de privacidad</h1>
      <div className="mt-6 space-y-4 text-sm text-muted">
        <p>
          Tratamos los datos que nos facilitáis (email, contenido de vuestra web, lista de invitados
          y de regalos) con la única finalidad de prestaros el servicio.
        </p>
        <p>
          Los pagos de la lista de regalos los gestiona Stripe, que trata los datos de pago según su
          propia política de privacidad.
        </p>
        <p>
          Podéis solicitar el acceso, rectificación o eliminación de vuestros datos escribiendo a
          hola@webodas.com.
        </p>
        <p className="text-xs">
          Documento en preparación. Se completará con los detalles del responsable del tratamiento
          antes del lanzamiento.
        </p>
      </div>
    </div>
  );
}
