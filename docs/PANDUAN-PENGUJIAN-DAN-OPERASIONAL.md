# 📘 Panduan Lengkap Pengujian, Operasional & Arsitektur SI-PATIR

> **Proyek:** SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori — DevOps Lite*)  
> **Mata Kuliah:** Pemrograman Integratif (Tugas Kelompok Rekayasa Perangkat Lunak)  
> **Versi Dokumen:** `v2.2.0-Academic` | **Status:** `APPROVED & PRODUCTION-READY`  
> **Repositori Resmi:** [github.com/denoyey/si-patir](https://github.com/denoyey/si-patir)  
> **Portal Web:** Dashboard: `http://localhost:3000/dashboard` • Dokumentasi & Lab: `http://localhost:3000/docs`

---

## 👥 Profil Tim Pengembang (4 Mahasiswa)

| No | Pengembang | Peran Teknis (*Jobdesk*) | Fokus Rekayasa Utama | GitHub |
|:--:|:-----------|:-------------------------|:---------------------|:-------|
| **1** | **Deni** | `Project Lead & DevOps Integrator` | Backend Gateway REST API v1 modular, Kriptografi HMAC SHA-256 (`crypto.timingSafeEqual`), Public Webhook Tunnel, CI/CD Pipeline. | [@denoyey](https://github.com/denoyey) |
| **2** | **Fatir** | `Integrations Lead & Database Engineer` | Skema basis data relasional MySQL2, In-Memory Failover Engine, Task State Machine, Outbound Discord Webhook Embeds. | [@Patirparkerr](https://github.com/Patirparkerr) |
| **3** | **Rafli** | `Frontend UI & Data Visualization Engineer` | Antarmuka Dashboard React 19, Tabel Tugas Filament v5, Terminal Web Git, Analitik SVG (Bar & Donut), Responsivitas 100% Multi-Device & iPhone. | [@muhamadrafli16](https://github.com/muhamadrafli16) |
| **4** | **Fajri** | `QA, Security Testing & Academic Documentation` | Automated Unit Testing Vitest (28/28 passed), Lab Simulator Keamanan Siber `/docs`, 6 Diagram Arsitektur UML formal, Naskah Presentasi PPT. | [@AATTTRAWRRR](https://github.com/AATTTRAWRRR) |

---

## 🏛️ 1. Ringkasan Arsitektur Sistem (3-Tier Architecture)

SI-PATIR dibangun menggunakan arsitektur **3-Tier Berorientasi Layanan (Service-Oriented)** dengan paradigma **Event-Driven Push** menggantikan metode *Polling* konvensional yang boros sumber daya:

```text
[ Mahasiswa / Developer ]
          │  git commit -m "Selesaikan modul [done #TASK-02]"
          ▼
   [ GitHub Repository ]
          │  HTTP POST (Event: push payload + X-Hub-Signature-256)
          ▼
[ Cloudflare Tunnel / Gateway ] ──> (Bypass CGNAT / Localhost Exposure)
          │
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND GATEWAY (PORT 5000)                       │
│                                                                        │
│  [ Gate 1: Helmet CSP ] ──> [ Gate 2: Rate Limiter 30 req/m ]          │
│                                  │                                     │
│  [ Gate 3: Payload Cap 100kb ] ──> [ Gate 4: HMAC SHA-256 Timing-Safe ]│
│                                  │                                     │
│  [ CommitParserService ] ────────┼─ Regex Matching: [#TASK-XX] & done  │
│                                  │                                     │
│  [ TaskStateEngine ] ────────────┼─ Transisi Status: In Progress ➔ Done│
│                                  │                                     │
│  [ DatabaseService ] ────────────┴─ MySQL2 Prepared Statement (?)      │
│                                     (Fallback: In-Memory RAM Store)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          │ Broadcast Real-Time                             │ Outbound Webhook
          ▼                                                 ▼
┌──────────────────────────────┐              ┌──────────────────────────┐
│   FRONTEND REACT 19 (3000)   │              │   DISCORD NOTIFICATION   │
│                              │              │                          │
│ • Socket.io 'activity_update'│              │ • Bot Embed Notifikasi   │
│ • Filament v5 Data Table     │              │ • Rincian Commit & Poin  │
│ • SVG Leaderboard & Analytics│              │ • Tautan Tugas Selesai   │
│ • 6 Diagram UML (Pan & Zoom) │              └──────────────────────────┘
└──────────────────────────────┘
```

---

## 🚀 2. Prosedur Menjalankan Sistem (Startup Guide)

SI-PATIR dilengkapi skrip otomatisasi **One-Click Startup** yang memiliki mekanisme proteksi *Port Killer* otomatis (membersihkan proses lama di port `5000` dan `3000` sebelum menyalakan server).

### 2.1 Di Linux / macOS
Jalankan file skrip bash starter di direktori utama:
```bash
cd /home/whoami/Documents/Projects/si-patir
./start.sh
```

### 2.2 Di Windows
Cukup klik ganda (*double-click*) file batch:
```cmd
start.bat
```

### 2.3 Perintah Manual (Dua Terminal Terpisah)
Jika ingin menjalankan backend dan frontend secara independen:

* **Terminal 1 — Backend Express (Port 5000):**
  ```bash
  cd backend
  npm install
  npm run dev
  ```
* **Terminal 2 — Frontend Vite React (Port 3000):**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 2.4 Matriks Port & Endpoint Lokal

| Komponen | Port | Protokol | URL Akses | Deskripsi |
| :--- | :---: | :---: | :--- | :--- |
| **Frontend Web** | `3000` | HTTP | `http://localhost:3000` | Dashboard rekayasa, tabel tugas, web git, & analitik tim |
| **Portal Dokumentasi** | `3000` | HTTP | `http://localhost:3000/docs` | Dokumentasi API, Lab Simulator Keamanan, & 6 Diagram UML |
| **Diagram UML Web** | `3000` | HTTP | `http://localhost:3000/docs?tab=uml` | Kanvas vektor SVG UML interaktif (Pan, Zoom, Fullscreen) |
| **Backend REST API** | `5000` | HTTP | `http://localhost:5000/api/v1` | Gateway API v1 modular & ingestion endpoint webhook |
| **OpenAPI / Swagger** | `5000` | HTTP | `http://localhost:5000/api/v1/system/docs` | Dokumen spesifikasi kontrak OpenAPI v3 JSON |
| **WebSocket Engine** | `5000` | WS | `ws://localhost:5000` | Channel real-time Socket.io event `activity_update` |

---

## 🧪 3. Panduan 4 Metode Pengujian Sistem (Testing Manual)

SI-PATIR menyediakan 4 pendekatan pengujian untuk menjamin mutu perangkat lunak pada evaluasi akademik:

```text
                                PENGUJIAN SISTEM SI-PATIR
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         ▼                  ▼                    ▼                  ▼
   [ METODE 1 ]       [ METODE 2 ]         [ METODE 3 ]       [ METODE 4 ]
  Unit Testing       Lab Simulasi Web     Live End-to-End    Code Quality Gate
 (Vitest 28 Suite)    (/docs Portal)       (Git ➔ Web ➔ Bot)  (Lint & Build)
```

---

### METODE 1: Automated Unit Testing (Vitest 28 Test Suites)

Pengujian logika internal tanpa ketergantungan pada server luar.

* **Perintah Eksekusi:**
  ```bash
  npm test
  # atau
  npm test --prefix backend
  ```

* **Cakupan File Test Suite:**
  1. **`backend/tests/CommitParserService.test.ts` (13 Tes):**
     * Memverifikasi ekstraksi tag tugas `#TASK-01` s/d `#TASK-05`.
     * Memverifikasi deteksi aksi penyelesaian (`done`, `resolve`, `fix`, `close`).
     * Memverifikasi aksi pengerjaan (`wip`, `progress`, `start`).
     * Memverifikasi kekebalan terhadap variasi huruf besar/kecil (*case-insensitivity*).
     * Memverifikasi penanganan pesan commit tanpa tag tugas (*graceful ignore*).
  2. **`backend/tests/WebhookSecurityService.test.ts` (9 Tes):**
     * Memverifikasi penerimaan payload sah dengan signature HMAC SHA-256 yang benar (`200 OK`).
     * Memverifikasi penolakan tanda tangan palsu / manipulasi isi JSON (`401 Unauthorized`).
     * Memverifikasi penolakan request tanpa header `X-Hub-Signature-256`.
     * Memverifikasi verifikasi biner waktu konstan (`crypto.timingSafeEqual`) untuk menangkal *Timing Attack*.
  3. **`backend/tests/TaskStatusFlow.test.ts` (6 Tes):**
     * Memverifikasi alur status tugas: `To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Done`.
     * Memverifikasi pencatatan ID commit dan nama author pada database saat mutasi status.

* **Target Keluaran Sukses:**
  ```text
  Test Files  3 passed (3)
       Tests  28 passed (28)
    Duration  ~200ms
  ```

---

### METODE 2: Pengujian Interaktif Keamanan & API di Web (`/docs`)

Disediakan khusus untuk demonstrasi langsung saat presentasi di depan dosen penguji.

* **Langkah Pengujian:**
  1. Buka peramban di alamat: **`http://localhost:3000/docs`**
  2. Klik tab **"5. Lab Pengujian"**:
     * **Uji Coba 1: Keaslian Tanda Tangan HMAC SHA-256**:
       * Klik **"Uji Tanda Tangan Sah (Valid)"** $\rightarrow$ Muncul kotak hijau: `HASIL: TANDA TANGAN ASLI & DITERIMA (HTTP 200)` beserta durasi pemeriksaan waktu konstan dalam nanodetik.
       * Klik **"Uji Tanda Tangan Palsu (Ditolak)"** $\rightarrow$ Muncul kotak merah: `HASIL: DITOLAK KARENA TANDA TANGAN PALSU (HTTP 401)`.
     * **Uji Coba 2: Ketahanan Flooding (Rate Limiter)**:
       * Klik **"Mulai Kirim 35 Request Cepat"**.
       * Sistem mengirim 35 request dalam 1 detik. Request 1 s/d 30 diterima (`200 OK`), dan request 31 s/d 35 seketika diblokir oleh gateway dengan status **`429 Too Many Requests`**.
     * **Uji Coba 3: Ketahanan Anti SQL Injection**:
       * Masukkan karakter berbahaya pada input: `' OR '1'='1`
       * Klik **"Kirim Uji SQLi"**.
       * Database membuktikan sistem aman (`HTTP 404 / Parameterized`), membuktikan karakter tanda kutip tidak merusak kueri SQL.
  3. Klik tab **"3. Katalog API"**:
     * Pilih endpoint (misal: `GET /api/v1/tasks`).
     * Klik **"Kirim Request Langsung"** untuk melihat respons data riil dari backend.

---

### METODE 3: Pengujian Demonstrasi Integrasi Riil (End-to-End Live Demo)

Membuktikan keterhubungan nyata: **Git Commit $\rightarrow$ MySQL Database $\rightarrow$ WebSocket Web $\rightarrow$ Discord Bot**.

#### Skenario 1: Menggunakan Terminal Web Git Terintegrasi (Tercepat)
1. Buka dashboard: `http://localhost:3000/dashboard`
2. Periksa tabel tugas: Pastikan salah satu tugas (misal `#TASK-02`) masih berstatus `In Progress` atau `To Do`.
3. Scroll ke kartu **"Terminal Web Git Terintegrasi"**:
   * Pilih Kontributor: **Deni** atau **Rafli**.
   * Klik tombol tag cepat: **`#TASK-02`**.
   * Klik tombol biru: **"Eksekusi Commit & Push"**.
4. **Verifikasi Bukti Real-Time (Tanpa Reload Halaman):**
   * ✅ Kartu `#TASK-02` di tabel langsung berpindah status menjadi hijau **`Done`**.
   * ✅ Item commit baru langsung muncul di panel kanan *Live Activity Stream*.
   * ✅ Diagram batang kontribusi developer langsung bertambah 1 poin.
   * ✅ Notifikasi *embed* terkirim seketika ke grup Discord tim.

#### Skenario 2: Menggunakan Terminal OS / cURL (Simulasi Push GitHub)
Jalankan perintah cURL berikut di terminal:
```bash
curl -X POST http://localhost:5000/api/v1/webhooks/github \
  -H "Content-Type: application/json" \
  -d '{
    "repository": { "name": "si-patir" },
    "commits": [
      {
        "id": "e4f8b91a2c3d",
        "message": "fix: selesaikan modul integrasi webhook [done #TASK-03]",
        "author": { "username": "Patirparkerr", "name": "Fatir" }
      }
    ]
  }'
```

---

### METODE 4: Uji Mutu Kode, Linter & Build Produksi

Memastikan integritas kode, kebersihan tipe data TypeScript, dan kesiapan rilis.

```bash
# 1. Uji Linter Frontend (Oxlint)
npm run lint

# 2. Uji Type Checking TypeScript (Backend & Frontend)
npm run typecheck

# 3. Uji Build Produksi Vite & TSC
npm run build
```

> **Target Keberhasilan:** 0 error linter, 0 type error, dan build Vite menghasilkan bundle asset teroptimasi.

---

## 📋 4. Katalog Lengkap 24 Endpoint REST API v1

Seluruh endpoint backend dirancang dengan standar RESTful modular di bawah prefix `/api/v1`:

### 4.1 Modul Tugas (Tasks API)
| Method | Path | Deskripsi | Akses |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/v1/tasks` | Mengambil seluruh daftar tugas beserta status dan PIC | Publik |
| `GET` | `/api/v1/tasks/:id` | Mengambil rincian 1 tugas spesifik berdasarkan ID | Publik |
| `POST` | `/api/v1/tasks` | Membuat tugas baru ke basis data | Tim |
| `PATCH` | `/api/v1/tasks/:id` | Memperbarui judul, status (`To Do`/`In Progress`/`Done`), atau assignee | Tim |
| `DELETE` | `/api/v1/tasks/:id` | Menghapus tugas dari sistem | Tim |
| `POST` | `/api/v1/tasks/seed` | Melakukan reset dan inisialisasi ulang 5 tugas default tim | Tim |

### 4.2 Modul Webhook (Webhooks Ingestion API)
| Method | Path | Deskripsi | Akses |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/v1/webhooks/github` | Menerima event push commit GitHub & validasi HMAC | GitHub / Tunnel |
| `POST` | `/api/v1/webhooks/test-commit` | Endpoint simulasi push commit langsung dari UI dashboard | Web Terminal |
| `POST` | `/api/v1/webhooks/discord/test` | Menguji pengiriman notifikasi rich embed ke Discord Webhook | Admin Tim |

### 4.3 Modul Kontributor & Tim (Members API)
| Method | Path | Deskripsi | Akses |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/v1/members` | Mengambil daftar 4 anggota tim resmi beserta skor commit | Publik |
| `GET` | `/api/v1/members/:username` | Mengambil profil spesifik anggota tim | Publik |
| `POST` | `/api/v1/members/clean-dummies` | Menghapus akun-akun dummy dan mereset ke 4 anggota resmi | Tim |
| `POST` | `/api/v1/members/sync-github` | Melakukan sinkronisasi riwayat commit riil dari API GitHub | Tim |

### 4.4 Modul Workspace Proyek (Projects API)
| Method | Path | Deskripsi | Akses |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/v1/projects` | Mengambil daftar workspace multi-repo yang terdaftar | Publik |
| `POST` | `/api/v1/projects` | Mendaftarkan workspace / repositori baru | Tim |
| `PATCH` | `/api/v1/projects/:id` | Mengubah konfigurasi repositori & URL Webhook Discord | Tim |
| `DELETE` | `/api/v1/projects/:id` | Menghapus profil repositori dari workspace | Tim |

### 4.5 Modul Sistem & Keamanan (System & Security Lab API)
| Method | Path | Deskripsi | Akses |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/v1/system/health` | Status kesehatan server, memori, uptime, & koneksi database | Publik |
| `GET` | `/api/v1/system/security-status` | Status 6 modul proteksi keamanan siber yang aktif di server | Publik |
| `GET` | `/api/v1/system/docs` | Dokumen spesifikasi kontrak OpenAPI v3 JSON | Publik |
| `POST` | `/api/v1/system/test-hmac` | Simulator verifikasi signature HMAC untuk lab `/docs` | Lab Dosen |
| `GET` | `/api/v1/system/test-rate-limit` | Endpoint target untuk uji flooding rate limiter 35 request | Lab Dosen |
| `GET` | `/api/v1/system/test-sqli` | Simulator pemeriksaan proteksi parameterized query anti-SQLi | Lab Dosen |
| `GET` | `/api/v1/system/logs` | Mengambil riwayat log aktivitas webhook & audit log sistem | Publik |

---

## 🛡️ 5. Matriks 6 Lapisan Keamanan Siber Terpasang

| Lapisan | Mekanisme Proteksi | Komponen Kode | Ancaman yang Dicegah |
| :---: | :--- | :--- | :--- |
| **1** | **HMAC-SHA256 Signature Verification** | `WebhookSecurityService.ts` (`crypto.timingSafeEqual`) | Pemalsuan data event Webhook oleh penyerang asing & serangan *Timing Attack*. |
| **2** | **Prepared Statements (Parameterized Queries)** | `DatabaseService.ts` (`mysql2/promise` dengan placeholder `?`) | Pembobolan basis data via *SQL Injection* (`' OR '1'='1`). |
| **3** | **Dual-Tier Rate Limiting** | `express-rate-limit` (30 req/m webhook, 120 req/m API) | Serangan DoS flooding, bot spammer, dan brute-force. |
| **4** | **Payload Size Cap (100 Kilobyte)** | `express.json({ limit: '100kb' })` | Serangan kehabisan memori server akibat *JSON Bomb*. |
| **5** | **Input Sanitization & Tag Stripping** | Regex sanitasi controller & middleware | Serangan *Stored Cross-Site Scripting (XSS)* pada web log stream. |
| **6** | **HTTP Security Headers (Helmet CSP)** | `helmet()` (`X-Frame-Options: DENY`, `X-Content-Type-Options`) | Penipuan klik melalui iframe (*Clickjacking*) & *MIME sniffing*. |

---

## 🎓 6. Cheatsheet Evaluasi Dosen (Tanya Jawab Ujian)

Pertanyaan kritis yang umum diajukan dosen pengampu mata kuliah **Pemrograman Integratif** beserta panduan jawaban ilmiahnya:

### Q1: Mengapa kelompok Anda memilih Webhook dibandingkan Polling berkala?
> **Jawaban Mahasiswa:**  
> Polling berkala membuat klien berulang kali bertanya ke server setiap beberapa detik sekalipun tidak ada data baru, sehingga memboroskan bandwidth, kuota API GitHub, dan siklus CPU server. Sebaliknya, Webhook menerapkan paradigma **Event-Driven Push**—GitHub hanya mengirimkan data tepat saat ada commit baru, sehingga efisiensi mencapai $100\%$ dengan latensi di bawah 2.5 detik.

### Q2: Bagaimana server membuktikan bahwa data webhook benar-benar dari GitHub resmi?
> **Jawaban Mahasiswa:**  
> Melalui verifikasi kriptografi **HMAC SHA-256**. GitHub dan server kami memegang *Shared Secret Key* yang sama. GitHub menghitung digest hash dari seluruh badan JSON dan mengirimkannya di header `X-Hub-Signature-256`. Server kami menghitung ulang hash payload yang masuk lalu mencocokkannya. Jika berbeda 1 karakter saja, request ditolak dengan HTTP `401 Unauthorized`.

### Q3: Mengapa verifikasi hash menggunakan `crypto.timingSafeEqual` dan bukan operator `===` biasa?
> **Jawaban Mahasiswa:**  
> Operator `===` membandingkan string karakter demi karakter dan langsung berhenti pada huruf pertama yang salah (*early exit*). Peretas dapat mengukur perbedaan waktu respons server dalam skala nanodetik untuk menebak kata kunci (*Timing Attack*). Fungsi `crypto.timingSafeEqual` menjamin durasi eksekusi selalu konstan di setiap pengujian berapapun karakter yang salah.

### Q4: Bagaimana cara sistem Anda mencegah pembobolan database SQL Injection?
> **Jawaban Mahasiswa:**  
> Seluruh kueri database dieksekusi menggunakan **Prepared Statements** dari driver `mysql2/promise` dengan placeholder `?`. Database mengompilasi struktur kueri SQL terlebih dahulu sebelum mengikat nilai parameter pengguna. Dengan demikian, input berbahaya seperti `' OR '1'='1` hanya dianggap sebagai teks pencarian biasa dan tidak dapat mengubah logika kueri SQL.

### Q5: Bagaimana layar Dashboard web bisa terupdate otomatis tanpa refresh halaman?
> **Jawaban Mahasiswa:**  
> Kami mengintegrasikan **WebSocket dua arah berbasis Socket.io**. Begitu webhook commit diproses dan database MySQL berhasil dimutasi, server Express langsung memancarkan (*broadcast*) event `activity_update` ke seluruh klien web yang terhubung. State React 19 langsung merender ulang baris tabel dan grafik analitik secara instan.

### Q6: Bagaimana jika service MySQL lokal mati saat ada commit masuk?
> **Jawaban Mahasiswa:**  
> Sistem kami dilengkapi subsistem **In-Memory Fallback Engine**. Jika koneksi MySQL terputus, backend tidak akan mengalami *crash*, melainkan otomatis mengalihkan penyimpanan data tugas dan log ke dalam memori RAM sementara. Notifikasi ke Discord tetap terkirim lancar, dan saat koneksi MySQL pulih sistem dapat dihubungkan kembali.

### Q7: Mengapa ukuran body JSON dibatasi maksimal 100kb?
> **Jawaban Mahasiswa:**  
> Untuk mencegah serangan *Denial of Service (DoS)* jenis *JSON Bomb*. Jika ukuran tidak dibatasi, penyerang bisa mengirimkan file JSON puluhan megabyte yang memaksa mesin V8 Node.js mengonsumsi memori besar saat proses parsing hingga menyebabkan *Out-of-Memory (OOM) Crash*.

---

## ⏱️ 7. Skenario Demonstrasi 30 Detik (Runbook Presentasi)

Saat giliran presentasi di depan kelas, ikuti alur 3 langkah ini:

1. **Langkah 1 (Kondisi Awal - 10 Detik):**  
   Buka `http://localhost:3000/dashboard`. Tunjukkan bahwa tugas `#TASK-02` masih berada pada kolom `In Progress` / `To Do` dan tunjukkan konektivitas sistem menyala hijau.
2. **Langkah 2 (Pemicu Automasi - 10 Detik):**  
   Pada panel *Terminal Web Git Terintegrasi*, pilih nama Anda, pilih tugas `#TASK-02`, lalu klik tombol **"Eksekusi Commit & Push"**.
3. **Langkah 3 (Pembuktian Integrasi - 10 Detik):**  
   Tunjukkan kepada dosen bahwa status tugas `#TASK-02` seketika berubah menjadi hijau **`Done`**, log baru muncul di *Live Stream*, diagram kontribusi bertambah, dan kanal Discord tim berbunyi notifikasi embed secara bersamaan tanpa me-refresh halaman.

---

<div align="center">
  <sub>Dokumen resmi disusun untuk kelengkapan akademik dan evaluasi proyek Pemrograman Integratif SI-PATIR.</sub>
</div>
