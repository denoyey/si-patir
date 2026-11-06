<div align="center">

# 🚀 SI-PATIR
### **Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (DevOps Lite)**

Platform automasi dan monitoring terpadu yang menghubungkan alur kerja **GitHub Webhook**, **Trello Kanban API**, dan notifikasi **Discord Webhook** ke dalam satu dashboard rekayasa berbasis **WebSocket Real-time** dan basis data **MySQL**.

[![Version](https://img.shields.io/badge/Release-v2.0.0-6366F1?style=flat-square&logo=git&logoColor=white)](https://github.com/denoyey/si-patir/releases/tag/v2.0.0)
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

* **Automasi DevOps Bebas Repot**: Tidak perlu membuka web Trello secara manual untuk menggeser kartu kerja; cukup commit dengan tag tugas (misal: `[done #TASK-02]`).
* **Interactive Landing Page & Architecture Showcase**: Halaman beranda visual yang menjelaskan alur kerja 3-sistem, demonstrasi pipeline, kartu teknologi, dan profil pengembang.
* **Sistem Pengalih Tema Cerdas (System OS, Light, Dark)**: Mendeteksi preferensi tema OS secara otomatis, didukung toggle manual, tersimpan secara persisten di `localStorage`, serta memenuhi standar rasio kontras WCAG AA.
* **Lenis Smooth Scroll & Navigation Restoration**: Pengalaman gulir halaman ultra-mulus berbasis OOP matematika eksponensial dengan isolasi native pada tabel/modal, tombol *Back to Top* melayang, dan reset posisi scroll otomatis ke puncak saat berpindah halaman.
* **Papan Klasemen Kontribusi Transparan**: Memantau peringkat developer berdasarkan jumlah commit dan tugas selesai secara objektif dengan avatar asli dan link profil GitHub.
* **Live Webhook Audit Stream**: Terminal monitoring interaktif berbasis WebSocket (`Socket.io`) untuk memantau sinyal commit secara detik-per-detik lengkap dengan tombol salin perintah terminal cepat.
* **Dual-Tier Resilient Storage**: Didukung penuh oleh basis data relasional **MySQL** dengan sistem **In-Memory Fallback otomatis** (sistem tetap jalan lancar tanpa crash meskipun server MySQL lokal sedang offline).
* **Pure Human Engineering UI (Anti-AI Slop)**: Desain antarmuka profesional bertaraf Linear/GitHub Actions: palet Zinc/Slate, standar radius `rounded-md` & `rounded-lg`, kontainer lebar `max-w-7xl`, dan nol gradasi sintetis.
* **Dukungan Responsif 100% Seluruh Perangkat & iPhone**: Kompatibel dari monitor Ultrawide 4K hingga seluruh varian iPhone (penanganan *Dynamic Island*, *Notch*, dan *Safe Area Insets*).
* **Dukungan Multi-Platform Penuh (Linux, macOS & Windows Native)**: Seluruh orkestrasi startup (`start.sh` & `start.bat`), auto-push (`auto-git-push.sh` & `.bat`), dan pembersihan branch (`clean-merged-branches.sh` & `.bat`) berjalan mulus di semua OS tim.
* **5-Tier Conflict-Proof & Rebase Safety Automation Engine**: Mencegah insiden Git desinkronisasi: penarikan branch dasar segar dari `origin/main`, rebase linear sebelum push, dan pembatalan otomatis (`git rebase --abort`) jika terdeteksi bentrok kode agar repositori lokal tidak pernah rusak.
* **Pembersihan Branch Otomatis (`npm run clean:branches`)**: Menjaga kebersihan repositori jangka panjang dengan menghapus branch lokal dan remote yang telah di-merge ke `origin/main`.
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

---

### C. Utilitas Skrip Pengembang (`scripts/`)

Mendukung eksekusi lintas sistem operasi secara penuh (**Linux, macOS, dan Windows CMD / PowerShell / Git Bash**):

| Utilitas | Linux / macOS | Windows (CMD / PowerShell) | Deskripsi |
| :------- | :------------ | :------------------------- | :-------- |
| **Auto Git Push** | `./scripts/auto-git-push.sh feat my-feat ui "msg"` | `scripts\auto-git-push.bat feat my-feat ui "msg"` | Quality gate otomatis (typecheck + build), checkout branch, commit conventional, dan push ke GitHub |
| **Clean Merged Branches** | `./scripts/clean-merged-branches.sh` (atau `npm run clean:branches`) | `scripts\clean-merged-branches.bat` (atau `npm run clean:branches`) | Menghapus branch lokal & remote yang sudah di-merge ke `main` agar repo tetap bersih |
| **Setup Local Git Hook** | `./scripts/setup-local-git-hook.sh /path/repo` | `./scripts/setup-local-git-hook.sh /path/repo` (Git Bash) | Memasang post-commit hook lokal agar commit otomatis memicu webhook SI-PATIR |

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

Proyek **SI-PATIR** dikembangkan secara kolaboratif oleh empat pengembang dengan spesialisasi tugas yang terstruktur untuk memastikan integrasi sistem, kehandalan basis data, keamanan siber, dan kualitas antarmuka pengguna berada pada standar rekayasa kelas industri.

| No | Pengembang | Peran & Badge | Tanggung Jawab & Jobdesk Utama | Tech Stack & Fokus |
|:--:|:-----------|:--------------|:-------------------------------|:-------------------|
| **1** | **Deni**<br>[@denoyey](https://github.com/denoyey) | `Project Lead`<br>`Lead Architect & DevOps Integrator` | • Memimpin arsitektur terpadu gateway sistem SI-PATIR.<br>• Merancang Webhook Ingestion Pipeline & verifikasi kriptografi HMAC SHA-256 (`crypto.timingSafeEqual`).<br>• Mengonfigurasi WebSocket Socket.io server engine & dual-tier fallback memori.<br>• Otomasi skrip CI/CD deployment & environment orchestration. | `Node.js`, `Express`, `TypeScript`, `WebSocket`, `DevOps`, `HMAC Security` |
| **2** | **Rafli**<br>[@muhamadrafli16](https://github.com/muhamadrafli16) | `UI/UX Specialist`<br>`Frontend UI & Data Visualization Engineer` | • Merancang arsitektur antarmuka dashboard modern & landing page interaktif.<br>• Menjamin responsivitas 100% di seluruh perangkat (desktop, tablet, hingga seluruh varian iPhone).<br>• Mengintegrasikan Lenis Smooth Scroll OOP engine & mikro-animasi GSAP.<br>• Mengembangkan sistem deteksi tema otomatis (System OS, Light, Dark) & dark mode accessibility. | `React 19`, `Tailwind CSS v4`, `GSAP`, `Lenis Scroll`, `Responsive UI` |
| **3** | **Fatir**<br>[@Patirparkerr](https://github.com/Patirparkerr) | `Integrations Lead`<br>`Kanban Trello & Database Engineer` | • Mengintegrasikan Trello REST API untuk pemindahan kartu tugas otomatis (*In Progress* ➔ *Done*).<br>• Merancang dan memelihara skema basis data relasional MySQL lokal.<br>• Mengimplementasikan sinkronisasi status tugas real-time antara commit Git dan papan Kanban.<br>• Mengelola idempotensi update kartu & penanganan error REST API. | `Trello REST API`, `MySQL2`, `Database Design`, `RESTful API`, `Data Modeling` |
| **4** | **Fajri**<br>[@AATTTRAWRRR](https://github.com/AATTTRAWRRR) | `Quality & Docs`<br>`QA, Security Testing & Academic Documentation` | • Menyusun pengujian unit test otomatis dan audit keamanan endpoint webhook.<br>• Melakukan pengujian audit ketahanan terhadap rate limiting, ReDoS, dan serangan DoS.<br>• Merancang laporan akademik lengkap, diagram UML (Use Case, Sequence, Activity, Class).<br>• Verifikasi kompatibilitas lintas peramban (*cross-browser*) & kepatuhan aksesibilitas. | `Automated QA`, `Security Audit`, `UML Modeling`, `Technical Documentation` |

---

### 🌟 Detail Kontribusi & Jobdesk Spesifik per Anggota

<details open>
<summary><b>1. Deni (@denoyey) — Project Lead & Lead Architect & DevOps Integrator</b></summary>

- **Peran**: Penanggung jawab teknis proyek dan arsitektur backend.
- **Jobdesk Spesifik**:
  1. Mengembangkan gateway server Node.js/Express dengan arsitektur OOP (*Object-Oriented Programming*).
  2. Mengimplementasikan verifikasi HMAC SHA-256 waktu konstan (`crypto.timingSafeEqual`) untuk melindungi endpoint webhook dari serangan *timing attack*.
  3. Membangun middleware sanitasi ReDoS, pembatasan ukuran payload (100kb), dan rate limiter bertingkat.
  4. Merancang sistem dual-tier storage: sinkronisasi MySQL utama dengan *in-memory resilient fallback* otomatis saat MySQL offline.
  5. Mengonfigurasi WebSocket server (`Socket.io`) untuk penyiaran aktivitas real-time ke seluruh klien dashboard.
  6. Menyusun skrip orkestrasi otomatis `start.sh`, `start.bat`, `auto-git-push.sh`, `auto-git-push.bat`, `clean-merged-branches.sh`, dan `clean-merged-branches.bat` dengan sistem proteksi 5-lapis *Conflict-Proof & Rebase Safety*.
</details>

<details open>
<summary><b>2. Rafli (@muhamadrafli16) — UI/UX Specialist & Frontend UI Engineer</b></summary>

- **Peran**: Perancang dan pengembang pengalaman pengguna serta visualisasi data frontend.
- **Jobdesk Spesifik**:
  1. Merancang dan mengimplementasikan antarmuka Landing Page dan Dashboard Monitoring berbasis React 19 dan Tailwind CSS v4.
  2. Menerapkan filosofi *Pure Human Engineering UI* (standar token `rounded-md` untuk tombol/input/badge, `rounded-lg` untuk kartu/modal, kontainer `max-w-7xl`, palet Zinc/Slate).
  3. Mengembangkan engine scroll halus Lenis OOP (`LenisScrollEngine`) yang terisolasi cerdas pada kontainer tabel dan modal dialog, dilengkapi pemulihan otomatis posisi scroll (*route restoration*).
  4. Membangun sistem navigasi auto-hiding navbar yang responsif terhadap arah scroll pengguna di semua perangkat.
  5. Mengoptimalkan tampilan untuk seluruh varian iPhone (penanganan *Safe Area Insets*, *Dynamic Island*, dan *Notch*).
  6. Menjamin kontras warna sempurna dan transisi mulus pada tema Sistem (Otomatis), Terang (*Light*), dan Gelap (*Dark*).
</details>

<details open>
<summary><b>3. Fatir (@Patirparkerr) — Integrations Lead & Database Engineer</b></summary>

- **Peran**: Pengembang integrasi platform pihak ketiga (Trello) dan basis data.
- **Jobdesk Spesifik**:
  1. Mengintegrasikan Trello REST API untuk melacak pergerakan kartu tugas berdasarkan kode tugas (misal: `#TASK-02`).
  2. Mengotomatiskan pemindahan kartu dari kolom *In Progress* ke *Done* saat sinyal commit diterima.
  3. Merancang struktur skema basis data MySQL `sipatir_db` (tabel `members`, `tasks`, `activity_logs`).
  4. Mengimplementasikan repository database menggunakan *Parameterized Prepared Statements* untuk pencegahan mutlak SQL Injection.
  5. Menangani sinkronisasi status tugas dua arah antara aktivitas lokal dan status papan Kanban Trello.
</details>

<details open>
<summary><b>4. Fajri (@AATTTRAWRRR) — QA, Security Testing & Academic Documentation</b></summary>

- **Peran**: Penjaminan mutu perangkat lunak, audit keamanan, dan penyusunan dokumentasi akademik.
- **Jobdesk Spesifik**:
  1. Merancang dan mengeksekusi skenario uji coba otomatis untuk memvalidasi alur integrasi Git ➔ Trello ➔ Discord ➔ Dashboard.
  2. Melakukan audit pengujian keamanan siber pada endpoint webhook (uji coba payload berbahaya, format regex commit ekstrem, dan uji ketahanan rate limiter).
  3. Menyusun modul dokumentasi akademik lengkap: Product Requirement Documents (PRD 00 s.d. 06).
  4. Membuat pemodelan diagram UML standar rekayasa perangkat lunak (Use Case Diagram, Activity Diagram, Sequence Diagram, dan Class Diagram).
  5. Melakukan verifikasi tampilan responsif lintas peramban (Chrome, Firefox, Safari, Edge, Mobile Safari iOS, Android Chrome).
</details>

---

<div align="center">
  <sub>Dikembangkan dengan standar rekayasa perangkat lunak modern untuk kolaborasi tim dan evaluasi akademik.</sub>
</div>
