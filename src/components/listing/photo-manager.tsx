"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage, uploadToBucket } from "@/lib/client-api";
import { prepareListingPhoto } from "@/lib/image";
import { HeartLoader } from "@/components/brand/heart";
import { toast } from "@/components/brand/effects";
import type { Plan } from "@/lib/types";

type Presign = { key: string; url: string; fields: Record<string, string> };

async function send(blob: Blob) {
  const presign = await api<Presign>("/api/listings/mine/photos/upload", { body: { contentType: blob.type } });
  await uploadToBucket(presign, blob);
  return presign.key;
}

export function PhotoManager({ photos, limit, plan }: { photos: { id: string; url: string; thumbUrl: string }[]; limit: number; plan: Plan }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const full = photos.length >= limit;
  const autoPublish = plan !== "STANDARD";

  async function upload(files: FileList) {
    setError(null);
    const list = Array.from(files).slice(0, limit - photos.length);
    let sent = 0;
    try {
      for (const [i, file] of list.entries()) {
        setBusy(`Photo ${i + 1}/${list.length}…`);
        const { main, thumb } = await prepareListingPhoto(file);
        const key = await send(main);
        const thumbKey = await send(thumb);
        await api("/api/listings/mine/photos", { body: { key, thumbKey } });
        sent++;
      }
    } catch (err) {
      setError(errorMessage(err));
    }
    if (sent) toast(sent > 1 ? `${sent} photos ajoutées` : "Photo ajoutée");
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    setBusy("Suppression…");
    setError(null);
    try {
      await api(`/api/listings/mine/photos/${id}`, { method: "DELETE" });
      toast("Photo supprimée");
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mt-4">
      {!photos.length && (
        <p className="alert alert-info mb-3 text-sm">Ajoutez au moins une photo : sans photo, votre annonce n’est pas visible.</p>
      )}
      <div className="rise grid grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <div key={p.id} className="group relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbUrl} alt="" width={480} height={480} className="aspect-square w-full object-cover" />
            {i === 0 && <span className="chip absolute left-1.5 top-1.5 bg-ink/80 text-white">Principale</span>}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => remove(p.id)}
                disabled={!!busy}
                className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-white/90 text-lg text-brand-dark shadow transition active:scale-90"
                aria-label="Supprimer la photo"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {!full && (
          <label
            className={`grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-sm text-muted transition hover:border-brand hover:text-brand-dark active:scale-95 ${busy ? "pointer-events-none" : ""}`}
          >
            {busy ? (
              <span className="flex flex-col items-center gap-1">
                <HeartLoader label={busy} className="size-7" />
                <span className="text-xs">{busy}</span>
              </span>
            ) : (
              <span>+ Ajouter</span>
            )}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={!!busy} onChange={(e) => e.target.files && upload(e.target.files)} />
          </label>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        {photos.length}/{limit} photos. Le filigrane Nyanga est ajouté automatiquement.
        {autoPublish ? " Vos nouvelles photos sont publiées aussitôt." : " Une nouvelle photo renvoie l’annonce en relecture."}
        {photos.length === 1 && " Pour changer de photo principale, ajoutez-en une autre avant de supprimer celle-ci."}
        {full && plan !== "VIP" && (
          <>
            {" "}
            <Link href="/offres" className="font-semibold text-brand-dark underline">Plus de photos avec Premium</Link>
          </>
        )}
      </p>
      {error && <p className="alert alert-error mt-3 text-sm">{error}</p>}
    </div>
  );
}
