import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { Container, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <Container narrow>
      <PageTitle title="Mot de passe oublié" subtitle="Indiquez votre email : nous vous envoyons un lien pour en choisir un nouveau." />
      <ForgotPasswordForm />
    </Container>
  );
}
