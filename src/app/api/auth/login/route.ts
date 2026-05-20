import { NextResponse } from "next/server";
import { buildAuthToken } from "@/lib/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body as { password: string };

  if (!password) {
    return Response.json({ error: "Password required" }, { status: 400 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = buildAuthToken(password);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
