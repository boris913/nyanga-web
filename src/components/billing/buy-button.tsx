"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import { formatXaf } from "@/lib/format";
import type { CatalogItem, Me } from "@/lib/types";

type Checkout = { step: "payment"; checkoutUrl: string } | { step: "completed" } | { step: "already_purchased" };

export function BuyButton({ item, me, disabled = false }: { item: CatalogItem; me: Me | null; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: me?.displayName ?? "", lastName: "", phone: me?.phone?.replace("+237", "") ?? "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!item.available) return <p className="btn btn-outline pointer-events-none w-full opacity-60">Bientôt disponible</p>;
  if (!me) return <Link href="/connexion?suite=/offres" className="btn btn-primary w-full">Se connecter pour acheter</Link>;
  if (!open) {
    return (
      <button type="button" className="btn btn-primary w-full" disabled={disabled} onClick={() => setOpen(true)}>
        {item.kind === "plan" ? `Passer ${item.label}` : "Acheter"}
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const r = await api<Checkout>("/api/billing/checkout", { body: { sku: item.sku, ...form } });
      // Redirection vers la page de paiement Chariow ; l'accès est accordé à réception du webhook.
      window.location.assign(r.step === "payment" ? r.checkoutUrl : `/paiement/retour?sku=${item.sku}`);
    } catch (err) {
      setError(err instanceof ApiError ? (err.field("phone") ? "Numéro invalide" : err.message) : errorMessage(err));
      setPending(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl bg-cream p-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="field">
          <span className="label">Prénom</span>
          <input className="input" required maxLength={60} autoComplete="given-name" value={form.firstName} onChange={set("firstName")} />
        </label>
        <label className="field">
          <span className="label">Nom</span>
          <input className="input" required maxLength={60} autoComplete="family-name" value={form.lastName} onChange={set("lastName")} />
        </label>
      </div>
      <label className="field">
        <span className="label">Numéro Mobile Money</span>
        <span className="flex items-center gap-2">
          <span className="text-muted">+237</span>
          <input className="input" required inputMode="tel" autoComplete="tel-national" placeholder="6XX XX XX XX" value={form.phone} onChange={set("phone")} />
        </span>
        <span className="hint">Orange Money ou MTN MoMo. Ce numéro n’est jamais affiché.</span>
      </label>
      {error && <p className="alert alert-error text-sm">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Redirection…" : `Payer ${formatXaf(item.priceXaf)}`}
      </button>
      <button type="button" className="text-sm text-muted underline" onClick={() => setOpen(false)}>Annuler</button>
    </form>
  );
}
