import { db } from "@/lib/prisma";
import { sendMail, buildInvoiceEmail } from "@/lib/mailer";
import { buildPayUrl } from "@/lib/invoice-helpers";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const payUrl = buildPayUrl(id);
  const fromName = process.env.FROM_NAME ?? "Payment";
  const emailHtml = buildInvoiceEmail({
    clientName: invoice.clientName,
    invoiceId: id,
    totalAmount: invoice.totalAmount,
    currency: invoice.currency,
    payUrl,
    fromName,
  });

  await sendMail({
    to: invoice.clientEmail,
    subject: `Invoice from ${fromName}`,
    html: emailHtml,
  });

  await db.invoice.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date() },
  });

  return Response.json({ ok: true });
}
