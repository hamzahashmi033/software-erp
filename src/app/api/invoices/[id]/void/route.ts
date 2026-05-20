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

  // Cancel Stripe PaymentIntent if it exists
  if (invoice.stripeInvoiceId) {
    try {
      await stripe.paymentIntents.cancel(invoice.stripeInvoiceId);
    } catch {
      // PaymentIntent may already be cancelled or succeeded — ignore
    }
  }

  await db.invoice.update({
    where: { id },
    data: { status: "VOID" },
  });

  return Response.json({ ok: true });
}
