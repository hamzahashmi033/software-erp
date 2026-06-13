import { db } from "@/lib/prisma";
import { isAuthenticated, getAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return Response.json({ error: "Both current and new password are required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return Response.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const adminPassword = await getAdminPassword();
  if (currentPassword !== adminPassword) {
    return Response.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  await db.setting.upsert({
    where: { key: "admin_password" },
    update: { value: newPassword },
    create: { key: "admin_password", value: newPassword },
  });

  return Response.json({ ok: true });
}
