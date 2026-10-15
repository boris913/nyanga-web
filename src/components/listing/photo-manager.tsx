"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage, uploadToBucket } from "@/lib/client-api";
import type { Plan } from "@/lib/types";

type Presign = { key: string; url: string; fields: Record<string, string> };

export function PhotoManager({ photos, limit, plan }: { photos: { id: string; url: string }[]; limit: number; plan: Plan }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const full = photos.length >= limit;

  async function upload(files: FileList) {
    setError(null);
    const list = Array.from(files).slice(0, limit - photos.length);
    try {
      for (const [i, file] of list.entries()) {
        setBusy(`Envoi ${i + 1}/${list.length}…`);
        const presign = await api<Presign>("/api/listings/mine/photos/upload", { body: { contentType: file.type } });
        await uploadToBucket(presign, file);
        await api("/api/listings/mine/photos", { body: { key: presign.key } });
      }
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    setBusy("Suppression…");
    setError(null);
    try {
      await api(`/api/listings/mine/photos/${id}`, { method: "DELETE" });
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <div key={p.id} className="group relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="aspect-square w-full object-cover" />
            {i === 0 && <span className="chip absolute left-1.5 top-1.5 bg-ink/80 text-white">Principale</span>}
            <button
              type="button"
              onClick={() => remove(p.id)}
              disabled={!!busy}
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-white/90 text-brand-dark shadow"
              aria-label="Supprimer la photo"
            >
              ×
            </button>
          </div>
        ))}
        {!full && (
          <label className={`grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-sm text-muted hover:border-brand hover:text-brand-dark ${busy ? "pointer-events-none opacity-60" : ""}`}>
            <span>{busy ?? "+ Ajouter"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={!!busy} onChange={(e) => e.target.files && upload(e.target.files)} />
          </label>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        {photos.length}/{limit} photos. Une nouvelle photo renvoie l’annonce en relecture.
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
