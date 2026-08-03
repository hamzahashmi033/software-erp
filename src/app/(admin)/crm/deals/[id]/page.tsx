import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User as UserIcon, Building2, Target, StickyNote } from "lucide-react";
import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DealStageControl } from "@/components/crm/deal-stage-control";
import { formatCurrency } from "@/lib/invoice-helpers";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      Client: { select: { id: true, name: true } },
      Lead: { select: { id: true, name: true } },
      User: { select: { id: true, name: true } },
    },
  });

  if (!deal) notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Deal Detail" />
      <main className="flex-1 overflow-y-auto bg-[#FFF7ED]">
        <div className="bg-gradient-to-r from-[#7C2D12] to-[#EA580C] px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <Link href="/crm/deals" className="mb-5 inline-flex items-center gap-1.5 text-xs text-[#FED7AA] hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Deals
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">{deal.title}</h1>
                <p className="mt-1 text-3xl font-extrabold text-white">{formatCurrency(deal.value, deal.currency)}</p>
              </div>
              <DealStageControl dealId={deal.id} stage={deal.stage} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <Card>
            <CardHeader title="Details" />
            <CardContent className="space-y-3">
              {[
                ...(deal.Client ? [{ icon: Building2, label: "Client", value: deal.Client.name, href: `/crm/clients/${deal.Client.id}` }] : []),
                ...(deal.Lead ? [{ icon: Target, label: "Lead", value: deal.Lead.name, href: `/crm/leads/${deal.Lead.id}` }] : []),
                ...(deal.User ? [{ icon: UserIcon, label: "Owner", value: deal.User.name, href: undefined }] : []),
                ...(deal.expectedClose
                  ? [{ icon: Calendar, label: "Expected Close", value: new Date(deal.expectedClose).toLocaleDateString("en-US", { dateStyle: "long" }), href: undefined }]
                  : []),
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED]">
                    <Icon className="h-3.5 w-3.5 text-[#EA580C]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
                    {href ? (
                      <Link href={href} className="text-sm font-medium text-[#EA580C] hover:underline">{value}</Link>
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}
              {deal.notes && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED]">
                    <StickyNote className="h-3.5 w-3.5 text-[#EA580C]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Notes</p>
                    <p className="text-sm text-gray-700">{deal.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
