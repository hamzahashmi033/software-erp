import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { buildUserToken, USER_COOKIE } from "@/lib/rbac";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { email, isActive: true },
    select: { id: true, name: true, passwordHash: true },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = buildUserToken(user.id);
  const response = NextResponse.json({ ok: true, name: user.name });
  response.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
