"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, AlertCircle, User, FileText, Receipt, Settings2 } from "lucide-react";
import { ClientFields } from "./client-fields";
import { DepartmentSelect } from "./department-select";
import { MerchantSelect } from "./merchant-select";
import { CurrencySelect } from "./currency-select";
import { LineItemsEditor } from "./line-items-editor";
import { RichTextEditor } from "./rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createInvoiceSchema, type LineItem } from "@/lib/validations";

const defaultItem: LineItem = { description: "", quantity: 1, unitPrice: 0 };

export function InvoiceForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [warning, setWarning] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [department, setDepartment] = useState("");
  const [merchant, setMerchant] = useState("STRIPE");
  const [currency, setCurrency] = useState("usd");
  const [packageName, setPackageName] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [items, setItems] = useState<LineItem[]>([defaultItem]);
  const [taxRate, setTaxRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setWarning("");
    setErrors({});

    const payload = {
      clientName,
      clientEmail,
      clientContact,
      packageName,
      department,
      paymentMerchant: merchant,
      descriptionHtml,
      items,
      currency,
      taxRate: taxRate ? parseFloat(taxRate) : undefined,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
    };

    const parsed = createInvoiceSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      for (const [k, v] of Object.entries(flat.fieldErrors)) {
        if (Array.isArray(v) && v.length > 0) fieldErrors[k] = v[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.warning) setWarning(data.warning);
      router.push(`/invoices/${data.invoice.id}`);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">

      {/* ── 01 Customer ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          step="1"
          title="Customer Details"
          description="Who is this invoice for?"
          icon={<User className="h-3.5 w-3.5" />}
        />
        <CardContent className="space-y-5">
          <ClientFields
            clientName={clientName}
            clientEmail={clientEmail}
            clientContact={clientContact}
            onClientNameChange={setClientName}
            onClientEmailChange={setClientEmail}
            onClientContactChange={setClientContact}
            errors={errors}
          />

          <div className="border-t border-[#EDE9FB]" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DepartmentSelect
              value={department}
              onChange={setDepartment}
              error={errors.department}
            />
            <MerchantSelect value={merchant} onChange={setMerchant} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CurrencySelect
              value={currency}
              onChange={setCurrency}
              error={errors.currency}
            />
            <Input
              label="Package Name"
              placeholder="e.g. Starter Plan, SEO Package…"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              error={errors.packageName}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 02 Description ──────────────────────────────────────────── */}
      <Card>
        <CardHeader
          step="2"
          title="Package Description"
          description="Visible to the client on their invoice"
          icon={<FileText className="h-3.5 w-3.5" />}
        />
        <CardContent>
          <RichTextEditor
            value={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder="Describe the work, deliverables, or services included…"
            error={errors.descriptionHtml}
          />
        </CardContent>
      </Card>

      {/* ── 03 Line Items ───────────────────────────────────────────── */}
      <Card>
        <CardHeader
          step="3"
          title="Line Items"
          description="Add services, products, or charges"
          icon={<Receipt className="h-3.5 w-3.5" />}
        />
        <CardContent>
          <LineItemsEditor
            items={items}
            onChange={setItems}
            currency={currency}
            taxRate={taxRate ? parseFloat(taxRate) : undefined}
            error={errors.items}
          />
        </CardContent>
      </Card>

      {/* ── 04 Invoice Settings ─────────────────────────────────────── */}
      <Card>
        <CardHeader
          step="4"
          title="Invoice Settings"
          description="Tax, due date, and optional notes"
          icon={<Settings2 className="h-3.5 w-3.5" />}
        />
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Tax Rate (%)"
              placeholder="e.g. 10 for 10%"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              error={errors.taxRate}
              helper="Leave blank if no tax applies"
            />
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
              error={errors.dueDate}
              helper="Defaults to 30 days if not set"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or payment instructions for the client…"
              rows={3}
              className="w-full resize-none rounded-lg border border-[#DCC9F7] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#4027C1] focus:ring-2 focus:ring-[#4027C1]/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Feedback banners ────────────────────────────────────────── */}
      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          {serverError}
        </div>
      )}
      {warning && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          {warning}
        </div>
      )}

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-1">
        <Button type="submit" loading={submitting} size="lg">
          <Send className="h-4 w-4" />
          {submitting ? "Creating on Stripe…" : "Create & Send Invoice"}
        </Button>
      </div>
    </form>
  );
}
