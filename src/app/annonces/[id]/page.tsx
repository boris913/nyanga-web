import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { apiGet, getMe } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import { GENDERS, INTENTS, LISTING_STATUS, timeAgo } from "@/lib/format";
import { PlanBadge, VerifiedBadge } from "@/components/badges";
import { Container, PageSkeleton } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { ReportButton } from "@/components/report-button";
import { WhatsappButton } from "@/components/listing/whatsapp-button";

export async function generateMetadata({ params }: PageProps<"/annonces/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = await apiGet<Listing>(`/api/listings/${id}`).catch(() => null);
  if (!listing) return { title: "Annonce", robots: { index: false } };
  const a = listing.author;
  const who = `${a.displayName ?? "Annonce"}${a.age ? `, ${a.age} ans` : ""} · ${listing.city.name}`;
  const cover = listing.photos[0];
  return {
    title: `${listing.title} · ${listing.city.name}`,
    description: listing.body.slice(0, 160),
    // Les annonces ne sont pas indexées par les moteurs de recherche ; l'aperçu de partage (WhatsApp, Facebook) reste complet.
    robots: { index: false, follow: true, googleBot: { index: false, follow: true, noimageindex: true } },
    openGraph: { type: "profile", title: who, description: listing.title, images: cover ? [{ url: cover.url, alt: who }] : undefined },
  };
}

export default function ListingPage({ params }: PageProps<"/annonces/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ViewTransition enter="slide-up" default="none">
        <ListingDetail params={params} />
      </ViewTransition>
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
              <ViewTransition name={`photo-${listing.id}`} share="morph" default="none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.url}
                  alt={`Photo de ${a.displayName ?? "l’annonceur"}`}
                  width={1600}
                  height={1200}
                  fetchPriority="high"
                  className="aspect-[4/3] w-full object-cover"
                />
              </ViewTransition>
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
                  <img src={p.thumbUrl} alt="" width={480} height={480} className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" decoding="async" />
                </a>
              ))}
            </div>
          )}

          <article className="mt-8">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl">{listing.title}</h1>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed [overflow-wrap:anywhere]">{listing.body}</p>
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

          {listing.whatsappMasked && !isOwner && (
            <div className="card p-5">
              <WhatsappButton listingId={listing.id} masked={listing.whatsappMasked} />
              <p className="mt-3 text-center text-xs text-muted">Le numéro s’affiche dans WhatsApp à l’ouverture de la conversation.</p>
            </div>
          )}

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

      {listing.whatsappMasked && !isOwner && (
        // Sur téléphone, le bouton WhatsApp reste à portée du pouce.
        <>
        <div className="h-20 lg:hidden" aria-hidden />
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-3 backdrop-blur lg:hidden">
          <WhatsappButton listingId={listing.id} masked={listing.whatsappMasked} compact />
        </div>
        </>
      )}
    </Container>
  );
}
