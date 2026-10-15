import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto w-full px-4 ${narrow ? "max-w-xl" : "max-w-6xl"}`}>{children}</div>;
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-8 mt-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <Container>
      <div className="skeleton mb-8 mt-10 h-10 w-64" />
      <div className="skeleton h-64" />
    </Container>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="card px-6 py-12 text-center">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
      {action && (
        <Link href={action.href} className="btn btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ApiDown() {
  return (
    <div className="alert alert-error my-10">
      Le service est momentanément indisponible. Réessayez dans quelques instants.
    </div>
  );
}
