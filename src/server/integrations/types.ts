/**
 * Integration adapter contracts. Every external system the platform talks to
 * (Gmail, GitHub, Fortnox, Stripe) is accessed through one of these
 * interfaces rather than called directly from route handlers or pages.
 *
 * Each has exactly one Mock implementation today, selected automatically
 * when the provider's env vars are absent (see each provider's `index.ts`).
 * Adding the real integration later means writing one class that satisfies
 * the same interface — nothing above this layer changes.
 */

export type InboundEmailMessage = {
  externalId: string;
  fromAddress: string;
  fromName?: string;
  subject: string;
  body: string;
  receivedAt: Date;
};

export interface EmailProvider {
  readonly name: string;
  fetchRecentMessages(sinceDays: number): Promise<InboundEmailMessage[]>;
}

export type RepoCommitSummary = {
  sha: string;
  message: string;
  author: string;
  date: Date;
  additions?: number;
  deletions?: number;
};

export interface GitHubProvider {
  readonly name: string;
  listRecentCommits(repo: string, sinceDays: number): Promise<RepoCommitSummary[]>;
}

export type FinancialSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  period: string;
};

export interface AccountingProvider {
  readonly name: string;
  getFinancialSummary(period: "week" | "month"): Promise<FinancialSummary>;
}

export type PaymentRecord = {
  id: string;
  customerName: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  createdAt: Date;
};

export interface PaymentProvider {
  readonly name: string;
  listRecentPayments(limit: number): Promise<PaymentRecord[]>;
}
