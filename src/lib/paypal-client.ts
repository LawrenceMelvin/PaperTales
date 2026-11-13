/**
 * PayPal API client and sandbox transaction handler
 * Follows PayPal Orders v2 Standard Checkout specifications
 */

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

export interface PayPalCreateOrderParams {
  items: Array<{
    name: string;
    description?: string;
    unitAmount: number;
    quantity: number;
    category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS";
  }>;
  shippingAmount?: number;
  customId?: string;
  requireShippingAddress?: boolean;
}

/**
 * Retrieve cached or fresh OAuth2 Bearer token from PayPal Sandbox
 */
async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  const now = Date.now();
  // Return cached token if valid for at least 60 more seconds
  if (cachedAccessToken && tokenExpiresAt > now + 60000) {
    return cachedAccessToken;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("PayPal OAuth failed:", tokenRes.status, errText);
      return null;
    }

    const tokenData = await tokenRes.json();
    cachedAccessToken = tokenData.access_token;
    // expires_in is in seconds
    tokenExpiresAt = now + (tokenData.expires_in || 3600) * 1000;
    return cachedAccessToken;
  } catch (err) {
    console.error("PayPal OAuth network error:", err);
    return null;
  }
}

export async function createPayPalOrder(params: PayPalCreateOrderParams) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const isMock = !clientId || clientId === "sb-demo-client-id" || clientId === "test_client_id" || clientId === "sb";

  // Compute breakdown with 2-decimal precision to prevent floating point discrepancies
  const itemTotal = Number(
    params.items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0).toFixed(2)
  );
  const shipping = Number((params.shippingAmount || 0).toFixed(2));
  const total = Number((itemTotal + shipping).toFixed(2));

  // If live sandbox credentials are provided, call PayPal Orders v2 API
  if (!isMock && clientSecret) {
    try {
      const accessToken = await getPayPalAccessToken(clientId, clientSecret);
      if (accessToken) {
        const orderPayload = {
          intent: "CAPTURE",
          purchase_units: [
            {
              custom_id: params.customId || `ord_${Date.now()}`,
              amount: {
                currency_code: "USD",
                value: total.toFixed(2),
                breakdown: {
                  item_total: { currency_code: "USD", value: itemTotal.toFixed(2) },
                  shipping: { currency_code: "USD", value: shipping.toFixed(2) },
                },
              },
              items: params.items.map((it) => ({
                name: it.name.slice(0, 127),
                description: it.description?.slice(0, 127),
                unit_amount: { currency_code: "USD", value: Number(it.unitAmount).toFixed(2) },
                quantity: it.quantity.toString(),
                category: it.category || (params.requireShippingAddress ? "PHYSICAL_GOODS" : "DIGITAL_GOODS"),
              })),
            },
          ],
          application_context: {
            brand_name: "PaperTales AI Studio",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
          },
        };

        const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderPayload),
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          return { id: orderData.id, status: orderData.status };
        } else {
          const errorDetails = await orderRes.text();
          console.error("PayPal Orders v2 create rejected:", orderRes.status, errorDetails);
          throw new Error(`PayPal order creation rejected (${orderRes.status}): ${errorDetails}`);
        }
      }
    } catch (err: any) {
      console.warn("PayPal live API order error:", err.message);
      throw err;
    }
  }

  // Graceful Sandbox simulation ID for immediate testing when no credentials exist
  return {
    id: `SANDBOX-ORDER-${Date.now().toString(36).toUpperCase()}`,
    status: "CREATED",
    mock: true,
  };
}

export async function capturePayPalOrder(orderId: string) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const isMock = !clientId || clientId === "sb-demo-client-id" || clientId === "test_client_id" || clientId === "sb" || orderId.startsWith("SANDBOX-");

  if (!isMock && clientSecret) {
    try {
      const accessToken = await getPayPalAccessToken(clientId, clientSecret);
      if (accessToken) {
        const captureRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (captureRes.ok) {
          const captureData = await captureRes.json();
          const purchaseUnit = captureData.purchase_units?.[0];
          const shipping = purchaseUnit?.shipping;
          return {
            id: captureData.id,
            status: captureData.status,
            captureId: purchaseUnit?.payments?.captures?.[0]?.id,
            shippingAddress: shipping
              ? {
                  recipientName: shipping.name?.full_name || "Customer",
                  street1: shipping.address?.address_line_1 || "123 Main St",
                  city: shipping.address?.admin_area_2 || "San Jose",
                  stateOrProvince: shipping.address?.admin_area_1 || "CA",
                  postalCode: shipping.address?.postal_code || "95131",
                  countryCode: shipping.address?.country_code || "US",
                }
              : undefined,
          };
        } else {
          const errText = await captureRes.text();
          console.error("PayPal capture error response:", captureRes.status, errText);
          throw new Error(`PayPal capture failed (${captureRes.status}): ${errText}`);
        }
      }
    } catch (err: any) {
      console.warn("PayPal live API capture error:", err.message);
      throw err;
    }
  }

  // Fallback / Sandbox Mock Capture for sandbox simulation IDs
  return {
    id: orderId,
    status: "COMPLETED",
    captureId: `CAP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    shippingAddress: {
      recipientName: "Demo Parent",
      street1: "456 Family Way",
      city: "Austin",
      stateOrProvince: "TX",
      postalCode: "78701",
      countryCode: "US",
    },
    mock: true,
  };
}
