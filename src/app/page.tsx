import Link from "next/link";
import { Suspense } from "react";
import { apiGet, getCities } from "@/lib/server-api";
import type { ListingPage } from "@/lib/types";
import { SearchForm } from "@/components/search-form";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { Container, EmptyState } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-brand-soft/70 to-cream">
        <Container>
          <div className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="chip mb-5 bg-surface text-brand-dark">Annonces relues par notre équipe</p>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                Trouver quelqu’un de bien, près de chez vous.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted">
                Des célibataires de Douala, Yaoundé, Bafoussam et de tout le Cameroun publient leur annonce. Écrivez-leur en
                privé, sans partager votre numéro.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/mon-annonce" className="btn btn-primary">Publier mon annonce</Link>
                <Link href="/annonces" className="btn btn-outline">Voir les annonces</Link>
              </div>
            </div>
            <div className="card p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Rechercher</h2>
              <Suspense fallback={<div className="skeleton h-48" />}>
                <SearchForm />
              </Suspense>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <Suspense fallback={<HomeListingsSkeleton />}>
          <HomeListings />
        </Suspense>

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            ["Annonces vérifiées", "Chaque annonce est relue avant publication. Les badges « Vérifié » signalent une photo contrôlée par l’équipe."],
            ["Messagerie privée", "Échangez sur Nyanga avant de donner votre numéro. Vous gardez la main sur ce que vous partagez."],
            ["Signalement en un clic", "Un comportement douteux ? Signalez l’annonce : un modérateur la regarde rapidement."],
          ].map(([title, text]) => (
            <div key={title} className="card p-6">
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </div>
          ))}
        </section>

        <Suspense fallback={null}>
          <CityGrid />
        </Suspense>
      </Container>
    </>
  );
}

async function HomeListings() {
  const data = await apiGet<ListingPage>("/api/listings").catch(() => null);
  if (!data) return null;
  if (!data.items.length && !data.featured.length) {
    return (
      <div className="mt-14">
        <EmptyState title="Soyez parmi les premiers" action={{ href: "/mon-annonce", label: "Publier mon annonce" }}>
          Aucune annonce n’est encore en ligne. Publiez la vôtre, elle apparaîtra ici après relecture.
        </EmptyState>
      </div>
    );
  }
  return (
    <>
      {data.featured.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-semibold">À la une</h2>
          <ListingGrid listings={data.featured.slice(0, 6)} />
        </section>
      )}
      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Annonces récentes</h2>
          <Link href="/annonces" className="text-sm font-semibold text-brand-dark hover:underline">Tout voir ({data.total})</Link>
        </div>
        <ListingGrid listings={data.items.slice(0, 9)} />
      </section>
    </>
  );
}

function HomeListingsSkeleton() {
  return (
    <section className="mt-14">
      <div className="skeleton mb-5 h-8 w-56" />
      <ListingGridSkeleton />
    </section>
  );
}

async function CityGrid() {
  const cities = await getCities().catch(() => []);
  if (!cities.length) return null;
  return (
    <section className="mt-16">
      <h2 className="mb-5 font-display text-2xl font-semibold">Par ville</h2>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link key={c.slug} href={`/annonces?ville=${c.slug}`} className="btn btn-outline btn-sm">
            {c.name}
            {c.listings > 0 && <span className="text-muted">{c.listings}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
