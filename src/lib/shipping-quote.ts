import crypto from "crypto";

export interface ShippingQuote {
  city: string;
  courier: string;
  destinationId: string;
  district: string;
  expiresAt: number;
  price: number;
  province: string;
  postalCode: string;
  service: string;
  weightKg: number;
}

function getSigningKey() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("Checkout signing configuration is incomplete.");
  return key;
}

export function createShippingQuoteToken(quote: ShippingQuote): string {
  const payload = Buffer.from(JSON.stringify(quote)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningKey())
    .update(`shipping-quote.${payload}`)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyShippingQuoteToken(token: string): ShippingQuote | null {
  const [payload, receivedSignature] = token.split(".");
  if (!payload || !receivedSignature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSigningKey())
    .update(`shipping-quote.${payload}`)
    .digest("base64url");
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;

  try {
    const quote = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ShippingQuote;
    if (quote.expiresAt < Date.now() || quote.price < 0 || quote.weightKg <= 0) return null;
    return quote;
  } catch {
    return null;
  }
}
