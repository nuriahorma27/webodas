"use client";

import { usePathname } from "next/navigation";

const sectionInfo: Record<string, { eyebrow: string; title: string; description: string }> = {
  presupuesto: { eyebrow: "Planificación", title: "Presupuesto", description: "Controlad lo previsto, lo pagado y lo que todavía queda por asignar." },
  tiempos: { eyebrow: "Planificación", title: "Tareas", description: "Organizad los preparativos por estado y momento, sin perder de vista lo importante." },
  proveedores: { eyebrow: "Planificación", title: "Proveedores", description: "Reunid contactos, importes y contrataciones en un único lugar." },
  regalos: { eyebrow: "Planificación", title: "Lista de regalos", description: "Preparad los regalos y revisad las aportaciones que recibís." },
  invitados: { eyebrow: "Invitados", title: "Lista de invitados", description: "Gestionad asistentes, acompañantes y datos prácticos de cada persona." },
  confirmaciones: { eyebrow: "Invitados", title: "Confirmaciones", description: "Consultad de forma clara quién ha respondido y quién asistirá." },
  formulario: { eyebrow: "Invitados", title: "Formulario", description: "Elegid qué queréis preguntar y comprobad cómo lo verán vuestros invitados." },
  mesas: { eyebrow: "Invitados", title: "Organización de mesas", description: "Cread las mesas y sentad a cada invitado de forma visual." },
};

export function GestionHeader() {
  const pathname = usePathname();
  const key = pathname.split("/").filter(Boolean).at(-1) ?? "presupuesto";
  const info = sectionInfo[key] ?? sectionInfo.presupuesto;

  return (
    <header className="gestion-heading">
      <p className="text-[.68rem] font-medium uppercase tracking-[.22em] text-accent">{info.eyebrow}</p>
      <h1 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{info.title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{info.description}</p>
    </header>
  );
}
