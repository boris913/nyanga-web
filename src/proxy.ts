import { NextResponse, type NextRequest } from "next/server";

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const PROXY_SECRET = process.env.PROXY_SECRET ?? "";

// Le navigateur appelle /api/* sur le domaine du site (cookie de session first-party) ;
// on relaie vers l'API en lui transmettant l'adresse réelle du visiteur, signée par PROXY_SECRET.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("x-nyanga-client-ip");
  headers.delete("x-nyanga-proxy-secret");
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (PROXY_SECRET && ip) {
    headers.set("x-nyanga-client-ip", ip);
    headers.set("x-nyanga-proxy-secret", PROXY_SECRET);
  }
  const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, API_URL);
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = {
  matcher: "/api/:path*",
};
