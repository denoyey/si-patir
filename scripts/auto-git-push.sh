#!/usr/bin/env bash
# ==============================================================================
# SI-PATIR: Automated Git Push & Verification Engine
# Mengikuti standar Feature Branch Workflow & Conventional Commits v1.0.0
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

BRANCH_TYPE="$1" # feat, fix, refactor, docs, chore
BRANCH_SLUG="$2" # contoh: responsive-dashboard
COMMIT_SCOPE="$3" # contoh: ui, security, prd
COMMIT_MSG="$4" # contoh: refine layout and enforce rounded-md tokens

if [ -z "$BRANCH_TYPE" ] || [ -z "$BRANCH_SLUG" ] || [ -z "$COMMIT_SCOPE" ] || [ -z "$COMMIT_MSG" ]; then
  echo "❌ Penggunaan:"
  echo "  ./scripts/auto-git-push.sh <type> <branch_slug> <scope> <commit_message>"
  echo "Contoh:"
  echo "  ./scripts/auto-git-push.sh feat responsive-ui ui 'standardize rounded-md tokens and max-w-7xl'"
  exit 1
fi

BRANCH_NAME="${BRANCH_TYPE}/${BRANCH_SLUG}"

# 1. Validasi Proteksi Branch Main
if [ "$BRANCH_NAME" = "main" ] || [ "$BRANCH_NAME" = "master" ]; then
  echo "🚨 ERROR: Dilarang keras push langsung ke branch main/master!"
  echo "Gunakan branch fitur atau perbaikan terpisah (misal: feat/... atau fix/...)."
  exit 1
fi

echo "🔍 [1/4] Menjalankan Pre-Push Quality Gate..."
echo "  -> Menjalankan Backend TypeScript Check..."
cd "$PROJECT_DIR/backend" && npx tsc --noEmit
echo "  -> Menjalankan Frontend Build Production..."
cd "$PROJECT_DIR/frontend" && npm run build
cd "$PROJECT_DIR"
echo "✅ Pre-Push Quality Gate Lolos! (0 error)"

echo "🌿 [2/4] Menyiapkan Branch: $BRANCH_NAME..."
# Buat branch baru jika belum ada, atau checkout
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  git checkout "$BRANCH_NAME"
else
  git checkout -b "$BRANCH_NAME"
fi

echo "📦 [3/4] Melakukan Staging & Conventional Commit..."
git add .

FULL_COMMIT_MSG="${BRANCH_TYPE}(${COMMIT_SCOPE}): ${COMMIT_MSG}"
git commit -m "$FULL_COMMIT_MSG"
echo "✅ Commit berhasil dibuat: \"$FULL_COMMIT_MSG\""

echo "🚀 [4/4] Mengirim (Push) ke GitHub Remote (origin/$BRANCH_NAME)..."
git push -u origin "$BRANCH_NAME"

echo "======================================================"
echo "🎉 Berhasil melakukan auto-push ke branch: $BRANCH_NAME"
echo "🔗 Buat Pull Request di GitHub untuk merge ke branch main."
echo "======================================================"

