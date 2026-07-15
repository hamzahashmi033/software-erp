import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import {
  sendMail,
  buildPaymentNotificationEmail,
  buildPaymentSuccessClientEmail,
  buildPaymentFailedClientEmail,
} from "@/lib/mailer";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.arrayBuffer();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
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

  if (event.type === "invoice.finalized") {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    const invoiceId = stripeInvoice.metadata?.invoiceId;
    if (!invoiceId) return Response.json({ received: true });

    await db.invoice.updateMany({
      where: { id: invoiceId },
      data: {
        stripeHostedUrl: stripeInvoice.hosted_invoice_url ?? undefined,
        totalAmount: stripeInvoice.amount_due,
        status: "SENT",
      },
    });
  }

  if (event.type === "invoice.paid") {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    const invoiceId = stripeInvoice.metadata?.invoiceId;
    if (!invoiceId) return Response.json({ received: true });

    const dbInvoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!dbInvoice || dbInvoice.status === "PAID") {
      return Response.json({ received: true });
    }

    const paidAt = new Date();
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt },
    });

    const fromName = process.env.FROM_NAME ?? "Payment";
    const billingEmail = process.env.BILLING_EMAIL;

    await Promise.all([
      sendMail({
        to: dbInvoice.clientEmail,
        subject: `Payment confirmed — thank you, ${dbInvoice.clientName}!`,
        html: buildPaymentSuccessClientEmail({
          clientName: dbInvoice.clientName,
          invoiceId: dbInvoice.id,
          totalAmount: stripeInvoice.amount_paid,
          currency: dbInvoice.currency,
          paidAt,
          fromName,
        }),
      }),
      ...(billingEmail
        ? [
            sendMail({
              to: billingEmail,
              subject: `Payment received — ${dbInvoice.clientName}`,
              html: buildPaymentNotificationEmail({
                clientName: dbInvoice.clientName,
                clientEmail: dbInvoice.clientEmail,
                invoiceId: dbInvoice.id,
                totalAmount: stripeInvoice.amount_paid,
                currency: dbInvoice.currency,
                paidAt,
              }),
            }),
          ]
        : []),
    ]);
  }

  if (event.type === "invoice.payment_failed") {
    const stripeInvoice = event.data.object as Stripe.Invoice;
    const invoiceId = stripeInvoice.metadata?.invoiceId;
    if (!invoiceId) return Response.json({ received: true });

    const dbInvoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!dbInvoice || dbInvoice.status === "PAID" || dbInvoice.status === "VOID") {
      return Response.json({ received: true });
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAYMENT_FAILED" },
    });

    const fromName = process.env.FROM_NAME ?? "Payment";
    const payUrl =
      dbInvoice.stripeHostedUrl ??
      `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoiceId}`;

    await sendMail({
      to: dbInvoice.clientEmail,
      subject: `Payment unsuccessful — please try again`,
      html: buildPaymentFailedClientEmail({
        clientName: dbInvoice.clientName,
        invoiceId: dbInvoice.id,
        totalAmount: dbInvoice.totalAmount,
        currency: dbInvoice.currency,
        payUrl,
        fromName,
      }),
    });
  }

  return Response.json({ received: true });
}
