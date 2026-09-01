import Link from "next/link";

export const metadata = { title: "Privacidad · webodas" };

export default function Privacidad() {
  return (
    <div className="lp min-h-screen">
      <header className="border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="lp-serif text-xl">
            webodas
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]">
            ← Volver
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-5 py-16">
        <p className="lp-eyebrow">Información legal</p>
        <h1 className="lp-serif mt-3 text-4xl leading-tight sm:text-5xl">
          Política de privacidad
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)]">Última actualización: agosto de 2026.</p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="lp-serif text-2xl">Qué datos tratamos</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              Tratamos los datos que nos facilitáis (email, contenido de vuestra web, lista de
              invitados y de regalos) con la única finalidad de prestaros el servicio.
            </p>
          </section>
          <section>
            <h2 className="lp-serif text-2xl">Pagos</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              Los pagos de la lista de regalos los gestiona Stripe, que trata los datos de pago según
              su propia política de privacidad.
            </p>
          </section>
          <section>
            <h2 className="lp-serif text-2xl">Vuestros derechos</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              Podéis solicitar el acceso, la rectificación o la eliminación de vuestros datos
              escribiendo a{" "}
              <a href="mailto:hola@webodas.com" className="underline underline-offset-4">
                hola@webodas.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-[var(--rule)] pt-6 text-xs text-[var(--muted)]">
          Documento en preparación. Se completará con los detalles del responsable del tratamiento
          antes del lanzamiento.
        </p>
      </article>
    </div>
  );
}
