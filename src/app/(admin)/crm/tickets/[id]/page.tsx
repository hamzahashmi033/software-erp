import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, User as UserIcon, Tag } from "lucide-react";
import { db } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketStatusControl } from "@/components/crm/ticket-status-control";
import { ticketPriorityColor } from "@/lib/crm-helpers";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      Client: { select: { id: true, name: true } },
      User_Ticket_assigneeIdToUser: { select: { id: true, name: true } },
      User_Ticket_createdByIdToUser: { select: { id: true, name: true } },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Ticket Detail" />
      <main className="flex-1 overflow-y-auto bg-[#FFF7ED]">
        <div className="bg-gradient-to-r from-[#7C2D12] to-[#EA580C] px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <Link href="/crm/tickets" className="mb-5 inline-flex items-center gap-1.5 text-xs text-[#FED7AA] hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Tickets
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">{ticket.subject}</h1>
                <div className="mt-2">
                  <Badge variant={ticketPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                </div>
              </div>
              <TicketStatusControl ticketId={ticket.id} status={ticket.status} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <div className="space-y-6">
            {ticket.description && (
              <Card>
                <CardHeader title="Description" />
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader title="Details" />
              <CardContent className="space-y-3">
                {[
                  ...(ticket.Client ? [{ icon: Building2, label: "Client", value: ticket.Client.name, href: `/crm/clients/${ticket.Client.id}` }] : []),
                  ...(ticket.category ? [{ icon: Tag, label: "Category", value: ticket.category, href: undefined }] : []),
                  ...(ticket.User_Ticket_assigneeIdToUser
                    ? [{ icon: UserIcon, label: "Assignee", value: ticket.User_Ticket_assigneeIdToUser.name, href: undefined }]
                    : []),
                  ...(ticket.User_Ticket_createdByIdToUser
                    ? [{ icon: UserIcon, label: "Created By", value: ticket.User_Ticket_createdByIdToUser.name, href: undefined }]
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
