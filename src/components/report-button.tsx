"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/client-api";

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") return <p className="alert alert-ok text-sm">Merci, un modérateur va examiner cette annonce.</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start text-sm font-semibold text-muted underline hover:text-brand-dark">
        Signaler cette annonce
      </button>
    );
  }
  return (
    <form
      className="card flex flex-col gap-3 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("pending");
        setError(null);
        try {
          await api(`/api/listings/${listingId}/report`, { body: { reason } });
          setState("done");
        } catch (err) {
          setError(errorMessage(err));
          setState("idle");
        }
      }}
    >
      <label className="field">
        <span className="label">Pourquoi signalez-vous cette annonce ?</span>
        <textarea
          className="input"
          required
          minLength={5}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Demande d’argent, faux profil, contenu choquant, personne mineure…"
        />
      </label>
      {error && <p className="alert alert-error text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={state === "pending"}>Envoyer le signalement</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Annuler</button>
      </div>
    </form>
  );
}
