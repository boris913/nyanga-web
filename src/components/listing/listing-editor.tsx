"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import { INTENTS } from "@/lib/format";
import type { City, Intent, Listing } from "@/lib/types";

type Result = { id: string; status: string; warnings: string[] };

export function ListingEditor({ listing, cities, defaultCity }: { listing: Listing | null; cities: City[]; defaultCity: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: listing?.title ?? "",
    body: listing?.body ?? "",
    intent: (listing?.intent ?? "RELATION") as Intent,
    citySlug: listing?.city.slug ?? defaultCity,
    neighborhood: listing?.neighborhood ?? "",
  });
  const [status, setStatus] = useState<{ ok?: string; warnings?: string[]; error?: string; reasons?: string[] }>({});
  const [pending, setPending] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus({});
    try {
      const r = await api<Result>("/api/listings/mine", { method: "PUT", body: { ...form, neighborhood: form.neighborhood || undefined } });
      setStatus({ ok: "Annonce envoyée en relecture.", warnings: r.warnings });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const field = err.field("title") ?? err.field("body");
        setStatus({ error: field ? fieldMessage(field) : err.message, reasons: Array.isArray(err.details) ? (err.details as string[]) : undefined });
      } else setStatus({ error: errorMessage(err) });
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <label className="field">
        <span className="label">Titre</span>
        <input className="input" required minLength={10} maxLength={80} value={form.title} onChange={set("title")} placeholder="Ex. : Douce et sérieuse, je cherche un homme posé" />
        <span className="hint">{form.title.length}/80 · 10 caractères minimum</span>
      </label>
      <label className="field">
        <span className="label">Présentation</span>
        <textarea className="input min-h-48" required minLength={40} maxLength={1500} value={form.body} onChange={set("body")} placeholder="Qui êtes-vous, ce que vous aimez, la personne que vous espérez rencontrer…" />
        <span className="hint">{form.body.length}/1500 · 40 caractères minimum</span>
      </label>
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="field">
          <span className="label">Je cherche</span>
          <select className="input" value={form.intent} onChange={set("intent")}>
            {Object.entries(INTENTS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Ville</span>
          <select className="input" required value={form.citySlug} onChange={set("citySlug")}>
            <option value="" disabled>Choisir…</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Quartier <span className="font-normal text-muted">(facultatif)</span></span>
          <input className="input" maxLength={60} value={form.neighborhood} onChange={set("neighborhood")} placeholder="Ex. : Bonamoussadi" />
        </label>
      </div>

      {status.error && (
        <div className="alert alert-error text-sm">
          {status.error}
          {status.reasons && <ul className="mt-1 list-disc pl-5">{status.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
        </div>
      )}
      {status.ok && (
        <div className="alert alert-ok text-sm">
          {status.ok}
          {!!status.warnings?.length && (
            <>
              <span className="block">Points que le modérateur vérifiera :</span>
              <ul className="list-disc pl-5">{status.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
            </>
          )}
        </div>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Envoi…" : listing ? "Enregistrer les modifications" : "Publier mon annonce"}
        </button>
      </div>
    </form>
  );
}

const fieldMessage = (m: string) => (/at least|au moins/i.test(m) ? "Le titre ou la présentation est trop court." : m);
