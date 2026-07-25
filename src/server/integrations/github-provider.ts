import type { GitHubProvider, RepoCommitSummary } from "./types";

class MockGitHubProvider implements GitHubProvider {
  readonly name = "mock";

  async listRecentCommits(repo: string, sinceDays: number): Promise<RepoCommitSummary[]> {
    const now = Date.now();
    return [
      { sha: "a1b2c3d", message: "Förbättra kontaktformulär med validering", author: "Nawid", date: new Date(now - 1 * 86400000), additions: 42, deletions: 8 },
      { sha: "e4f5g6h", message: "Uppdatera SEO-metadata för produktsidor", author: "Partner", date: new Date(now - 2 * 86400000), additions: 15, deletions: 3 },
      { sha: "i7j8k9l", message: "Fixa 5 buggar i bokningsflödet", author: "Nawid", date: new Date(now - 3 * 86400000), additions: 63, deletions: 21 },
    ].filter((c) => (now - c.date.getTime()) / 86400000 <= sinceDays);
  }
}

// Swap for a real provider backed by GITHUB_TOKEN + @octokit/rest once the
// AI Development Assistant module is built out. Same interface.
export function getGitHubProvider(): GitHubProvider {
  return new MockGitHubProvider();
}
