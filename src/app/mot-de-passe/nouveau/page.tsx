import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import { Container, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function ResetPasswordPage({ searchParams }: PageProps<"/mot-de-passe/nouveau">) {
  return (
    <Container narrow>
      <PageTitle title="Nouveau mot de passe" />
      <Suspense fallback={<div className="skeleton h-72" />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/mot-de-passe/nouveau">, "searchParams">) {
  const { jeton } = await searchParams;
  return <ResetPasswordForm token={typeof jeton === "string" ? jeton : ""} />;
}
