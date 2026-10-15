import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNext } from "@/lib/format";
import { AuthForm } from "@/components/auth/auth-form";
import { Container, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <Container narrow>
      <PageTitle title="Bon retour parmi nous" subtitle="Connectez-vous pour écrire aux membres et gérer votre annonce." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/connexion">, "searchParams">) {
  const { suite } = await searchParams;
  return <AuthForm mode="login" next={safeNext(suite)} />;
}
