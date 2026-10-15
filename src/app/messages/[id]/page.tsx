import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireMe } from "@/lib/auth";
import { apiGet } from "@/lib/server-api";
import type { ConversationThread } from "@/lib/types";
import { Container, PageSkeleton } from "@/components/ui";
import { Thread } from "@/components/messages/thread";

export const metadata: Metadata = { title: "Conversation" };

export default function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Conversation params={params} />
    </Suspense>
  );
}

async function Conversation({ params }: Pick<PageProps<"/messages/[id]">, "params">) {
  const { id } = await params;
  await requireMe(`/messages/${id}`);
  const thread = await apiGet<ConversationThread>(`/api/conversations/${id}/messages`);
  if (!thread) notFound();
  return (
    <Container>
      <div className="mb-4 mt-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/messages" className="text-sm text-muted hover:text-ink">← Messages</Link>
          <h1 className="font-display text-2xl font-semibold">{thread.other.displayName ?? "Membre"}</h1>
        </div>
        {thread.listingId && <Link href={`/annonces/${thread.listingId}`} className="btn btn-outline btn-sm">Voir l’annonce</Link>}
      </div>
      <Thread initial={thread} />
    </Container>
  );
}
