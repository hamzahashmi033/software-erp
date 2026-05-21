import { NextRequest, NextResponse } from "next/server";

const ADMIN_PUBLIC_PATHS = [
  "/login",
  "/pay",
  "/api/auth",
  "/api/webhooks",
  "/api/pay",
  "/api/debug",
  "/_next",
  "/favicon.ico",
];

const AGENT_PATHS = ["/agent/", "/api/invoices"];

function isAdminPublic(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isAgentPath(pathname: string): boolean {
  return AGENT_PATHS.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always-public paths (login pages, pay page, API webhooks)
  if (isAdminPublic(pathname)) return NextResponse.next();
  if (pathname === "/agent-login") return NextResponse.next();

  const adminToken = request.cookies.get("auth_token")?.value;
  const agentToken = request.cookies.get("agent_token")?.value;
  const isApi = pathname.startsWith("/api/");

  // Agent-only paths: accept agent_token OR admin_token (admin can test too)
  if (isAgentPath(pathname)) {
    if (agentToken || adminToken) return NextResponse.next();
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/agent-login", request.url));
  }

  // Admin paths: require admin token
  if (!adminToken) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|otf)).*)",
  ],
};
