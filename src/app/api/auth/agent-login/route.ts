import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyPassword, buildAgentToken, AGENT_COOKIE } from "@/lib/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const agent = await db.agent.findUnique({ where: { email } });
  if (!agent || !verifyPassword(password, agent.passwordHash)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = buildAgentToken(agent.id, agent.name, agent.email);
  const response = NextResponse.json({ ok: true, agentName: agent.name });
  response.cookies.set(AGENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
