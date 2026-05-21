"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Ban, ExternalLink, MoreHorizontal, Copy, Check, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { ActiveViewerBadge } from "./active-viewer-badge";
import { formatCurrency, timeAgo } from "@/lib/invoice-helpers";
import type { InvoiceWithCounts } from "@/types/invoice";

interface InvoiceTableRowProps {
  invoice: InvoiceWithCounts;
  onRefresh: () => void;
}

export function InvoiceTableRow({ invoice, onRefresh }: InvoiceTableRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSend() {
    setSending(true);
    setMenuOpen(false);
    try {
      await fetch(`/api/invoices/${invoice.id}/send`, { method: "POST" });
      onRefresh();
    } finally {
      setSending(false);
    }
  }

  async function handleVoid() {
    if (!confirm("Void this invoice? This cannot be undone.")) return;
    setVoiding(true);
    setMenuOpen(false);
    try {
      await fetch(`/api/invoices/${invoice.id}/void`, { method: "POST" });
      onRefresh();
    } finally {
      setVoiding(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setMenuOpen(false);
    try {
      await fetch(`/api/invoices/${invoice.id}/sync`, { method: "POST" });
      onRefresh();
    } finally {
      setSyncing(false);
    }
  }

  async function handleCopyLink() {
    const url = (invoice as unknown as { stripeHostedUrl?: string }).stripeHostedUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  }

  const stripeHostedUrl = (invoice as unknown as { stripeHostedUrl?: string }).stripeHostedUrl;

  const departmentColor =
    invoice.department === "FRONT"
      ? "text-[#4027C1] bg-[#DCC9F7]"
      : "text-purple-800 bg-purple-100";

  return (
    <tr className="border-t border-[#ece8f8] hover:bg-[#F5F3FC] transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/invoices/${invoice.id}`}
          className="font-medium text-gray-900 hover:text-[#4027C1] transition-colors"
        >
          {invoice.clientName}
        </Link>
        <p className="text-xs text-gray-400">{invoice.clientEmail}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={[
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            departmentColor,
          ].join(" ")}
        >
          {invoice.department}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        {formatCurrency(invoice.totalAmount, invoice.currency)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{invoice._count.views}</span>
          <ActiveViewerBadge invoiceId={invoice.id} />
        </div>
      </td>
      <td className="px-4 py-3">
        {invoice.createdByAgent ? (
          <>
            <p className="text-sm text-gray-800">{invoice.createdByAgent}</p>
            {invoice.createdByAgentEmail && (
              <p className="text-xs text-gray-400">{invoice.createdByAgentEmail}</p>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400">Admin</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {timeAgo(invoice.createdAt)}
        {invoice.paidAt && (
          <p className="text-emerald-600 font-medium">Paid {timeAgo(invoice.paidAt)}</p>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {stripeHostedUrl && (
            <a
              href={stripeHostedUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Stripe Invoice"
              className="rounded-md p-1.5 text-[#4027C1] hover:bg-[#DCC9F7] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <div className="relative inline-block">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              disabled={sending || voiding || syncing}
              className="rounded-md p-1.5 text-gray-400 hover:bg-[#DCC9F7] hover:text-[#2D1879] transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-[#DCC9F7] bg-white py-1 shadow-xl">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#F5F3FC]"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View details
                </Link>
                {invoice.stripeInvoiceId && invoice.status !== "PAID" && invoice.status !== "VOID" && (
                  <button
                    onClick={handleSync}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#F5F3FC]"
                  >
                    <RefreshCw className={["h-3.5 w-3.5", syncing ? "animate-spin" : ""].join(" ")} />
                    {syncing ? "Syncing..." : "Sync status"}
                  </button>
                )}
                {stripeHostedUrl && (
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#F5F3FC]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy invoice link
                      </>
                    )}
                  </button>
                )}
                {invoice.status !== "VOID" && invoice.status !== "PAID" && (
                  <button
                    onClick={handleSend}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#F5F3FC]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sending ? "Sending..." : "Resend email"}
                  </button>
                )}
                {invoice.status !== "VOID" && invoice.status !== "PAID" && (
                  <button
                    onClick={handleVoid}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-[#F5F3FC]"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    {voiding ? "Voiding..." : "Void invoice"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
