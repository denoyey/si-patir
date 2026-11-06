#!/usr/bin/env bash
# ==============================================================================
# SI-PATIR: Clean Merged Branches Utility
# Membersihkan branch lokal & remote yang sudah selesai di-merge ke branch main
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Pastikan berada di branch main dan tersinkron
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️  Berpindah ke branch main terlebih dahulu..."
  git checkout main
fi

git pull origin main --quiet

echo "🔍 Memeriksa branch yang sudah di-merge ke main..."

MERGED_LOCAL=$(git branch --merged main | grep -v '^\*' | grep -v 'main' || true)
MERGED_REMOTE=$(git branch -r --merged main | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's/origin\///' || true)

if [ -z "$MERGED_LOCAL" ] && [ -z "$MERGED_REMOTE" ]; then
  echo "✨ Repositori sudah bersih! Tidak ada branch usang yang perlu dihapus."
  exit 0
fi

if [ -n "$MERGED_LOCAL" ]; then
  echo "🗑️  Menghapus branch lokal yang sudah di-merge:"
  for b in $MERGED_LOCAL; do
    echo "  - Menghapus lokal: $b"
    git branch -d "$b"
  done
fi

if [ -n "$MERGED_REMOTE" ]; then
  echo "🌐 Menghapus branch remote yang sudah di-merge di origin:"
  for b in $MERGED_REMOTE; do
    echo "  - Menghapus remote: $b"
    git push origin --delete "$b"
  done
fi

git fetch --prune origin --quiet
echo "✅ Pembersihan selesai! Repositori kini bersih dan rapi."
