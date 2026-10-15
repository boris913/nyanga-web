"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import { GENDERS } from "@/lib/format";
import type { City, Gender, Me } from "@/lib/types";

// Date max pour avoir 18 ans aujourd'hui (AAAA-MM-JJ).
function adultMaxDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export function ProfileForm({ me, cities, next }: { me: Me; cities: City[]; next: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: me.displayName ?? "",
    birthDate: me.birthDate?.slice(0, 10) ?? "",
    gender: (me.gender ?? "") as Gender | "",
    seeking: (me.seeking ?? "") as Gender | "",
    citySlug: me.city?.slug ?? "",
  });
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const [pending, setPending] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus({});
    try {
      await api("/api/me/profile", { method: "PUT", body: form });
      if (next) return router.push(next);
      setStatus({ ok: "Profil enregistré." });
      router.refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? (err.field("displayName") ?? err.field("birthDate") ?? err.message) : errorMessage(err);
      setStatus({ error: msg });
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <label className="field sm:col-span-2">
        <span className="label">Prénom ou pseudo</span>
        <input className="input" required minLength={2} maxLength={40} value={form.displayName} onChange={set("displayName")} />
        <span className="hint">Affiché sur votre annonce. Évitez votre nom complet.</span>
      </label>
      <label className="field">
        <span className="label">Date de naissance</span>
        <input className="input" type="date" required max={adultMaxDate()} value={form.birthDate} onChange={set("birthDate")} />
        <span className="hint">Seul votre âge est affiché.</span>
      </label>
      <label className="field">
        <span className="label">Ville</span>
        <select className="input" required value={form.citySlug} onChange={set("citySlug")}>
          <option value="" disabled>Choisir…</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <fieldset className="field">
        <legend className="label mb-1.5">Je suis</legend>
        <GenderChoice name="gender" value={form.gender} onChange={(gender) => setForm({ ...form, gender })} />
      </fieldset>
      <fieldset className="field">
        <legend className="label mb-1.5">Je cherche</legend>
        <GenderChoice name="seeking" value={form.seeking} onChange={(seeking) => setForm({ ...form, seeking })} />
      </fieldset>
      {status.error && <p className="alert alert-error text-sm sm:col-span-2">{status.error}</p>}
      {status.ok && <p className="alert alert-ok text-sm sm:col-span-2">{status.ok}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : next ? "Enregistrer et continuer" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function GenderChoice({ name, value, onChange }: { name: string; value: Gender | ""; onChange: (g: Gender) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(GENDERS) as Gender[]).map((g) => (
        <label
          key={g}
          className={`btn btn-outline cursor-pointer ${value === g ? "!border-brand bg-brand-soft text-brand-dark" : ""}`}
        >
          <input type="radio" name={name} value={g} required checked={value === g} onChange={() => onChange(g)} className="sr-only" />
          {GENDERS[g]}
        </label>
      ))}
    </div>
  );
}
