import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireMe } from "@/lib/auth";
import { apiGet } from "@/lib/server-api";
import type { ConversationSummary } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { Container, EmptyState, PageSkeleton, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Inbox />
    </Suspense>
  );
}

async function Inbox() {
  await requireMe("/messages");
  const conversations = (await apiGet<ConversationSummary[]>("/api/conversations")) ?? [];
  return (
    <Container>
      <PageTitle title="Messages" />
      {conversations.length === 0 ? (
        <EmptyState title="Aucune conversation" action={{ href: "/annonces", label: "Parcourir les annonces" }}>
          Écrivez à un membre depuis son annonce : la conversation apparaîtra ici.
        </EmptyState>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/messages/${c.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-soft/50">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-lg text-brand-dark">
                  {(c.other.displayName ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold">{c.other.displayName ?? "Membre"}</span>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(c.updatedAt)}</span>
                  </span>
                  {c.lastMessage && (
                    <span className="block truncate text-sm text-muted">
                      {c.lastMessage.mine && "Vous : "}
                      {c.lastMessage.body}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
