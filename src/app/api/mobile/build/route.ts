import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { createBuild, updateBuild } from "@/lib/supabaseActions";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, platform } = body;

    if (!["android", "ios"].includes(platform)) {
      return Response.json(
        { error: "Platform must be 'android' or 'ios'" },
        { status: 400 }
      );
    }

    // Erstelle Build-Eintrag
    const build = await createBuild(projectId, {
      platform,
      status: "building",
    });

    // Starte Build-Prozess im Hintergrund
    buildMobileApp(build.id, projectId, platform).catch(console.error);

    return Response.json({
      success: true,
      buildId: build.id,
      message: `${platform} build started`,
    });
  } catch (error) {
    const err = error as Error;
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

async function buildMobileApp(buildId: string, projectId: string, platform: string) {
  try {
    let logs = "";

    // 1. Build Next.js
    logs += "📦 Building Next.js app...\n";
    const { stdout: buildOut } = await execAsync("npm run build");
    logs += buildOut;

    // 2. Export static files
    logs += "\n📤 Exporting static files...\n";
    const { stdout: exportOut } = await execAsync("npx next export");
    logs += exportOut;

    // 3. Sync to Capacitor
    logs += `\n🔄 Syncing to Capacitor (${platform})...\n`;
    const { stdout: syncOut } = await execAsync(`npx cap sync ${platform}`);
    logs += syncOut;

    // 4. Build native app
    let outputUrl = "";
    if (platform === "android") {
      logs += "\n🤖 Building Android APK...\n";
      const { stdout: androidOut } = await execAsync(
        "cd android && ./gradlew assembleRelease"
      );
      logs += androidOut;
      outputUrl = "./android/app/build/outputs/apk/release/app-release.apk";
    } else {
      logs += "\n🍎 Building iOS app...\n";
      const { stdout: iosOut } = await execAsync(
        "cd ios && xcodebuild -scheme App -configuration Release"
      );
      logs += iosOut;
      outputUrl = "./ios/build/Release-iphoneos/App.app";
    }

    // Update Build Status
    await updateBuild(buildId, {
      status: "completed",
      output_url: outputUrl,
      logs,
    });
  } catch (error) {
    const err = error as Error;
    await updateBuild(buildId, {
      status: "failed",
      logs: err.message,
    });
  }
}
