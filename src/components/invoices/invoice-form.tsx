"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, AlertCircle } from "lucide-react";
import { ClientFields } from "./client-fields";
import { DepartmentSelect } from "./department-select";
import { MerchantSelect } from "./merchant-select";
import { CurrencySelect } from "./currency-select";
import { LineItemsEditor } from "./line-items-editor";
import { RichTextEditor } from "./rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createInvoiceSchema, type LineItem } from "@/lib/validations";

const defaultItem: LineItem = { description: "", quantity: 1, unitPrice: 0 };

export function InvoiceForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [warning, setWarning] = useState("");

  // Client details
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");

  // Invoice details
  const [department, setDepartment] = useState("");
  const [merchant, setMerchant] = useState("STRIPE");
  const [currency, setCurrency] = useState("usd");
  const [packageName, setPackageName] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [items, setItems] = useState<LineItem[]>([defaultItem]);

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
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Client info */}
      <Card>
        <CardHeader title="Customer Details" />
        <CardContent className="space-y-4">
          <ClientFields
            clientName={clientName}
            clientEmail={clientEmail}
            clientContact={clientContact}
            onClientNameChange={setClientName}
            onClientEmailChange={setClientEmail}
            onClientContactChange={setClientContact}
            errors={errors}
          />
          <div className="w-full border border-[#969696] mt-6"></div>
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
              placeholder="Enter Package Name"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              error={errors.packageName}
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader
          title="Package Description"
          description="Visible to the client on their invoice"
        />
        <CardContent>
          <RichTextEditor
            value={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder="Describe the work, deliverables, or services..."
            error={errors.descriptionHtml}
          />
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader
          title="Line Items"
          description="Add items, services, or charges"
        />
        <CardContent>
          <LineItemsEditor
            items={items}
            onChange={setItems}
            error={errors.items}
          />
        </CardContent>
      </Card>

      {/* Errors */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}
      {warning && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {warning}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} size="lg">
          <Send className="h-4 w-4" />
          {submitting ? "Creating & Sending..." : "Create & Send Invoice"}
        </Button>
      </div>
    </form>
  );
}
