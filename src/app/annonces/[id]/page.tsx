import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { apiGet, getMe } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import { GENDERS, INTENTS, LISTING_STATUS, timeAgo } from "@/lib/format";
import { PlanBadge, VerifiedBadge } from "@/components/badges";
import { Container, PageSkeleton } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { ReportButton } from "@/components/report-button";

export async function generateMetadata({ params }: PageProps<"/annonces/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = await apiGet<Listing>(`/api/listings/${id}`).catch(() => null);
  if (!listing) return { title: "Annonce" };
  return {
    title: `${listing.title} · ${listing.city.name}`,
    description: listing.body.slice(0, 160),
  };
}

export default function ListingPage({ params }: PageProps<"/annonces/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ListingDetail params={params} />
    </Suspense>
  );
}

async function ListingDetail({ params }: Pick<PageProps<"/annonces/[id]">, "params">) {
  const { id } = await params;
  const [listing, me] = await Promise.all([apiGet<Listing>(`/api/listings/${id}`), getMe().catch(() => null)]);
  if (!listing) notFound();
  const a = listing.author;
  const isOwner = me?.id === a.id;
  const [cover, ...others] = listing.photos;

  return (
    <Container>
      <nav className="mt-6 text-sm text-muted">
        <Link href="/annonces" className="hover:text-ink">Annonces</Link>
        <span className="mx-2">/</span>
        <Link href={`/annonces?ville=${listing.city.slug}`} className="hover:text-ink">{listing.city.name}</Link>
      </nav>

      {listing.status !== "APPROVED" && (
        <div className="alert alert-info mt-4">Statut : {LISTING_STATUS[listing.status]}. Cette annonce n’est pas visible publiquement.</div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl bg-brand-soft">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.url} alt={`Photo de ${a.displayName ?? "l’auteur"}`} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center font-display text-8xl text-brand/30">
                {(a.displayName ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {others.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {others.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                </a>
              ))}
            </div>
          )}

          <article className="mt-8">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{listing.title}</h1>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed">{listing.body}</p>
          </article>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-semibold">
                {a.displayName}
                {a.age ? `, ${a.age} ans` : ""}
              </h2>
              {a.verified && <VerifiedBadge />}
              <PlanBadge plan={a.plan} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted">Ville</dt>
                <dd className="font-medium">{listing.city.name}{listing.neighborhood ? `, ${listing.neighborhood}` : ""}</dd>
              </div>
              <div>
                <dt className="text-muted">Cherche</dt>
                <dd className="font-medium">{INTENTS[listing.intent]}</dd>
              </div>
              {a.gender && (
                <div>
                  <dt className="text-muted">Genre</dt>
                  <dd className="font-medium">{GENDERS[a.gender]}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Mise à jour</dt>
                <dd className="font-medium">{timeAgo(listing.bumpedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            {isOwner ? (
              <>
                <p className="text-muted">C’est votre annonce.</p>
                <Link href="/mon-annonce" className="btn btn-primary mt-4 w-full">Modifier mon annonce</Link>
              </>
            ) : !me ? (
              <>
                <h3 className="font-display text-lg font-semibold">Écrire à {a.displayName}</h3>
                <p className="mt-1 text-sm text-muted">Connectez-vous pour envoyer un message privé.</p>
                <Link href={`/connexion?suite=/annonces/${listing.id}`} className="btn btn-primary mt-4 w-full">Se connecter</Link>
              </>
            ) : !me.profileComplete ? (
              <>
                <h3 className="font-display text-lg font-semibold">Écrire à {a.displayName}</h3>
                <p className="mt-1 text-sm text-muted">Complétez votre profil pour pouvoir écrire.</p>
                <Link href={`/profil?suite=/annonces/${listing.id}`} className="btn btn-primary mt-4 w-full">Compléter mon profil</Link>
              </>
            ) : (
              <ContactForm listingId={listing.id} name={a.displayName ?? "cette personne"} />
            )}
          </div>

          <div className="alert alert-info text-sm">
            Ne payez jamais quelqu’un rencontré en ligne et retrouvez-vous dans un lieu public.{" "}
            <Link href="/charte" className="font-semibold underline">Nos conseils</Link>
          </div>
          {me && !isOwner && <ReportButton listingId={listing.id} />}
        </aside>
      </div>
    </Container>
  );
}
