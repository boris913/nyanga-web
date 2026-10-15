import Link from "next/link";
import { Suspense } from "react";
import { getMe } from "@/lib/server-api";
import { LogoutButton } from "./logout-button";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Nyanga, accueil">
      <span className="grid size-9 place-items-center rounded-full bg-brand font-display text-lg font-semibold text-white">N</span>
      <span className="font-display text-2xl font-semibold tracking-tight">Nyanga</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-[0.9375rem] font-medium md:flex">
          <Link href="/annonces" className="btn btn-ghost btn-sm">Annonces</Link>
          <Link href="/offres" className="btn btn-ghost btn-sm">Offres</Link>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Suspense fallback={<div className="skeleton h-9 w-40" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function UserMenu() {
  const me = await getMe().catch(() => null);
  if (!me) {
    return (
      <>
        <Link href="/connexion" className="btn btn-ghost btn-sm">Connexion</Link>
        <Link href="/inscription" className="btn btn-primary btn-sm">
          <span className="sm:hidden">S’inscrire</span>
          <span className="hidden sm:inline">Créer un compte</span>
        </Link>
      </>
    );
  }
  const staff = me.role !== "USER";
  return (
    <>
      <nav className="flex items-center gap-1 text-sm font-medium">
        <Link href="/messages" className="btn btn-ghost btn-sm">Messages</Link>
        <Link href="/mon-annonce" className="btn btn-ghost btn-sm hidden sm:inline-flex">Mon annonce</Link>
        {staff && <Link href="/moderation" className="btn btn-ghost btn-sm hidden sm:inline-flex">Modération</Link>}
      </nav>
      <details className="relative">
        <summary
          className="grid size-9 cursor-pointer list-none place-items-center rounded-full bg-ink font-semibold text-white [&::-webkit-details-marker]:hidden"
          aria-label="Menu du compte"
        >
          {(me.displayName ?? me.email).charAt(0).toUpperCase()}
        </summary>
        <div className="card absolute right-0 mt-2 w-60 p-2 shadow-lg">
          <p className="truncate px-3 py-2 text-sm text-muted">{me.email}</p>
          <Link href="/profil" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft">Mon profil</Link>
          <Link href="/annonces" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft md:hidden">Annonces</Link>
          <Link href="/mon-annonce" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft sm:hidden">Mon annonce</Link>
          {staff && <Link href="/moderation" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft sm:hidden">Modération</Link>}
          <Link href="/offres" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft">Offres</Link>
          <LogoutButton />
        </div>
      </details>
    </>
  );
}
