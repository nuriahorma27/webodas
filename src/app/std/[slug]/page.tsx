import { notFound } from "next/navigation";
import { SaveTheDatePublic } from "@/components/save-the-date-public";

export const metadata = { title: "Save the date" };

export default async function StdPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "ana-y-leo" && slug !== "demo") notFound();
  return <SaveTheDatePublic />;
}
