export async function GET() {
  return Response.json({
    adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: process.env.ADMIN_PASSWORD?.length,
    adminPasswordFirst3: process.env.ADMIN_PASSWORD?.slice(0, 3),
    nodeEnv: process.env.NODE_ENV,
  });
}
