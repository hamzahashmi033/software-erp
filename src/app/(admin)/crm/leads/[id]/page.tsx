import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, User as UserIcon, Tag } from "lucide-react";
import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadActivities } from "@/components/crm/lead-activities";
import { leadStatusColor, pipelineStageLabel, pipelineStageColor } from "@/lib/crm-helpers";
import { formatCurrency } from "@/lib/invoice-helpers";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true } },
      LeadActivity: { orderBy: { createdAt: "desc" } },
      Deal: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lead) notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Lead Detail" />
      <main className="flex-1 overflow-y-auto bg-[#FFF7ED]">
        <div className="bg-gradient-to-r from-[#7C2D12] to-[#EA580C] px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <Link href="/crm/leads" className="mb-5 inline-flex items-center gap-1.5 text-xs text-[#FED7AA] hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Leads
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white ring-2 ring-white/20">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white leading-tight">{lead.name}</h1>
                  {lead.companyName && <p className="mt-0.5 text-sm text-[#FED7AA]">{lead.companyName}</p>}
                </div>
              </div>
              <Badge variant={leadStatusColor(lead.status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST")}>
                {lead.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader title="Activity Timeline" />
                <CardContent>
                  <LeadActivities leadId={lead.id} activities={lead.LeadActivity} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Deals" description={`${lead.Deal.length} linked deal${lead.Deal.length === 1 ? "" : "s"}`} />
                <CardContent>
                  {lead.Deal.length === 0 ? (
                    <p className="text-sm text-gray-400">No deals yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {lead.Deal.map((deal) => (
                        <Link
                          key={deal.id}
                          href={`/crm/deals/${deal.id}`}
                          className="flex items-center justify-between rounded-lg border border-[#FFEDD5] bg-[#FFF7ED] px-3 py-2.5 hover:bg-white transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{deal.title}</p>
                            <p className="text-xs text-gray-400">{formatCurrency(deal.value, deal.currency)}</p>
                          </div>
                          <Badge variant={pipelineStageColor(deal.stage)}>{pipelineStageLabel(deal.stage)}</Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Details" />
                <CardContent className="space-y-3">
                  {[
                    ...(lead.email ? [{ icon: Mail, label: "Email", value: lead.email }] : []),
                    ...(lead.phone ? [{ icon: Phone, label: "Phone", value: lead.phone }] : []),
                    ...(lead.companyName ? [{ icon: Building2, label: "Company", value: lead.companyName }] : []),
                    { icon: Tag, label: "Source", value: lead.source },
                    ...(lead.User ? [{ icon: UserIcon, label: "Assignee", value: lead.User.name }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED]">
                        <Icon className="h-3.5 w-3.5 text-[#EA580C]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                  {lead.notes && (
                    <div className="mt-2 rounded-lg border border-[#FED7AA] bg-amber-50/40 px-3 py-2 text-sm text-gray-700">
                      {lead.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
