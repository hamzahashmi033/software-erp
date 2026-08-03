import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Globe, Building2, User as UserIcon } from "lucide-react";
import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientContacts } from "@/components/crm/client-contacts";
import { clientStatusColor, pipelineStageLabel, pipelineStageColor, ticketStatusColor } from "@/lib/crm-helpers";
import { formatCurrency, timeAgo } from "@/lib/invoice-helpers";
import { StatusBadge } from "@/components/ui/badge";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true } },
      ClientContact: { orderBy: { isPrimary: "desc" } },
      Invoice: { orderBy: { createdAt: "desc" }, take: 10 },
      Deal: { orderBy: { createdAt: "desc" }, take: 10 },
      Ticket: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!client) notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Client Detail" />
      <main className="flex-1 overflow-y-auto bg-[#FFF7ED]">
        <div className="bg-gradient-to-r from-[#7C2D12] to-[#EA580C] px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <Link href="/crm/clients" className="mb-5 inline-flex items-center gap-1.5 text-xs text-[#FED7AA] hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Clients
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white ring-2 ring-white/20">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white leading-tight">{client.name}</h1>
                  {client.industry && <p className="mt-0.5 text-sm text-[#FED7AA]">{client.industry}</p>}
                </div>
              </div>
              <Badge variant={clientStatusColor(client.status as "ACTIVE" | "INACTIVE" | "ARCHIVED")}>
                {client.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader title="Invoices" description={`${client.Invoice.length} linked invoice${client.Invoice.length === 1 ? "" : "s"}`} />
                <CardContent>
                  {client.Invoice.length === 0 ? (
                    <p className="text-sm text-gray-400">No invoices yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {client.Invoice.map((inv) => (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex items-center justify-between rounded-lg border border-[#FFEDD5] bg-[#FFF7ED] px-3 py-2.5 hover:bg-white transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{formatCurrency(inv.totalAmount, inv.currency)}</p>
                            <p className="text-xs text-gray-400">{timeAgo(inv.createdAt)}</p>
                          </div>
                          <StatusBadge status={inv.status} />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Deals" description={`${client.Deal.length} linked deal${client.Deal.length === 1 ? "" : "s"}`} />
                <CardContent>
                  {client.Deal.length === 0 ? (
                    <p className="text-sm text-gray-400">No deals yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {client.Deal.map((deal) => (
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

              <Card>
                <CardHeader title="Tickets" description={`${client.Ticket.length} linked ticket${client.Ticket.length === 1 ? "" : "s"}`} />
                <CardContent>
                  {client.Ticket.length === 0 ? (
                    <p className="text-sm text-gray-400">No tickets yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {client.Ticket.map((ticket) => (
                        <Link
                          key={ticket.id}
                          href={`/crm/tickets/${ticket.id}`}
                          className="flex items-center justify-between rounded-lg border border-[#FFEDD5] bg-[#FFF7ED] px-3 py-2.5 hover:bg-white transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-800">{ticket.subject}</p>
                          <Badge variant={ticketStatusColor(ticket.status)}>{ticket.status}</Badge>
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
                    ...(client.email ? [{ icon: Mail, label: "Email", value: client.email }] : []),
                    ...(client.phone ? [{ icon: Phone, label: "Phone", value: client.phone }] : []),
                    ...(client.website ? [{ icon: Globe, label: "Website", value: client.website }] : []),
                    ...(client.legalName ? [{ icon: Building2, label: "Legal Name", value: client.legalName }] : []),
                    ...(client.User ? [{ icon: UserIcon, label: "Account Manager", value: client.User.name }] : []),
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
                  {client.notes && (
                    <div className="mt-2 rounded-lg border border-[#FED7AA] bg-amber-50/40 px-3 py-2 text-sm text-gray-700">
                      {client.notes}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Contacts" />
                <CardContent>
                  <ClientContacts clientId={client.id} contacts={client.ClientContact} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
