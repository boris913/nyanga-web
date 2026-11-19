import Link from "next/link";
import { apiGet } from "@/lib/server-api";
import type { ListingPage } from "@/lib/types";
import { SearchForm, type SearchValues } from "@/components/search-form";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { ApiDown, EmptyState } from "@/components/ui";

type SearchParams = Record<string, string | string[] | undefined>;

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export function ListingsResultsSkeleton() {
  return (
    <>
      <div className="skeleton mb-8 h-24" />
      <ListingGridSkeleton />
    </>
  );
}

/**
 * Recherche d'annonces partagée par /annonces et /annonces/ville/[city].
 * `city` fixe la ville (pages ville) ; `basePath` sert aux liens de pagination.
 */
export async function ListingsResults({ searchParams, city, basePath = "/annonces" }: { searchParams: Promise<SearchParams>; city?: string; basePath?: string }) {
  const sp = await searchParams;
  const values: SearchValues = {
    ville: city ?? pick(sp.ville),
    quartier: pick(sp.quartier),
    intention: pick(sp.intention),
    genre: pick(sp.genre),
    age_min: pick(sp.age_min),
    age_max: pick(sp.age_max),
    verifies: pick(sp.verifies) === "1" ? "1" : undefined,
  };
  const page = Math.max(1, Number(pick(sp.page)) || 1);

  const query = new URLSearchParams();
  if (values.ville) query.set("city", values.ville);
  if (values.quartier) query.set("neighborhood", values.quartier);
  if (values.intention) query.set("intent", values.intention);
  if (values.genre) query.set("gender", values.genre);
  if (values.age_min) query.set("minAge", values.age_min);
  if (values.age_max) query.set("maxAge", values.age_max);
  if (values.verifies) query.set("verified", "1");
  query.set("page", String(page));

  let data: ListingPage | null;
  try {
    data = await apiGet<ListingPage>(`/api/listings?${query}`);
  } catch {
    return <ApiDown />;
  }

  const pageHref = (p: number) => {
    // Sur une page ville, la ville est déjà dans le chemin.
    const kept = Object.entries(values).filter((e): e is [string, string] => Boolean(e[1]) && !(city && e[0] === "ville"));
    const q = new URLSearchParams(kept);
    q.set("page", String(p));
    return `${basePath}?${q}`;
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
        <EmptyState title="Aucune annonce pour ces critères" action={{ href: basePath, label: "Effacer les filtres" }}>
          {city ? "Essayez un autre quartier ou élargissez la tranche d’âge." : "Essayez une autre ville ou élargissez la tranche d’âge."}
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
