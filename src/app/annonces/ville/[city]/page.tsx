import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCities } from "@/lib/server-api";
import { cityHref } from "@/lib/format";
import { ListingsResults, ListingsResultsSkeleton } from "@/components/listings-results";
import { Container, PageTitle } from "@/components/ui";

const findCity = async (slug: string) => (await getCities().catch(() => [])).find((c) => c.slug === slug) ?? null;

export async function generateMetadata({ params }: PageProps<"/annonces/ville/[city]">): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await findCity(slug);
  if (!city) return { title: "Ville introuvable", robots: { index: false } };
  return {
    title: `Rencontres à ${city.name}`,
    description: `Annonces de rencontre sérieuses à ${city.name} (${city.region}) : amitié, relation, mariage. Profils relus par l’équipe Nyanga.`,
  };
}

export default function CityListingsPage({ params, searchParams }: PageProps<"/annonces/ville/[city]">) {
  return (
    <Container>
      <Suspense
        fallback={
          <>
            <div className="skeleton mb-8 mt-10 h-10 w-64" />
            <ListingsResultsSkeleton />
          </>
        }
      >
        <CityListings params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function CityListings({ params, searchParams }: PageProps<"/annonces/ville/[city]">) {
  const { city: slug } = await params;
  const city = await findCity(slug);
  if (!city) notFound();
  return (
    <>
      <nav className="mt-6 text-sm text-muted">
        <Link href="/annonces" className="hover:text-ink">Annonces</Link>
        <span className="mx-2">/</span>
        <span>{city.name}</span>
      </nav>
      <PageTitle title={`Rencontres à ${city.name}`} subtitle={`Les annonces publiées à ${city.name}, les plus récentes d’abord.`} />
      <ListingsResults searchParams={searchParams} city={city.slug} basePath={cityHref(city.slug)} />
    </>
  );
}
