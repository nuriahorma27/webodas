import type { Data } from "@measured/puck";
import { WeddingEditor } from "@/components/wedding-editor";
import { TEMPLATES, plantillaEditorial } from "@/lib/puck/config";

// Prototipo: sin base de datos. ?t= elige la plantilla de arranque.
export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  const tpl = t && TEMPLATES[t] ? TEMPLATES[t] : null;
  const data = (tpl ? tpl.data : plantillaEditorial) as Data;

  return (
    <WeddingEditor
      weddingId={id}
      initialData={data}
      seedFromTemplate={Boolean(tpl)}
      publishedSlug={id === "demo" ? "ana-y-leo" : null}
    />
  );
}
