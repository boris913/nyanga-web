import Link from "next/link";
import { ViewTransition } from "react";
import type { Listing } from "@/lib/types";
import { INTENTS, cityHref, listingHref, timeAgo } from "@/lib/format";
import { PlanBadge, VerifiedBadge } from "./badges";

// Toute la carte est cliquable via le lien du titre (étiré en ::after) ; le lien vers la ville passe au-dessus.
export function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos[0];
  const a = listing.author;
  return (
    <article className={`card listing-card group relative flex flex-col overflow-hidden ${a.plan === "VIP" ? "listing-card-vip" : ""}`}>
      <div className="relative aspect-[4/3] bg-brand-soft">
        {photo ? (
          <ViewTransition name={`photo-${listing.id}`} share="morph" default="none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.thumbUrl} alt="" width={480} height={360} className="size-full object-cover" loading="lazy" decoding="async" />
          </ViewTransition>
        ) : (
          <div className="grid size-full place-items-center font-display text-5xl text-brand/40">
            {(a.displayName ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {listing.featured && <span className="chip bg-gold text-white">À la une</span>}
          <PlanBadge plan={a.plan} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">
            {a.displayName}
            {a.age ? `, ${a.age} ans` : ""}
          </span>
          {a.verified && <VerifiedBadge />}
        </div>
        <h3 className="line-clamp-2 font-display text-lg leading-snug [overflow-wrap:anywhere] group-hover:text-brand-dark">
          <Link href={listingHref(listing)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-brand">
            {listing.title}
          </Link>
        </h3>
        <p className="mt-auto flex flex-wrap gap-x-2 text-sm text-muted">
          <span>
            <Link href={cityHref(listing.city.slug)} className="relative z-10 hover:text-ink hover:underline">{listing.city.name}</Link>
            {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
          </span>
          <span aria-hidden>·</span>
          <span>{INTENTS[listing.intent]}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(listing.bumpedAt)}</span>
        </p>
      </div>
    </article>
  );
}

export function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="rise grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton h-80" />
      ))}
    </div>
  );
}
