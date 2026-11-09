#!/bin/bash
# ==============================================================================
# SI-PATIR: Setup Public Webhook Gateway Tunnel (DevOps Tool for Deni)
# Exposes local Express backend (port 5000) to a public HTTPS URL for GitHub Webhooks
# ==============================================================================

PORT=5000
BACKEND_HEALTH_URL="http://localhost:$PORT/api/v1/system/health"

echo "======================================================"
echo "🌐 SI-PATIR: Public Webhook Gateway Setup"
echo "======================================================"

# 1. Check if backend is alive
if command -v curl >/dev/null 2>&1; then
  HEALTH=$(curl -s "$BACKEND_HEALTH_URL" 2>/dev/null)
  if [[ -z "$HEALTH" ]]; then
    echo "⚠️  Peringatan: Server backend port $PORT belum terdeteksi aktif."
    echo "   Pastikan backend berjalan (jalankan ./start.sh atau npm start)."
    echo ""
  else
    echo "✅ Backend lokal terdeteksi aktif di http://localhost:$PORT"
  fi
fi

echo "Pilih penyedia HTTPS Tunnel:"
echo "1) Cloudflare Tunnel (cloudflared)"
echo "2) LocalTunnel (npx localtunnel - Standar Node.js)"
echo "3) SSH Localhost.run (Tanpa install dependensi)"
echo ""

read -t 10 -p "Pilihan Anda [1/2/3, default: 2]: " CHOICE || CHOICE="2"

if [[ -z "$CHOICE" ]]; then
  CHOICE="2"
fi

echo ""
case "$CHOICE" in
  1)
    if command -v cloudflared >/dev/null 2>&1; then
      echo "🚀 Menjalankan Cloudflare Tunnel ke port $PORT..."
      cloudflared tunnel --url "http://localhost:$PORT"
    else
      echo "⚠️  cloudflared belum terinstal. Mengalihkan ke LocalTunnel..."
      npx localtunnel --port "$PORT"
    fi
    ;;
  3)
    echo "🚀 Menjalankan SSH Tunnel ke localhost.run (port $PORT)..."
    ssh -R 80:localhost:$PORT nokey@localhost.run
    ;;
  *)
    echo "🚀 Menjalankan LocalTunnel via npx (port $PORT)..."
    echo "📋 Setelah tunnel aktif, masukkan URL berikut ke GitHub Repo Webhook:"
    echo "   👉 https://<domain-tunnel>/api/v1/webhooks/github"
    echo "------------------------------------------------------"
    npx localtunnel --port "$PORT"
    ;;
esac
