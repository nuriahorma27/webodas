import type { Data } from "@measured/puck";
import { redirect } from "next/navigation";
import { WeddingEditor } from "@/components/wedding-editor";
import { TEMPLATES, plantillaEditorial } from "@/lib/puck/config";
import { createClient } from "@/lib/supabase/server";

// Prototipo: sin base de datos. ?t= elige la plantilla de arranque.
export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/inicio");

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
