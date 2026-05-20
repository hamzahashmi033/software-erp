import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { InvoiceDisplay } from "@/components/pay/invoice-display";
import { StripeProvider } from "@/components/pay/stripe-provider";
import { ViewerTracker } from "@/components/pay/viewer-tracker";
import { StatusBadge } from "@/components/ui/badge";
import type { LineItem } from "@/types/invoice";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({ where: { id } });

  // Only show sent/viewed/paid invoices — do not leak draft or void
  if (!invoice || invoice.status === "DRAFT" || invoice.status === "VOID") {
    notFound();
  }

  const items = invoice.items as LineItem[];
  const fromName = process.env.FROM_NAME ?? "Invoice";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  // Retrieve client secret for Stripe Elements
  let clientSecret: string | null = null;
  if (invoice.status !== "PAID" && invoice.stripeInvoiceId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(invoice.stripeInvoiceId);
      clientSecret = pi.client_secret;
    } catch {
      // PaymentIntent may have been cancelled — show invoice without payment
    }
  }

  return (
    <>
      <ViewerTracker invoiceId={id} />

      <div className="rounded-2xl bg-white shadow-md overflow-hidden">
        {/* Status bar */}
        {invoice.status === "PAID" && (
          <div className="bg-emerald-600 px-6 py-3 text-center text-sm font-medium text-white">
            This invoice has been paid. Thank you!
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex items-start justify-between">
            <InvoiceDisplay
              clientName={invoice.clientName}
              clientEmail={invoice.clientEmail}
              descriptionHtml={invoice.descriptionHtml}
              items={items}
              currency={invoice.currency}
              fromName={fromName}
              createdAt={invoice.createdAt}
            />
            <div className="ml-4 shrink-0">
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Payment form */}
          {invoice.status !== "PAID" && clientSecret && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Payment
              </h3>
              <StripeProvider
                publishableKey={publishableKey}
                clientSecret={clientSecret}
                totalAmount={invoice.totalAmount}
                currency={invoice.currency}
                clientName={invoice.clientName}
              />
            </div>
          )}

          {invoice.status !== "PAID" && !clientSecret && (
            <div className="border-t border-slate-100 pt-6 text-sm text-slate-500">
              Payment is not available for this invoice right now. Please
              contact us.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
