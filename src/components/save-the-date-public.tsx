"use client";

import { useEffect, useState } from "react";
import { SaveTheDateView } from "@/components/save-the-date-view";
import { loadStd, type SaveTheDate } from "@/lib/savethedate";

export function SaveTheDatePublic() {
  const [std, setStd] = useState<SaveTheDate | null>(null);

  useEffect(() => {
    const sync = () => setStd(loadStd());
    sync();
    window.addEventListener("webodas:savethedate", sync);
    return () => window.removeEventListener("webodas:savethedate", sync);
  }, []);

  if (!std) return null;

  if (!std.publicada) {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-100 p-8 text-center text-sm text-neutral-500">
        Este Save the date todavía no está publicado.
      </div>
    );
  }

  return (
    <div
      className="grid min-h-screen place-items-center p-6"
      style={{ backgroundColor: std.colorBg }}
    >
      <div className="w-full max-w-md">
        <SaveTheDateView std={std} />
      </div>
    </div>
  );
}
