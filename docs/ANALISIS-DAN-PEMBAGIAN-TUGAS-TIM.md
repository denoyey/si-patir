# ANALISIS GAP PROYEK & PEMBAGIAN TUGAS TIM (SI-PATIR)
> **Nama Proyek:** SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori*)  
> **Tanggal Pembaruan Dokumen:** 16 November 2026  
> **Status:** `ACTIVE SPRINT ROADMAP` | **Versi:** `2.3.0`  
> **Anggota Tim (4 Orang):** Deni (Lead), Rafli, Fatir, Fajri  
> **Repositori Resmi:** `https://github.com/denoyey/si-patir`  
> **Integrasi Utama:** GitHub Webhooks (Inbound) • Discord Webhooks (Outbound) • Internal Task State Engine (MySQL2) • Live WebSockets

---

## 1. Analisis Status Proyek Terkini (Current State Analysis)

Berdasarkan audit arsitektur kode dan implementasi sistem SI-PATIR terkini, berikut adalah pemetaan lengkap fitur yang **sudah selesai diimplementasikan & diverifikasi** vs fitur yang **masih dalam tahap pengerjaan / rencana lanjutan**:

### 1.1 Apa yang Sudah Selesai (Completed & Verified) ✅
1. **Frontend Modern & Dashboard UI (React 19 + Tailwind v4 + GSAP + Lenis + Poppins)**:
   - **Interactive Landing Page**: Hero section interaktif, diagram visual alur kerja Git Push Webhook ➔ Internal Task State Engine ➔ Discord Rich Embed, kartu fitur, preview mockup, dan showcase tim resmi.
   - **Theme Switcher Cerdas**: Mode `System OS`, `Light`, dan `Dark` dengan persistensi otomatis di `localStorage` dan kepatuhan kontras WCAG AA.
   - **Lenis Smooth Scroll OOP Engine**: Gulir halaman halus matematis dengan tombol Back to Top melayang, auto-scroll stream log, dan *Route Scroll Restoration*.
   - **Tabel Tugas Gaya Filament v5**: Data table kartu tugas dengan pagination dinamis (pilihan per-page 5/10/25/50, nomor halaman aktif), pencarian teks instan, filter status (*To Do*, *In Progress*, *Done*), serta filter per developer.
   - **Terminal Web Git Terintegrasi**: Terminal eksekusi commit langsung di dashboard web (bukan sekadar simulator atau teks panduan) dengan chip pemilih kontributor dan chip tugas cepat (`#TASK-02` s/d `#TASK-05`).
   - **Dialog Konfirmasi Tanpa Blur**: Penggantian dialog bawaan `window.confirm` dengan custom modal confirmation dialog yang responsif dan elegan.
   - **Real-Time WebSocket Stream & Toast**: Notifikasi toast dinamis saat ada aktivitas commit baru, tugas selesai, perubahan status, atau siaran live event WebSocket.
2. **Backend Gateway, Security & REST API v1 Architecture**:
   - Express 5 + TypeScript berarsitektur OOP (`Application.ts`, controllers, services, repositories).
   - **REST API v1 Terstruktur**: Endpoint modular `/api/v1/tasks`, `/api/v1/members`, `/api/v1/webhooks`, dan `/api/v1/system` dengan backward compatibility.
   - **Portal Dokumentasi & Lab Keamanan (`/docs`)**: Portal dokumentasi interaktif yang **100% responsif di seluruh perangkat dan full support iPhone (iOS Safari)**:
     - Mendukung Safe Area Insets & Notch/Dynamic Island iPhone (`viewport-fit=cover`).
     - Pencegahan auto-zoom mengganggu pada iOS Safari (`font-size: 16px` pada input mobile).
     - Pencarian live endpoint, copy cURL instan, uji live request, dan simulator lab keamanan (HMAC, Rate Limiting, anti-SQLi).
   - **Keamanan Ketat (Hardening)**: Verifikasi tanda tangan HMAC SHA-256 constant-time (`crypto.timingSafeEqual`), Helmet CSP compliance (`script-src-attr 'unsafe-inline'`), IP Rate Limiter (120 req/min umum, 30 req/min webhook), dan strict CORS policy.
3. **Internal Task State Engine & Integrasi Real-Time**:
   - Mesin pelacak siklus hidup tugas (*Task State Engine*) internal berbasis MySQL2 + In-Memory Fallback.
   - Transisi status otomatis saat commit Git mengandung tag penyelesaian (`[done #TASK-XX]` ➔ status berubah menjadi `Done`).
   - Sinkronisasi dua arah via REST API dan integrasi opsional GitHub Issues (`/api/v1/tasks/sync-github-issues`).
   - Manajemen 4 kartu tugas utama tim (`#TASK-02` s/d `#TASK-05`) tersimpan aman dalam database lokal tanpa dependensi vendor Kanban eksternal.
4. **Integrasi GitHub Multi-Kontributor & Commit History Stream**:
   - Endpoint `/api/v1/members/sync-github` yang menarik kontributor nyata dari GitHub API dengan fallback `git shortlog`.
   - **Sinkronisasi Riwayat Commit Nyata ke Stream**: Riwayat commit asli dari repositori GitHub otomatis diimpor ke tabel `activity_logs`, sehingga stream live tidak pernah kosong dan memadukan commit historis dengan event live webhook.
5. **Discord Webhook Notification Engine**:
   - Pengiriman notifikasi kaya (*Rich Embed*) ke kanal Discord saat tugas diselesaikan oleh tim.
6. **Database Layer (MySQL & In-Memory Fallback)**:
   - Skema tabel `members`, `tasks`, dan `activity_logs` dengan auto-migration dan fallback in-memory yang tangguh saat MySQL lokal mati.
7. **Skrip Operasional & Otomasi Git Lintas OS**:
   - Starter Scripts: `start.sh` (Linux/macOS) & `start.bat` (Windows).
   - Auto-Push Scripts: `scripts/auto-git-push.sh` & `scripts/auto-git-push.bat` dengan quality gate otomatis (`tsc` + `vite build`).
   - Repository Hygiene: `scripts/clean-merged-branches.sh` & `scripts/clean-merged-branches.bat` (`npm run clean:branches`).
8. **Konfigurasi Profil Proyek Dinamis & Multi-Repo Workspace (Dynamic Project & Multi-Tenant)**:
   - **Isolasi Penuh Antar-Proyek**: Integrasi repositori GitHub, task engine internal, dan webhook Discord dibundel menjadi satu kesatuan profil proyek mandiri untuk mencegah kontaminasi data (*cross-pollution*).
   - **Tabel `projects` & REST API v1 (`/api/v1/projects`)**: CRUD profil proyek lengkap dengan proteksi proyek default ID 1 (SI-PATIR).
   - **Project Switcher & Configuration Modal di Dashboard**: Modal interaktif di frontend untuk beralih proyek aktif, mengedit kredensial integrasi, dan mendaftarkan proyek baru secara live.
   - **Webhook Routing Cerdas**: Backend secara otomatis mencocokkan repo GitHub pada payload webhook untuk memperbarui status tugas dan mengirim notifikasi Discord ke proyek yang tepat.
9. **CI/CD Pipeline, Stream Progresif & Penguatan UX/Aksesibilitas**:
   - **GitHub Actions Quality Gate (`.github/workflows/ci.yml`)**: Pipeline paralel untuk `backend` & `frontend` (`tsc --noEmit`, `oxlint`, Vite build, dan `npm test --if-present`) pada setiap push & PR ke `main`.
   - **Aktivitas Webhook Progresif & Modal Riwayat**: Feed sidebar ringkas 5 item terbaru dengan format hari singkat Indonesia (`Sel, 19:14`), *expandable commit message* (`line-clamp-2`), tombol *Muat lebih banyak*, pemisahan card `Terminal Git`, dan `ActivityLogsModal.tsx`.
   - **Overlay Scroll Lock & Aksesibilitas Form**: Penguncian scroll background di seluruh modal (`useBodyScrollLock.ts` + `overscroll-contain`), overlay hitam solid tanpa blur, kelengkapan `id`/`name` seluruh form field, serta hierarki klasemen tim yang setara.

---

### 1.2 Matriks Status Kebutuhan Proyek (Project Gap Matrix)

| No | Modul / Kebutuhan | Kondisi Saat Ini | Status | Penanggung Jawab |
| :--- | :--- | :--- | :---: | :---: |
| 1 | **Internal Task State Engine** | Mesin status tugas internal aktif, transisi otomatis via commit tag `[done #TASK-XX]`, live Socket.io broadcast. | **SELESAI (DONE)** ✅ | Fatir |
| 2 | **Pendaftaran Akun Anggota Nyata** | 4 akun GitHub resmi (`@denoyey`, `@muhamadrafli16`, `@Patirparkerr`, `@AATTTRAWRRR`) tersinkron ke MySQL & klasemen. | **SELESAI (DONE)** ✅ | Fatir & Deni |
| 3 | **REST API v1 & Portal Dokumentasi & Security** | Endpoint modular v1 aktif, portal `/docs` interaktif dengan test runner & security lab. | **SELESAI (DONE)** ✅ | Deni |
| 4 | **Terminal Web Git di Dashboard** | Terminal langsung di web tanpa perlu buka terminal OS/laptop, otomatis transisikan status tugas & siarkan WebSocket. | **SELESAI (DONE)** ✅ | Rafli & Deni |
| 5 | **Sinkronisasi Commit GitHub ke Stream** | Riwayat commit asli GitHub otomatis diimpor ke stream live (`activity_logs`). | **SELESAI (DONE)** ✅ | Deni & Fatir |
| 6 | **Deployment Publik / Webhook Gateway (HTTPS URL)** | Skrip tunnel lintas platform aktif via `npm run tunnel` (LocalTunnel & Cloudflare), siap menghubungkan webhook GitHub.com ke backend lokal. | **SELESAI (DONE)** ✅ | Deni |
| 7 | **CI/CD Pipeline (GitHub Actions)** | Workflow `.github/workflows/ci.yml` aktif memvalidasi `tsc --noEmit`, `oxlint`, Vite build, dan automated tests saat PR/push ke `main`. | **SELESAI (DONE)** ✅ | Deni |
| 8 | **Visualisasi Grafik Kontribusi (Analytics Chart)** | Tersedia diagram batang perbandingan commit & diagram donat status sprint berbasis SVG presisi tinggi. | **SELESAI (DONE)** ✅ | Rafli |
| 9 | **Modal Edit Tugas Lengkap** | Modal interaktif (`EditTaskModal.tsx`) terintegrasi tabel untuk mutasi judul, assignee, dan status dengan persistensi database & WebSocket real-time. | **SELESAI (DONE)** ✅ | Rafli |
| 10 | **Export Laporan Sprint (PDF / CSV)** | Dukungan export CSV dengan UTF-8 BOM dan pencetakan PDF bersih via styling `@media print`. | **SELESAI (DONE)** ✅ | Rafli |
| 11 | **Sinkronisasi GitHub Issues API** | Sinkronisasi issue dari repositori GitHub langsung ke daftar tugas lokal (`/api/v1/tasks/sync-github-issues`). | **SELESAI (DONE)** ✅ | Fatir & Deni |
| 12 | **Automated Unit Testing (Vitest/Jest)** | Suite unit test otomatis 28 skenario: CommitParser, WebhookSecurity HMAC, dan TaskStatusFlow. | **SELESAI (DONE)** ✅ | Fajri |
| 13 | **Security Penetration & Load Testing** | Simulator uji batas rate limiter (35 req 429), batas payload 100kb, dan anti-SQLi aktif di `/docs`. | **SELESAI (DONE)** ✅ | Fajri |
| 14 | **Panduan Akademik & Pertanyaan Sidang** | Panduan tanya jawab kritis sidang Pemrograman Integratif lengkap dengan analisis teknis di `/docs`. | **SELESAI (DONE)** ✅ | Fajri |
| 15 | **Slide Presentasi & Skenario Demo Dosen** | Naskah runbook demo live 30 detik alur end-to-end terintegrasi di web dashboard & dokumentasi. | **SELESAI (DONE)** ✅ | Fajri |
| 16 | **Konfigurasi Profil Proyek Dinamis & Multi-Repo** | Multi-repo terisolasi, modal switcher, per-project repository config & Discord webhook. | **SELESAI (DONE)** ✅ | Deni & Rafli |

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
│  Frontend & Analytics │       │ Database & System Eng │       │ QA, Testing & Docs    │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

---

## 3. Rincian Jobdesk Mendalam untuk Setiap Anggota

---

### 👤 1. DENI (Lead Engineer & DevOps Integrator)
* **Akun GitHub:** `@denoyey` (Repo Owner & Team Lead)
* **Peran Utama:** Pimpinan Proyek, Arsitek Backend Gateway & Multi-Repo, Keamanan Sistem, CI/CD DevOps, serta Penguatan UX & Aksesibilitas.

#### Checklist Pekerjaan:
- [x] **1.1 Arsitektur Backend Gateway REST API v1**:
  - Bangun Express 5 + TypeScript OOP dengan pemisahan Controller, Service, dan Repository.
  - Implementasikan routing modular `/api/v1/tasks`, `/api/v1/members`, `/api/v1/webhooks`, dan `/api/v1/system`.
- [x] **1.2 Gateway Security Hardening & Rate Limiter**:
  - Pasang verifikasi signature HMAC SHA-256 konstan (`crypto.timingSafeEqual`) untuk validasi webhook GitHub.
  - Terapkan Helmet CSP header dengan konfigurasi `script-src-attr 'unsafe-inline'`.
  - Pasang Rate Limiter ketat (120 req/min general, 30 req/min webhook endpoint).
- [x] **1.3 Portal Dokumentasi REST API & Lab Keamanan (`/docs`)**:
  - Bangun portal dokumentasi dan lab keamanan interaktif dengan live test runner, uji HMAC, rate limiter flooding, dan cURL generator.
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
  - Rancang entitas `IProject` dan migrasi tabel `projects` di MySQL dengan fallback in-memory dan proteksi default project ID 1.
  - Implementasikan REST API modular `/api/v1/projects` (List, Active, Create, Update, Activate, Delete) dengan alias `/api/projects`.
  - Hubungkan `WebhookController`, `TaskRepository`, dan `DiscordNotificationService` untuk isolasi per-proyek (*anti cross-pollution*).
- [x] **1.9 Setup CI/CD Pipeline (GitHub Actions)**:
  - Buat berkas `.github/workflows/ci.yml` yang otomatis menjalankan:
    1. Backend `tsc --noEmit` & `npm run build`
    2. Frontend `oxlint`, `tsc --noEmit`, & `npm run build`
    3. Automated test gate (`npm test --if-present`) pada setiap Pull Request & push ke branch `main`.
- [x] **1.10 Penyempurnaan UX, Aksesibilitas Form & Stream Progresif**:
  - Pisahkan card *Aktivitas Webhook* & *Terminal Git*, terapkan stream progresif (5 log awal + `Muat lebih banyak` + `ActivityLogsModal.tsx`) dengan format hari singkat Indonesia (`Sel, 19:14`).
  - Terapkan `useBodyScrollLock` + `overscroll-contain` pada modal overlay hitam solid, penomoran `id`/`name` seluruh form field, paginasi ringkas, dan hierarki klasemen tim yang setara.
- [x] **1.11 Code Review & Integrasi Sistem End-to-End**:
  - Validasi seluruh integrasi modul tim dan verifikasi 28 unit tests Vitest tanpa error sebelum rilis ke branch `main`.

* **Berkas Kerja Utama:**
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

---

### 👤 2. RAFLI (Frontend UI & Data Visualization Engineer)
* **Akun GitHub:** `@muhamadrafli16` (Frontend Specialist • Collaborator)
* **Peran Utama:** Pengembangan Antarmuka Dashboard, Interaktivitas Data, Desain Responsif, dan Visualisasi Analitik.

#### Checklist Pekerjaan:
- [x] **2.1 Desain Dashboard Interaktif & Landing Page**:
  - Rancang Landing Page informatif dengan showcase tim, diagram alur integrasi webhook, dan kartu fitur.
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
  - Pasang notifikasi toast real-time yang menangani event tugas selesai, pembaruan status, commit, dan siaran live WebSocket.
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
- [x] **2.10 Komponen Modal Profil Proyek Dinamis & Multi-Repo Switcher (`ProjectConfigModal.tsx`)**:
  - Buat komponen modal human-crafted dengan 3 tab: *Daftar Proyek & Switcher*, *Edit Konfigurasi Aktif*, dan *Tambah Proyek Baru*.
  - Pasang tombol pemilih proyek interaktif di header dashboard dengan live project name badge.

* **Berkas Kerja Utama:**
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/LandingPage.tsx`
  - `frontend/src/components/ThemeSwitcher.tsx`
  - `frontend/src/components/ConfirmDialog.tsx`
  - `frontend/src/components/ContributionChart.tsx`
  - `frontend/src/components/EditTaskModal.tsx`
  - `frontend/src/components/ProjectConfigModal.tsx`

---

### 👤 3. FATIR (Database & System Integration Engineer)
* **Akun GitHub:** `@Patirparkerr` (Database & Integrations Specialist • Collaborator)
* **Peran Utama:** Perancangan Skema Basis Data MySQL, State Engine Tugas Internal, Integrasi Outbound Discord Webhook, Seeder Data Riil & Pembersihan Dummy.

#### Checklist Pekerjaan:
- [x] **3.1 Setup Skema Basis Data Relasional & Indeks Query**:
  - Rancang DDL tabel `members`, `tasks`, `projects`, dan `activity_logs` di MySQL dengan foreign keys dan indeks komposit query efisien.
  - Susun kolom standar siklus hidup tugas: `To Do`, `In Progress`, dan `Done`.
  - Daftarkan kartu tugas awal tim (`#TASK-02` s/d `#TASK-05`) yang dipetakan ke 4 kolaborator resmi.
- [x] **3.2 Arsitektur Internal Task State Engine (Native Kanban Engine)**:
  - Bangun `TaskRepository.ts` berorientasi objek yang mengontrol transisi siklus hidup tugas (`To Do` -> `In Progress` -> `Done`) murni secara internal tanpa ketergantungan vendor pihak ketiga.
  - Implementasikan metode mutasi status tugas (`upsertTask`, `updateStatusByCode`, `deleteTask`).
- [x] **3.3 Integrasi REST API Manajemen Tugas & GitHub Issues Sync**:
  - Sediakan controller dan repository untuk mutasi tugas via REST API v1 (`/api/v1/tasks`).
  - Sediakan integrasi sinkronisasi issue dari repositori GitHub (`/api/v1/tasks/sync-github-issues`).
- [x] **3.4 Sinkronisasi 4 Kartu Tugas Utama & Seeder Database Riil**:
  - Pastikan kartu `#TASK-02`, `#TASK-03`, `#TASK-04`, dan `#TASK-05` tersimpan rapi di tabel `tasks` dan terhubung langsung dengan developer penanggung jawab.
  - Hapus seluruh sisa data dummy dan integrasikan pembersihan otomatis akun dummy pada `clearDummyMembers()`.
- [x] **3.5 Outbound Webhook Dispatcher (Discord Rich Embed)**:
  - Hubungkan pembaruan status tugas dengan pengiriman pesan embed kaya (color-coded, author info, link commit GitHub) ke kanal Discord via `DiscordWebhookService.ts`.
- [x] **3.6 Skema Database MySQL & In-Memory Fallback**:
  - Rancang dan pelihara skema tabel `members`, `tasks`, dan `activity_logs` di `DatabaseService.ts`.
  - Buat mekanisme in-memory fallback agar aplikasi tetap berjalan lancar saat koneksi MySQL terputus.
- [x] **3.7 Database Backup & Maintenance Script**:
  - Dibuat script otomatisasi backup dump basis data MySQL cross-platform: `scripts/backup_db.bat` (Windows), `scripts/backup_db.sh` (Linux/macOS), dan `scripts/backup_helper.js` (Engine Node.js mandiri).
  - Berhasil melakukan tuning indeks komposit pada tabel `activity_logs` (`idx_task_created`, `idx_author_created`, `idx_event_status`, `idx_commit_msg`) untuk performa pencatatan ribuan log aktivitas.

* **Berkas Kerja Utama:**
  - `backend/src/controllers/TaskController.ts`
  - `backend/src/database/DatabaseService.ts`
  - `backend/src/database/repositories/TaskRepository.ts`
  - `backend/src/database/repositories/MemberRepository.ts`
  - `backend/src/database/repositories/ActivityLogRepository.ts`
  - `backend/src/services/DiscordWebhookService.ts`
  - `backend/database/seed_team.sql`

---

### 👤 4. FAJRI (Quality Assurance, Security Testing & Academic Docs Specialist)
* **Akun GitHub:** `@AATTTRAWRRR` (QA, Security & Docs Specialist • Collaborator)
* **Peran Utama:** Pengujian Otomatis (QA), Security Penetration Testing, Dokumentasi Akademik Formal, dan Runbook Demonstrasi.

#### Checklist Pekerjaan:
- [x] **4.1 Verifikasi Quality Gate Pre-Push**:
  - Pastikan setiap proses commit dan push diverifikasi otomatis oleh compiler TypeScript (`tsc`) dan build frontend (`vite build`).
- [x] **4.2 Audit Keamanan Gateway & Header**:
  - Uji kepatuhan header CSP Helmet dan pastikan tidak ada kebocoran stack trace error pada production mode.
- [x] **4.3 Pengujian Alur Webhook Nyata**:
  - Validasi alur pengiriman pesan Discord dan transisi status tugas internal saat webhook dijalankan.
- [x] **4.4 Automated Unit Testing Suite (Vitest)**:
  - Berhasil membuat pengujian otomatis 28 skenario pada folder `backend/tests/` (100% lolos):
    1. `CommitParserService.test.ts`: Uji parsing regex pesan commit (`[done #TASK-01]`, `fix: #TASK-02`, casing variatif, anti-XSS, anti-ReDoS).
    2. `WebhookSecurityService.test.ts`: Uji validasi HMAC SHA-256 (payload valid, signature palsu/spoofed, payload tanpa header signature, anti-CRLF).
    3. `TaskStatusFlow.test.ts`: Uji transisi status tugas (*To Do* ➔ *In Progress* ➔ *Done*).
- [x] **4.5 Uji Ketahanan Keamanan & Beban (Security & Load Testing)**:
  - Uji batas rate limiter: lakukan 35 request dalam 1 menit ke endpoint webhook dan buktikan sistem memblokir dengan HTTP `429 Too Many Requests`.
  - Uji batas ukuran payload (100kb anti-JSON bomb) dan uji keamanan input parameterized query (anti-SQL Injection).
  - Terapkan simulator pengujian keamanan interaktif di portal `/docs` untuk demonstrasi langsung di hadapan dosen penguji.
- [x] **4.6 Penyusunan Panduan Akademik & Tanya Jawab Sidang**:
  - Menyusun materi tanya jawab kritis penguji sidang mata kuliah Pemrograman Integratif pada `/docs`:
    - Alasan pemilihan arsitektur Webhook vs Polling.
    - Mekanisme verifikasi identitas pengirim payload via HMAC SHA-256 (`crypto.timingSafeEqual`).
    - Mitigasi timing attack, SQL Injection, dan skema in-memory fallback saat MySQL offline.
- [x] **4.7 Skenario Demonstrasi Live Sidang Dosen 30 Detik**:
  - Susun skenario runbook demo live 30 detik: Langkah 1 (Cek tugas di tabel) ➔ Langkah 2 (Commit Git berformat tugas) ➔ Langkah 3 (Status tugas otomatis Done di database & dashboard) ➔ Langkah 4 (Notifikasi Discord dan Live Stream muncul seketika).

* **Berkas Kerja Utama:**
  - `backend/tests/CommitParserService.test.ts`
  - `backend/tests/WebhookSecurityService.test.ts`
  - `backend/tests/TaskStatusFlow.test.ts`
  - `frontend/src/pages/DocumentationPage.tsx`
  - `docs/academic/DIAGRAM-ARSITEKTUR-UML.md`
  - `docs/ANALISIS-DAN-PEMBAGIAN-TUGAS-TIM.md`
  - `docs/prd/*`

---

## 4. Jadwal Sprint & Rencana Tindak Lanjut Tim (Sprint Action Plan)

```
[ FASE 1: Core Foundation & Integrasi Sistem ] ──> STATUS: 100% SELESAI ✅
  ├─ Deni   : Backend Gateway REST API v1, Security Hardening, & Portal Dokumentasi /docs
  ├─ Fatir  : Setup Task State Engine, MySQL DDL Schema, & Database Seeder 4 Anggota
  ├─ Rafli  : Frontend Dashboard React 19, Filament v5 Data Table, & Terminal Web Git
  └─ Fajri  : Quality Gate Pre-push & Validasi Alur Integrasi

[ FASE 2: Fitur Lanjutan, Visualisasi & Pengujian ] ──> STATUS: 100% SELESAI ✅
  ├─ Deni   : Setup Public Webhook Gateway (Cloudflare Tunnel / LocalTunnel) & CI/CD Actions [SELESAI ✅]
  ├─ Fatir  : Discord Outbound Webhook, Database Backup Script & Pembersihan Data Dummy [SELESAI ✅]
  ├─ Rafli  : Grafik Analitik Kontribusi Tim, Modal Edit Tugas, & Export Laporan PDF/CSV [SELESAI ✅]
  └─ Fajri  : Automated Unit Testing (Vitest 28/28 Passed) & Lab Simulasi Keamanan [SELESAI ✅]

[ FASE 3: Penyusunan Panduan Akademik & Kesiapan Demonstrasi ] ──> STATUS: SIAP SIDANG 🚀
  ├─ Fajri  : Panduan Tanya Jawab Sidang Dosen & Skenario Demo Live 30 Detik di /docs [SELESAI ✅]
  ├─ Deni   : Standarisasi Multi-Repo Project & HMAC Timing-Safe Verification [SELESAI ✅]
  ├─ Rafli  : Tampilan Human-Crafted Responsif (Semua Device & iPhone) dengan Radius Konsisten [SELESAI ✅]
  └─ Seluruh Tim: Gladi Bersih Demonstrasi Alur Integrasi Riil (Git ➔ MySQL ➔ Discord ➔ Web UI)
```

---

## 5. Standar Aturan Kolaborasi Git Tim (Team Git Rules)

Seluruh anggota tim (Deni, Rafli, Fatir, Fajri) **wajib mematuhi** aturan berikut saat mengembangkan kode:

1. **Dilarang Keras Melakukan Direct Push ke Branch `main`**:
   Seluruh pengerjaan fitur wajib menggunakan branch tersendiri:
   - Deni: `feat/devops-public-gateway` atau `feat/ci-cd-pipeline`
   - Rafli: `feat/analytics-chart` atau `feat/export-report`
   - Fatir: `feat/db-backup` atau `feat/query-optimization`
   - Fajri: `test/automated-unit-tests` atau `docs/academic-report`
2. **Gunakan Script Auto-Push Resmi (Mendukung Linux, macOS & Windows)**:
   Gunakan script starter otomatis agar kode diverifikasi sebelum dikirim ke GitHub:
   * **Linux / macOS / Git Bash**:
     ```bash
     ./scripts/auto-git-push.sh feat analytics-chart ui "tambahkan komponen grafik kontribusi tim"
     ```
   * **Windows (Command Prompt / PowerShell)**:
     ```cmd
     scripts\auto-git-push.bat feat analytics-chart ui "tambahkan komponen grafik kontribusi tim"
     ```
3. **Pembersihan Rutin Branch yang Sudah Di-Merge**:
   Setelah Pull Request di-merge ke `main` di GitHub, bersihkan branch lokal dan remote dengan:
   ```bash
   npm run clean:branches
   ```
4. **Format Pesan Commit (Conventional Commits)**:
   - `feat(...)`: Penambahan fitur baru.
   - `fix(...)`: Perbaikan bug atau penyesuaian error.
   - `docs(...)`: Pembaruan dokumen laporan / PRD.
   - `test(...)`: Pembuatan atau pembaruan berkas pengujian.
   - `refactor(...)`: Restrukturisasi kode tanpa mengubah fungsionalitas.

---

> **Catatan Pengingat Tim:**  
> Dokumen ini adalah acuan kerja bersama. Periksa checklist tugas masing-masing dan koordinasikan progres secara berkala agar proyek SI-PATIR selesai tepat waktu dengan kualitas akademik dan teknis tertinggi!
