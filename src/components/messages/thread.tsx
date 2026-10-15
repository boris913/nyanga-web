"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import type { ConversationThread, Message } from "@/lib/types";

const POLL_MS = 6000;

const time = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" }).format(new Date(iso));

export function Thread({ initial }: { initial: ConversationThread }) {
  const [messages, setMessages] = useState<Message[]>(initial.messages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<{ text: string; upsell: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  // Rafraîchissement périodique, suspendu quand l'onglet est masqué.
  useEffect(() => {
    const tick = async () => {
      if (document.hidden) return;
      const t = await api<ConversationThread>(`/api/conversations/${initial.id}/messages`).catch(() => null);
      if (t) setMessages((prev) => (t.messages.length !== prev.length || t.messages.at(-1)?.id !== prev.at(-1)?.id ? t.messages : prev));
    };
    const timer = setInterval(tick, POLL_MS);
    return () => clearInterval(timer);
  }, [initial.id]);

  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setPending(true);
    setError(null);
    try {
      const msg = await api<Message>(`/api/conversations/${initial.id}/messages`, { body: { body: text } });
      setMessages((m) => [...m, msg]);
      setBody("");
    } catch (err) {
      setError({ text: errorMessage(err), upsell: err instanceof ApiError && err.status === 429 });
    }
    setPending(false);
  }

  return (
    <div className="card flex h-[calc(100dvh-14rem)] min-h-96 flex-col overflow-hidden">
      <ol className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 sm:p-6">
        {messages.map((m) => (
          <li key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${
                m.mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-cream"
              }`}
            >
              {m.body}
            </p>
            <span className="mt-0.5 px-1 text-xs text-muted">{time(m.createdAt)}</span>
          </li>
        ))}
        <div ref={bottom} />
      </ol>
      <form onSubmit={send} className="border-t border-line p-3 sm:p-4">
        {error && (
          <p className="alert alert-error mb-3 text-sm">
            {error.text}{" "}
            {error.upsell && <Link href="/offres" className="font-semibold underline">Voir les offres</Link>}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            className="input !min-h-0 flex-1"
            rows={2}
            maxLength={1000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Votre message…"
            aria-label="Votre message"
          />
          <button type="submit" className="btn btn-primary" disabled={pending || !body.trim()}>Envoyer</button>
        </div>
      </form>
    </div>
  );
}
