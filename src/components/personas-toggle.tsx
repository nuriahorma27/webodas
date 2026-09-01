"use client";

// Asigna una o varias personas. El valor se guarda como texto separado por comas.

export function personasDe(valor?: string): string[] {
  return (valor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function PersonasToggle({
  valor,
  opciones,
  onChange,
  size = "sm",
}: {
  valor?: string;
  opciones: string[];
  onChange: (texto: string) => void;
  size?: "sm" | "xs";
}) {
  const activos = personasDe(valor);
  const toggle = (nombre: string) => {
    const set = new Set(activos);
    if (set.has(nombre)) set.delete(nombre);
    else set.add(nombre);
    onChange([...set].join(", "));
  };

  const pad = size === "xs" ? "px-2 py-0.5 text-[0.7rem]" : "px-2.5 py-1 text-xs";

  if (opciones.length === 0) {
    return (
      <span className="text-xs text-muted">
        Añade personas desde «Configuración → Nuevo».
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {opciones.map((nombre) => {
        const on = activos.includes(nombre);
        return (
          <button
            key={nombre}
            type="button"
            onClick={() => toggle(nombre)}
            aria-pressed={on}
            className={`rounded-full border transition ${pad} ${
              on
                ? "border-accent bg-accent-soft font-medium text-accent-deep"
                : "border-line text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {on && <span aria-hidden>✓ </span>}
            {nombre}
          </button>
        );
      })}
    </div>
  );
}
