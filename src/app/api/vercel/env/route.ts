import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, key, value, target = ["production", "preview", "development"] } = body;

    const response = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
          type: "encrypted",
          target,
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "ENV sync failed" },
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
