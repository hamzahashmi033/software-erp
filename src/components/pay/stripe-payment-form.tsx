"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { PaymentStatusBanner } from "./payment-status-banner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/invoice-helpers";

interface StripePaymentFormProps {
  totalAmount: number;
  currency: string;
  clientName: string;
}

export function StripePaymentForm({
  totalAmount,
  currency,
  clientName,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setStatus("processing");
    setMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: { name: clientName },
        },
        return_url: `${window.location.origin}/pay/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message ?? "Payment failed.");
    } else {
      setStatus("success");
      setMessage("Payment successful! A receipt will be sent to your email.");
    }
  }

  if (status === "success") {
    return (
      <PaymentStatusBanner
        status="success"
        message="Payment successful! A receipt will be sent to your email."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentStatusBanner status={status} message={message} />
      <PaymentElement />
      <Button
        type="submit"
        loading={status === "processing"}
        disabled={!stripe || !elements}
        className="w-full"
        size="lg"
      >
        Pay {formatCurrency(totalAmount, currency)}
      </Button>
    </form>
  );
}
