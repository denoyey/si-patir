<div align="center">

# 🚀 SI-PATIR
### **Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (DevOps Lite)**

Platform automasi dan monitoring terpadu yang menghubungkan alur kerja **GitHub Webhook**, notifikasi **Discord Webhook**, dan **State Engine Tugas** ke dalam satu dashboard rekayasa berbasis **WebSocket Real-time** dan basis data **MySQL**.

[![Version](https://img.shields.io/badge/Release-v2.2.0-6366F1?style=flat-square&logo=git&logoColor=white)](https://github.com/denoyey/si-patir/releases/tag/v2.2.0)
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
7. [Cara Menjalankan Sistem & Perintah CLI (Running Commands)](#-7-cara-menjalankan-sistem--perintah-cli-running-commands)
8. [Skenario Demo 30 Detik (Untuk Evaluasi Dosen/Penguji)](#-8-skenario-demo-30-detik-untuk-evaluasi-dosenpenguji)
9. [Struktur Folder Proyek](#-9-struktur-folder-proyek)
10. [Dokumentasi PRD & Standar Kontribusi Git](#-10-dokumentasi-prd--standar-kontribusi-git)
11. [Tim Pengembang & Pembagian Tugas (Jobdesk)](#-11-tim-pengembang--pembagian-tugas-jobdesk)

---

## 💡 1. Latar Belakang & Masalah

Dalam pengerjaan proyek perangkat lunak kolaboratif (tim/kelompok), sering terjadi kendala:
* **Status Tugas Terbengkalai**: Developer telah menyelesaikan fitur dan melakukan `git push`, namun lupa memperbarui status tugas proyek di sistem pelacakan.
* **Sindrom Numpang Nama (*Free-Rider*)**: Sulit melihat kontribusi riil commit dan tugas selesai per anggota secara transparan.
* **Komunikasi Asinkron yang Lambat**: Anggota tim lain tidak segera mengetahui saat ada modul fundamental yang sudah selesai diintegrasikan.

**Solusi SI-PATIR:**  
Cukup tambahkan tag kode tugas pada pesan commit Git (contoh: `git commit -m "Selesai halaman login [done #TASK-02]"`), sistem akan secara otomatis memutakhirkan status tugas ke kolom **Done** di basis data MySQL, mengirim bukti commit ke grup **Discord**, dan memperbarui **Dashboard** secara real-time.

---

## 🔄 2. Alur Integrasi Sistem

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
│  - Task State Engine & Mutasi Status Tugas             │
│  - Penyimpanan Persisten Relasional MySQL              │
└────────┬───────────────────────┬───────────────────────┘
         │                       │
         ▼ (2. Task State Engine)▼ (3. Outbound Notification)
┌──────────────────┐    ┌──────────────────┐
│  DATABASE MYSQL  │    │ DISCORD WEBHOOK  │
│- Status tugas    │    │- Kirim notifikasi│
│  Done di MySQL   │    │  Rich Embed hijau│
│- Audit log hash  │    │- Link commit Git │
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

* **Terminal Web Git Terintegrasi (Langsung di Web)**: Eksekusi commit langsung dari dashboard web tanpa perlu membuka terminal laptop/OS; dilengkapi tombol pintas tugas cepat (`#TASK-02` s/d `#TASK-05`) dan pemilih kontributor aktif yang langsung memperbarui status tugas di database & notifikasi Discord serta menyiarkan log stream.
* **Konfigurasi Profil Proyek Dinamis & Multi-Repo Workspace**: Fleksibilitas pemantauan multi-proyek dan repositori GitHub berbeda tanpa hardcode. Pengguna dapat beralih atau mendaftarkan profil proyek baru secara live di mana setiap repositori memiliki konfigurasi terisolasi untuk kanal notifikasi Discord masing-masing agar data tidak saling tumpang tindih (*anti cross-pollution*).
* **REST API v1 Modular & Interactive API & Security Explorer (`/docs`)**: Arsitektur API modular (`/api/v1/tasks`, `/api/v1/members`, `/api/v1/webhooks`, `/api/v1/system`) dengan portal dokumentasi dan laboratorium keamanan siber interaktif yang **100% responsif dan full support iPhone (iOS Safari)**: Safe Area Insets (`viewport-fit=cover`), live request runner, verifikasi HMAC, simulasi rate limiting, dan copy cURL instan.
* **Tabel Tugas Gaya Filament v5**: Data table kartu tugas modern dengan pagination dinamis (navigasi nomor halaman aktif, pemilih 5/10/25/50 baris per halaman), pencarian teks instan, filter status (*To Do*, *In Progress*, *Done*), serta filter per developer dari klasemen.
* **Sinkronisasi Riwayat Commit Asli GitHub ke Stream**: Riwayat commit asli repositori GitHub otomatis diimpor ke basis data `activity_logs`, memastikan live audit stream selalu berisi data riil dan memadukan commit historis dengan event live webhook.
* **Automasi DevOps Bebas Repot**: Tidak perlu membuka aplikasi pelacak secara manual untuk memperbarui kartu tugas; cukup commit dengan tag tugas (misal: `[done #TASK-02]`).
* **Interactive Landing Page & Architecture Showcase**: Halaman beranda visual yang menjelaskan alur kerja 3-sistem, demonstrasi pipeline, kartu teknologi, dan profil pengembang.
* **Sistem Pengalih Tema Cerdas (System OS, Light, Dark)**: Mendeteksi preferensi tema OS secara otomatis, didukung toggle manual, tersimpan secara persisten di `localStorage`, serta memenuhi standar rasio kontras WCAG AA.
* **Lenis Smooth Scroll & Navigation Restoration**: Pengalaman gulir halaman ultra-mulus berbasis OOP matematika eksponensial dengan isolasi native pada tabel/modal, tombol *Back to Top* melayang, dan reset posisi scroll otomatis ke puncak saat berpindah halaman.
* **Papan Klasemen Kontribusi Transparan**: Memantau peringkat developer berdasarkan jumlah commit dan tugas selesai secara objektif dengan avatar asli dan link profil GitHub.
* **Live Webhook Audit Stream**: Terminal monitoring interaktif berbasis WebSocket (`Socket.io`) untuk memantau sinyal commit secara detik-per-detik lengkap dengan tombol salin perintah terminal cepat.
* **Dual-Tier Resilient Storage**: Didukung penuh oleh basis data relasional **MySQL** dengan sistem **In-Memory Fallback otomatis** (sistem tetap jalan lancar tanpa crash meskipun server MySQL lokal sedang offline).
* **Pure Human Engineering UI (Anti-AI Slop)**: Desain antarmuka profesional bertaraf Linear/GitHub Actions: palet Zinc/Slate, standar radius `rounded-md` & `rounded-lg`, kontainer lebar `max-w-7xl`, custom modal dialog konfirmasi tanpa blur (`ConfirmDialog.tsx`), dan nol gradasi sintetis.
* **Dukungan Responsif 100% Seluruh Perangkat & iPhone**: Kompatibel dari monitor Ultrawide 4K hingga seluruh varian iPhone (penanganan *Dynamic Island*, *Notch*, dan *Safe Area Insets*).
* **Dukungan Multi-Platform Penuh (Linux, macOS & Windows Native)**: Seluruh orkestrasi startup (`start.sh` & `start.bat`), auto-push (`auto-git-push.sh` & `.bat`), dan pembersihan branch (`clean-merged-branches.sh` & `.bat`) berjalan mulus di semua OS tim.
* **5-Tier Conflict-Proof & Rebase Safety Automation Engine**: Mencegah insiden Git desinkronisasi: penarikan branch dasar segar dari `origin/main`, rebase linear sebelum push, dan pembatalan otomatis (`git rebase --abort`) jika terdeteksi bentrok kode agar repositori lokal tidak pernah rusak.
* **Pembersihan Branch Otomatis (`npm run clean:branches`)**: Menjaga kebersihan repositori jangka panjang dengan menghapus branch lokal dan remote yang telah di-merge ke `origin/main`.
* **OWASP Hardened Security**: Kebal dari Timing Attacks via `crypto.timingSafeEqual`, Helmet CSP compliant (`script-src-attr 'unsafe-inline'`), bebas SQL Injection berkat Parameterized Queries, anti-ReDoS, dan perlindungan DoS via rate limiting bertingkat & pembatasan payload 100kb.

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

# GitHub Webhook Secret (Opsional untuk verifikasi HMAC signature)
GITHUB_WEBHOOK_SECRET=sipatir_secret_123
```

> 💡 **Tips Pengujian Offline / Tanpa API**:  
> Jika kredensial Discord belum Anda isi, backend secara otomatis beralih ke **Mode Simulasi Mandiri** sehingga seluruh fitur dashboard dan database tetap dapat didemonstrasikan dengan sempurna.

---

## 🚀 7. Cara Menjalankan Sistem & Perintah CLI (Running Commands)

SI-PATIR mendukung dua metode eksekusi: **Skrip Otomatis Satu-Klik (*One-Click*)** dengan fitur pembersih bentrok port otomatis, serta **Perintah CLI Standar (`npm run`)**.

### A. Metode Satu-Klik (Rekomendasi Utama)
Skrip otomatis mendeteksi dan mematikan proses lama di port `5000` dan `3000`, menginisialisasi `.env`, menginstal dependensi jika belum ada, lalu menjalankan backend dan frontend sekaligus.

* **Di Linux / macOS**:
  ```bash
  ./start.sh
  # atau
  npm start
  ```
  *(Tekan `Ctrl + C` kapan saja untuk mematikan kedua service secara bersih)*

* **Di Windows**:
  Cukup klik ganda (*double-click*) file:
  ```cmd
  start.bat
  ```
  *(Skrip otomatis membersihkan port lama, menjalankan backend & frontend, lalu membuka browser ke `http://localhost:3000`)*

---

### B. Perintah NPM CLI (Root Workspace)
Tersedia perintah ringkas dari root folder untuk kebutuhan operasional developer:

| Perintah | Deskripsi & Kegunaan |
| :------- | :------------------- |
| `npm start` atau `npm run dev` | Menjalankan seluruh sistem (Backend & Frontend) via `start.sh` dengan auto-kill port |
| `npm run dev:backend` | Menjalankan server backend secara mandiri (`tsx watch` di port 5000) |
| `npm run dev:frontend` | Menjalankan dev server frontend secara mandiri (Vite di port 3000) |
| `npm run build` | Melakukan build produksi lengkap (TypeScript compile backend & Vite bundle frontend) |
| `npm run typecheck` | Menjalankan validasi tipe TypeScript (`tsc --noEmit`) pada backend dan frontend |
| `npm run lint` | Menjalankan audit linter cepat (`oxlint`) pada kode sumber frontend |
| `npm run clean:branches` | Membersihkan branch lokal & remote yang sudah selesai di-merge ke `main` secara otomatis |
| `npm run tunnel` | Menjalankan public HTTPS tunnel (LocalTunnel / Cloudflare) agar webhook GitHub.com terhubung ke localhost:5000 |

---

### C. Utilitas Skrip Pengembang (`scripts/`)

Mendukung eksekusi lintas sistem operasi secara penuh (**Linux, macOS, dan Windows CMD / PowerShell / Git Bash**):

| Utilitas | Linux / macOS | Windows (CMD / PowerShell) | Deskripsi |
| :------- | :------------ | :------------------------- | :-------- |
| **Public Webhook Tunnel** | `./scripts/setup-public-tunnel.sh` (atau `npm run tunnel`) | `scripts\setup-public-tunnel.bat` (atau `npm run tunnel`) | Membuka public HTTPS URL ke port 5000 untuk pendaftaran webhook di GitHub.com |
| **Auto Git Push** | `./scripts/auto-git-push.sh feat my-feat ui "msg"` | `scripts\auto-git-push.bat feat my-feat ui "msg"` | Quality gate otomatis (typecheck + build), checkout branch, commit conventional, dan push ke GitHub |
| **Clean Merged Branches** | `./scripts/clean-merged-branches.sh` (atau `npm run clean:branches`) | `scripts\clean-merged-branches.bat` (atau `npm run clean:branches`) | Menghapus branch lokal & remote yang sudah di-merge ke `main` agar repo tetap bersih |
| **Setup Local Git Hook** | `./scripts/setup-local-git-hook.sh /path/repo` | `./scripts/setup-local-git-hook.sh /path/repo` (Git Bash) | Memasang post-commit hook lokal agar commit otomatis memicu webhook SI-PATIR |

---

## 🎯 8. Skenario Demo 30 Detik (Untuk Evaluasi Dosen/Penguji)

Gunakan skenario cepat ini untuk membuktikan integrasi nyata di hadapan penilai:

1. **Buka Dashboard**: Akses `http://localhost:3000`. Tunjukkan status indikator hijau `GitHub: Ready 🟢`, `Discord: Active 🟢`, `MySQL: Connected 🟢`, `WebSocket: Live 🟢`.
2. **Pilih Tugas Target**: Tunjukkan pada tabel Filament bahwa tugas **`[#TASK-02] Integrasi Basis Data & Task State Engine`** masih berstatus **`In Progress`**.
3. **Picukan Automasi**:
   * **Opsi A (Terminal Web Git Langsung di Web)**: Pada panel bawah *Terminal Web Git* di dashboard, klik chip tugas **`#TASK-02`**, pilih penguji (misal: `@denoyey`), lalu klik tombol hijau **`Kirim 🚀`**.
   * **Opsi B (Terminal Laptop / Git Asli)**: Di terminal repo Git lokal Anda, ketik:
     ```bash
     git commit -m "Selesai modul login auth [done #TASK-02]"
     ```
4. **Perhatikan Respons Seketika (1–2 Detik)**:
   * Status tugas `#TASK-02` di layar langsung berubah menjadi hijau **`Done`**.
   * Di database MySQL, record tugas otomatis termutasi menjadi *Done* dan terekam di log audit.
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
│   │   ├── services/                # Discord, Security, GitHub & Commit Parser Services
│   │   ├── middlewares/             # Helmet, Dual-tier RateLimiter, CORS, Error Sanitizer
│   │   ├── controllers/             # Webhook, Task, Member & System Controllers
│   │   ├── Application.ts           # Application Gateway & Socket.io Lifecycle
│   │   └── server.ts                # Bootstrap Server Entry Point
│   ├── .env.example
│   └── package.json
├── frontend/                        # React 19 + Vite 8 + Tailwind CSS v4 (Pure Human Engineering)
│   ├── src/
│   │   ├── animations/              # GSAP Animation Engine OOP & reactive hooks
│   │   ├── components/              # ThemeSwitcher, BackToTop, ExpandableDescription
│   │   ├── context/                 # ThemeContext (System, Light, Dark)
│   │   ├── pages/                   # LandingPage & DashboardPage
│   │   ├── services/scroll/         # LenisScrollEngine OOP, contracts & smart navbar hooks
│   │   ├── App.tsx                  # Client router & pre-paint scroll restoration
│   │   ├── main.tsx                 # Root bootstrap & manual scroll restoration setup
│   │   └── index.css                # Styling token & Safe Area Inset iPhone
│   └── package.json
├── scripts/
│   ├── setup-local-git-hook.sh      # Skrip pemasang Git hook lokal (tanpa tunnel)
│   ├── auto-git-push.sh             # Skrip otomatis branch feature & Conventional Commits (Linux/macOS)
│   ├── auto-git-push.bat            # Skrip otomatis branch feature & Conventional Commits (Windows CMD/PowerShell)
│   ├── clean-merged-branches.sh     # Skrip pembersih branch usang yang sudah selesai di-merge (Linux/macOS)
│   └── clean-merged-branches.bat    # Skrip pembersih branch usang yang sudah selesai di-merge (Windows)
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
* 📑 [Team Roadmap: Analisis Gap & Pembagian Tugas Anggota](docs/ANALISIS-DAN-PEMBAGIAN-TUGAS-TIM.md)

### Alur Kerja Git Developer (*Best Practices*):
* **Dilarang push langsung ke branch `main`**. Selalu buat branch fitur terpisah: `feat/<nama-fitur>`, `fix/<nama-bug>`, atau `docs/<topik>`.
* Gunakan standar pesan commit **Conventional Commits v1.0.0**: `<type>(<scope>): <pesan deskriptif>`.
* Seluruh anggota tim (Deni, Rafli, Fatir, Fajri) dapat menggunakan skrip otomatis multi-platform:
  * **Di Linux / macOS / Git Bash**:
    ```bash
    ./scripts/auto-git-push.sh feat responsive-ui ui "refine dashboard layout and enforce rounded-md"
    ```
  * **Di Windows (Command Prompt / PowerShell)**:
    ```cmd
    scripts\auto-git-push.bat feat responsive-ui ui "refine dashboard layout and enforce rounded-md"
    ```
  *(Skrip akan otomatis menjalankan verifikasi tipe & build produksi, membuat branch baru jika belum ada, membuat conventional commit, dan melakukan push ke GitHub remote).*

#### 🛡️ Mekanisme Proteksi Anti-Conflict & Rebase Safety
Untuk mencegah terjadinya *merge conflict*, commit tertinggal (*divergent history*), atau kerusakan repositori lokal saat beberapa pengembang bekerja bersamaan, sistem otomasi SI-PATIR dilengkapi 5 lapis pengaman:
1. **Penyelarasan Metadata (`git fetch origin --prune`)**: Dijalankan di awal setiap proses agar referensi remote selalu *up-to-date*.
2. **Fresh Base Guarantee**: Jika membuat branch fitur baru saat berada di `main`, skrip secara otomatis menarik `origin/main` terbaru (*fast-forward*) terlebih dahulu sehingga branch fitur tidak pernah dibuat dari commit usang.
3. **Smart Branch Resolution**: Jika branch fitur sudah dibuat oleh rekan tim di GitHub (misal: Rafli atau Fatir), skrip otomatis mengaitkan (*track*) remote branch tersebut tanpa membuat branch terpisah.
4. **Rebase Sinkronisasi Otomatis**: Jika branch remote memiliki commit baru, skrip menjalankan `git pull --rebase origin <branch>` sebelum push untuk menghasilkan riwayat Git linear yang rapi tanpa commit merge yang berantakan.
5. **Auto-Abort saat Terjadi Konflik Konten**: Jika commit rekan tim bentrok pada baris kode yang sama, skrip mendeteksi kegagalan dan **seketika mengeksekusi `git rebase --abort`** agar workspace lokal kembali bersih dan aman (tidak tertinggal dalam mode interaktif rebase yang membingungkan), lalu memberikan petunjuk resolusi manual yang jelas.
6. **Proteksi Pembersihan Branch (`clean-merged-branches`)**: Memvalidasi bahwa tidak ada perubahan file yang belum di-commit (`uncommitted changes`) sebelum berpindah ke `main`, memvalidasi status merge terhadap `origin/main`, dan menekan error jika branch remote sudah otomatis dihapus oleh GitHub.

---

## 👥 11. Tim Pengembang & Pembagian Tugas (Jobdesk)

Proyek **SI-PATIR** (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori*) dikembangkan secara kolaboratif oleh empat pengembang dengan pembagian peran dan spesialisasi tugas yang terstruktur untuk memastikan integrasi sistem, kehandalan basis data, keamanan siber, dan kualitas antarmuka pengguna berada pada standar rekayasa kelas industri.

### Struktur Tim & Pembagian Peran (Role Distribution)

```text
                            ┌───────────────────────────────┐
                            │          DENI (LEAD)          │
                            │  Lead Architect & DevOps      │
                            └───────────────┬───────────────┘
                                            │
            ┌───────────────────────────────┼───────────────────────────────┐
            ▼                               ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│         RAFLI         │       │         FATIR         │       │         FAJRI         │
│  Frontend & Analytics │       │ Database & Integrator │       │ QA, Testing & Docs    │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

| No | Pengembang | Peran & Badge | Tanggung Jawab & Jobdesk Utama | Tech Stack & Fokus |
|:--:|:-----------|:--------------|:-------------------------------|:-------------------|
| **1** | **Deni**<br>[@denoyey](https://github.com/denoyey) | `Project Lead`<br>`Lead Architect & DevOps Integrator` | • Memimpin arsitektur gateway SI-PATIR, REST API v1 modular, serta isolasi Multi-Repo Workspace (`/api/v1/projects`).<br>• Merancang Webhook Ingestion Pipeline, engine Terminal Web Git, & verifikasi kriptografi HMAC SHA-256 (`crypto.timingSafeEqual`).<br>• Membangun Portal Dokumentasi REST API & Laboratorium Keamanan Siber (`/docs`) responsif multi-device serta stream progresif & modal riwayat log (`ActivityLogsModal.tsx`).<br>• Mengonfigurasi WebSocket real-time server, sinkronisasi commit historis GitHub, & format waktu log bahasa Indonesia.<br>• Membangun public HTTPS webhook tunnel (`npm run tunnel`), CI/CD GitHub Actions (`.github/workflows/ci.yml`), serta otomasi branch governance (`auto-git-push` & `clean-merged-branches`). | `Node.js`, `Express`, `TypeScript`, `WebSocket`, `Multi-Repo`, `CI/CD`, `HMAC Security` |
| **2** | **Rafli**<br>[@muhamadrafli16](https://github.com/muhamadrafli16) | `UI/UX Specialist`<br>`Frontend UI & Data Visualization Engineer` | • Merancang arsitektur antarmuka dashboard modern & landing page interaktif.<br>• Mengembangkan tabel tugas Filament v5 dengan pagination dinamis & filter kontributor.<br>• Membangun Terminal Web Git interaktif langsung di web browser.<br>• Menjamin responsivitas 100% di seluruh perangkat (desktop, tablet, hingga seluruh varian iPhone).<br>• Mengintegrasikan Lenis Smooth Scroll OOP engine & Theme Switcher cerdas.<br>• Membangun visualisasi grafik analitik presisi tinggi (Commit Bar Chart & Donut Chart), modal edit tugas terintegrasi database, ekspor laporan sprint (CSV/PDF), dan filter pencarian panel stream. | `React 19`, `Tailwind CSS v4`, `GSAP`, `Lenis Scroll`, `Filament UI`, `SVG Analytics` |
| **3** | **Fatir**<br>[@Patirparkerr](https://github.com/Patirparkerr) | `Integrations Lead`<br>`Integrations Lead & Database Engineer` | • Merancang dan memelihara skema basis data relasional MySQL lokal dan in-memory fallback.<br>• Mengimplementasikan state machine status tugas internal terintegrasi commit parser.<br>• Mengembangkan seeder 4 anggota tim resmi, sinkronisasi data riil GitHub, dan otomasi pembersihan data dummy.<br>• Mengintegrasikan notifikasi outbound Discord Webhook dengan format rich embed.<br>• Mengotomasi backup basis data cross-platform (script .sh/.bat) dan optimasi indeks query komposit. | `MySQL2`, `Database Design`, `State Engine`, `Discord Webhook`, `Backup Script` |
| **4** | **Fajri**<br>[@AATTTRAWRRR](https://github.com/AATTTRAWRRR) | `QA & Security`<br>`QA, Security Testing & Academic Documentation` | • Menyusun automated unit testing Vitest (28 skenario pengujian 100% lolos).<br>• Mengembangkan simulator uji penetrasi keamanan & rate limiter flooding (35 req 429) di portal `/docs`.<br>• Menguji batas ukuran payload (100kb anti-JSON bomb) dan verifikasi anti-SQL Injection.<br>• Menyusun panduan tanya jawab kritis sidang akademik dan naskah runbook demo live 30 detik. | `Vitest Suite`, `Rate Limiting`, `Penetration Testing`, `Security Lab`, `Academic Defense` |

---

### 📊 Matriks Status Kebutuhan Proyek (Project Gap Matrix)

| No | Modul / Kebutuhan | Kondisi Saat Ini | Status | Penanggung Jawab |
| :--- | :--- | :--- | :---: | :---: |
| 1 | **Database & Task State Engine** | Skema MySQL aktif, in-memory fallback siap, mutasi status tugas via commit berfungsi 100%. | **SELESAI (DONE)** ✅ | Fatir |
| 2 | **Pendaftaran Akun Anggota Nyata** | 4 akun GitHub resmi (`@denoyey`, `@muhamadrafli16`, `@Patirparkerr`, `@AATTTRAWRRR`) tersinkron ke MySQL & klasemen. | **SELESAI (DONE)** ✅ | Fatir & Deni |
| 3 | **REST API v1 & Portal Dokumentasi & Security** | Endpoint modular v1 aktif, portal `/docs` interaktif dengan test runner & security lab. | **SELESAI (DONE)** ✅ | Deni |
| 4 | **Terminal Web Git di Dashboard** | Terminal langsung di web tanpa perlu buka terminal OS/laptop, otomatis mutasi status tugas & catat riwayat. | **SELESAI (DONE)** ✅ | Rafli & Deni |
| 5 | **Sinkronisasi Commit GitHub ke Stream** | Riwayat commit asli GitHub otomatis diimpor ke stream live (`activity_logs`). | **SELESAI (DONE)** ✅ | Deni & Fatir |
| 6 | **Deployment Publik / Webhook Gateway (HTTPS URL)** | Skrip tunnel lintas platform aktif via `npm run tunnel` (LocalTunnel & Cloudflare), siap menghubungkan webhook GitHub.com ke backend lokal. | **SELESAI (DONE)** ✅ | Deni |
| 7 | **CI/CD Pipeline (GitHub Actions)** | Workflow `.github/workflows/ci.yml` aktif memvalidasi `tsc --noEmit`, `oxlint`, Vite build, dan automated tests saat PR/push ke `main`. | **SELESAI (DONE)** ✅ | Deni |
| 8 | **Visualisasi Grafik Kontribusi (Analytics Chart)** | Tersedia diagram batang perbandingan commit & diagram donat status sprint berbasis SVG presisi tinggi. | **SELESAI (DONE)** ✅ | Rafli |
| 9 | **Modal Edit Tugas Lengkap** | Modal interaktif (`EditTaskModal.tsx`) terintegrasi tabel untuk mutasi judul, assignee, dan status dengan basis data MySQL. | **SELESAI (DONE)** ✅ | Rafli |
| 10 | **Export Laporan Sprint (PDF / CSV)** | Dukungan export CSV dengan UTF-8 BOM dan pencetakan PDF bersih via styling `@media print`. | **SELESAI (DONE)** ✅ | Rafli |
| 11 | **Automated Unit Testing (Vitest)** | 28 automated tests lulus 100% untuk CommitParserService, WebhookSecurityService, dan TaskStatusFlow. | **SELESAI (DONE)** ✅ | Fajri & Deni |
| 12 | **Security Penetration & Load Testing** | Simulator uji batas rate limiter (35 req 429), batas payload 100kb, dan anti-SQLi aktif di `/docs`. | **SELESAI (DONE)** ✅ | Fajri |
| 13 | **Panduan Akademik & Pertanyaan Sidang** | Panduan tanya jawab kritis sidang Pemrograman Integratif lengkap dengan analisis teknis di `/docs`. | **SELESAI (DONE)** ✅ | Fajri |
| 14 | **Slide Presentasi & Skenario Demo Dosen** | Naskah runbook demo live 30 detik alur end-to-end terintegrasi di web dashboard & dokumentasi. | **SELESAI (DONE)** ✅ | Fajri |
| 15 | **Konfigurasi Profil Proyek Dinamis & Multi-Repo** | Multi-repo terisolasi, modal switcher, per-project Discord webhook tanpa kebocoran secret. | **SELESAI (DONE)** ✅ | Deni & Rafli |

---

### 🌟 Rincian Checklist Pekerjaan per Anggota Tim

<details open>
<summary><b>1. Deni (@denoyey) — Project Lead & Lead Architect & DevOps Integrator</b></summary>

- **Peran**: Penanggung jawab teknis proyek, arsitektur backend gateway, keamanan sistem, CI/CD DevOps, serta penyempurnaan UX & aksesibilitas.
- **Checklist Pekerjaan**:
  - [x] **1.1 Arsitektur Backend Gateway REST API v1**:
    - Bangun Express 5 + TypeScript OOP dengan pemisahan Controller, Service, dan Repository.
    - Implementasikan routing modular `/api/v1/tasks`, `/api/v1/members`, `/api/v1/webhooks`, dan `/api/v1/system`.
  - [x] **1.2 Gateway Security Hardening & Rate Limiter**:
    - Pasang verifikasi signature HMAC SHA-256 konstan (`crypto.timingSafeEqual`) untuk validasi webhook GitHub.
    - Terapkan Helmet CSP header dengan konfigurasi `script-src-attr 'unsafe-inline'`.
    - Pasang Rate Limiter ketat (120 req/min general, 30 req/min webhook endpoint).
  - [x] **1.3 Portal Dokumentasi REST API & Lab Keamanan (`/docs`)**:
    - Bangun halaman dokumentasi dan lab keamanan interaktif dengan live test runner, uji HMAC, rate limiter flooding, dan cURL generator.
    - Buat tampilan 100% responsif multi-device dengan dukungan penuh iPhone (iOS notch, safe-area, anti-zoom).
  - [x] **1.4 Sinkronisasi Multi-Kontributor & Commit History GitHub**:
    - Buat service sinkronisasi kontributor nyata GitHub via API dan fallback `git shortlog`.
    - Sinkronisasikan riwayat commit repositori asli GitHub ke dalam tabel `activity_logs` stream.
  - [x] **1.5 Engine Terminal Web Git**:
    - Sediakan controller dan handler webhook commit langsung dari web browser.
  - [x] **1.6 Skrip Otomasi Git & Keamanan Branch**:
    - Rancang skrip `auto-git-push` lintas platform (Linux `.sh` & Windows `.bat`) dengan auto pre-push quality gate.
    - Buat skrip pembersih branch usang `clean-merged-branches`.
  - [x] **1.7 Setup Public Webhook Gateway (Cloudflare Tunnel / LocalTunnel)**:
    - Bangun skrip tunnel otomatis lintas platform (`scripts/setup-public-tunnel.sh` & `.bat`) dan perintah `npm run tunnel`.
    - Hubungkan backend lokal port 5000 ke domain publik HTTPS agar webhook GitHub.com di internet dapat menembak server secara riil.
  - [x] **1.8 Arsitektur Backend Multi-Repo & Dynamic Project Configuration Gateway**:
    - Rancang entitas `IProject` dan migrasi tabel `projects` di MySQL dengan fallback in-memory serta isolasi per-proyek (*anti cross-pollution*).
    - Implementasikan REST API modular `/api/v1/projects` dengan alias `/api/projects`.
  - [x] **1.9 Setup CI/CD Pipeline (GitHub Actions)**:
    - Buat berkas `.github/workflows/ci.yml` yang otomatis menjalankan:
      1. Backend `tsc --noEmit` & `npm run build`
      2. Frontend `oxlint`, `tsc --noEmit`, & `npm run build`
      3. Automated test gate (`npm test --if-present`) pada setiap Pull Request & push ke branch `main`.
  - [x] **1.10 Penyempurnaan UX, Aksesibilitas Form & Stream Progresif**:
    - Pisahkan card *Aktivitas Webhook* & *Terminal Git*, terapkan stream progresif (5 log awal + `Muat lebih banyak` + modal riwayat `ActivityLogsModal.tsx`) dengan format hari singkat Indonesia (`Sel, 19:14`).
    - Terapkan `useBodyScrollLock` + `overscroll-contain` pada seluruh modal overlay hitam solid, penomoran `id`/`name` seluruh input form, paginasi ringkas, dan hierarki klasemen tim yang setara.
  - [x] **1.11 Code Review & Integrasi Sistem End-to-End**:
    - Validasi seluruh integrasi modul tim dan verifikasi 28 unit tests Vitest tanpa error sebelum rilis ke branch `main`.
- **Berkas Kerja Utama**:
  - `backend/src/Application.ts`
  - `backend/src/controllers/WebhookController.ts`
  - `backend/src/controllers/ProjectController.ts`
  - `backend/src/database/repositories/ProjectRepository.ts`
  - `backend/src/docs/renderApiDocsHtml.ts`
  - `backend/src/services/GitHubIntegrationService.ts`
  - `backend/src/middlewares/SecurityMiddleware.ts`
  - `frontend/src/components/ActivityLogsModal.tsx`
  - `frontend/src/components/ActivityLogItem.tsx`
  - `frontend/src/utils/logFormatters.ts`
  - `frontend/src/services/scroll/hooks/useBodyScrollLock.ts`
  - `scripts/setup-public-tunnel.sh` & `.bat`
  - `scripts/auto-git-push.sh` & `.bat`
  - `.github/workflows/ci.yml`
</details>

<details open>
<summary><b>2. Rafli (@muhamadrafli16) — UI/UX Specialist & Frontend UI Engineer</b></summary>

- **Peran**: Perancang dan pengembang pengalaman pengguna, antarmuka dashboard, dan visualisasi data analitik.
- **Checklist Pekerjaan**:
  - [x] **2.1 Desain Dashboard Interaktif & Landing Page**:
    - Rancang Landing Page informatif dengan showcase tim, diagram integrasi 3-sistem, dan kartu fitur.
    - Terapkan kontainer modern `max-w-7xl` dengan ritme layout seragam dan tipografi Poppins.
  - [x] **2.2 Data Table Kartu Tugas Gaya Filament v5**:
    - Implementasikan tabel daftar tugas Filament v5 dengan pagination dinamis (navigasi halaman, pemilih jumlah baris 5/10/25/50).
    - Tambahkan fitur pencarian cepat tugas (#TASK, judul, assignee) dan filter status (*To Do*, *In Progress*, *Done*).
    - Terapkan filter tugas berdasarkan kontributor yang dipilih dari klasemen.
  - [x] **2.3 Komponen Terminal Web Git di Dashboard**:
    - Buat antarmuka terminal langsung di web dengan prompt `@author $ git commit ...`.
    - Pasang chip pemilih kontributor aktif (`@denoyey`, `@Patirparkerr`, `@muhamadrafli16`, `@AATTTRAWRRR`).
    - Sediakan chip pintasan tugas cepat (`#TASK-02` s/d `#TASK-05`) yang otomatis mengisi pesan commit.
  - [x] **2.4 Theme Switcher & Navigasi Mulus**:
    - Integrasikan Theme Switcher 3-mode (`System`, `Light`, `Dark`) dengan persistensi `localStorage`.
    - Terapkan Lenis Smooth Scroll dan tombol Back to Top dinamis.
  - [x] **2.5 Custom Dialog Konfirmasi & Toast Notifikasi**:
    - Buat komponen modal dialog konfirmasi kustom tanpa blur (`ConfirmDialog.tsx`).
    - Pasang notifikasi toast real-time yang menangani event tugas selesai, pembaruan status, commit, dan pembaruan database.
  - [x] **2.6 Visualisasi Grafik Analitik Kontribusi (Analytics Chart)**:
    - Pasang visualisasi chart SVG presisi tinggi pada dashboard.
    - Tampilkan diagram batang perbandingan jumlah commit per anggota tim.
    - Tampilkan diagram donat (*donut chart*) persentase penyelesaian tugas sprint (*To Do*, *In Progress*, *Done*).
  - [x] **2.7 Modal Edit Tugas Interaktif**:
    - Buat modal **Edit Tugas**: memungkinkan pengguna mengubah judul tugas, status, atau mengubah assignee developer langsung dari antarmuka web.
  - [x] **2.8 Fitur Export Laporan Sprint (PDF & CSV)**:
    - Tombol **Export CSV**: menghasilkan berkas `laporan-sprint-sipatir.csv` berisi rekap tugas, penanggung jawab, status, dan riwayat commit.
    - Opsi **Print / Export PDF**: styling `@media print` agar tampilan dashboard dapat dicetak bersih ke format PDF untuk diserahkan ke dosen pembimbing.
  - [x] **2.9 Fitur Pencarian & Filter pada Panel Stream**:
    - Tambahkan kotak filter teks dan filter berdasarkan author pada panel *Live Webhook Stream*.
- **Berkas Kerja Utama**:
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/LandingPage.tsx`
  - `frontend/src/components/ThemeSwitcher.tsx`
  - `frontend/src/components/ConfirmDialog.tsx`
  - `frontend/src/components/EditTaskModal.tsx`
  - `frontend/src/components/ContributionChart.tsx`
</details>

<details open>
<summary><b>3. Fatir (@Patirparkerr) — Integrations Lead & Database Engineer</b></summary>

- **Peran**: Perancangan basis data MySQL, implementasi state machine status tugas, dan integrasi webhook pipeline.
- **Checklist Pekerjaan**:
  - [x] **3.1 Perancangan Skema Database Relasional MySQL**:
    - Rancang dan pelihara skema tabel `members`, `tasks`, `projects`, dan `activity_logs` di `DatabaseService.ts`.
    - Terapkan indexing optimal (`idx_commits`, `idx_task_code`, `idx_created`) untuk performa tinggi.
  - [x] **3.2 In-Memory Fallback Subsystem**:
    - Bangun mekanisme fallback memori aktif agar aplikasi tetap berjalan 100% mulus saat database MySQL offline.
  - [x] **3.3 Task State Engine & Status Lifecycle**:
    - Bangun state machine transisi status tugas (`To Do` ➔ `In Progress` ➔ `Done`).
    - Integrasikan mutasi status tugas secara otomatis saat webhook commit Git diterima.
  - [x] **3.4 Database Seeder Kolaborator Resmi & Pembersihan Data Dummy**:
    - Daftarkan 4 anggota tim resmi (`@denoyey`, `@muhamadrafli16`, `@Patirparkerr`, `@AATTTRAWRRR`) ke database dengan statistik commit riil GitHub.
    - Bersihkan seluruh akun dummy bawaan dan sediakan otomasi pembersihan data dummy pada controller & repository.
  - [x] **3.5 Outbound Webhook Dispatcher (Discord Rich Embed)**:
    - Hubungkan pembaruan status tugas dengan pengiriman pesan embed kaya ke kanal Discord secara otomatis.
  - [x] **3.6 Sinkronisasi Status & Recalculate Stats**:
    - Hubungkan pembaruan status tugas dengan perhitungan metrik kontributor (`tasks_done`) secara real-time.
  - [x] **3.7 Database Backup & Maintenance Script**:
    - Buat script otomatisasi backup dump basis data MySQL (`backup_db.sh` / `backup_db.bat` / `backup_helper.js`).
    - Lakukan tuning indeks query untuk performa pencatatan ribuan log aktivitas.
- **Berkas Kerja Utama**:
  - `backend/src/controllers/TaskController.ts`
  - `backend/src/database/DatabaseService.ts`
  - `backend/src/database/repositories/TaskRepository.ts`
  - `backend/src/database/repositories/MemberRepository.ts`
  - `backend/src/database/repositories/ActivityLogRepository.ts`
  - `backend/src/database/repositories/ProjectRepository.ts`
</details>

<details open>
<summary><b>4. Fajri (@AATTTRAWRRR) — QA, Security Testing & Academic Documentation</b></summary>

- **Peran**: Pengujian otomatis (QA), security testing, dokumentasi akademik formal, dan runbook demonstrasi.
- **Checklist Pekerjaan**:
  - [x] **4.1 Verifikasi Quality Gate Pre-Push**:
    - Pastikan setiap proses commit dan push diverifikasi otomatis oleh compiler TypeScript (`tsc`) dan build frontend (`vite build`).
  - [x] **4.2 Audit Keamanan Gateway & Header**:
    - Uji kepatuhan header CSP Helmet dan pastikan tidak ada kebocoran stack trace error pada production mode.
  - [x] **4.3 Pengujian Alur Webhook Nyata**:
    - Validasi alur pengiriman pesan Discord dan mutasi status tugas saat webhook dijalankan.
  - [x] **4.4 Automated Unit Testing Suite (Vitest)**:
    - Pengujian otomatis pada folder `backend/tests/` (28 unit tests passed):
      1. `CommitParserService.test.ts`: Uji parsing regex pesan commit (`[done #TASK-01]`, `fix: #TASK-02`, casing variatif).
      2. `WebhookSecurityService.test.ts`: Uji validasi HMAC SHA-256 (payload valid, signature palsu, payload tanpa header signature).
      3. `TaskStatusFlow.test.ts`: Uji transisi status tugas (*To Do* ➔ *In Progress* ➔ *Done*).
  - [x] **4.5 Uji Ketahanan Keamanan & Beban (Security & Load Testing)**:
    - Uji batas rate limiter: lakukan 35 request dalam 1 menit ke endpoint webhook dan buktikan sistem memblokir dengan HTTP `429 Too Many Requests`.
    - Uji batas payload (100kb anti-JSON bomb) dan uji keamanan input parameterized query (anti-SQL Injection).
    - Implementasikan simulator interaktif di portal `/docs` untuk demonstrasi langsung saat presentasi.
  - [x] **4.6 Penyusunan Panduan Akademik & Tanya Jawab Sidang**:
    - Menyusun materi tanya jawab kritis penguji sidang mata kuliah Pemrograman Integratif pada `/docs`:
      - Alasan pemilihan arsitektur Webhook vs Polling.
      - Mekanisme verifikasi identitas pengirim payload via HMAC SHA-256 (`crypto.timingSafeEqual`).
      - Mitigasi timing attack, SQL Injection, dan skema in-memory fallback saat MySQL offline.
  - [x] **4.7 Skenario Demonstrasi Live Sidang Dosen 30 Detik**:
    - Susun skenario runbook demo live: Langkah 1 (Cek tugas di tabel) ➔ Langkah 2 (Commit Git berformat tugas) ➔ Langkah 3 (Status tugas otomatis Done di database & dashboard) ➔ Langkah 4 (Notifikasi Discord dan Live Stream muncul seketika).
- **Berkas Kerja Utama**:
  - `backend/tests/CommitParserService.test.ts`
  - `backend/tests/WebhookSecurityService.test.ts`
  - `backend/tests/TaskStatusFlow.test.ts`
  - `docs/ANALISIS-DAN-PEMBAGIAN-TUGAS-TIM.md`
  - `docs/prd/*`
</details>

---

### 📅 Jadwal Sprint & Rencana Tindak Lanjut Tim (Sprint Action Plan)

```text
[ FASE 1: Core Foundation & Integrasi Sistem ] ──> STATUS: 100% SELESAI ✅
  ├─ Deni   : Backend Gateway REST API v1, Security Hardening, & Interactive API Docs Explorer
  ├─ Fatir  : Skema Database MySQL, Task State Engine, & Database Seeder 4 Anggota
  ├─ Rafli  : Frontend Dashboard React 19, Filament v5 Data Table, & Terminal Web Git
  └─ Fajri  : Quality Gate Pre-push & Validasi Alur Integrasi

[ FASE 2: Fitur Lanjutan, Visualisasi & Pengujian ] ──> STATUS: SEDANG BERJALAN ⏳
  ├─ Deni   : Setup Public Webhook Gateway (Cloudflare Tunnel / LocalTunnel) & CI/CD Actions [SELESAI ✅]
  ├─ Fatir  : Database Backup Script & Maintenance Query Optimization
  ├─ Rafli  : Grafik Analitik Kontribusi Tim, Modal Edit Tugas, & Export Laporan PDF/CSV [SELESAI ✅]
  └─ Fajri  : Automated Unit Testing (Vitest 28 Tests Passed) & Security/Load Testing Report [SELESAI ✅]

[ FASE 3: Penyusunan Laporan Akademik & Presentasi Demo ] ──> STATUS: MINGGU DEPAN 📅
  ├─ Fajri  : Penyusunan Dokumen Laporan Bab 1–5, Diagram UML & ERD, serta Slide Canva/PPT
  └─ Seluruh Tim: Gladi Bersih Demonstrasi Alur Integrasi (Git ➔ Database ➔ Discord ➔ Web)
```

---

<div align="center">
  <sub>Dikembangkan dengan standar rekayasa perangkat lunak modern untuk kolaborasi tim dan evaluasi akademik.</sub>
</div>
