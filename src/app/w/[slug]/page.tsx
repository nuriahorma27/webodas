import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicSite } from "@/components/public-site";

export const metadata: Metadata = { title: "Ana & Leo" };

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "ana-y-leo" && slug !== "demo") notFound();

  return <PublicSite weddingId="demo" />;
}
