import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      functions: [
        {
          name: "create_project",
          description: "Erstellt ein neues Projekt mit GitHub Repo und Vercel Deployment",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name des Projekts (wird als Repo-Name verwendet)",
              },
              description: {
                type: "string",
                description: "Beschreibung des Projekts",
              },
              template: {
                type: "string",
                enum: ["next", "react", "vue", "node"],
                description: "Projekt-Template",
              },
            },
            required: ["name", "template"],
          },
        },
        {
          name: "deploy_project",
          description: "Deployed ein existierendes Projekt auf Vercel",
          parameters: {
            type: "object",
            properties: {
              projectName: {
                type: "string",
                description: "Name des Projekts",
              },
            },
            required: ["projectName"],
          },
        },
        {
          name: "build_mobile",
          description: "Erstellt einen Mobile Build (Android/iOS)",
          parameters: {
            type: "object",
            properties: {
              projectId: {
                type: "string",
                description: "ID des Projekts",
              },
              platform: {
                type: "string",
                enum: ["android", "ios"],
                description: "Ziel-Platform",
              },
            },
            required: ["projectId", "platform"],
          },
        },
      ],
    });

    const message = completion.choices[0].message;

    // Wenn GPT eine Function aufrufen will
    if (message.function_call) {
      const { name, arguments: args } = message.function_call;
      const parsedArgs = JSON.parse(args);

      // Führe die entsprechende Action aus
      let result;
      switch (name) {
        case "create_project":
          result = await executeCreateProject(parsedArgs);
          break;
        case "deploy_project":
          result = await executeDeployProject(parsedArgs);
          break;
        case "build_mobile":
          result = await executeBuildMobile(parsedArgs);
          break;
        default:
          result = { error: "Unknown function" };
      }

      return Response.json({
        role: "function",
        name,
        content: JSON.stringify(result),
      });
    }

    return Response.json(message);
  } catch (error) {
    const err = error as Error;
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

async function executeCreateProject(params: { name: string; description?: string; template: string }) {
  try {
    // 1. Erstelle GitHub Repo
    const repoResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/github/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        auto_init: true,
      }),
    });
    const repo = await repoResponse.json();

    // 2. Deploy auf Vercel
    const deployResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/vercel/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: params.name,
      }),
    });
    const deployment = await deployResponse.json();

    return {
      success: true,
      repo: repo.html_url,
      deployment: deployment.url,
    };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

async function executeDeployProject(params: { projectName: string }) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/vercel/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: params.projectName,
      }),
    });
    const data = await response.json();
    
    return { success: true, deployment: data };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

async function executeBuildMobile(params: { projectId: string; platform: string }) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/mobile/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    
    return { success: true, build: data };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}
