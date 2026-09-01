import Link from "next/link";

export const metadata = { title: "Aviso legal · webodas" };

export default function Legal() {
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
        <h1 className="lp-serif mt-3 text-4xl leading-tight sm:text-5xl">Aviso legal</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">Última actualización: agosto de 2026.</p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="lp-serif text-2xl">Qué es webodas</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              webodas es una plataforma para organizar bodas: creación de páginas web, listas de
              regalos y gestión de la celebración.
            </p>
          </section>
          <section>
            <h2 className="lp-serif text-2xl">Aportaciones de la lista de regalos</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              Las aportaciones por tarjeta se procesan a través de Stripe y se abonan directamente a
              la cuenta de cada pareja. webodas actúa únicamente como plataforma tecnológica y no
              retiene los fondos ni cobra comisión sobre los regalos.
            </p>
          </section>
          <section>
            <h2 className="lp-serif text-2xl">Contacto</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">
              <a href="mailto:hola@webodas.com" className="underline underline-offset-4">
                hola@webodas.com
              </a>
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-[var(--rule)] pt-6 text-xs text-[var(--muted)]">
          Documento en preparación. Se completará con la información fiscal y de titularidad antes del
          lanzamiento.
        </p>
      </article>
    </div>
  );
}
