// Liste alle Vercel Projekte
export async function GET() {
  try {
    const response = await fetch("https://api.vercel.com/v9/projects", {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Failed to fetch projects" },
        { status: response.status }
      );
    }

    return Response.json(data.projects || []);
  } catch (error) {
    const err = error as Error;
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
