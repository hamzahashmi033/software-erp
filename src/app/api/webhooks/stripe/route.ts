import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { sendMail, buildPaymentNotificationEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.arrayBuffer();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const invoiceId = paymentIntent.metadata?.invoiceId;

    if (!invoiceId) return Response.json({ received: true });

    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.status === "PAID") {
      return Response.json({ received: true });
    }

    const paidAt = new Date();
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt },
    });

    // Email billing team
    const billingEmail = process.env.BILLING_EMAIL;
    if (billingEmail) {
      const html = buildPaymentNotificationEmail({
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        invoiceId: invoice.id,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        paidAt,
      });

      await sendMail({
        to: billingEmail,
        subject: `Payment received — ${invoice.clientName}`,
        html,
      });
    }
  }

  return Response.json({ received: true });
}
