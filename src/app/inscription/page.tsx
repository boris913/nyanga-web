import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNext } from "@/lib/format";
import { AuthForm } from "@/components/auth/auth-form";
import { Container, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage({ searchParams }: PageProps<"/inscription">) {
  return (
    <Container narrow>
      <PageTitle title="Créer un compte" subtitle="Gratuit. Publiez votre annonce et écrivez aux membres en quelques minutes." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/inscription">, "searchParams">) {
  const { suite } = await searchParams;
  return <AuthForm mode="register" next={safeNext(suite)} />;
}
