#!/bin/bash

set -e

echo "🔍 Detecting Codespaces URL…"

if [ -z "$CODESPACE_NAME" ]; then
  echo "❌ Not inside GitHub Codespaces. Aborting."
  exit 1
fi

PORT="${PORT:-3000}"

CURRENT_URL="https://${CODESPACE_NAME}-${PORT}.app.github.dev"

echo "🌐 Codespace URL:"
echo " → $CURRENT_URL"
echo ""

echo "📝 Writing .env.local…"
cat > .env.local <<EOF
NEXTAUTH_URL=$CURRENT_URL
EOF

echo "✅ .env.local updated successfully!"
echo "🎉 You can now run: npm run dev"
