"use client";

import { useState } from "react";
import { FieldLabel } from "@measured/puck";
import { subirImagen } from "@/lib/media";

// La imagen se sube a Storage y se guarda solo la URL.
export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > 15 * 1024 * 1024) {
      setError("La imagen es muy pesada (máx. 15 MB).");
      return;
    }
    setBusy(true);
    try {
      onChange(await subirImagen(file));
    } catch {
      setError("No se pudo subir la imagen. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FieldLabel label={label ?? "Imagen"}>
      <div className="space-y-2">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-24 w-full rounded object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="block w-full text-xs"
        />
        <input
          type="url"
          placeholder="…o pega una URL de imagen"
          defaultValue={value?.startsWith("data:") ? "" : value}
          onBlur={(e) => e.target.value && onChange(e.target.value)}
          className="block w-full rounded border border-neutral-300 px-2 py-1 text-xs"
        />
        {busy && <p className="text-xs text-neutral-500">Cargando…</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-neutral-500 underline"
          >
            Quitar
          </button>
        )}
      </div>
    </FieldLabel>
  );
}
