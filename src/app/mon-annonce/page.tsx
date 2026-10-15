import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireMe } from "@/lib/auth";
import { apiGet, getCities } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import { LISTING_STATUS, formatDate } from "@/lib/format";
import { Container, PageSkeleton, PageTitle } from "@/components/ui";
import { ListingEditor } from "@/components/listing/listing-editor";
import { PhotoManager } from "@/components/listing/photo-manager";

export const metadata: Metadata = { title: "Mon annonce" };

export default function MyListingPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyListing />
    </Suspense>
  );
}

const STATUS_STYLE = {
  PENDING: "alert-info",
  APPROVED: "alert-ok",
  REJECTED: "alert-error",
  HIDDEN: "alert-error",
} as const;

async function MyListing() {
  const me = await requireMe("/mon-annonce", { profile: true });
  const [listing, cities] = await Promise.all([apiGet<Listing>("/api/listings/mine"), getCities()]);
  const featuredUntil = me.listing?.featuredUntil && new Date(me.listing.featuredUntil) > new Date() ? me.listing.featuredUntil : null;

  return (
    <Container>
      <PageTitle
        title={listing ? "Mon annonce" : "Publier mon annonce"}
        subtitle="Une seule annonce par membre. Chaque modification est relue avant d’être visible."
      />

      {listing && (
        <div className={`alert ${STATUS_STYLE[listing.status]} mb-6 flex flex-wrap items-center justify-between gap-3`}>
          <span>
            <strong>{LISTING_STATUS[listing.status]}</strong>
            {listing.status === "PENDING" && " · généralement sous 24 h."}
            {listing.moderationNote && listing.status !== "APPROVED" && <span className="block text-sm">Note : {listing.moderationNote}</span>}
            {featuredUntil && <span className="block text-sm">À la une jusqu’au {formatDate(featuredUntil)}</span>}
          </span>
          {listing.status === "APPROVED" && (
            <span className="flex gap-2">
              <Link href={`/annonces/${listing.id}`} className="btn btn-outline btn-sm">Voir</Link>
              <Link href="/offres#boosts" className="btn btn-primary btn-sm">Mettre en avant</Link>
            </span>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-6 sm:p-8">
          <ListingEditor listing={listing} cities={cities} defaultCity={me.city?.slug ?? ""} />
        </section>
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Photos</h2>
          {listing ? (
            <PhotoManager photos={listing.photos} limit={me.limits.photos} plan={me.plan} />
          ) : (
            <p className="mt-2 text-sm text-muted">Enregistrez d’abord votre annonce, puis ajoutez jusqu’à {me.limits.photos} photos.</p>
          )}
          <p className="mt-5 text-sm text-muted">
            Photos de vous uniquement, visage visible, sans nudité. Pas de numéro ni de lien dans le texte : les membres vous écrivent par la messagerie.
          </p>
        </section>
      </div>
    </Container>
  );
}
