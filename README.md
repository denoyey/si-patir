# 🚀 SI-PATIR
### **Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (DevOps Lite)**

Dashboard monitoring aktivitas tugas kelompok terpadu yang menghubungkan **GitHub Webhook**, **Trello API**, **Discord Webhook**, dan database **MySQL**.

---

## 📁 Struktur Direktori
```text
si-patir/
├── docs/
│   └── prd/            # Kumpulan Dokumen Kebutuhan Produk (PRD) Terstruktur
│       ├── 00-INDEX-AND-OVERVIEW.md
│       ├── 01-SYSTEM-INTEGRATION-PRD.md
│       ├── 02-DATABASE-AND-STORAGE-PRD.md
│       ├── 03-SECURITY-AND-HARDENING-PRD.md
│       ├── 04-FRONTEND-UI-UX-PRD.md
│       ├── 05-API-AND-WEBHOOK-CONTRACTS-PRD.md
│       └── 06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md
├── backend/            # Express.js + TypeScript + MySQL (mysql2) + Socket.io (OOP Architecture)
│   ├── src/
│   │   ├── config/     # EnvironmentConfig Singleton
│   │   ├── database/   # DatabaseService & Repositories (Prepared Statements)
│   │   ├── services/   # Integrasi Discord, Trello, Security & Parser
│   │   ├── controllers/# Webhook, Task, Member & System Controllers
│   │   └── Application.ts # Gateway Express & Socket.io Lifecycle
│   ├── .env.example    # Contoh konfigurasi kredensial
│   └── package.json
├── frontend/           # React 19 + Vite 8 + Tailwind CSS v4 + Lucide Icons (Pure Human UI)
│   ├── src/            # Dashboard UI & Socket.io client
│   └── package.json
├── scripts/
│   └── setup-local-git-hook.sh  # Skrip otomatis pasang hook git lokal
├── start.sh            # One-click starter dengan auto-kill port (Linux/macOS)
└── start.bat           # One-click starter dengan auto-kill port (Windows)
```

---

## ⚙️ 1. Konfigurasi Database & Environment
Buka file `backend/.env` dan sesuaikan kredensial Anda:

```env
# Server
PORT=5000

# MySQL Database (Sesuaikan dengan MySQL Anda)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sipatir_db
DB_PORT=3306

# Discord Webhook (Ambil dari Channel Discord -> Settings -> Integrations -> Webhooks)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy

# Trello API (Ambil dari https://trello.com/app-key)
TRELLO_API_KEY=your_key
TRELLO_TOKEN=your_token
TRELLO_BOARD_ID=your_board_id
TRELLO_DONE_LIST_ID=your_done_list_id
```

> **Catatan:** Backend sudah dilengkapi **auto-create database & tables**. Anda cukup memastikan service MySQL menyala, dan tabel `members`, `tasks`, dan `activity_logs` akan otomatis dibuat saat backend dijalankan.

---

## 🚀 2. Cara Menjalankan Aplikasi (One-Click)

### Di Linux / macOS:
```bash
./start.sh
```
*Skrip otomatis mendeteksi dan mematikan proses lama di Port 5000 & 3000 terlebih dahulu, lalu menyalakan Backend & Frontend sekaligus. Tekan `Ctrl + C` kapan saja untuk berhenti bersih.*

### Di Windows:
Cukup klik ganda:
* **`start.bat`** (otomatis membersihkan bentrok port lama, menyalakan kedua service, dan membuka browser)

---

## 🎯 3. Cara Melakukan Demo ke Dosen (30 Detik!)

Ada 3 opsi cara demo yang bisa Anda pilih:

### Opsi A: Menggunakan Tombol UI Cepat (Paling Aman & Praktis)
1. Buka dashboard di `http://localhost:3000`.
2. Klik tombol hijau **"⚡ Test Commit [done #TASK-02]"** di pojok kanan atas.
3. Detik itu juga:
   * Status tugas `#TASK-02` di tabel berubah menjadi **Done**.
   * Notifikasi kartu selesai terkirim ke channel **Discord**.
   * Log webhook langsung muncul di **Live Webhook Log**.
   * Papan Trello otomatis bergeser ke kolom **Done**.

### Opsi B: Menggunakan Local Git Hook (100% Lokal, Tanpa Tunnel)
Pasang hook ke repositori tugas Anda:
```bash
./scripts/setup-local-git-hook.sh /path/ke/repo/kelompok
```
Lalu di terminal repo tersebut, Anda cukup ketik:
```bash
git commit -m "Selesai integrasi login [done #TASK-02]"
```
Git lokal akan otomatis menembak ke backend SI-PATIR secara real-time!

### Opsi C: Menggunakan GitHub Webhook Asli (Via Tunnel Gratis)
Jalankan di terminal:
```bash
npx localtunnel --port 5000
```
Salin URL publik yang muncul (contoh: `https://sipatir.loca.lt`) dan daftarkan di menu **Settings -> Webhooks** di GitHub repositori Anda:
* **Payload URL**: `https://sipatir.loca.lt/api/webhooks/github`
* **Content type**: `application/json`

