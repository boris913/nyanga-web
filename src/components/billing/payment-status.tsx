"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { Me, Plan } from "@/lib/types";
import { Heart } from "@/components/brand/heart";

const POLL_MS = 4000;
const MAX_WAIT_MS = 3 * 60_000;

// Le Pulse Chariow arrive en général quelques secondes après le retour : on surveille /api/me.
export function PaymentStatus({
  sku,
  initialPlan,
  initialFeaturedUntil,
  initialPinnedUntil,
}: {
  sku: string;
  initialPlan: Plan;
  initialFeaturedUntil: string | null;
  initialPinnedUntil: string | null;
}) {
  const [state, setState] = useState<"waiting" | "done" | "slow">("waiting");
  const isPlan = sku === "PREMIUM" || sku === "VIP";

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(async () => {
      const me = await api<Me>("/api/me").catch(() => null);
      const activated = isPlan
        ? me?.plan === sku && initialPlan !== sku
        : sku === "BUMP"
          ? me?.listing?.pinnedUntil !== initialPinnedUntil
          : me?.listing?.featuredUntil !== initialFeaturedUntil;
      if (activated) {
        setState("done");
        clearInterval(timer);
      } else if (Date.now() - started > MAX_WAIT_MS) {
        setState("slow");
        clearInterval(timer);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [sku, isPlan, initialPlan, initialFeaturedUntil, initialPinnedUntil]);

  if (state === "done") {
    return (
      <div className="card p-6">
        <p className="alert alert-ok">
          {isPlan ? `Votre formule ${sku === "VIP" ? "VIP" : "Premium"} est active.` : sku === "BUMP" ? "Votre annonce est en tête des annonces pour 24 h." : "Votre annonce est à la une."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/mon-annonce" className="btn btn-primary">Mon annonce</Link>
          <Link href="/annonces" className="btn btn-outline">Voir les annonces</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="card p-6">
      {state === "waiting" ? (
        <p className="flex items-center gap-3">
          <Heart className="size-5 shrink-0 animate-heartbeat text-brand" />
          Confirmation en cours… Gardez cette page ouverte.
        </p>
      ) : (
        <p className="alert alert-info">
          La confirmation prend plus de temps que prévu. Si votre compte Mobile Money a été débité, l’accès sera activé automatiquement dans quelques minutes.
        </p>
      )}
      <p className="mt-4 text-sm text-muted">Paiement annulé ? <Link href="/offres" className="font-semibold underline">Retour aux offres</Link></p>
    </div>
  );
}
