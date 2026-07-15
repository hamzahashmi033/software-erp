import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (!invoice.stripeInvoiceId) {
    return Response.json({ error: "No Stripe invoice linked" }, { status: 400 });
  }

  const si = await stripe.invoices.retrieve(invoice.stripeInvoiceId);

  const updates: Parameters<typeof db.invoice.update>[0]["data"] = {
    stripeHostedUrl: si.hosted_invoice_url ?? invoice.stripeHostedUrl,
  };

  if (si.status === "paid" && invoice.status !== "PAID") {
    updates.status = "PAID";
    updates.paidAt = si.status_transitions.paid_at
      ? new Date(si.status_transitions.paid_at * 1000)
      : new Date();
  } else if (si.status === "void" && invoice.status !== "VOID") {
    updates.status = "VOID";
  } else if (si.status === "open" && invoice.status === "PAYMENT_FAILED") {
    updates.status = "SENT";
  }

  const updated = await db.invoice.update({ where: { id }, data: updates });
  return Response.json({ invoice: updated });
}
