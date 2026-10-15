import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireMe } from "@/lib/auth";
import { Container, PageSkeleton, PageTitle } from "@/components/ui";
import { ModerationBoard } from "@/components/moderation/board";

export const metadata: Metadata = { title: "Modération", robots: { index: false } };

export default function ModerationPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Moderation />
    </Suspense>
  );
}

async function Moderation() {
  const me = await requireMe("/moderation");
  // L'API refuse aussi ces routes aux non-modérateurs ; ici on évite seulement d'afficher la page.
  if (me.role === "USER") notFound();
  return (
    <Container>
      <PageTitle title="Modération" subtitle="Annonces à relire, signalements et vérifications de photo." />
      <ModerationBoard />
    </Container>
  );
}
