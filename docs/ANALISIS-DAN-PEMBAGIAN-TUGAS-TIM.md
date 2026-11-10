# ANALISIS GAP PROYEK & PEMBAGIAN TUGAS TIM (SI-PATIR)
> **Nama Proyek:** SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori*)  
> **Tanggal Pembaruan Dokumen:** 10 November 2026  
> **Status:** `ACTIVE SPRINT ROADMAP` | **Versi:** `2.2.0`  
> **Anggota Tim (4 Orang):** Deni (Lead), Rafli, Fatir, Fajri  
> **Repositori Resmi:** `https://github.com/denoyey/si-patir`  
> **Papan Trello Resmi:** `https://trello.com/b/1GJ7t2HK/si-patir-sprint-board`  

---

## 1. Analisis Status Proyek Terkini (Current State Analysis)

Berdasarkan audit arsitektur kode dan implementasi sistem SI-PATIR terkini, berikut adalah pemetaan lengkap fitur yang **sudah selesai diimplementasikan & diverifikasi** vs fitur yang **masih dalam tahap pengerjaan / rencana lanjutan**:

### 1.1 Apa yang Sudah Selesai (Completed & Verified) ✅
1. **Frontend Modern & Dashboard UI (React 19 + Tailwind v4 + GSAP + Lenis + Poppins)**:
   - **Interactive Landing Page**: Hero section interaktif, diagram visual alur kerja Git ➔ Trello ➔ Discord, kartu fitur, preview mockup, dan showcase tim resmi.
   - **Theme Switcher Cerdas**: Mode `System OS`, `Light`, dan `Dark` dengan persistensi otomatis di `localStorage` dan kepatuhan kontras WCAG AA.
   - **Lenis Smooth Scroll OOP Engine**: Gulir halaman halus matematis dengan tombol Back to Top melayang, auto-scroll stream log, dan *Route Scroll Restoration*.
   - **Tabel Tugas Gaya Filament v5**: Data table kartu tugas dengan pagination dinamis (pilihan per-page 5/10/25/50, nomor halaman aktif), pencarian teks instan, filter status (*To Do*, *In Progress*, *Done*), serta filter per developer.
   - **Terminal Web Git Terintegrasi**: Terminal eksekusi commit langsung di dashboard web (bukan sekadar simulator atau teks panduan) dengan chip pemilih kontributor dan chip tugas cepat (`#TASK-01` s/d `#TASK-05`).
   - **Dialog Konfirmasi Tanpa Blur**: Penggantian dialog bawaan `window.confirm` dengan custom modal confirmation dialog yang responsif dan elegan.
   - **Real-Time WebSocket Stream & Toast**: Notifikasi toast dinamis saat ada aktivitas commit baru, tugas selesai, perubahan status, atau sinkronisasi data Trello.
2. **Backend Gateway, Security & REST API v1 Architecture**:
   - Express 5 + TypeScript berarsitektur OOP (`Application.ts`, controllers, services, repositories).
   - **REST API v1 Terstruktur**: Endpoint modular `/api/v1/tasks`, `/api/v1/members`, `/api/v1/webhooks`, dan `/api/v1/system` dengan backward compatibility.
   - **Interactive REST API Explorer (`/api/docs`)**: Halaman dokumentasi interaktif yang **100% responsif di seluruh perangkat dan full support iPhone (iOS Safari)**:
     - Mendukung Safe Area Insets & Notch/Dynamic Island iPhone (`viewport-fit=cover`).
     - Pencegahan auto-zoom mengganggu pada iOS Safari (`font-size: 16px` pada input mobile).
     - Pencarian live endpoint, filter kategori, copy cURL instan, dan uji tembak API langsung dari browser.
   - **Keamanan Ketat (Hardening)**: Verifikasi tanda tangan HMAC SHA-256 constant-time (`crypto.timingSafeEqual`), Helmet CSP compliance (`script-src-attr 'unsafe-inline'`), IP Rate Limiter (120 req/min umum, 30 req/min webhook), dan strict CORS policy.
3. **Integrasi Trello API Nyata Dua Arah (Bidirectional Kanban Sync)**:
   - Papan resmi tim terhubung penuh: `https://trello.com/b/1GJ7t2HK/si-patir-sprint-board`.
   - Sinkronisasi kartu otomatis: `moveCardToDone()`, `createCard()`, `deleteCard()`, `moveCardByStatus()`, dan `syncBoardToLocalDatabase()`.
   - Sinkronisasi 100% antara database MySQL dan papan Trello untuk 5 kartu tugas utama (`#TASK-01` s/d `#TASK-05`).
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
   - **Isolasi Penuh 3-Sistem**: Integrasi repositori GitHub, board Trello, dan webhook Discord dibundel menjadi satu kesatuan profil proyek mandiri untuk mencegah kontaminasi data (*cross-pollution*).
   - **Tabel `projects` & REST API v1 (`/api/v1/projects`)**: CRUD profil proyek lengkap dengan proteksi proyek default ID 1 (SI-PATIR).
   - **Project Switcher & Configuration Modal di Dashboard**: Modal interaktif di frontend untuk beralih proyek aktif, mengedit kredensial integrasi, dan mendaftarkan proyek baru secara live.
   - **Webhook Routing Cerdas**: Backend secara otomatis mencocokkan repo GitHub pada payload webhook untuk menggerakkan kartu Trello dan mengirim notifikasi Discord ke proyek yang tepat.

---

### 1.2 Matriks Status Kebutuhan Proyek (Project Gap Matrix)

| No | Modul / Kebutuhan | Kondisi Saat Ini | Status | Penanggung Jawab |
| :--- | :--- | :--- | :---: | :---: |
| 1 | **Trello Board Nyata** | Papan resmi aktif, kredensial `.env` terkonfigurasi, pergeseran kartu dua arah berfungsi 100%. | **SELESAI (DONE)** ✅ | Fatir |
| 2 | **Pendaftaran Akun Anggota Nyata** | 4 akun GitHub resmi (`@denoyey`, `@muhamadrafli16`, `@Patirparkerr`, `@AATTTRAWRRR`) tersinkron ke MySQL & klasemen. | **SELESAI (DONE)** ✅ | Fatir & Deni |
| 3 | **REST API v1 & Interactive API Explorer** | Endpoint modular v1 aktif, halaman `/api/docs` interaktif dan full support iPhone/mobile. | **SELESAI (DONE)** ✅ | Deni |
| 4 | **Terminal Web Git di Dashboard** | Terminal langsung di web tanpa perlu buka terminal OS/laptop, otomatis geser Trello & catat riwayat. | **SELESAI (DONE)** ✅ | Rafli & Deni |
| 5 | **Sinkronisasi Commit GitHub ke Stream** | Riwayat commit asli GitHub otomatis diimpor ke stream live (`activity_logs`). | **SELESAI (DONE)** ✅ | Deni & Fatir |
| 6 | **Deployment Publik / Webhook Gateway (HTTPS URL)** | Skrip tunnel lintas platform aktif via `npm run tunnel` (LocalTunnel & Cloudflare), siap menghubungkan webhook GitHub.com ke backend lokal. | **SELESAI (DONE)** ✅ | Deni |
| 7 | **CI/CD Pipeline (GitHub Actions)** | Workflow `.github/workflows/ci.yml` aktif memvalidasi `tsc --noEmit`, `oxlint`, Vite build, dan automated tests saat PR/push ke `main`. | **SELESAI (DONE)** ✅ | Deni |
| 8 | **Visualisasi Grafik Kontribusi (Analytics Chart)** | Tersedia diagram batang perbandingan commit & diagram donat status sprint berbasis SVG presisi tinggi. | **SELESAI (DONE)** ✅ | Rafli |
| 9 | **Modal Edit Tugas Lengkap** | Modal interaktif (`EditTaskModal.tsx`) terintegrasi tabel untuk mutasi judul, assignee, dan status dengan sinkronisasi Trello. | **SELESAI (DONE)** ✅ | Rafli |
| 10 | **Export Laporan Sprint (PDF / CSV)** | Dukungan export CSV dengan UTF-8 BOM dan pencetakan PDF bersih via styling `@media print`. | **SELESAI (DONE)** ✅ | Rafli |
| 11 | **Trello Webhook Listener (Inbound)** | Belum ada listener webhook otomatis saat kartu digeser langsung di Trello.com. | **PENDING (P3)** ⏳ | Fatir |
| 12 | **Automated Unit Testing (Vitest/Jest)** | Suite unit test otomatis 28 skenario: CommitParser, WebhookSecurity HMAC, dan TaskStatusFlow. | **SELESAI (DONE)** ✅ | Fajri |
| 13 | **Security Penetration & Load Testing** | Belum ada tabel hasil uji batas rate limiter dan pengujian beban payload. | **PENDING (P2)** ⏳ | Fajri |
| 14 | **Laporan Akademik Formal (Bab 1–5 & UML)** | Dokumen laporan formal skripsi/tugas besar & diagram arsitektur UML belum selesai. | **PENDING (P1)** ⏳ | Fajri |
| 15 | **Slide Presentasi & Skenario Demo Dosen** | Bahan tayang presentasi Canva/PPT dan runbook naskah demo belum dibuat. | **PENDING (P1)** ⏳ | Fajri |
| 16 | **Konfigurasi Profil Proyek Dinamis & Multi-Repo** | Multi-repo terisolasi, modal switcher, per-project Trello board & Discord webhook. | **SELESAI (DONE)** ✅ | Deni & Rafli |

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

## 3. Rincian Jobdesk Mendalam untuk Setiap Anggota

---

### 👤 1. DENI (Lead Engineer & DevOps Integrator)
* **Akun GitHub:** `@denoyey` (Repo Owner & Team Lead)
* **Peran Utama:** Pimpinan Proyek, Arsitek Backend Gateway, Keamanan Sistem, dan Integrasi Server.

#### Checklist Pekerjaan:
- [x] **1.1 Arsitektur Backend Gateway REST API v1**:
  - Bangun Express 5 + TypeScript OOP dengan pemisahan Controller, Service, dan Repository.
  - Implementasikan routing modular `/api/v1/tasks`, `/api/v1/members`, `/api/v1/webhooks`, dan `/api/v1/system`.
- [x] **1.2 Gateway Security Hardening & Rate Limiter**:
  - Pasang verifikasi signature HMAC SHA-256 konstan (`crypto.timingSafeEqual`) untuk validasi webhook GitHub.
  - Terapkan Helmet CSP header dengan konfigurasi `script-src-attr 'unsafe-inline'`.
  - Pasang Rate Limiter ketat (120 req/min general, 30 req/min webhook endpoint).
- [x] **1.3 Dokumentasi REST API Explorer Interaktif (`/api/docs`)**:
  - Bangun halaman explorer API interaktif dengan live runner request dan copy cURL.
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
  - Hubungkan `WebhookController`, `TrelloIntegrationService`, dan `DiscordNotificationService` untuk isolasi per-proyek (*anti cross-pollution*).
- [x] **1.9 Setup CI/CD Pipeline (GitHub Actions)**:
  - Buat berkas `.github/workflows/ci.yml` yang otomatis menjalankan:
    1. Backend `tsc --noEmit` & `npm run build`
    2. Frontend `oxlint`, `tsc --noEmit`, & `npm run build`
    3. Automated test gate (`npm test --if-present`) pada setiap Pull Request & push ke branch `main`.
- [ ] **1.10 Code Review & Branch Governance**:
  - Tinjau setiap Pull Request dari rekan tim (Rafli, Fatir, Fajri) sebelum di-merge ke branch `main`.

* **Berkas Kerja Utama:**
  - `backend/src/Application.ts`
  - `backend/src/controllers/WebhookController.ts`
  - `backend/src/controllers/ProjectController.ts`
  - `backend/src/database/repositories/ProjectRepository.ts`
  - `backend/src/docs/renderApiDocsHtml.ts`
  - `backend/src/services/GitHubIntegrationService.ts`
  - `backend/src/middlewares/SecurityMiddleware.ts`
  - `scripts/setup-public-tunnel.sh`
  - `scripts/setup-public-tunnel.bat`
  - `.github/workflows/ci.yml`

---

### 👤 2. RAFLI (Frontend UI & Data Visualization Engineer)
* **Akun GitHub:** `@muhamadrafli16` (Frontend Specialist • Collaborator)
* **Peran Utama:** Pengembangan Antarmuka Dashboard, Interaktivitas Data, Desain Responsif, dan Visualisasi Analitik.

#### Checklist Pekerjaan:
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
  - Sediakan chip pintasan tugas cepat (`#TASK-01` s/d `#TASK-05`) yang otomatis mengisi pesan commit.
- [x] **2.4 Theme Switcher & Navigasi Mulus**:
  - Integrasikan Theme Switcher 3-mode (`System`, `Light`, `Dark`) dengan persistensi `localStorage`.
  - Terapkan Lenis Smooth Scroll dan tombol Back to Top dinamis.
- [x] **2.5 Custom Dialog Konfirmasi & Toast Notifikasi**:
  - Buat komponen modal dialog konfirmasi kustom tanpa blur (`ConfirmDialog.tsx`).
  - Pasang notifikasi toast real-time yang menangani event tugas selesai, pembaruan status, commit, dan sinkronisasi Trello.
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

### 👤 3. FATIR (Kanban Trello Integrator & Database Engineer)
* **Akun GitHub:** `@Patirparkerr` (Database & Trello Specialist • Collaborator)
* **Peran Utama:** Integrasi Nyata Papan Trello, Otomasi Kolom Tugas, dan Optimalisasi Basis Data MySQL.

#### Checklist Pekerjaan:
- [x] **3.1 Setup Akun & Papan Trello Resmi Tim**:
  - Buat papan Trello resmi: `https://trello.com/b/1GJ7t2HK/si-patir-sprint-board`.
  - Susun kolom standar Kanban: `To Do`, `in progress`, dan `Done`.
  - Daftarkan kartu tugas awal tim (`#TASK-01` s/d `#TASK-05`).
- [x] **3.2 Konfigurasi API Key & Token Trello**:
  - Dapatkan API Key dan Server Token dari Trello Developer Portal.
  - Ambil Board ID (`6aeda5a802922f9870c61315`) dan Done List ID (`6aeda5a902922f9870c61336`), lalu simpan di `.env`.
- [x] **3.3 Integrasi Nyata Trello API Dua Arah (Bidirectional Integration)**:
  - Bangun `TrelloIntegrationService.ts` yang mendukung:
    1. `moveCardToDone()`: Menggeser kartu ke kolom Done dan menempelkan bukti commit.
    2. `moveCardByStatus()`: Menggeser kartu sesuai perubahan dropdown status di dashboard.
    3. `createCard()`: Menambah kartu baru di Trello saat tugas dibuat di dashboard.
    4. `deleteCard()`: Menghapus kartu di Trello saat tugas dihapus di dashboard.
    5. `syncBoardToLocalDatabase()`: Menarik dan menyamakan semua kartu dari Trello ke MySQL.
- [x] **3.4 Sinkronisasi Penuh 5 Kartu Tugas Trello & MySQL**:
  - Pastikan kartu `#TASK-01`, `#TASK-02`, `#TASK-03`, `#TASK-04`, dan `#TASK-05` sinkron 100% antara Trello dan MySQL.
- [x] **3.5 Skema Database MySQL & In-Memory Fallback**:
  - Rancang dan pelihara skema tabel `members`, `tasks`, dan `activity_logs` di `DatabaseService.ts`.
  - Buat mekanisme in-memory fallback agar aplikasi tidak crash jika koneksi MySQL terputus.
- [x] **3.6 Database Seeder Kolaborator Resmi**:
  - Daftarkan 4 anggota resmi (`@denoyey`, `@muhamadrafli16`, `@Patirparkerr`, `@AATTTRAWRRR`) ke dalam database.
- [ ] **3.7 Trello Inbound Webhook Listener**:
  - Rancang endpoint webhook inbound dari Trello (`/api/v1/webhooks/trello`) agar jika ada anggota yang menggeser kartu langsung di website Trello.com, status di MySQL dan dashboard otomatis ikut terupdate secara real-time.
- [ ] **3.8 Database Backup & Maintenance Script**:
  - Buat script otomatisasi backup dump basis data MySQL (`backup_db.sh` / `backup_db.bat`).
  - Lakukan tuning indeks query untuk performa pencatatan ribuan log aktivitas.

* **Berkas Kerja Utama:**
  - `backend/src/services/TrelloIntegrationService.ts`
  - `backend/src/controllers/TaskController.ts`
  - `backend/src/database/DatabaseService.ts`
  - `backend/src/database/repositories/TaskRepository.ts`
  - `backend/src/database/repositories/MemberRepository.ts`
  - `backend/src/database/repositories/ActivityLogRepository.ts`

---

### 👤 4. FAJRI (Quality Assurance, Security Testing & Academic Docs Specialist)
* **Akun GitHub:** `@AATTTRAWRRR` (QA, Security & Docs Specialist • Collaborator)
* **Peran Utama:** Pengujian Otomatis (QA), Security Testing, Dokumentasi Akademik Formal, dan Runbook Demonstrasi.

#### Checklist Pekerjaan:
- [x] **4.1 Verifikasi Quality Gate Pre-Push**:
  - Pastikan setiap proses commit dan push diverifikasi otomatis oleh compiler TypeScript (`tsc`) dan build frontend (`vite build`).
- [x] **4.2 Audit Keamanan Gateway & Header**:
  - Uji kepatuhan header CSP Helmet dan pastikan tidak ada kebocoran stack trace error pada production mode.
- [x] **4.3 Pengujian Alur Webhook Nyata**:
  - Validasi alur pengiriman pesan Discord dan sinkronisasi kartu Trello saat webhook dijalankan.
- [x] **4.4 Automated Unit Testing Suite (Vitest / Jest)**:
  - Berhasil membuat pengujian otomatis 28 skenario pada folder `backend/tests/`:
    1. `CommitParserService.test.ts`: Uji parsing regex pesan commit (`[done #TASK-01]`, `fix: #TASK-02`, casing variatif, anti-XSS, anti-ReDoS).
    2. `WebhookSecurityService.test.ts`: Uji validasi HMAC SHA-256 (payload valid, signature palsu/spoofed, payload tanpa header signature, anti-CRLF).
    3. `TaskStatusFlow.test.ts`: Uji transisi status tugas (*To Do* ➔ *In Progress* ➔ *Done*).
- [ ] **4.5 Uji Ketahanan Keamanan & Beban (Security & Load Testing)**:
  - Uji batas rate limiter: lakukan 35 request dalam 1 menit ke endpoint webhook dan pastikan sistem merespons dengan HTTP `429 Too Many Requests`.
  - Uji ketahanan terhadap payload raksasa (>100KB) dan karakter khusus (SQL Injection / XSS injection).
  - Susun tabel hasil pengujian Blackbox Testing (Input, Ekspektasi, Hasil Aktual, Status Valid).
- [ ] **4.6 Penyusunan Laporan Akademik Formal (Bab 1 s/d Bab 5)**:
  - Menyusun dokumen laporan resmi tugas besar / skripsi:
    - **Bab 1:** Pendahuluan (Latar Belakang, Identifikasi Masalah, Batasan Masalah, Tujuan & Manfaat).
    - **Bab 2:** Landasan Teori (Webhook, RESTful API, WebSocket Socket.io, HMAC SHA-256, React, Express, MySQL, Trello API, Discord Webhook).
    - **Bab 3:** Analisis & Perancangan Sistem (Use Case Diagram, Activity Diagram Integrasi 3-Sistem, Sequence Diagram Webhook, Entity Relationship Diagram / ERD, Perancangan Antarmuka).
    - **Bab 4:** Implementasi & Hasil Pengujian (Tabel Blackbox Test & Uji Integrasi).
    - **Bab 5:** Kesimpulan & Saran Pengembangan Mendatang.
- [ ] **4.7 Pembuatan Slide Presentasi & Skenario Demo Dosen 30 Detik**:
  - Buat slide presentasi (Canva / PPT) berdesain modern, elegan, dan berbobot akademis.
  - Susun skenario naskah demo 30 detik: Langkah 1 (Tugas di Trello In Progress) ➔ Langkah 2 (Commit Git dengan tag `[done #TASK-XX]`) ➔ Langkah 3 (Kartu Trello otomatis bergeser ke Done) ➔ Langkah 4 (Notifikasi Discord dan Live Stream muncul seketika).

* **Berkas Kerja Utama:**
  - `backend/tests/CommitParser.test.ts` (Pending)
  - `backend/tests/WebhookSecurity.test.ts` (Pending)
  - `docs/academic/LAPORAN-FORMAL-SI-PATIR.md` (Pending)
  - `docs/academic/DIAGRAM-ARSITEKTUR-UML.md` (Pending)
  - `docs/prd/06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md`

---

## 4. Jadwal Sprint & Rencana Tindak Lanjut Tim (Sprint Action Plan)

```
[ FASE 1: Core Foundation & Integrasi 3-Sistem ] ──> STATUS: 100% SELESAI ✅
  ├─ Deni   : Backend Gateway REST API v1, Security Hardening, & Interactive API Docs Explorer
  ├─ Fatir  : Setup Papan Trello Resmi, Bidirectional Sync API, & Database Seeder 4 Anggota
  ├─ Rafli  : Frontend Dashboard React 19, Filament v5 Data Table, & Terminal Web Git
  └─ Fajri  : Quality Gate Pre-push & Validasi Alur Integrasi

[ FASE 2: Fitur Lanjutan, Visualisasi & Pengujian ] ──> STATUS: SEDANG BERJALAN ⏳
  ├─ Deni   : Setup Public Webhook Gateway (Cloudflare Tunnel / LocalTunnel) & CI/CD Actions [SELESAI ✅]
  ├─ Fatir  : Trello Inbound Webhook Listener & Backup Maintenance Script
  ├─ Rafli  : Grafik Analitik Kontribusi Tim, Modal Edit Tugas, & Export Laporan PDF/CSV [SELESAI ✅]
  └─ Fajri  : Automated Unit Testing (Vitest) & Security/Load Testing Report

[ FASE 3: Penyusunan Laporan Akademik & Presentasi Demo ] ──> STATUS: MINGGU DEPAN 📅
  ├─ Fajri  : Penyusunan Dokumen Laporan Bab 1–5, Diagram UML & ERD, serta Slide Canva/PPT
  ├─ Seluruh Tim: Gladi Bersih Demonstrasi Alur 3-Sistem (Git ➔ Trello ➔ Discord ➔ Web)
```

---

## 5. Standar Aturan Kolaborasi Git Tim (Team Git Rules)

Seluruh anggota tim (Deni, Rafli, Fatir, Fajri) **wajib mematuhi** aturan berikut saat mengembangkan kode:

1. **Dilarang Keras Melakukan Direct Push ke Branch `main`**:
   Seluruh pengerjaan fitur wajib menggunakan branch tersendiri:
   - Deni: `feat/devops-public-gateway` atau `feat/ci-cd-pipeline`
   - Rafli: `feat/analytics-chart` atau `feat/export-report`
   - Fatir: `feat/trello-inbound-webhook` atau `feat/db-backup`
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
