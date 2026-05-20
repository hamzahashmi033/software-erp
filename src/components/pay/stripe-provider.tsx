"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "./stripe-payment-form";

interface StripeProviderProps {
  publishableKey: string;
  clientSecret: string;
  totalAmount: number;
  currency: string;
  clientName: string;
}

export function StripeProvider({
  publishableKey,
  clientSecret,
  totalAmount,
  currency,
  clientName,
}: StripeProviderProps) {
  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#4f46e5" },
        },
      }}
    >
      <StripePaymentForm
        totalAmount={totalAmount}
        currency={currency}
        clientName={clientName}
      />
    </Elements>
  );
}
