"use client";

import { useEffect, useState } from "react";
import { loadFormulario, type FormularioConfig } from "@/lib/formulario";
import { FormularioPreview } from "@/components/formulario-preview";

export default function PreviewPage() {
  const [cfg, setCfg] = useState<FormularioConfig | null>(null);

  useEffect(() => {
    const sync = () => setCfg(loadFormulario());
    sync();
    window.addEventListener("webodas:formulario", sync);
    return () => window.removeEventListener("webodas:formulario", sync);
  }, []);

  if (!cfg) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div>
        <p className="mb-3 text-center text-xs text-muted">
          Vista previa del formulario · se actualiza sola al editar
        </p>
        <FormularioPreview cfg={cfg} />
      </div>
    </div>
  );
}
