import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, gitSource } = body;

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: gitSource || {
          type: "github",
          ref: "main",
        },
        target: "production",
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Vercel deployment failed" },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    const err = error as Error;
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
