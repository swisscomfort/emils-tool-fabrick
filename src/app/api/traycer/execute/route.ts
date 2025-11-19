import { NextRequest } from "next/server";
import traycerConfig from "@/../../traycer.config.json";
import { logAction } from "@/lib/supabaseActions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskName, params, projectId } = body;

    const task = traycerConfig.tasks.find((t) => t.name === taskName);
    if (!task) {
      return Response.json(
        { error: `Task '${taskName}' not found` },
        { status: 404 }
      );
    }

    console.log(`${traycerConfig.output.console_prefix} Starting task: ${taskName}`);

    const results = [];

    // Führe alle Steps sequenziell aus
    for (const step of task.steps) {
      console.log(`${traycerConfig.output.emoji_status.building} Executing: ${step.action}`);

      const stepParams = interpolateParams(step.params, params);
      const result = await executeStep(step.action, stepParams, projectId);

      results.push({
        action: step.action,
        result,
      });

      // Log in Supabase wenn aktiviert
      if (traycerConfig.output.log_to_supabase && projectId) {
        await logAction(projectId, {
          type: step.action,
          payload: stepParams,
          result,
          status: result.error ? "failed" : "success",
        });
      }
    }

    console.log(`${traycerConfig.output.emoji_status.success} Task completed: ${taskName}`);

    return Response.json({
      success: true,
      task: taskName,
      results,
    });
  } catch (error) {
    console.error(`${traycerConfig.output.emoji_status.error} Task failed:`, error);
    const err = error as Error;
    
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

function interpolateParams(params: Record<string, unknown>, values: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...params };
  
  for (const key in result) {
    if (typeof result[key] === "string" && (result[key] as string).startsWith("{{")) {
      const varName = (result[key] as string).slice(2, -2).trim();
      result[key] = values[varName] || result[key];
    }
  }
  
  return result;
}

async function executeStep(action: string, params: Record<string, unknown>, projectId?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    switch (action) {
      case "github_create_repo":
        return await fetch(`${baseUrl}/api/github/repos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).then((r) => r.json());

      case "github_push_files":
        return await fetch(`${baseUrl}/api/github/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).then((r) => r.json());

      case "vercel_deploy":
        return await fetch(`${baseUrl}/api/vercel/deploy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).then((r) => r.json());

      case "mobile_build":
        return await fetch(`${baseUrl}/api/mobile/build`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...params, projectId }),
        }).then((r) => r.json());

      case "supabase_log":
        if (projectId) {
          return await logAction(projectId, {
            type: params.type,
            payload: params.payload,
            status: "success",
          });
        }
        return { success: true };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const err = error as Error;
    return { error: err.message };
  }
}
