import type { Metadata } from "next";
import { Suspense } from "react";
import { requireMe } from "@/lib/auth";
import { Container, PageSkeleton, PageTitle } from "@/components/ui";
import { PaymentStatus } from "@/components/billing/payment-status";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

export default function PaymentReturnPage({ searchParams }: PageProps<"/paiement/retour">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Return searchParams={searchParams} />
    </Suspense>
  );
}

async function Return({ searchParams }: Pick<PageProps<"/paiement/retour">, "searchParams">) {
  const [{ sku }, me] = await Promise.all([searchParams, requireMe("/offres")]);
  return (
    <Container narrow>
      <PageTitle title="Merci !" subtitle="Nous attendons la confirmation de votre paiement." />
      <PaymentStatus sku={typeof sku === "string" ? sku : ""} initialPlan={me.plan} initialFeaturedUntil={me.listing?.featuredUntil ?? null} />
    </Container>
  );
}
