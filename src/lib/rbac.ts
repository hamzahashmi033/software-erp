import { cookies } from "next/headers";
import { db } from "@/lib/prisma";
import { sign, isAuthenticated } from "@/lib/auth";

export const USER_COOKIE = "user_token";

export function buildUserToken(userId: string): string {
  const idB64 = Buffer.from(userId).toString("base64url");
  const mac = sign(idB64);
  return `${idB64}.${mac}`;
}

function verifyUserToken(token: string): string | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const idB64 = token.slice(0, lastDot);
    const mac = token.slice(lastDot + 1);
    if (sign(idB64) !== mac) return null;
    return Buffer.from(idB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export type UserSession = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleSlug: string;
};

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;
  const userId = verifyUserToken(token);
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, roleId: true, isActive: true, Role: { select: { slug: true } } },
  });
  if (!user || !user.isActive) return null;

  return { id: user.id, name: user.name, email: user.email, roleId: user.roleId, roleSlug: user.Role.slug };
}

export async function getPermissionKeys(roleId: string): Promise<Set<string>> {
  const rolePermissions = await db.rolePermission.findMany({
    where: { roleId },
    select: { Permission: { select: { key: true } } },
  });
  return new Set(rolePermissions.map((rp) => rp.Permission.key));
}

export async function hasPermission(session: UserSession | null, key: string): Promise<boolean> {
  if (!session) return false;
  if (session.roleSlug === "superadmin") return true;
  const keys = await getPermissionKeys(session.roleId);
  return keys.has(key);
}

/**
 * The shared admin login always has full access. Otherwise falls back to the
 * per-user staff session and its role's permissions.
 */
export async function resolveAccess(
  permissionKey: string
): Promise<{ allowed: boolean; session: UserSession | null }> {
  if (await isAuthenticated()) return { allowed: true, session: null };
  const session = await getUserSession();
  return { allowed: await hasPermission(session, permissionKey), session };
}
