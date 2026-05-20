import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "auth_token";

function sign(value: string): string {
  const secret = process.env.AUTH_COOKIE_SECRET ?? "fallback-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function buildAuthToken(password: string): string {
  const hash = sign(password);
  return Buffer.from(`${password}:${hash}`).toString("base64");
}

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const colonIndex = decoded.lastIndexOf(":");
    const password = decoded.slice(0, colonIndex);
    const hash = decoded.slice(colonIndex + 1);
    return sign(password) === hash && password === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
