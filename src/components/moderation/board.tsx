"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/client-api";
import { INTENTS, LISTING_STATUS, timeAgo } from "@/lib/format";
import type { AdminListing, AdminReport, AdminVerification, ListingStatus } from "@/lib/types";

type Tab = "listings" | "reports" | "verifications";

export function ModerationBoard() {
  const [tab, setTab] = useState<Tab>("listings");
  return (
    <>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {(
          [
            ["listings", "Annonces"],
            ["reports", "Signalements"],
            ["verifications", "Vérifications"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === key ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "listings" && <ListingsQueue />}
      {tab === "reports" && <ReportsQueue />}
      {tab === "verifications" && <VerificationsQueue />}
    </>
  );
}

function useLoad<T>(path: string) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{ path: string; data?: T; error?: string } | null>(null);
  useEffect(() => {
    let live = true;
    api<T>(path).then(
      (data) => live && setResult({ path, data }),
      (e) => live && setResult({ path, error: errorMessage(e) }),
    );
    return () => {
      live = false;
    };
  }, [path, version]);
  // Après un rechargement, l'ancienne liste reste affichée jusqu'à la nouvelle réponse.
  const current = result?.path === path ? result : null;
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data: current?.data ?? null, error: current?.error ?? null, reload };
}

function Loading({ error }: { error: string | null }) {
  return error ? <p className="alert alert-error">{error}</p> : <div className="skeleton h-48" />;
}

function ListingsQueue() {
  const [status, setStatus] = useState<ListingStatus>("PENDING");
  const { data, error, reload } = useLoad<AdminListing[]>(`/api/admin/listings?status=${status}`);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(LISTING_STATUS) as ListingStatus[]).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`btn btn-sm ${s === status ? "btn-primary" : "btn-outline"}`}>
            {LISTING_STATUS[s]}
          </button>
        ))}
      </div>
      {!data ? (
        <Loading error={error} />
      ) : data.length === 0 ? (
        <p className="card p-8 text-center text-muted">Rien à traiter ici.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((l) => (
            <ListingReview key={l.id} listing={l} onDone={reload} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingReview({ listing: l, onDone }: { listing: AdminListing; onDone: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(path: string, body: object, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      await api(path, { body });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }
  const decide = (decision: "APPROVED" | "REJECTED" | "HIDDEN") => act(`/api/admin/listings/${l.id}/decision`, { decision, note: note || undefined });

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{l.title}</h3>
          <p className="text-sm text-muted">
            {l.user.displayName} · {l.user.email} · {l.city}{l.whatsapp && ` · WhatsApp ${l.whatsapp}`}
            {l.neighborhood ? `, ${l.neighborhood}` : ""} · {INTENTS[l.intent]} · modifiée {timeAgo(l.updatedAt)}
          </p>
        </div>
        <div className="flex gap-1.5">
          {l.openReports > 0 && <span className="chip bg-brand text-white">{l.openReports} signalement(s)</span>}
          {l.user.verification === "VERIFIED" && <span className="chip bg-leaf-soft text-leaf">Vérifié</span>}
        </div>
      </div>
      {l.moderationNote && <p className="alert alert-info mt-3 text-sm">{l.moderationNote}</p>}
      <p className="mt-3 whitespace-pre-line text-[0.9375rem]">{l.body}</p>
      {l.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {l.photos.map((src) => (
            <a key={src} href={src} target="_blank" rel="noreferrer" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-28 rounded-lg object-cover" />
            </a>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input className="input sm:max-w-sm" placeholder="Note pour l’auteur (motif du refus…)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        <div className="flex flex-wrap gap-2">
          {l.status !== "APPROVED" && <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => decide("APPROVED")}>Publier</button>}
          {l.status !== "REJECTED" && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => decide("REJECTED")}>Refuser</button>}
          {l.status !== "HIDDEN" && <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => decide("HIDDEN")}>Masquer</button>}
          <button
            className="btn btn-ghost btn-sm text-brand-dark"
            disabled={busy}
            onClick={() => act(`/api/admin/users/${l.user.id}/ban`, {}, `Bannir ${l.user.displayName ?? l.user.email} ? Ses sessions seront coupées et son annonce masquée.`)}
          >
            Bannir l’auteur
          </button>
        </div>
      </div>
      {error && <p className="alert alert-error mt-3 text-sm">{error}</p>}
    </article>
  );
}

function ReportsQueue() {
  const { data, error, reload } = useLoad<AdminReport[]>("/api/admin/reports");
  if (!data) return <Loading error={error} />;
  if (!data.length) return <p className="card p-8 text-center text-muted">Aucun signalement en attente.</p>;
  return (
    <ul className="card divide-y divide-line">
      {data.map((r) => (
        <li key={r.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={`/annonces/${r.listing.id}`} target="_blank" className="font-semibold hover:underline">{r.listing.title}</Link>
            <span className="ml-2 text-sm text-muted">({LISTING_STATUS[r.listing.status]})</span>
            <p className="mt-1 text-[0.9375rem]">« {r.reason} »</p>
            <p className="text-sm text-muted">Par {r.reporter.displayName ?? "un membre"} · {timeAgo(r.createdAt)}</p>
          </div>
          <button
            className="btn btn-outline btn-sm self-start"
            onClick={async () => {
              await api(`/api/admin/reports/${r.id}/resolve`, { body: {} }).catch(() => {});
              reload();
            }}
          >
            Classer
          </button>
        </li>
      ))}
    </ul>
  );
}

function VerificationsQueue() {
  const { data, error, reload } = useLoad<AdminVerification[]>("/api/admin/verifications");
  if (!data) return <Loading error={error} />;
  if (!data.length) return <p className="card p-8 text-center text-muted">Aucune vérification en attente.</p>;
  const decide = async (id: string, decision: "VERIFIED" | "REJECTED") => {
    await api(`/api/admin/users/${id}/verification`, { body: { decision } }).catch(() => {});
    reload();
  };
  return (
    <div className="flex flex-col gap-4">
      {data.map((v) => (
        <article key={v.id} className="card p-5">
          <h3 className="font-semibold">{v.displayName ?? "Membre"}</h3>
          <p className="text-sm text-muted">Le selfie doit montrer la même personne que les photos, avec un « V » fait de deux doigts.</p>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {v.selfie && (
              <figure className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.selfie} alt="Selfie de vérification" className="size-40 rounded-lg object-cover ring-2 ring-brand" />
                <figcaption className="mt-1 text-xs text-muted">Selfie</figcaption>
              </figure>
            )}
            {v.photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="size-40 shrink-0 rounded-lg object-cover" />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => decide(v.id, "VERIFIED")}>Valider</button>
            <button className="btn btn-outline btn-sm" onClick={() => decide(v.id, "REJECTED")}>Refuser</button>
          </div>
        </article>
      ))}
    </div>
  );
}
