"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puck, usePuck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "@/lib/puck/config";

const ROOT_ZONE = "root:default-zone";

// Orden en el que se ofrecen las secciones al añadir.
const SECTION_ORDER = [
  "RichText",
  "Hero",
  "MediaText",
  "List",
  "Schedule",
  "CTA",
  "GiftList",
  "Gallery",
  "Countdown",
  "Location",
  "FAQ",
  "RSVP",
];

const labelFor = (type: string) =>
  (puckConfig.components as Record<string, { label?: string }>)[type]?.label ?? type;

function SectionsSidebar() {
  const { appState, dispatch } = usePuck();
  const [adding, setAdding] = useState(false);
  const content = appState.data.content ?? [];
  const selected = appState.ui.itemSelector?.index;

  const select = (index: number | null) =>
    dispatch({
      type: "setUi",
      ui: { itemSelector: index === null ? null : { index } },
    });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= content.length) return;
    dispatch({ type: "reorder", sourceIndex: from, destinationIndex: to, destinationZone: ROOT_ZONE });
  };

  const remove = (index: number) => {
    dispatch({ type: "remove", index, zone: ROOT_ZONE });
    select(null);
  };

  const add = (type: string) => {
    const index = content.length;
    dispatch({ type: "insert", componentType: type, destinationIndex: index, destinationZone: ROOT_ZONE });
    setAdding(false);
    setTimeout(() => select(index), 0);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-3">
        <p className="text-sm font-semibold">Secciones de la web</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <button
          onClick={() => select(null)}
          className={`mb-2 w-full rounded-md px-3 py-2 text-left text-sm ${
            selected == null ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
          }`}
        >
          Ajustes de la página
          <span className="block text-xs opacity-70">Tipografías y colores</span>
        </button>

        <ul className="space-y-1">
          {content.map((item, i) => (
            <li
              key={item.props.id}
              className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
                selected === i ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
              }`}
            >
              <button onClick={() => select(i)} className="flex-1 truncate text-left">
                {labelFor(item.type)}
              </button>
              <button
                onClick={() => move(i, i - 1)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100"
                title="Subir"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, i + 1)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100"
                title="Bajar"
              >
                ↓
              </button>
              <button
                onClick={() => remove(i)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100"
                title="Eliminar"
              >
                ✕
              </button>
            </li>
          ))}
          {content.length === 0 && (
            <li className="rounded-md border border-dashed border-neutral-300 px-3 py-4 text-center text-xs text-neutral-500">
              Aún no hay secciones. Añade la primera abajo.
            </li>
          )}
        </ul>
      </div>

      <div className="border-t border-neutral-200 p-3">
        {adding ? (
          <div className="space-y-1">
            <p className="px-1 pb-1 text-xs uppercase tracking-wider text-neutral-500">
              Elige qué añadir
            </p>
            <p className="px-1 pb-2 text-[11px] leading-snug text-neutral-500">
              «Texto» es un bloque libre: dentro puedes añadir varios títulos y
              párrafos con estilos distintos.
            </p>
            {SECTION_ORDER.map((type) => (
              <button
                key={type}
                onClick={() => add(type)}
                className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-100"
              >
                {labelFor(type)}
              </button>
            ))}
            <button
              onClick={() => setAdding(false)}
              className="mt-1 block w-full rounded-md px-3 py-1.5 text-left text-xs text-neutral-500 hover:bg-neutral-100"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + Añadir sección o texto
          </button>
        )}
      </div>
    </div>
  );
}

function RightPanel() {
  const { appState } = usePuck();
  const index = appState.ui.itemSelector?.index;
  const item = index != null ? appState.data.content?.[index] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-3">
        <p className="text-sm font-semibold">
          {item ? labelFor(item.type) : "Ajustes de la página"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Puck.Fields />
      </div>
    </div>
  );
}

function Layout({
  slug,
  status,
  onSave,
  onPublish,
  onReset,
}: {
  slug: string;
  status: string | null;
  onSave: () => void;
  onPublish: () => void;
  onReset: () => void;
}) {
  const { history } = usePuck();

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/panel/webs" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Salir
          </Link>
          <span className="font-display text-lg">webodas</span>
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="mr-1 text-xs text-neutral-500">{status}</span>}
          <button
            onClick={() => history.back?.()}
            disabled={!history.hasPast}
            className="rounded px-2 py-1 text-base text-neutral-500 disabled:opacity-30"
            title="Deshacer"
          >
            ↶
          </button>
          <button
            onClick={() => history.forward?.()}
            disabled={!history.hasFuture}
            className="rounded px-2 py-1 text-base text-neutral-500 disabled:opacity-30"
            title="Rehacer"
          >
            ↷
          </button>
          <button
            onClick={onReset}
            className="rounded-md px-2 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
            title="Volver a la plantilla inicial"
          >
            Restablecer
          </button>
          <a
            href={`/w/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Ver web
          </a>
          <button
            onClick={onSave}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Guardar
          </button>
          <button
            onClick={onPublish}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Publicar
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white">
          <SectionsSidebar />
        </aside>
        <main className="min-w-0 flex-1 overflow-auto">
          <Puck.Preview />
        </main>
        <aside className="w-80 shrink-0 border-l border-neutral-200 bg-white">
          <RightPanel />
        </aside>
      </div>
    </div>
  );
}

export function WeddingEditor({
  weddingId,
  initialData,
  publishedSlug,
  seedFromTemplate,
}: {
  weddingId: string;
  initialData: Data;
  publishedSlug: string | null;
  seedFromTemplate?: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const slug = publishedSlug ?? weddingId;
  const storageKey = `webodas:site:${weddingId}`;

  // Prototipo: el trabajo se guarda en este navegador para que no se pierda al recargar.
  useEffect(() => {
    let saved: Data | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      saved = raw ? (JSON.parse(raw) as Data) : null;
    } catch {
      saved = null;
    }
    const hasContent = !!saved && Array.isArray(saved.content) && saved.content.length > 0;

    if (seedFromTemplate) {
      const replace =
        !hasContent ||
        confirm("Ya tienes una web empezada. ¿Reemplazarla por esta plantilla? Perderás los cambios.");
      if (replace) {
        setData(initialData);
        try {
          localStorage.setItem(storageKey, JSON.stringify(initialData));
        } catch {
          /* noop */
        }
        return;
      }
    }
    setData(saved ?? initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 2500);
  };

  const persist = (d: Data) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(d));
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const restablecer = () => {
    if (!confirm("¿Volver a la plantilla inicial? Se perderán los cambios de esta web.")) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
    setData(null);
    setTimeout(() => setData(initialData), 0);
  };

  if (!data) return <div className="p-8 text-sm text-neutral-500">Cargando editor…</div>;

  return (
    <Puck
      config={puckConfig}
      data={data}
      onChange={(d) => persist(d)}
    >
      <Layout
        slug={slug}
        status={status}
        onSave={() => flash("Guardado en este navegador")}
        onPublish={() => flash("Web publicada")}
        onReset={restablecer}
      />
    </Puck>
  );
}
