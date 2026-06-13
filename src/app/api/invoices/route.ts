import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendMail, buildInvoiceEmail, buildInvoiceCreatedEmail } from "@/lib/mailer";
import { createInvoiceSchema, type LineItem } from "@/lib/validations";
import { getAgentSession, isAuthenticated } from "@/lib/auth";
import type { InvoiceStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as InvoiceStatus | null;
  const department = searchParams.get("department");
  const search = searchParams.get("search");
  const agent = searchParams.get("agent");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(department ? { department: department as "FRONT" | "UPSELL" } : {}),
    ...(agent ? { createdByAgentEmail: agent } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
          },
        }
      : {}),
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
    const [isAdmin, agentSession] = await Promise.all([isAuthenticated(), getAgentSession()]);
    if (!isAdmin && !agentSession) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const createdByAgent = agentSession ? agentSession.name : data.createdByAgent;
    const createdByAgentEmail = agentSession ? agentSession.email : data.createdByAgentEmail;
    const subtotalCents = data.items.reduce(
      (sum: number, item: LineItem) => sum + Math.round(item.quantity * item.unitPrice * 100),
      0
    );
    const taxCents = data.taxRate
      ? Math.round(subtotalCents * (data.taxRate / 100))
      : 0;
    const totalCents = subtotalCents + taxCents;

    // Save draft record first so we have an ID for Stripe metadata
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
        taxRate: data.taxRate ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes ?? null,
        paymentMerchant: data.paymentMerchant,
        createdByAgent: createdByAgent ?? null,
        createdByAgentEmail: createdByAgentEmail ?? null,
        status: "DRAFT",
      },
    });

    try {
      // 1. Create or find Stripe customer
      const existing = await stripe.customers.list({ email: data.clientEmail, limit: 1 });
      let customerId: string;
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        await stripe.customers.update(customerId, { name: data.clientName });
      } else {
        const customer = await stripe.customers.create({
          name: data.clientName,
          email: data.clientEmail,
          metadata: { source: "payment-link" },
        });
        customerId = customer.id;
      }

      // 2. Create Stripe invoice in draft
      // Parse date-only strings as end-of-day UTC so selecting "today" still gives
      // a future timestamp. Then apply a 1-hour safety floor.
      const nowSec = Math.floor(Date.now() / 1000);
      let dueDateUnix: number;
      if (data.dueDate) {
        const d = new Date(data.dueDate);
        d.setUTCHours(23, 59, 59, 0);
        const ts = Math.floor(d.getTime() / 1000);
        dueDateUnix = ts > nowSec + 3600 ? ts : nowSec + 86400;
      } else {
        dueDateUnix = nowSec + 30 * 86400;
      }

      const stripeInvoice = await stripe.invoices.create({
        customer: customerId,
        currency: data.currency,
        collection_method: "send_invoice",
        due_date: dueDateUnix,
        description: data.packageName ?? undefined,
        footer: data.notes ?? undefined,
        metadata: { invoiceId: invoice.id },
      });

      // 3. Create invoice items — `amount` is the line total; Stripe rejects
      //    `quantity` when `amount` is also set, so we embed qty in the description.
      for (const item of data.items) {
        const lineDescription =
          item.quantity > 1
            ? `${item.description} × ${item.quantity}`
            : item.description;
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: stripeInvoice.id,
          amount: Math.round(item.unitPrice * item.quantity * 100),
          currency: data.currency,
          description: lineDescription,
        });
      }

      // 4. Apply tax rate if provided
      if (data.taxRate && data.taxRate > 0) {
        const taxRate = await stripe.taxRates.create({
          display_name: "Tax",
          inclusive: false,
          percentage: data.taxRate,
        });
        await stripe.invoices.update(stripeInvoice.id, {
          default_tax_rates: [taxRate.id],
        });
      }

      // 5. Finalize the invoice — this locks it and generates the hosted URL
      const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
      const hostedUrl = finalized.hosted_invoice_url ?? null;
      const finalAmount = finalized.amount_due;

      const updated = await db.invoice.update({
        where: { id: invoice.id },
        data: {
          stripeInvoiceId: finalized.id,
          stripeCustomerId: customerId,
          stripeHostedUrl: hostedUrl,
          totalAmount: finalAmount,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      // 6. Send email with Stripe hosted URL
      const payUrl = hostedUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;
      const fromName = process.env.FROM_NAME ?? "Payment";
      const agentName = createdByAgent ?? undefined;
      const agentEmail = createdByAgentEmail ?? undefined;
      const pdfAttachment = data.agreementPdfBase64
        ? {
            filename: data.agreementPdfName ?? "services-agreement.pdf",
            content: Buffer.from(data.agreementPdfBase64, "base64"),
            contentType: "application/pdf",
          }
        : null;

      const emailHtml = buildInvoiceEmail({
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientContact: data.clientContact ?? null,
        invoiceId: invoice.id,
        packageName: data.packageName ?? null,
        descriptionHtml: data.descriptionHtml,
        totalAmount: finalAmount,
        currency: data.currency,
        createdAt: new Date(),
        payUrl,
        fromName,
        agentName,
        agentEmail,
        hasAgreement: !!pdfAttachment,
      });

      const billingEmail = process.env.BILLING_EMAIL;

      await Promise.all([
        // Client email (with optional PDF attachment)
        sendMail({
          to: data.clientEmail,
          subject: `Invoice from ${fromName}`,
          html: emailHtml,
          attachments: pdfAttachment ? [pdfAttachment] : undefined,
        }),
        // Billing team notification
        ...(billingEmail
          ? [
              sendMail({
                to: billingEmail,
                subject: `New invoice created — ${data.clientName} (${new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency.toUpperCase() }).format(finalAmount / 100)})`,
                html: buildInvoiceCreatedEmail({
                  clientName: data.clientName,
                  clientEmail: data.clientEmail,
                  clientContact: data.clientContact ?? null,
                  invoiceId: invoice.id,
                  packageName: data.packageName ?? null,
                  descriptionHtml: data.descriptionHtml,
                  totalAmount: finalAmount,
                  currency: data.currency,
                  stripeHostedUrl: hostedUrl,
                  createdAt: new Date(),
                  fromName,
                  agentName,
                  agentEmail,
                  hasAgreement: !!pdfAttachment,
                }),
              }),
            ]
          : []),
      ]);

      return Response.json({ invoice: updated }, { status: 201 });
    } catch (stripeOrEmailErr) {
      console.error("Stripe/email error:", stripeOrEmailErr);
      return Response.json(
        {
          invoice,
          warning: "Invoice saved but Stripe/email failed: " + String(stripeOrEmailErr),
        },
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
