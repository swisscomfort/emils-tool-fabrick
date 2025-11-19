import { Octokit } from "@octokit/rest";
import { NextRequest } from "next/server";

const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

// Erstelle neuen Branch
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, branch, from_branch = "main" } = body;

    // Hole SHA des Source-Branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${from_branch}`,
    });

    // Erstelle neuen Branch
    const { data } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: refData.object.sha,
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
