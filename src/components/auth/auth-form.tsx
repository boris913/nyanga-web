"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";
import { GoogleButton } from "./google-button";

type Mode = "login" | "register";

// Désactivé tant que l'API n'envoie pas d'emails (MAIL_DRIVER=none).
const PASSWORD_RESET = process.env.NEXT_PUBLIC_PASSWORD_RESET === "true";

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Rechargement complet : l'en-tête et les pages serveur relisent la nouvelle session.
  const done = ({ profileComplete }: { profileComplete: boolean }) =>
    // Sans page d'origine, un nouveau profil mène à « Mon annonce » (choix par défaut de /profil).
    window.location.assign(profileComplete ? next : next === "/" ? "/profil" : `/profil?suite=${encodeURIComponent(next)}`);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      done(await api<{ profileComplete: boolean }>(`/api/auth/${mode}`, { body: { email, password } }));
    } catch (err) {
      setError(err instanceof ApiError ? (err.field("password") ?? err.field("email") ?? err.message) : errorMessage(err));
      setPending(false);
    }
  }

  const isRegister = mode === "register";
  return (
    <div className="card p-6 sm:p-8">
      <GoogleButton onSuccess={done} />
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <div className="my-6 flex items-center gap-3 text-sm text-muted">
          <span className="h-px flex-1 bg-line" />
          ou avec votre email
          <span className="h-px flex-1 bg-line" />
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="field">
          <span className="label">Email</span>
          <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <div className="field">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="label">Mot de passe</label>
            {!isRegister && PASSWORD_RESET && (
              <Link href="/mot-de-passe/oublie" className="text-sm font-semibold text-brand-dark hover:underline">Mot de passe oublié ?</Link>
            )}
          </div>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isRegister && <span className="hint">8 caractères minimum.</span>}
        </div>
        {isRegister && (
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" required checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
            <span>
              J’ai 18 ans ou plus et j’accepte la <Link href="/charte" className="font-semibold underline" target="_blank">charte de Nyanga</Link>.
            </span>
          </label>
        )}
        {error && <p className="alert alert-error text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Un instant…" : isRegister ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {isRegister ? "Déjà inscrit·e ? " : "Pas encore de compte ? "}
        <Link
          href={`${isRegister ? "/connexion" : "/inscription"}${next !== "/" ? `?suite=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-brand-dark hover:underline"
        >
          {isRegister ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}
