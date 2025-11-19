#!/bin/bash
echo "🔄 Auto-Updating Codespace Environment..."

# Detect Codespace URL
CODESPACE_URL="https://${CODESPACE_NAME}-3000.app.github.dev"
REDIRECT_URL="${CODESPACE_URL}/api/auth/callback/github"

echo "🌐 Detected Codespace URL: $CODESPACE_URL"
echo "🔁 Redirect URL: $REDIRECT_URL"

# Write .env.local
cat <<EOF > .env.local
NEXTAUTH_URL=${CODESPACE_URL}
NEXTAUTH_SECRET=$(openssl rand -hex 32)
GH_CLIENT_ID=${GH_CLIENT_ID}
GH_CLIENT_SECRET=${GH_CLIENT_SECRET}
GITHUB_REDIRECT_URL=${REDIRECT_URL}
EOF

echo "✨ .env.local updated"

# Restart Next dev server if running
pkill -f "next dev" || true

echo "🚀 Done. Run 'npm run dev' now."
echo "Running automatic OAuth URL updater…"
npm run update-oauth || true
