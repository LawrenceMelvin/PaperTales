"use client";

import React from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from "@/components/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
    components: "buttons",
    "enable-funding": "venmo,paylater",
    "data-sdk-integration-source": "react-paypal-js",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <AuthProvider>{children}</AuthProvider>
    </PayPalScriptProvider>
  );
}
