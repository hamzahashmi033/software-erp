import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendMail, buildInvoiceEmail } from "@/lib/mailer";
import { buildPayUrl } from "@/lib/invoice-helpers";
import { createInvoiceSchema, type LineItem } from "@/lib/validations";
import type { InvoiceStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as InvoiceStatus | null;
  const department = searchParams.get("department");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(department ? { department: department as "FRONT" | "UPSELL" } : {}),
    ...(search
      ? {
          OR: [
            { clientName: { contains: search, mode: "insensitive" as const } },
            { clientEmail: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { views: true, activeViewers: true } },
      },
    }),
    db.invoice.count({ where }),
  ]);

  return Response.json({ invoices, total, page, limit });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const totalAmount = data.items.reduce(
      (sum: number, item: LineItem) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalCents = Math.round(totalAmount * 100);

    // Create invoice record (DRAFT)
    const invoice = await db.invoice.create({
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientContact: data.clientContact ?? null,
        packageName: data.packageName ?? null,
        department: data.department,
        descriptionHtml: data.descriptionHtml,
        items: data.items,
        totalAmount: totalCents,
        currency: data.currency,
        paymentMerchant: data.paymentMerchant,
        status: "DRAFT",
      },
    });

    const payUrl = buildPayUrl(invoice.id);

    // Stripe + email — failures here still return 201 with a warning
    try {
      const existingCustomers = await stripe.customers.list({
        email: data.clientEmail,
        limit: 1,
      });

      let customerId: string;
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          name: data.clientName,
          email: data.clientEmail,
          metadata: { source: "payment-link" },
        });
        customerId = customer.id;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: data.currency,
        customer: customerId,
        description: `Invoice for ${data.clientName}`,
        metadata: { invoiceId: invoice.id },
        automatic_payment_methods: { enabled: true },
      });

      const updated = await db.invoice.update({
        where: { id: invoice.id },
        data: {
          stripeInvoiceId: paymentIntent.id,
          stripeCustomerId: customerId,
          stripePayUrl: payUrl,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      const fromName = process.env.FROM_NAME ?? "Payment";
      const emailHtml = buildInvoiceEmail({
        clientName: data.clientName,
        invoiceId: invoice.id,
        totalAmount: totalCents,
        currency: data.currency,
        payUrl,
        fromName,
      });

      await sendMail({
        to: data.clientEmail,
        subject: `Invoice from ${fromName}`,
        html: emailHtml,
      });

      return Response.json({ invoice: updated }, { status: 201 });
    } catch (stripeOrEmailErr) {
      console.error("Stripe/email error:", stripeOrEmailErr);
      return Response.json(
        { invoice, warning: "Invoice saved but Stripe/email failed: " + String(stripeOrEmailErr) },
        { status: 201 }
      );
    }
  } catch (err) {
    console.error("Invoice creation error:", err);
    return Response.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}
