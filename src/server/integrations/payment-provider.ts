import type { PaymentProvider, PaymentRecord } from "./types";

class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async listRecentPayments(limit: number): Promise<PaymentRecord[]> {
    return [];
  }
}

// Swap for a real StripeProvider once STRIPE_SECRET_KEY is configured.
export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}
