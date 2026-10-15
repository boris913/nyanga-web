import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-base font-semibold text-ink">Nyanga</span> · Rencontres entre adultes au Cameroun. Réservé aux 18 ans et plus.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/charte" className="hover:text-ink">Charte et sécurité</Link>
          <Link href="/offres" className="hover:text-ink">Offres</Link>
          <Link href="/annonces" className="hover:text-ink">Annonces</Link>
        </nav>
      </div>
    </footer>
  );
}
