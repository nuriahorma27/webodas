import Link from "next/link";

export const metadata = { title: "Aviso legal · webodas" };

export default function Legal() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Link href="/" className="text-sm text-muted hover:underline">
        ← webodas
      </Link>
      <h1 className="mt-4 font-display text-3xl">Aviso legal</h1>
      <div className="mt-6 space-y-4 text-sm text-muted">
        <p>
          webodas es una plataforma para organizar bodas: creación de páginas web, listas de regalos
          y gestión de la celebración.
        </p>
        <p>
          Las aportaciones de la lista de regalos se procesan a través de Stripe y se abonan
          directamente a la cuenta de cada pareja. webodas actúa únicamente como plataforma
          tecnológica y no retiene los fondos.
        </p>
        <p>Contacto: hola@webodas.com</p>
        <p className="text-xs">
          Documento en preparación. Se completará con la información fiscal y de titularidad antes del
          lanzamiento.
        </p>
      </div>
    </div>
  );
}
