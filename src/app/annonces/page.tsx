import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { apiGet } from "@/lib/server-api";
import type { ListingPage } from "@/lib/types";
import { SearchForm, type SearchValues } from "@/components/search-form";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { ApiDown, Container, EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Annonces de rencontre" };

export default function ListingsPage({ searchParams }: PageProps<"/annonces">) {
  return (
    <Container>
      <PageTitle title="Annonces" subtitle="Toutes les annonces publiées, les plus récentes d’abord." />
      <Suspense fallback={<><div className="skeleton mb-8 h-24" /><ListingGridSkeleton /></>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

async function Results({ searchParams }: Pick<PageProps<"/annonces">, "searchParams">) {
  const sp = await searchParams;
  const values: SearchValues = {
    ville: pick(sp.ville),
    intention: pick(sp.intention),
    genre: pick(sp.genre),
    age_min: pick(sp.age_min),
    age_max: pick(sp.age_max),
  };
  const page = Math.max(1, Number(pick(sp.page)) || 1);

  const query = new URLSearchParams();
  if (values.ville) query.set("city", values.ville);
  if (values.intention) query.set("intent", values.intention);
  if (values.genre) query.set("gender", values.genre);
  if (values.age_min) query.set("minAge", values.age_min);
  if (values.age_max) query.set("maxAge", values.age_max);
  query.set("page", String(page));

  let data: ListingPage | null;
  try {
    data = await apiGet<ListingPage>(`/api/listings?${query}`);
  } catch {
    return <ApiDown />;
  }

  const pageHref = (p: number) => {
    const q = new URLSearchParams(Object.entries(values).filter((e): e is [string, string] => Boolean(e[1])));
    q.set("page", String(p));
    return `/annonces?${q}`;
  };
  const pages = data?.pages ?? 0;

  return (
    <>
      <div className="card mb-8 p-4 sm:p-5">
        <SearchForm values={values} compact />
      </div>

      {!data ? (
        <div className="alert alert-error">Ces critères ne sont pas valides. Vérifiez les âges (18 à 99 ans).</div>
      ) : data.total === 0 && !data.featured.length ? (
        <EmptyState title="Aucune annonce pour ces critères" action={{ href: "/annonces", label: "Effacer les filtres" }}>
          Essayez une autre ville ou élargissez la tranche d’âge.
        </EmptyState>
      ) : (
        <>
          {data.featured.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 font-display text-xl font-semibold">À la une</h2>
              <ListingGrid listings={data.featured} />
            </section>
          )}
          <p className="mb-4 text-sm text-muted">
            {data.total} annonce{data.total > 1 ? "s" : ""}
          </p>
          <ListingGrid listings={data.items} />
          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
              {page > 1 && <Link href={pageHref(page - 1)} className="btn btn-outline btn-sm">Précédente</Link>}
              <span className="text-sm text-muted">Page {page} sur {pages}</span>
              {page < pages && <Link href={pageHref(page + 1)} className="btn btn-outline btn-sm">Suivante</Link>}
            </nav>
          )}
        </>
      )}
    </>
  );
}
