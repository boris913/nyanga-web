// Formes des réponses de l'API Nyanga (nyanga-api/src/routes).

export type Gender = 'FEMME' | 'HOMME';
export type Intent = 'AMITIE' | 'RELATION' | 'MARIAGE' | 'SORTIES';
export type Plan = 'STANDARD' | 'PREMIUM' | 'VIP';
export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
export type Verification = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export type City = { slug: string; name: string; region: string; listings: number };

export type Me = {
  id: string;
  email: string;
  phone: string | null;
  hasPassword: boolean;
  googleLinked: boolean;
  displayName: string | null;
  birthDate: string | null;
  gender: Gender | null;
  seeking: Gender | null;
  city: { slug: string; name: string } | null;
  role: Role;
  verification: Verification;
  profileComplete: boolean;
  plan: Plan;
  planExpiresAt: string | null;
  limits: { photos: number; messagesPerDay: number | null; seeViewers: boolean };
  listing: { id: string; status: ListingStatus; moderationNote: string | null; featuredUntil: string | null; pinnedUntil: string | null } | null;
};

export type Listing = {
  id: string;
  title: string;
  body: string;
  intent: Intent;
  city: { slug: string; name: string };
  neighborhood: string | null;
  status: ListingStatus;
  featured: boolean;
  pinned: boolean;
  bumpedAt: string;
  photos: { id: string; url: string }[];
  author: { id: string; displayName: string | null; age: number | null; gender: Gender | null; verified: boolean; plan: Plan };
  moderationNote?: string | null;
};

export type ListingPage = { featured: Listing[]; items: Listing[]; total: number; page: number; pageSize: number; pages: number };

export type ConversationSummary = {
  id: string;
  other: { id: string; displayName: string | null };
  lastMessage: { body: string; createdAt: string; mine: boolean } | null;
  updatedAt: string;
};

export type Message = { id: string; body: string; createdAt: string; mine: boolean };

export type ConversationThread = {
  id: string;
  listingId: string | null;
  other: { id: string; displayName: string | null };
  messages: Message[];
};

export type Sku = 'PREMIUM' | 'VIP' | 'BUMP' | 'FEATURED_24H' | 'FEATURED_7D';

export type CatalogItem =
  | { sku: 'PREMIUM' | 'VIP'; kind: 'plan'; plan: Plan; label: string; priceXaf: number; period: string; available: boolean }
  | { sku: 'BUMP' | 'FEATURED_24H' | 'FEATURED_7D'; kind: 'boost'; label: string; priceXaf: number; featuredHours: number; pinnedHours: number; available: boolean };

export type AdminListing = {
  id: string;
  title: string;
  body: string;
  intent: Intent;
  city: string;
  neighborhood: string | null;
  status: ListingStatus;
  moderationNote: string | null;
  updatedAt: string;
  openReports: number;
  photos: string[];
  user: { id: string; displayName: string | null; email: string; birthDate: string | null; verification: Verification };
};

export type AdminReport = {
  id: string;
  reason: string;
  createdAt: string;
  listing: { id: string; title: string; status: ListingStatus };
  reporter: { id: string; displayName: string | null };
};

export type AdminVerification = { id: string; displayName: string | null; selfie: string | null; photos: string[] };
