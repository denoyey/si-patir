# ANALISIS GAP PROYEK & PEMBAGIAN TUGAS TIM (SI-PATIR)
> **Nama Proyek:** SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori*)  
> **Tanggal Rilis Dokumen:** 6 November 2026  
> **Status:** `ACTIVE ROADMAP` | **Versi:** `2.0.0`  
> **Anggota Tim (4 Orang):** Deni (Lead), Rafli, Fatir, Fajri  

---

## 1. Analisis Status Proyek Saat Ini (Current State Analysis)

Berdasarkan audit arsitektur kode dan dokumentasi PRD SI-PATIR, berikut adalah pemetaan fitur yang **sudah selesai** vs yang **masih belum / perlu disempurnakan**:

### 1.1 Apa yang Sudah Selesai (Completed & Verified)
1. **Frontend Modern & Dashboard UI (React 19 + Tailwind v4 + GSAP + Lenis + Poppins)**:
   - **Interactive Landing Page**: Hero section interaktif, diagram visual alur kerja Git ➔ Trello ➔ Discord, kartu fitur, preview mockup, dan showcase tim.
   - **Theme Switcher Cerdas**: Mendukung mode `System OS`, `Light`, dan `Dark` dengan deteksi otomatis, penyimpanan persisten di localStorage, dan kepatuhan kontras WCAG AA.
   - **Lenis Smooth Scroll OOP Engine**: Gulir halaman halus matematis dengan tombol Back to Top melayang, auto-scroll stream log, dan *Route Scroll Restoration* (otomatis kembali ke posisi atas saat berpindah rute).
   - **Optimasi Responsif Multi-Device & iOS**: Penyesuaian layout 100% untuk monitor desktop hingga seluruh varian iPhone (penanganan Dynamic Island, Notch, Safe Area Insets, dan header toolbar yang adaptif).
   - Layout *Pure Human Engineering* (Anti-AI Slop) dengan kontainer `max-w-7xl`, token sudut ketat (`rounded-md` & `rounded-lg`), dan ritme tinggi seragam (`p-5`, `min-h-[52px]`).
   - PWA & Mobile Web App meta tag compliance (`mobile-web-app-capable`) dan SEO 100%.
2. **Backend Gateway & Webhook Security**:
   - Express.js + TypeScript berarsitektur OOP (`Application.ts`, controllers, services, repositories).
   - Verifikasi tanda tangan GitHub HMAC SHA-256 konstan (`crypto.timingSafeEqual`).
   - Rate limiting (30 req/min) & pencegahan DoS/ReDoS.
   - Socket.io broadcast engine untuk real-time update tanpa refresh halaman.
3. **Database Layer (MySQL & In-Memory Fallback)**:
   - Skema tabel `members`, `tasks`, dan `activity_logs` dengan migrasi otomatis.
   - Mekanisme *In-Memory Fallback* yang membuat aplikasi tetap jalan meski MySQL lokal padam.
4. **Discord Webhook Notification**:
   - `DiscordNotificationService.ts` terhubung dan mengirimkan pesan kaya (*Rich Embed*) ke kanal Discord.
5. **Skrip Operasional & Otomasi Multi-Platform Lintas OS**:
   - **Starter Scripts**: `start.sh` (Linux/macOS) & `start.bat` (Windows) dengan auto port-kill (port 5000 & 3000) dan inisialisasi dependensi otomatis.
   - **Auto-Push Engine**: `scripts/auto-git-push.sh` & `scripts/auto-git-push.bat` dengan quality gate otomatis (`tsc` + `vite build`), pembuatan branch konvensional, dan push GitHub.
   - **Repository Hygiene Utility**: `scripts/clean-merged-branches.sh` & `scripts/clean-merged-branches.bat` (serta `npm run clean:branches`) untuk membersihkan branch usang yang sudah selesai di-merge ke `origin/main`.
   - **5-Tier Conflict-Proof & Rebase Safety Engine**: Proteksi otomatis terhadap desinkronisasi git: fetch remote & prune, jaminan branch dasar segar dari `origin/main`, auto-track branch tim, linear rebase sebelum push, dan **automatic `rebase --abort`** seketika saat terdeteksi bentrok kode agar workspace tidak rusak.

---

### 1.2 Apa yang Masih Belum / Perlu Dikerjakan (Gaps & Pending Items)

| No | Modul / Kebutuhan | Kondisi Saat Ini | Target Penyelesaian | Prioritas |
| :--- | :--- | :--- | :--- | :---: |
| 1 | **Trello Board Nyata** | **SELESAI (DONE)**: Papan Trello resmi `SI-PATIR Sprint Board` telah dibuat (`https://trello.com/b/1GJ7t2HK/si-patir-sprint-board`), API Key, Token, Board ID, dan Done List ID telah dikonfigurasikan di `.env`. | Terhubung penuh ke Trello API untuk pemindahan kartu otomatis. | **Tuntas (P1)** |
| 2 | **Pendaftaran Akun Anggota Nyata** | **SELESAI (DONE)**: 4 akun GitHub nyata telah di-acc sebagai kolaborator repositori dan tersinkronisasi ke basis data: `@denoyey` (Deni), `@muhamadrafli16` (Rafli), `@Patirparkerr` (Fatir), `@AATTTRAWRRR` (Fajri). | Terhubung penuh ke database MySQL & leaderboard. | **Tuntas (P1)** |
| 3 | **Deployment Publik (Public HTTPS URL)** | Backend masih berjalan di `localhost:5000`. GitHub.com membutuhkan URL HTTPS publik untuk push webhook internet. | Deploy backend/frontend ke VPS/Railway/Render atau setup Cloudflare Tunnel / Ngrok permanen. | **Tinggi (P1)** |
| 4 | **Visualisasi Grafik Kontribusi** | Belum ada diagram analitik perbandingan kontribusi commit & velocity tugas per anggota. | Menambahkan chart (Recharts / Chart.js) di tab analitik dashboard. | **Sedang (P2)** |
| 5 | **Interaktivitas Tugas (Edit & Status)** | Status tugas hanya bisa diubah via commit atau add baru, belum bisa di-edit langsung dari dashboard UI. | Fitur edit judul, ganti status via dropdown/modal, dan deskripsi tugas. | **Sedang (P2)** |
| 6 | **Export Laporan (PDF/CSV)** | Belum ada fitur download rekap kerja tim untuk diserahkan ke dosen evaluasi mingguan. | Tombol export laporan sprint ke format CSV atau PDF cetak. | **Sedang (P2)** |
| 7 | **Automated Testing (QA Unit Tests)** | Belum ada unit test otomatis (Vitest/Jest) untuk parser commit dan validasi HMAC. | Suite test otomatis untuk `CommitParserService` dan `WebhookSecurityService`. | **Sedang (P2)** |
| 8 | **Laporan Akademik & Diagram UML** | PRD teknis sudah ada, namun berkas laporan formal (Bab 1–5, Use Case, Activity, Sequence, ERD) belum disusun. | Dokumen Laporan Skripsi/Tugas Besar lengkap beserta slide presentasi demo. | **Tinggi (P1)** |

---

## 2. Struktur Tim & Pembagian Peran (Role Distribution)

```
                            ┌───────────────────────────────┐
                            │          DENI (LEAD)          │
                            │  Lead Architect & DevOps      │
                            └───────────────┬───────────────┘
                                            │
            ┌───────────────────────────────┼───────────────────────────────┐
            ▼                               ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│         RAFLI         │       │         FATIR         │       │         FAJRI         │
│  Frontend & Analytics │       │ Trello & Database Eng │       │ QA, Testing & Docs    │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

---

## 3. Rincian Tugas Mendalam untuk Setiap Anggota

---

### 👤 1. DENI (Lead Engineer & DevOps Integrator)
* **Akun GitHub:** `@denoyey` (Repo Owner)
* **Peran Utama:** Pimpinan Proyek, Arsitektur Sistem, Integrasi GitHub Webhook Internet & Deployment Server.
* **Tanggung Jawab:**

#### Checklist Pekerjaan:
- [ ] **1.1 Setup Public Webhook Gateway (Cloud/Tunnel)**:
  - Konfigurasi Cloudflare Tunnel (`cloudflared`) atau deploy backend ke platform cloud (Railway/Render/VPS) agar endpoint `https://domain-kamu/api/webhooks/github` dapat diakses langsung oleh server GitHub.com.
  - Pasang webhook di pengaturan GitHub repository (`Settings -> Webhooks -> Add Webhook`) dengan Content Type `application/json` dan masukkan Secret yang sama dengan `GITHUB_WEBHOOK_SECRET` di `.env`.
- [ ] **1.2 Setup CI/CD Pipeline (GitHub Actions)**:
  - Buat berkas `.github/workflows/ci.yml` yang otomatis menjalankan:
    1. Backend `tsc --noEmit`
    2. Frontend `npm run build`
    3. Linter dan Unit Test setiap ada Pull Request ke branch `main`.
- [ ] **1.3 Integrasi Multi-Contributor GitHub**:
  - Memastikan seluruh commit dari 4 akun anggota (Deni, Rafli, Fatir, Fajri) yang di-push ke repositori GitHub otomatis terdeteksi via endpoint `/api/members/sync-github`.
- [ ] **1.4 Code Review & Branch Management**:
  - Memeriksa setiap Pull Request dari Rafli, Fatir, dan Fajri sebelum di-merge ke `main`.
  - Memastikan seluruh developer mematuhi aturan Conventional Commits (`feat(...)`, `fix(...)`, `docs(...)`).

* **Berkas Kerja Utama:**
  - `.github/workflows/ci.yml`
  - `backend/src/Application.ts`
  - `backend/src/services/GitHubIntegrationService.ts`
  - `backend/.env` (Konfigurasi Domain & Public URL)

---

### 👤 2. RAFLI (Frontend UI & Data Visualization Engineer)
* **Akun GitHub:** `@muhamadrafli16` (Collaborator)
* **Peran Utama:** Pengembangan Antarmuka Interaktif, Visualisasi Data Grafik, dan Fitur Reporting.
* **Tanggung Jawab:**

#### Checklist Pekerjaan:
- [ ] **2.1 Implementasi Grafik Analitik Kontribusi**:
  - Pasang library grafik ringan (misal `recharts` atau diagram SVG kustom berbasis GSAP).
  - Tampilkan visualisasi perbandingan kontribusi commit harian/mingguan antar 4 anggota tim (Deni, Rafli, Fatir, Fajri).
  - Tampilkan diagram lingkaran (*pie/donut chart*) persentase status tugas (*To Do*, *In Progress*, *Done*).
- [ ] **2.2 Interaktivitas & Edit Kartu Tugas**:
  - Buat modal **Edit Tugas** di frontend: memungkinkan penggantian judul tugas, penugasan (*re-assign* anggota), atau pengubahan status manual.
  - Tambahkan konfirmasi dialog yang rapi saat menghapus atau mengubah tugas.
- [ ] **2.3 Fitur Export Laporan Sprint (PDF / CSV)**:
  - Buat tombol **"Export Laporan"** di dashboard:
    - Opsi CSV: Menghasilkan berkas `laporan-aktivitas-sipatir.csv` berisi daftar tugas, assignee, status, dan riwayat commit.
    - Opsi Print/PDF: Styling CSS `@media print` agar dashboard dapat dicetak langsung ke PDF secara rapi untuk dilampirkan ke dosen.
- [ ] **2.4 Halaman / Tab Riwayat Audit Log**:
  - Tambahkan fitur pencarian teks dan filter per author pada panel *Live Webhook Stream*.
  - Sediakan pagination atau "Muat Lebih Banyak" untuk membaca log yang tersimpan di database.

* **Berkas Kerja Utama:**
  - `frontend/src/App.tsx`
  - `frontend/src/components/` (Buat komponen baru: `ContributionChart.tsx`, `EditTaskModal.tsx`, `ExportReportModal.tsx`)
  - `frontend/package.json` (Jika menambah dependency seperti `recharts`)

---

### 👤 3. FATIR (Kanban Trello Integrator & Database Engineer)
* **Akun GitHub:** `@Patirparkerr` (Collaborator)
* **Peran Utama:** Integrasi Nyata Papan Trello, Otomasi Kolom Tugas, dan Optimalisasi Basis Data MySQL.
* **Tanggung Jawab:**

#### Checklist Pekerjaan:
- [x] **3.1 Setup Akun & Papan Trello Resmi Tim**:
  - Papan resmi tim dibuat: `https://trello.com/b/1GJ7t2HK/si-patir-sprint-board`.
  - Kolom standar aktif: `To Do`, `in progress`, `Done`.
  - Kartu tugas awal aktif (`#TASK-01`, `#TASK-02`, `#TASK-03`, `#TASK-05`).
- [x] **3.2 Konfigurasi Trello Developer API Key & Token**:
  - API Key & Server Token berhasil di-generate dari Trello Developer Portal.
  - Board ID (`6aeda5a802922f9870c61315`) & Done List ID (`6aeda5a902922f9870c61336`) telah diekstrak dan dikonfigurasi ke `.env`.
- [ ] **3.3 Verifikasi Otomasi Pergeseran Kartu Nyata**:
  - Uji fungsi `moveCardToDone()` di `backend/src/services/TrelloIntegrationService.ts`.
  - Pastikan saat ada commit `[done #TASK-XX]`, kartu di Trello benar-benar berpindah ke kolom *Done* dan komentar bukti commit GitHub tertempel di kartu tersebut.
- [x] **3.4 Database Seeder & Skema Penugasan Anggota**:
  - 4 anggota nyata (`@denoyey`, `@muhamadrafli16`, `@Patirparkerr`, `@AATTTRAWRRR`) dan 5 tugas awal diresmikan ke dalam skrip SQL `backend/database/seed_team.sql`.

* **Berkas Kerja Utama:**
  - `backend/src/services/TrelloIntegrationService.ts`
  - `backend/src/controllers/TaskController.ts`
  - `backend/src/database/DatabaseService.ts`
  - `backend/database/seed_team.sql`

---

### 👤 4. FAJRI (Quality Assurance, Security Testing & Academic Docs Specialist)
* **Akun GitHub:** `@AATTTRAWRRR` (Nama Akun: Fajrii • Collaborator)
* **Peran Utama:** Pengujian Otomatis (QA), Security Audit, Dokumentasi Laporan Akademik & Skenario Presentasi Demo.
* **Tanggung Jawab:**

#### Checklist Pekerjaan:
- [ ] **4.1 Automated Unit Testing (Vitest / Jest)**:
  - Pasang Vitest di backend: buat suite pengujian di `backend/tests/`:
    1. `CommitParserService.test.ts`: Uji parsing regex pesan commit (`[done #TASK-01]`, `closes #TASK-02`, `fix: auth (#TASK-03)`).
    2. `WebhookSecurityService.test.ts`: Uji verifikasi signature HMAC SHA-256 (payload valid vs signature palsu/spoofed).
- [ ] **4.2 Uji Ketahanan Keamanan (Security & Load Test)**:
  - Uji rate limiter: tembak endpoint `/api/webhooks/github` lebih dari 30 kali per menit dan pastikan status HTTP `429 Too Many Requests` muncul.
  - Uji payload raksasa (>100kb) dan pastikan sistem menolak dengan HTTP `413 Payload Too Large`.
  - Catat hasil pengujian untuk dilampirkan pada Bab Pengujian sistem.
- [ ] **4.3 Penyusunan Laporan Akademik Formal (Bab 1 s/d Bab 5)**:
  - Mengonversi PRD yang sudah ada ke dalam format dokumen laporan resmi:
    - **Bab 1:** Latar Belakang Masalah, Rumusan Masalah, Tujuan & Manfaat.
    - **Bab 2:** Landasan Teori (Webhook, REST API, WebSocket, HMAC SHA-256, React, Express, MySQL).
    - **Bab 3:** Analisis & Perancangan Sistem (Diagram Use Case, Activity Diagram, Sequence Diagram Integrasi 3 Sistem, ERD Database).
    - **Bab 4:** Implementasi & Hasil Pengujian (Tabel hasil uji fungsi & keamanan).
    - **Bab 5:** Kesimpulan & Saran Pengembangan.
- [ ] **4.4 Pembuatan Slide Presentasi & Skenario Demo Dosen**:
  - Buat slide presentasi (Canva / PowerPoint) berdesain modern dan profesional.
  - Susun naskah demonstrasi sistem 30 detik (Langkah 1 s/d Langkah 4 sesuai `06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md`) agar saat presentasi di depan dosen berjalan lancar tanpa kendala.

* **Berkas Kerja Utama:**
  - `backend/tests/CommitParser.test.ts`
  - `backend/tests/Security.test.ts`
  - `docs/academic/LAPORAN-TUGAS-BESAR-SI-PATIR.md`
  - `docs/academic/DIAGRAM-ARSITEKTUR-UML.md`

---

## 4. Jadwal & Alur Kerja Kolaborasi (Sprint Timeline)

```
[ Minggu 1: Setup & Integrasi Nyata ]
  ├─ Deni   : Setup Public Gateway / Tunnel & Webhook GitHub
  ├─ Fatir  : Setup Papan Trello Resmi & Isi Token .env
  ├─ Rafli  : Buat Komponen Grafik Kontribusi & Modal Edit Tugas
  └─ Fajri  : Rancang Diagram UML & Unit Test Awal

[ Minggu 2: Pengujian Terpadu & Pelaporan ]
  ├─ Deni   : Review PR, CI/CD Actions & Multi-contributor Sync
  ├─ Fatir  : Uji Real Move Card Trello & Database Seeder 4 Anggota
  ├─ Rafli  : Fitur Export CSV/PDF & Riwayat Audit Log
  └─ Fajri  : Load Testing, Laporan Akademik Lengkap & Slide Demo
```

---

## 5. Standar Aturan Kolaborasi Git Tim (Team Git Rules)

Seluruh anggota (Deni, Rafli, Fatir, Fajri) **wajib** mengikuti aturan git berikut:

1. **Dilarang Keras Push ke Branch `main` Langsung**:
   Gunakan branch fitur masing-masing yang terisolasi:
   - Deni: `feat/devops-gateway-setup`
   - Rafli: `feat/analytics-chart-and-export`
   - Fatir: `feat/trello-real-integration`
   - Fajri: `test/automated-qa-and-docs`
2. **Gunakan Script Auto-Push (Mendukung Linux & Windows)**:
   Jalankan script starter yang sudah disediakan agar format commit rapi, verifikasi tipe lolos, dan build produksi diverifikasi sebelum push:
   * **Linux / macOS / Git Bash**:
     ```bash
     ./scripts/auto-git-push.sh feat analytics-chart ui "tambahkan grafik analitik kontribusi tim"
     ```
   * **Windows (Command Prompt / PowerShell)**:
     ```cmd
     scripts\auto-git-push.bat feat analytics-chart ui "tambahkan grafik analitik kontribusi tim"
     ```
3. **Proteksi Anti-Conflict Otomatis**:
   Sistem secara otomatis melindungi pekerjaan Anda saat menjalankan `auto-git-push`:
   - Jika rekan tim sudah membuat commit di branch remote, skrip melakukan `git pull --rebase origin <branch>` sebelum push.
   - Jika terdeteksi konflik kode baris yang sama, skrip **segera membatalkan rebase (`git rebase --abort`) secara otomatis** sehingga file lokal Anda tetap utuh, aman, dan tidak rusak.
4. **Pembersihan Rutin Branch Usang**:
   Setelah Pull Request di-merge ke `main` di GitHub, bersihkan branch lokal dan remote menggunakan:
   ```bash
   npm run clean:branches
   ```
   *(Atau jalankan `./scripts/clean-merged-branches.sh` di Linux atau `scripts\clean-merged-branches.bat` di Windows)*.
5. **Format Pesan Commit (Conventional Commits)**:
   - `feat(...)`: Untuk penambahan fitur baru.
   - `fix(...)`: Untuk perbaikan bug.
   - `docs(...)`: Untuk pembaruan dokumen laporan/PRD.
   - `test(...)`: Untuk pembuatan berkas test pengujian.
6. **Wajib Update PRD**:
   Setiap kali menambah endpoint atau mengubah UI, perbarui dokumen terkait di folder `docs/prd/`.

---

Dokumen ini adalah panduan resmi pembagian tugas tim SI-PATIR. Simpan dan bagikan kepada Rafli, Fatir, dan Fajri untuk segera dieksekusi!

