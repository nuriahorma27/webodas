"use client";

import { useState } from "react";

// Selector de imagen sencillo (sin Puck). Guarda data URL o URL pegada.
export function ImagePicker({
  value,
  onChange,
  className = "",
}: {
  value?: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File) => {
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError("Máx. 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.onerror = () => setError("No se pudo leer");
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-accent-soft">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted">Sin foto</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            className="block w-full text-xs"
          />
          <input
            type="url"
            placeholder="…o pega una URL"
            defaultValue={value?.startsWith("data:") ? "" : value}
            onBlur={(e) => e.target.value && onChange(e.target.value)}
            className="block w-full rounded border border-line px-2 py-1 text-xs"
          />
          {value && (
            <button onClick={() => onChange("")} className="text-xs text-muted underline">
              Quitar
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
