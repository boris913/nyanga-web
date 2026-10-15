"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import Link from "next/link";

export function ContactForm({ listingId, name }: { listingId: string; name: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<{ text: string; upsell: boolean } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/api/conversations", { body: { listingId, body } });
      router.push(`/messages/${id}`);
    } catch (err) {
      setError({ text: errorMessage(err), upsell: err instanceof ApiError && err.status === 429 });
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="field">
        <span className="font-display text-lg font-semibold">Écrire à {name}</span>
        <textarea
          className="input"
          required
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Présentez-vous en quelques lignes…"
        />
      </label>
      {error && (
        <p className="alert alert-error text-sm">
          {error.text}{" "}
          {error.upsell && <Link href="/offres" className="font-semibold underline">Voir les offres</Link>}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending || !body.trim()}>
        {pending ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
