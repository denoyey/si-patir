#!/usr/bin/env bash
# ==============================================================================
# SI-PATIR: Clean Merged Branches Utility (Conflict-Proof)
# Membersihkan branch lokal & remote yang sudah selesai di-merge ke branch main
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🔍 [1/3] Memeriksa status workspace..."
# Proteksi jika ada uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
  echo "⚠️  Terdeteksi perubahan file yang belum di-commit!"
  echo "👉 Silakan commit atau stash perubahan Anda terlebih dahulu sebelum membersihkan branch."
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "  -> Berpindah ke branch main..."
  git checkout main
fi

# Fetch remote metadata dan prune branch yang sudah dihapus di GitHub
echo "🔄 [2/3] Mengambil pembaruan dari origin/main..."
git fetch origin --prune --quiet
git pull --rebase origin main --quiet || true

echo "🧹 [3/3] Memeriksa branch yang sudah di-merge ke origin/main..."

# Sumber kebenaran: branch yang sudah masuk ke origin/main
MERGED_LOCAL=$(git branch --merged origin/main | grep -v '^\*' | grep -v 'main' || true)
MERGED_REMOTE=$(git branch -r --merged origin/main | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's/origin\///' || true)

if [ -z "$MERGED_LOCAL" ] && [ -z "$MERGED_REMOTE" ]; then
  echo "✨ Repositori sudah bersih! Tidak ada branch usang yang perlu dihapus."
  exit 0
fi

if [ -n "$MERGED_LOCAL" ]; then
  echo "🗑️  Menghapus branch lokal yang sudah di-merge:"
  for b in $MERGED_LOCAL; do
    echo "  - Menghapus lokal: $b"
    git branch -d "$b" 2>/dev/null || git branch -D "$b"
  done
fi

if [ -n "$MERGED_REMOTE" ]; then
  echo "🌐 Menghapus branch remote yang sudah di-merge di origin:"
  for b in $MERGED_REMOTE; do
    echo "  - Menghapus remote: $b"
    git push origin --delete "$b" 2>/dev/null || true
  done
fi

git fetch --prune origin --quiet
echo "======================================================"
echo "✅ Pembersihan selesai! Repositori kini bersih dan rapi."
echo "======================================================"
