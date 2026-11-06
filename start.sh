#!/usr/bin/env bash
# ==============================================================================
# SI-PATIR: One-Click Startup Script (Linux / macOS)
# Mendeteksi dan membersihkan port yang bentrok sebelum menjalankan sistem
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000

# ANSI Color Codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}🚀 MEMULAI SISTEM SI-PATIR (DevOps Lite)${NC}"
echo -e "${CYAN}======================================================${NC}"

# Fungsi pembersih port
kill_port() {
  local port=$1
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti :"$port" 2>/dev/null)
  elif command -v fuser >/dev/null 2>&1; then
    pids=$(fuser "$port"/tcp 2>/dev/null)
  fi

  if [ -n "$pids" ]; then
    echo -e "${YELLOW}⚠️  Port $port sedang digunakan oleh PID: $pids. Membersihkan...${NC}"
    for pid in $pids; do
      kill -9 "$pid" 2>/dev/null || true
    done
    sleep 0.5
    echo -e "${GREEN}✅ Port $port berhasil dibebaskan!${NC}"
  else
    echo -e "${GREEN}✅ Port $port aman (siap digunakan).${NC}"
  fi
}

echo -e "\n${CYAN}[1/3] Memeriksa ketersediaan port & dependensi...${NC}"
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

# Auto-initialize .env jika belum ada
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
  echo -e "${YELLOW}⚠️  Berkas backend/.env belum ditemukan. Menyalin dari .env.example...${NC}"
  cp "$PROJECT_DIR/backend/.env.example" "$PROJECT_DIR/backend/.env"
  echo -e "${GREEN}✅ backend/.env berhasil dibuat.${NC}"
fi

# Auto-install dependencies jika node_modules belum ada
if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
  echo -e "${YELLOW}📦 Menginstal dependensi backend (npm install)...${NC}"
  (cd "$PROJECT_DIR/backend" && npm install)
fi

if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
  echo -e "${YELLOW}📦 Menginstal dependensi frontend (npm install)...${NC}"
  (cd "$PROJECT_DIR/frontend" && npm install)
fi

# Trap handler saat user menekan Ctrl+C
cleanup() {
  echo -e "\n\n${YELLOW}🛑 Menghentikan seluruh service SI-PATIR...${NC}"
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  kill_port "$BACKEND_PORT" >/dev/null 2>&1
  kill_port "$FRONTEND_PORT" >/dev/null 2>&1
  echo -e "${GREEN}✅ Semua proses berhasil dihentikan dengan aman. Sampai jumpa!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo -e "\n${CYAN}[2/3] Menjalankan Backend Server (Port $BACKEND_PORT)...${NC}"
cd "$PROJECT_DIR/backend" || exit 1
npm run dev &
BACKEND_PID=$!

# Tunggu backend siap sebentar
sleep 1.5

echo -e "\n${CYAN}[3/3] Menjalankan Frontend Dashboard (Port $FRONTEND_PORT)...${NC}"
cd "$PROJECT_DIR/frontend" || exit 1
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}✨ SI-PATIR BERHASIL BERJALAN AKTIF!${NC}"
echo -e "🌐 Dashboard Web : ${CYAN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "📡 Backend API   : ${CYAN}http://localhost:$BACKEND_PORT${NC}"
echo -e "📡 Webhook URL   : ${CYAN}http://localhost:$BACKEND_PORT/api/webhooks/github${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "${YELLOW}Tekan [Ctrl + C] untuk menghentikan seluruh sistem.${NC}\n"

# Menahan script agar tetap berjalan dan menampilkan log
wait

