import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/brand/effects";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });

const description =
  "Petites annonces de rencontre au Cameroun : Douala, Yaoundé, Bafoussam et partout ailleurs. Contact par messagerie privée ou WhatsApp, réservé aux adultes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Nyanga · Rencontres au Cameroun", template: "%s · Nyanga" },
  description,
  applicationName: "Nyanga",
  openGraph: { type: "website", siteName: "Nyanga", locale: "fr_CM", title: "Nyanga · Rencontres au Cameroun", description },
  twitter: { card: "summary_large_image" },
  // Les photos des membres ne doivent pas se retrouver dans Google Images.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, noimageindex: true } },
};

export const viewport: Viewport = { themeColor: "#b3343a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${manrope.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
