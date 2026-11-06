#!/usr/bin/env bash
# ==============================================================================
# SI-PATIR: Automated Git Push & Conflict-Proof Verification Engine
# Mengikuti standar Feature Branch Workflow & Conventional Commits v1.0.0
# Dilengkapi proteksi anti-conflict, rebase safety, dan branch isolation
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

echo "🔍 [1/5] Mengambil metadata terbaru & memeriksa remote..."
git fetch origin --prune --quiet

# 2. Menjalankan Pre-Push Quality Gate
echo "🛡️  [2/5] Menjalankan Pre-Push Quality Gate..."
echo "  -> Backend TypeScript Validation..."
(cd "$PROJECT_DIR/backend" && npx tsc --noEmit)
echo "  -> Frontend Production Build Validation..."
(cd "$PROJECT_DIR/frontend" && npm run build)
echo "✅ Pre-Push Quality Gate Lolos! (0 error)"

echo "🌿 [3/5] Menyiapkan Branch: $BRANCH_NAME..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Jika branch lokal sudah ada
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    git checkout "$BRANCH_NAME"
  fi
# Jika belum ada di lokal tapi sudah ada di remote GitHub (kolaborasi tim)
elif git ls-remote --exit-code --heads origin "$BRANCH_NAME" >/dev/null 2>&1; then
  echo "  -> Mendeteksi branch remote di origin/$BRANCH_NAME. Melacak..."
  git checkout -b "$BRANCH_NAME" --track "origin/$BRANCH_NAME"
# Jika benar-benar branch baru
else
  # Jika saat ini di main dan tidak ada perubahan unstaged, tarik main terbaru dulu
  if [ "$CURRENT_BRANCH" = "main" ]; then
    if git diff --quiet && git diff --staged --quiet; then
      git pull --ff-only origin main --quiet 2>/dev/null || true
    fi
  fi
  git checkout -b "$BRANCH_NAME"
fi

echo "📦 [4/5] Melakukan Staging & Conventional Commit..."
git add .

FULL_COMMIT_MSG="${BRANCH_TYPE}(${COMMIT_SCOPE}): ${COMMIT_MSG}"

# Cek apakah ada perubahan untuk di-commit
if git diff --staged --quiet; then
  echo "ℹ️  Tidak ada perubahan file baru untuk di-commit."
else
  git commit -m "$FULL_COMMIT_MSG"
  echo "✅ Commit berhasil dibuat: \"$FULL_COMMIT_MSG\""
fi

# 5. Sinkronisasi Anti-Conflict sebelum Push
echo "🚀 [5/5] Memeriksa & Mengirim ke Remote (origin/$BRANCH_NAME)..."

# Cek apakah remote branch sudah memiliki commit (misal dari rekan tim lain)
if git ls-remote --exit-code --heads origin "$BRANCH_NAME" >/dev/null 2>&1; then
  echo "  -> Mendeteksi commit di remote. Melakukan rebase sinkronisasi anti-conflict..."
  if ! git pull --rebase origin "$BRANCH_NAME" 2>/dev/null; then
    echo "⚠️  Terjadi conflict dengan commit rekan tim di remote!"
    echo "Membatalkan rebase secara otomatis agar workspace Anda aman..."
    git rebase --abort || true
    echo "❌ PUSH DIBATALKAN UNTUK MENCEGAH KERUSAKAN KODE."
    echo "👉 Rekomendasi: Jalankan 'git pull origin $BRANCH_NAME' manual untuk menyelesaikan perbedaan file."
    exit 1
  fi
fi

# Push ke remote dengan proteksi
git push -u origin "$BRANCH_NAME"

echo "======================================================"
echo "🎉 Berhasil melakukan auto-push ke branch: $BRANCH_NAME"
echo "🔗 Buka GitHub untuk membuat/merge Pull Request ke main."
echo "======================================================"
