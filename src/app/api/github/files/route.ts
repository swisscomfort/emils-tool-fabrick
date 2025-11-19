import { Octokit } from "@octokit/rest";
import { NextRequest } from "next/server";

const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

// Erstelle oder update eine Datei im Repo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, path, content, message, branch = "main" } = body;

    // Prüfe ob Datei existiert
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });
      if ("sha" in data) {
        sha = data.sha;
      }
    } catch {
      // Datei existiert nicht, das ist OK
    }

    // Erstelle/Update Datei
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
      sha,
    });

    return Response.json(data);
  } catch (error) {
    const err = error as { message: string; status?: number };
    return Response.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}
