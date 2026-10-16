import type { Metadata } from "next";
import { Suspense } from "react";
import { apiGet, getMe } from "@/lib/server-api";
import type { CatalogItem, Plan } from "@/lib/types";
import { formatXaf } from "@/lib/format";
import { ApiDown, Container, PageSkeleton, PageTitle } from "@/components/ui";
import { BuyButton } from "@/components/billing/buy-button";

export const metadata: Metadata = {
  title: "Offres Premium et VIP",
  description: "Messages illimités, plus de photos et annonce mise en avant. Paiement Orange Money ou MTN MoMo.",
};

const FEATURES: Record<Plan, string[]> = {
  STANDARD: ["1 annonce relue par l’équipe", "3 photos", "10 messages par 24 h"],
  PREMIUM: ["Annonce publiée aussitôt, sans attente", "Messages illimités", "10 photos", "Badge Premium sur l’annonce"],
  VIP: ["Tout Premium", "15 photos", "Badge VIP doré, le plus visible"],
};

export default function OffersPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Offers />
    </Suspense>
  );
}

async function Offers() {
  const [catalog, me] = await Promise.all([apiGet<CatalogItem[]>("/api/billing/catalog").catch(() => null), getMe().catch(() => null)]);
  if (!catalog) return <Container><ApiDown /></Container>;
  const plans = catalog.filter((c) => c.kind === "plan");
  const boosts = catalog.filter((c) => c.kind === "boost");
  const listingLive = me?.listing?.status === "APPROVED";

  return (
    <Container>
      <PageTitle title="Offres" subtitle="Paiement sécurisé par Orange Money ou MTN Mobile Money. Sans engagement : pas de renouvellement automatique." />

      <div className="grid gap-5 md:grid-cols-3">
        <PlanCard name="Gratuit" price="0 FCFA" features={FEATURES.STANDARD} current={!me || me.plan === "STANDARD"} />
        {plans.map((p) => (
          <PlanCard
            key={p.sku}
            name={p.label}
            price={formatXaf(p.priceXaf)}
            period={p.kind === "plan" ? p.period : undefined}
            features={FEATURES[p.kind === "plan" ? p.plan : "STANDARD"]}
            highlight={p.sku === "PREMIUM"}
            current={me?.plan === (p.kind === "plan" ? p.plan : null)}
          >
            <BuyButton item={p} me={me} />
          </PlanCard>
        ))}
      </div>

      <section id="boosts" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold">Mettre mon annonce en avant</h2>
        <p className="mt-1 text-muted">Achat unique, pour une annonce déjà publiée.</p>
        {me && !listingLive && <p className="alert alert-info mt-4 text-sm">Votre annonce doit être publiée pour utiliser ces options.</p>}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {boosts.map((b) => (
            <div key={b.sku} className="card flex flex-col p-6">
              <h3 className="font-display text-lg font-semibold">{b.label}</h3>
              <p className="mt-1 text-sm text-muted">
                {b.kind === "boost" && b.featuredHours
                  ? "Affichée en haut des résultats et sur l’accueil, et remontée en tête de liste."
                  : b.kind === "boost" && b.pinnedHours
                    ? `Votre annonce reste en tête des annonces récentes pendant ${b.pinnedHours} h.`
                    : "Votre annonce repasse en tête des annonces récentes."}
              </p>
              <p className="mt-4 text-2xl font-semibold">{formatXaf(b.priceXaf)}</p>
              <div className="mt-4">
                <BuyButton item={b} me={me} disabled={!!me && !listingLive} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-muted">
        L’accès est activé dès la confirmation du paiement, généralement en moins d’une minute. Une question ? Écrivez-nous depuis la page Charte et sécurité.
      </p>
    </Container>
  );
}

function PlanCard(props: {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlight?: boolean;
  current?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`card relative flex flex-col p-6 ${props.highlight ? "border-2 border-brand shadow-md" : ""}`}>
      {props.highlight && <span className="chip absolute -top-3 left-6 bg-brand text-white">Le plus choisi</span>}
      <h2 className="font-display text-2xl font-semibold">{props.name}</h2>
      <p className="mt-3">
        <span className="text-3xl font-semibold">{props.price}</span>
        {props.period && <span className="text-muted"> / {props.period}</span>}
      </p>
      <ul className="mt-5 flex flex-1 flex-col gap-2">
        {props.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-leaf" aria-hidden>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {props.current ? <p className="btn btn-outline pointer-events-none w-full">Votre formule</p> : props.children}
      </div>
    </div>
  );
}
