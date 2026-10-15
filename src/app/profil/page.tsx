import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireMe } from "@/lib/auth";
import { getCities } from "@/lib/server-api";
import { PLANS, formatDate, safeNext } from "@/lib/format";
import { Container, PageSkeleton, PageTitle } from "@/components/ui";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { VerificationUpload } from "@/components/profile/verification-upload";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProfilePage({ searchParams }: PageProps<"/profil">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Profile searchParams={searchParams} />
    </Suspense>
  );
}

async function Profile({ searchParams }: Pick<PageProps<"/profil">, "searchParams">) {
  const [{ suite }, me, cities] = await Promise.all([searchParams, requireMe("/profil"), getCities()]);
  const next = typeof suite === "string" ? safeNext(suite) : null;

  return (
    <Container>
      <PageTitle
        title={me.profileComplete ? "Mon profil" : "Complétez votre profil"}
        subtitle={me.profileComplete ? me.email : "Quelques informations pour présenter votre annonce et écrire aux membres."}
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-6 sm:p-8">
          <h2 className="mb-5 font-display text-xl font-semibold">Informations</h2>
          <ProfileForm me={me} cities={cities} next={next ?? (me.profileComplete ? null : "/mon-annonce")} />
        </section>

        <div className="flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">Formule</h2>
            <p className="mt-2">
              <span className="font-semibold">{PLANS[me.plan]}</span>
              {me.planExpiresAt && <span className="text-muted"> · jusqu’au {formatDate(me.planExpiresAt)}</span>}
            </p>
            <p className="mt-1 text-sm text-muted">
              {me.limits.photos} photos · {me.limits.messagesPerDay === null ? "messages illimités" : `${me.limits.messagesPerDay} messages par 24 h`}
            </p>
            {me.plan !== "VIP" && <Link href="/offres" className="btn btn-outline btn-sm mt-4">Voir les offres</Link>}
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">Badge « Vérifié »</h2>
            <VerificationUpload status={me.verification} />
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">{me.hasPassword ? "Mot de passe" : "Définir un mot de passe"}</h2>
            {me.googleLinked && <p className="mt-1 text-sm text-muted">Compte relié à Google.</p>}
            <PasswordForm hasPassword={me.hasPassword} />
          </section>
        </div>
      </div>
    </Container>
  );
}
