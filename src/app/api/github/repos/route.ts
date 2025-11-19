import { Octokit } from "@octokit/rest";
import { NextRequest } from "next/server";

const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

// Liste alle Repos des authentifizierten Users
export async function GET() {
  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
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

// Erstelle neues Repository
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, private: isPrivate = false, auto_init = true } = body;

    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init,
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
