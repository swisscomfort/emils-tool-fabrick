import { http, HttpResponse } from "msw";

export const handlers = [
  // GitHub API Mocks
  http.get("/api/github/repos", () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "test-repo-1",
        description: "Test Repository 1",
        html_url: "https://github.com/user/test-repo-1",
        owner: { login: "testuser" },
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: 2,
        name: "test-repo-2",
        description: "Test Repository 2",
        html_url: "https://github.com/user/test-repo-2",
        owner: { login: "testuser" },
        updated_at: "2025-01-02T00:00:00Z",
      },
    ]);
  }),

  http.post("/api/github/repos", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 123,
      name: body.name,
      description: body.description,
      html_url: `https://github.com/user/${body.name}`,
      owner: { login: "testuser" },
    });
  }),

  // Vercel API Mocks
  http.post("/api/vercel/deploy", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: "dpl_123",
      url: `https://${body.projectName}.vercel.app`,
      status: "ready",
    });
  }),

  http.get("/api/vercel/projects", () => {
    return HttpResponse.json([
      { id: "prj_1", name: "project-1" },
      { id: "prj_2", name: "project-2" },
    ]);
  }),

  // Mobile Build Mocks
  http.post("/api/mobile/build", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      buildId: "build_123",
      message: `${body.platform} build started`,
    });
  }),

  // GPT Chat Mock
  http.post("/api/gpt/chat", async ({ request }) => {
    const body = await request.json();
    const lastMessage = body.messages[body.messages.length - 1];
    
    return HttpResponse.json({
      role: "assistant",
      content: `Test response to: ${lastMessage.content}`,
    });
  }),
];
