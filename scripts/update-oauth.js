import { execSync } from "child_process";

console.log("🔄 Updating GitHub OAuth configuration…");

try {
  execSync("bash scripts/update-oauth.sh", { stdio: "inherit" });
  console.log("✅ OAuth configuration updated successfully.");
} catch (err) {
  console.error("❌ OAuth update failed:", err);
}
