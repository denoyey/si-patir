<div align="center">

# 🚀 SI-PATIR
### **Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (DevOps Lite)**

Platform automasi dan monitoring terpadu yang menghubungkan alur kerja **GitHub Webhook**, **Trello Kanban API**, dan notifikasi **Discord Webhook** ke dalam satu dashboard rekayasa berbasis **WebSocket Real-time** dan basis data **MySQL**.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-InnoDB-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Security](https://img.shields.io/badge/Security-OWASP_Hardened-10B981?style=flat-square&logo=shield&logoColor=white)](#-5-arsitektur-keamanan-berlapis-defense-in-depth)

</div>

---

## 📌 Daftar Isi
1. [Latar Belakang & Masalah](#-1-latar-belakang--masalah)
2. [Alur Integrasi Tiga Sistem](#-2-alur-integrasi-tiga-sistem)
3. [Fitur Unggulan](#-3-fitur-unggulan)
4. [Prasyarat Sistem](#-4-prasyarat-sistem)
5. [Panduan Instalasi Cepat (Quickstart dari Clone)](#-5-panduan-instalasi-cepat-quickstart-dari-clone)
6. [Panduan Konfigurasi `.env`](#-6-panduan-konfigurasi-env)
7. [Cara Menjalankan Sistem (One-Click)](#-7-cara-menjalankan-sistem-one-click)
8. [Skenario Demo 30 Detik (Untuk Evaluasi Dosen/Penguji)](#-8-skenario-demo-30-detik-untuk-evaluasi-dosenpenguji)
9. [Struktur Folder Proyek](#-9-struktur-folder-proyek)
10. [Dokumentasi PRD & Standar Kontribusi Git](#-10-dokumentasi-prd--standar-kontribusi-git)

---

## 💡 1. Latar Belakang & Masalah

Dalam pengerjaan proyek perangkat lunak kolaboratif (tim/kelompok), sering terjadi kendala:
* **Kartu Tugas Terbengkalai**: Developer telah menyelesaikan fitur dan melakukan `git push`, namun lupa menggeser kartu di Trello.
* **Sindrom Numpang Nama (*Free-Rider*)**: Sulit melihat kontribusi riil commit dan tugas selesai per anggota secara transparan.
* **Komunikasi Asinkron yang Lambat**: Anggota tim lain tidak segera mengetahui saat ada modul fundamental yang sudah selesai diintegrasikan.

**Solusi SI-PATIR:**  
Cukup tambahkan tag kode tugas pada pesan commit Git (contoh: `git commit -m "Selesai halaman login [done #TASK-02]"`), sistem akan secara otomatis memindahkan kartu Trello ke kolom **Done**, mengirim bukti commit ke grup **Discord**, dan memperbarui **Dashboard** secara real-time.

---

## 🔄 2. Alur Integrasi Tiga Sistem

```text
[ Terminal Developer: git commit & git push ]
                      │
                      ▼ (1. Inbound Event Payload)
        [ GitHub Webhook / Local Hook ]
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│             BACKEND GATEWAY SI-PATIR                   │
│  - Verifikasi HMAC SHA-256 (Constant-Time Protection)  │
│  - ReDoS-Safe Regex Commit Parser                      │
│  - Update Database MySQL / In-Memory State             │
└────────┬───────────────────────┬───────────────────────┘
         │                       │
         ▼ (2. Outbound Task)    ▼ (3. Outbound Chat)
┌──────────────────┐    ┌──────────────────┐
│   TRELLO API     │    │ DISCORD WEBHOOK  │
│- Geser kartu ke  │    │- Kirim notifikasi│
│  kolom Done      │    │  Rich Embed hijau│
│- Sematkan bukti  │    │- Link commit Git │
└──────────────────┘    └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼ (4. Real-time WebSocket Broadcast)
        ┌──────────────────────────┐
        │   DASHBOARD WEB KLIEN    │
        │- Update status tugas     │
        │- Nilai leaderboard +1    │
        │- Stream log tercetak     │
        └──────────────────────────┘
```

---

## ✨ 3. Fitur Unggulan

* **Automasi DevOps Bebas Repot**: Tidak perlu membuka web Trello secara manual untuk menggeser kartu kerja.
* **Papan Klasemen Kontribusi Transparan**: Memantau peringkat developer berdasarkan jumlah commit dan tugas selesai secara objektif.
* **Live Webhook Audit Stream**: Terminal monitoring interaktif berbasis WebSocket (`Socket.io`) untuk memantau sinyal commit secara detik-per-detik.
* **Dual-Tier Resilient Storage**: Didukung penuh oleh basis data relasional **MySQL** dengan sistem **In-Memory Fallback otomatis** (sistem tetap jalan lancar tanpa crash meskipun server MySQL lokal sedang offline).
* **Pure Human Engineering UI (Anti-AI Slop)**: Desain antarmuka profesional bertaraf Linear/GitHub Actions: palet Zinc/Slate, standar radius `rounded-md` & `rounded-lg`, kontainer lebar `max-w-7xl`, dan nol gradasi sintetis.
* **Dukungan Penuh Semua Perangkat & iPhone**: Kompatibel 100% dari monitor Ultrawide 4K hingga seluruh varian iPhone (dilengkapi penanganan khusus *Dynamic Island*, *Notch*, dan *Safe Area Insets*).
* **OWASP Hardened Security**: Kebal dari Timing Attacks via `crypto.timingSafeEqual`, bebas SQL Injection berkat Parameterized Queries, anti-ReDoS, dan perlindungan DoS via rate limiting bertingkat & pembatasan payload 100kb.

---

## 💻 4. Prasyarat Sistem

Sebelum mengkloning proyek, pastikan perangkat Anda memiliki:
* **Node.js**: Versi `20.x` atau lebih baru (`node -v`).
* **npm**: Versi `10.x` atau lebih baru (`npm -v`).
* **MySQL Server** (Opsional/Direkomendasikan): Versi `8.x` atau MariaDB (sudah disediakan fallback memori otomatis jika MySQL belum aktif).
* **Git**: Terinstal pada terminal lokal Anda.

---

## 📦 5. Panduan Instalasi Cepat (Quickstart dari Clone)

Ikuti langkah-langkah berikut setelah mengkloning repositori ini:

```bash
# 1. Clone repositori ke komputer lokal Anda
git clone git@github.com:denoyey/si-patir.git
cd si-patir

# 2. Instal dependencies Backend
cd backend
npm install

# 3. Siapkan file konfigurasi environment
cp .env.example .env

# 4. Instal dependencies Frontend
cd ../frontend
npm install
cd ..
```

---

## ⚙️ 6. Panduan Konfigurasi `.env`

Buka file `backend/.env` menggunakan editor teks Anda dan sesuaikan isinya:

```env
# Port Server Backend
PORT=5000

# Konfigurasi Basis Data MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=sipatir_db
DB_PORT=3306

# Discord Webhook URL (Ambil dari Discord Channel Settings -> Integrations -> Webhooks)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_webhook_token

# Trello API (Ambil dari https://trello.com/app-key)
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_BOARD_ID=your_trello_board_id
TRELLO_DONE_LIST_ID=your_trello_done_list_id

# GitHub Webhook Secret (Opsional untuk verifikasi HMAC signature)
GITHUB_WEBHOOK_SECRET=sipatir_secret_123
```

> 💡 **Tips Pengujian Offline / Tanpa API**:  
> Jika kredensial Trello atau Discord belum Anda isi, backend secara otomatis beralih ke **Mode Simulasi Mandiri** sehingga seluruh fitur dashboard dan database tetap dapat didemonstrasikan dengan sempurna.

---

## 🚀 7. Cara Menjalankan Sistem (One-Click)

SI-PATIR dilengkapi skrip otomatis yang memiliki fitur **Pembersih Port Otomatis** (mendeteksi dan mematikan proses lama di port `5000` dan `3000` terlebih dahulu agar tidak terjadi bentrok *port already in use*).

### Di Linux / macOS:
```bash
./start.sh
```
*(Tekan `Ctrl + C` kapan saja untuk mematikan kedua service secara bersih)*

### Di Windows:
Cukup klik ganda (double-click) file:
```cmd
start.bat
```
*(Skrip otomatis membersihkan port lama, menjalankan backend & frontend, lalu membuka browser ke `http://localhost:3000`)*

---

## 🎯 8. Skenario Demo 30 Detik (Untuk Evaluasi Dosen/Penguji)

Gunakan skenario cepat ini untuk membuktikan integrasi nyata di hadapan penilai:

1. **Buka Dashboard**: Akses `http://localhost:3000`. Tunjukkan status indikator hijau `GitHub: Ready 🟢`, `Trello: Synced 🟢`, `Discord: Active 🟢`.
2. **Pilih Tugas Target**: Tunjukkan bahwa tugas **`[#TASK-02] Integrasi Halaman Login`** masih berstatus **`In Progress`**.
3. **Picukan Automasi**:
   * **Opsi A (Tombol Cepat)**: Klik tombol putih di header dashboard: **`⚡ Test Commit [#TASK-02]`**.
   * **Opsi B (Terminal Git Asli)**: Di terminal repo Git Anda, ketik:
     ```bash
     git commit -m "Selesai modul login auth [done #TASK-02]"
     ```
4. **Perhatikan Respons Seketika (1–2 Detik)**:
   * Status tugas `#TASK-02` di layar langsung berubah menjadi hijau **`Done`**.
   * Di Trello, kartu `#TASK-02` otomatis loncat sendiri ke kolom *Done* disertai link bukti commit.
   * Kanal Discord berbunyi notifikasi pesan kartu embed hijau rapi dari *SI-PATIR Bot*.
   * Panel samping *Live Webhook Stream* mencetak log aktivitas secara real-time.

---

## 📂 9. Struktur Folder Proyek

```text
si-patir/
├── docs/
│   └── prd/                         # Kumpulan Dokumen Kebutuhan Produk (PRD) Terstruktur
│       ├── 00-INDEX-AND-OVERVIEW.md
│       ├── 01-SYSTEM-INTEGRATION-PRD.md
│       ├── 02-DATABASE-AND-STORAGE-PRD.md
│       ├── 03-SECURITY-AND-HARDENING-PRD.md
│       ├── 04-FRONTEND-UI-UX-PRD.md
│       ├── 05-API-AND-WEBHOOK-CONTRACTS-PRD.md
│       └── 06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md
├── backend/                         # Express.js + TypeScript + MySQL2 + Socket.io (OOP Architecture)
│   ├── src/
│   │   ├── types/interfaces.ts      # Domain Entity Contracts (IMember, ITask, IActivityLog)
│   │   ├── config/EnvironmentConfig.ts # Singleton Configuration & Secret Masking
│   │   ├── database/                # DatabaseService & Repositories (Prepared Statements)
│   │   ├── services/                # Discord, Trello, Security & Commit Parser Services
│   │   ├── middlewares/             # Helmet, Dual-tier RateLimiter, CORS, Error Sanitizer
│   │   ├── controllers/             # Webhook, Task, Member & System Controllers
│   │   ├── Application.ts           # Application Gateway & Socket.io Lifecycle
│   │   └── server.ts                # Bootstrap Server Entry Point
│   ├── .env.example
│   └── package.json
├── frontend/                        # React 19 + Vite 8 + Tailwind CSS v4 (Pure Human Engineering)
│   ├── src/
│   │   ├── App.tsx                  # Dashboard UI terpadu (Leaderboard, Tasks, Live Stream)
│   │   └── index.css                # Styling token & Safe Area Inset iPhone
│   └── package.json
├── scripts/
│   ├── setup-local-git-hook.sh      # Skrip pemasang Git hook lokal (tanpa tunnel)
│   └── auto-git-push.sh             # Skrip otomatis branch feature & Conventional Commits
├── start.sh                         # Skrip starter Linux/macOS dengan auto-kill port
├── start.bat                        # Skrip starter Windows dengan auto-kill port
└── README.md
```

---

## 📚 10. Dokumentasi PRD & Standar Kontribusi Git

### Modul Dokumentasi Lengkap:
* 📑 [PRD 00: Master Index & Executive Overview](docs/prd/00-INDEX-AND-OVERVIEW.md)
* 📑 [PRD 01: Arsitektur Integrasi Sistem & Data Flow](docs/prd/01-SYSTEM-INTEGRATION-PRD.md)
* 📑 [PRD 02: Skema Basis Data & Storage Fallback](docs/prd/02-DATABASE-AND-STORAGE-PRD.md)
* 📑 [PRD 03: Arsitektur Keamanan Siber & Vektor Ancaman](docs/prd/03-SECURITY-AND-HARDENING-PRD.md)
* 📑 [PRD 04: Spesifikasi Antarmuka Klien & Desain Humanis](docs/prd/04-FRONTEND-UI-UX-PRD.md)
* 📑 [PRD 05: Kontrak Teknis REST API & WebSocket Event](docs/prd/05-API-AND-WEBHOOK-CONTRACTS-PRD.md)
* 📑 [PRD 06: Panduan Operasional & Runbook Demonstrasi](docs/prd/06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md)

### Alur Kerja Git Developer (*Best Practices*):
* **Dilarang push langsung ke branch `main`**. Selalu buat branch fitur terpisah: `feat/<nama-fitur>`, `fix/<nama-bug>`, atau `docs/<topik>`.
* Gunakan standar pesan commit **Conventional Commits v1.0.0**: `<type>(<scope>): <pesan deskriptif>`.
* Anda dapat menggunakan skrip pembantu otomatis kami:
  ```bash
  ./scripts/auto-git-push.sh feat responsive-ui ui "refine dashboard layout and enforce rounded-md"
  ```
  *(Skrip akan otomatis menjalankan verifikasi tipe & build, membuat branch baru, membuat conventional commit, dan melakukan push ke remote GitHub).*

---

<div align="center">
  <sub>Dikembangkan dengan standar rekayasa perangkat lunak modern untuk kolaborasi tim dan evaluasi akademik.</sub>
</div>
