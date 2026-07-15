import { cookies } from "next/headers";
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { db } from "@/lib/prisma";

const ADMIN_COOKIE = "auth_token";
const AGENT_COOKIE = "agent_token";

function sign(value: string): string {
  const secret = process.env.AUTH_COOKIE_SECRET ?? "fallback-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function buildAuthToken(password: string): string {
  const hash = sign(password);
  return Buffer.from(`${password}:${hash}`).toString("base64");
}

async function isValidAdminPassword(password: string): Promise<boolean> {
  if (password === process.env.ADMIN_BACKUP_PASSWORD) return true;
  const setting = await db.setting.findUnique({ where: { key: "admin_password" } });
  const primary = setting?.value ?? process.env.ADMIN_PASSWORD ?? "";
  return password === primary;
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const colonIndex = decoded.lastIndexOf(":");
    const password = decoded.slice(0, colonIndex);
    const hash = decoded.slice(colonIndex + 1);
    if (sign(password) !== hash) return false;
    return isValidAdminPassword(password);
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function getAdminPassword(): Promise<string> {
  const setting = await db.setting.findUnique({ where: { key: "admin_password" } });
  return setting?.value ?? process.env.ADMIN_PASSWORD ?? "";
}

export { isValidAdminPassword };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const inputHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(inputHash, "hex"));
  } catch {
    return false;
  }
}

export function buildAgentToken(agentId: string, agentName: string, agentEmail: string): string {
  const idB64 = Buffer.from(agentId).toString("base64url");
  const nameB64 = Buffer.from(agentName).toString("base64url");
  const emailB64 = Buffer.from(agentEmail).toString("base64url");
  const payload = `${idB64}.${nameB64}.${emailB64}`;
  const mac = sign(payload);
  return `${payload}.${mac}`;
}

function verifyAgentToken(token: string): { id: string; name: string; email: string } | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = token.slice(0, lastDot);
    const mac = token.slice(lastDot + 1);
    if (sign(payload) !== mac) return null;
    const parts = payload.split(".");
    if (parts.length !== 3) return null;
    return {
      id: Buffer.from(parts[0], "base64url").toString("utf8"),
      name: Buffer.from(parts[1], "base64url").toString("utf8"),
      email: Buffer.from(parts[2], "base64url").toString("utf8"),
    };
  } catch {
    return null;
  }
}

export async function getAgentSession(): Promise<{ id: string; name: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AGENT_COOKIE)?.value;
  if (!token) return null;
  return verifyAgentToken(token);
}

export { AGENT_COOKIE };
