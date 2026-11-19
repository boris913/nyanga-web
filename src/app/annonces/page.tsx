import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingsResults, ListingsResultsSkeleton } from "@/components/listings-results";
import { Container, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Annonces de rencontre" };

export default function ListingsPage({ searchParams }: PageProps<"/annonces">) {
  return (
    <Container>
      <PageTitle title="Annonces" subtitle="Toutes les annonces publiées, les plus récentes d’abord." />
      <Suspense fallback={<ListingsResultsSkeleton />}>
        <ListingsResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
