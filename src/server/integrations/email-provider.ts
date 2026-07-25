import type { EmailProvider, InboundEmailMessage } from "./types";

class MockEmailProvider implements EmailProvider {
  readonly name = "mock";

  async fetchRecentMessages(_sinceDays: number): Promise<InboundEmailMessage[]> {
    // MVP reads inbox data straight from the Email table (seeded to look
    // like a synced Gmail inbox). A real GmailProvider would call the
    // Gmail API here and return the same normalized shape.
    return [];
  }
}

// A real implementation (GmailProvider using googleapis + OAuth) would be
// selected here once GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are configured
// and a connected account exists — same interface, no caller changes.
export function getEmailProvider(): EmailProvider {
  return new MockEmailProvider();
}
