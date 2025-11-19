import { describe, it, expect, vi } from "vitest";

// Mock Octokit
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: {
      listForAuthenticatedUser: vi.fn().mockResolvedValue({
        data: [
          { id: 1, name: "repo1", description: "Test repo 1" },
          { id: 2, name: "repo2", description: "Test repo 2" },
        ],
      }),
      createForAuthenticatedUser: vi.fn().mockResolvedValue({
        data: {
          id: 123,
          name: "new-repo",
          description: "New test repo",
          html_url: "https://github.com/user/new-repo",
        },
      }),
    },
  })),
}));

describe("GitHub API", () => {
  it("should list repositories", async () => {
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit();
    
    const result = await octokit.repos.listForAuthenticatedUser();
    
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe("repo1");
  });

  it("should create repository", async () => {
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit();
    
    const result = await octokit.repos.createForAuthenticatedUser({
      name: "new-repo",
      description: "New test repo",
    });
    
    expect(result.data.name).toBe("new-repo");
    expect(result.data.html_url).toContain("github.com");
  });
});
