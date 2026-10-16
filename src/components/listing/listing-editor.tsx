"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import { INTENTS } from "@/lib/format";
import type { City, Intent, Listing, ListingStatus } from "@/lib/types";
import { heartBurst, toast } from "@/components/brand/effects";
import { WhatsappIcon } from "./whatsapp-button";

type Result = { id: string; status: ListingStatus };

const localWhatsapp = (phone: string | null | undefined) => (phone ? phone.replace(/^\+237/, "") : "");

export function ListingEditor({ listing, cities, defaultCity }: { listing: Listing | null; cities: City[]; defaultCity: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: listing?.title ?? "",
    body: listing?.body ?? "",
    intent: (listing?.intent ?? "RELATION") as Intent,
    citySlug: listing?.city.slug ?? defaultCity,
    neighborhood: listing?.neighborhood ?? "",
    whatsapp: localWhatsapp(listing?.whatsapp),
  });
  const submitRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<{ ok?: string; error?: string; reasons?: string[] }>({});
  const [pending, setPending] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus({});
    try {
      const r = await api<Result>("/api/listings/mine", { method: "PUT", body: { ...form, neighborhood: form.neighborhood || undefined } });
      const hasPhoto = !!listing?.photos.length;
      const ok = !hasPhoto
        ? "Annonce enregistrée. Ajoutez maintenant au moins une photo."
        : r.status === "APPROVED"
          ? "Annonce publiée."
          : "Annonce envoyée en relecture.";
      setStatus({ ok });
      heartBurst(submitRef.current);
      toast(r.status === "APPROVED" && hasPhoto ? "Annonce publiée" : "Annonce enregistrée");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const phone = err.field("whatsapp");
        const field = err.field("title") ?? err.field("body");
        setStatus({
          error: phone ? `Numéro WhatsApp : ${phoneMessage(phone)}` : field ? fieldMessage(field) : err.message,
          reasons: Array.isArray(err.details) ? (err.details as string[]) : undefined,
        });
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

      <label className="field">
        <span className="label flex items-center gap-1.5">
          <WhatsappIcon className="size-4 text-[#128c7e]" /> Numéro WhatsApp
        </span>
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-brand">
          <span className="grid place-items-center border-r border-line bg-cream px-3 text-sm font-semibold text-muted">+237</span>
          <input
            className="w-full min-w-0 bg-transparent px-3.5 py-2.5 text-base outline-none"
            required
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="6XX XX XX XX"
            value={form.whatsapp}
            onChange={set("whatsapp")}
          />
        </div>
        <span className="hint">
          Obligatoire. Les visiteurs voient seulement « +237 6XX XX XX XX » sur le site ; le numéro s’affiche dans WhatsApp quand quelqu’un vous écrit.
        </span>
      </label>

      {status.error && (
        <div className="alert alert-error text-sm">
          {status.error}
          {status.reasons && <ul className="mt-1 list-disc pl-5">{status.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
        </div>
      )}
      {status.ok && (
        <div className="alert alert-ok text-sm">
          {status.ok}
        </div>
      )}
      <div>
        <button ref={submitRef} type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Envoi…" : listing ? "Enregistrer les modifications" : "Publier mon annonce"}
        </button>
      </div>
    </form>
  );
}

const phoneMessage = (m: string) => (/at least|au moins|too small/i.test(m) ? "numéro trop court." : m);

const fieldMessage = (m: string) => (/at least|au moins/i.test(m) ? "Le titre ou la présentation est trop court." : m);
