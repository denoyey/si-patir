# 📊 Panduan & Materi Presentasi Tugas Kelompok (Slide Deck)
**Mata Kuliah**: Pemrograman Integratif  
**Proyek**: SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori - DevOps Lite*)  
**Format Tayang**: PowerPoint / Canva / Google Slides  
**Alokasi Waktu Total**: 15 – 20 Menit (Presentasi Materi 12 Menit + Live Demo 4 Menit + Tanya Jawab 4 Menit)

---

## 👥 Struktur Tim & Pembagian Giliran Bicara di Depan Kelas

Setiap anggota tim memiliki alokasi segmen materi dan demonstrasi yang berimbang sesuai spesialisasi teknis masing-masing:

| No | Anggota & Akun GitHub | Peran di Proyek | Segmen Slide yang Dipresentasikan | Peran Saat Live Demo di Kelas |
|:--:|:----------------------|:----------------|:-----------------------------------|:------------------------------|
| **1** | **Deni**<br>(`@denoyey`) | *Project Lead & Lead Architect* | **Slide 1 – Slide 4 + Slide 14**<br>(Pembukaan, Latar Belakang, Solusi Sistem, Arsitektur Multi-Protokol, Penutup & Q&A) | Membuka sesi demo, memandu pengantar skenario alur integrasi ke dosen. |
| **2** | **Fatir**<br>(`@Patirparkerr`) | *Integrations Lead & Database Engineer* | **Slide 5 – Slide 8**<br>(Cara Kerja End-to-End, Skema Database MySQL & Task State Engine, Katalog Lengkap Semua Endpoint REST API Bagian 1 & 2) | Memperlihatkan hasil mutasi data di MySQL Workbench dan pesan bot di channel Discord. |
| **3** | **Fajri**<br>(`@AATTTRAWRRR`) | *QA, Security Testing & Documentation Specialist* | **Slide 9 – Slide 10 + Slide 12**<br>(7 Lapisan Keamanan Siber, Kriptografi HMAC SHA-256 Anti-Timing Attack, QA Testing Vitest 28/28 & Simulator `/docs`) | Menjalankan simulator penolakan signature palsu (401), rate limiter 35 req (429), dan anti-SQLi di depan dosen. |
| **4** | **Rafli**<br>(`@muhamadrafli16`) | *Frontend UI & Data Visualization Engineer* | **Slide 11 + Slide 13**<br>(Antarmuka Dashboard React 19, Terminal Web Git Interaktif, Visualisasi Analitik SVG, dan Pemandu Utama Live Demo) | Memandu navigasi UI, mengeksekusi commit cepat dari Web Git Terminal, dan menunjukkan update realtime WebSocket. |

---

## 📑 Materi Slide per Slide (Poin Tayang, Visual & Naskah Bicara Lengkap)

---

### 🖥️ Slide 1: Judul Proyek & Pengenalan Tim
- **Judul Slide**: SI-PATIR: Platform Integrasi Pemantau Aktivitas Tugas & Informasi Repositori
- **Sub-judul**: Otomasi Kolaborasi Terintegrasi Berbasis Webhook API, WebSocket Real-Time, dan Keamanan Siber Berlapis
- **Informasi Mata Kuliah**: Tugas Kelompok Mata Kuliah Pemrograman Integratif
- **Poin Anggota di Slide**:
  - **Deni** (`@denoyey`) — *Project Lead & Backend Gateway Architecture*
  - **Fatir** (`@Patirparkerr`) — *Database Design & System Integrations*
  - **Fajri** (`@AATTTRAWRRR`) — *Quality Assurance, Security Testing & Academic Documentation*
  - **Rafli** (`@muhamadrafli16`) — *Frontend Dashboard & Data Visualization*
- **Visual**: Foto tim / avatar resmi GitHub + logo SI-PATIR + logo GitHub, Discord, MySQL, Express, dan React.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Selamat pagi/siang kepada Bapak/Ibu Dosen pengampu dan rekan-rekan mahasiswa sekalian. Kami dari Kelompok Pengembang SI-PATIR beranggotakan Deni, Fatir, Fajri, dan Rafli. Pada kesempatan hari ini, kami akan mempresentasikan proyek perangkat lunak yang kami bangun untuk memenuhi tugas mata kuliah Pemrograman Integratif. Kami membangun platform bernama SI-PATIR, yaitu sistem integrasi cerdas yang menghubungkan repositori Git, basis data relasional MySQL, chat bot Discord, dan dashboard web reaktif secara otomatis, aman, dan tanpa perlu refresh manual."*

---

### 🖥️ Slide 2: Latar Belakang Masalah & Urgensi Integrasi
- **Judul Slide**: Latar Belakang Masalah: Dilema Kolaborasi Tim Developer
- **Poin Masalah di Slide**:
  1. **Status Tugas Sering Tidak Sinkron (*Sync Friction*)**: Developer sering lupa memperbarui papan tugas (kanban) setelah selesai menulis kode di Git, sehingga progres tim terlihat lambat padahal kode sudah selesai.
  2. **Notifikasi yang Terfragmentasi**: Anggota tim harus membuka banyak tab terpisah (GitHub, papan tugas, dan aplikasi chat) hanya untuk mengetahui perkembangan pekerjaan rekan setim.
  3. **Pemborosan Sumber Daya dengan Polling**: Sistem pemantauan tradisional kerap menggunakan *polling* berkala yang terus menembak server meskipun tidak ada data baru, sehingga memboroskan kuota internet dan CPU server.
  4. **Kerentanan Keamanan pada Endpoint Terbuka**: Integrasi webhook publik di internet rentan terhadap pemalsuan payload (*spoofing*), serangan waktu (*timing attacks*), banjir request (*DoS*), dan kebocoran basis data (*SQL Injection*).
- **Visual**: Ilustrasi developer kewalahan membuka banyak tab terpisah vs ilustrasi satu alur otomatis yang terpusat.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Dalam proyek rekayasa perangkat lunak berkelompok, tantangan terbesar adalah sinkronisasi informasi. Developer yang sibuk menulis kode seringkali lupa membuka papan tugas untuk mengubah status tugasnya menjadi 'Done'. Akibatnya, manajer proyek atau rekan setim mengira tugas tersebut belum dikerjakan. Selain itu, cara lama memantau perubahan dengan teknik polling berkala sangat tidak efisien dan boros kuota. Terlebih lagi, membuka endpoint integrasi ke jaringan publik tanpa perlindungan siber sangat berbahaya. Berangkat dari masalah nyata ini, kami merancang platform SI-PATIR sebagai solusi integrasi event-driven yang efisien dan aman."*

---

### 🖥️ Slide 3: Solusi yang Dibangun — Platform SI-PATIR
- **Judul Slide**: Solusi: SI-PATIR (DevOps Lite Berbasis Event-Driven)
- **Poin Solusi di Slide**:
  - **Zero-Manual Tracking**: Status tugas otomatis berubah menjadi 'Done' di basis data hanya dengan menambahkan tag tugas pada pesan commit Git, misalnya: `git commit -m "Fix login [done #TASK-02]"`.
  - **Integrasi Ekosistem Heterogen**: Menghubungkan 4 platform berbeda ke dalam satu ekosistem terpadu:
    - *GitHub Cloud*: Sebagai Version Control System & event trigger via Webhook.
    - *Express Gateway*: Sebagai pusat pemrosesan logika, sanitasi data, dan verifikasi keamanan kriptografi.
    - *MySQL Relasional*: Sebagai penyimpan data persisten dan penggerak status mesin tugas (*Task State Engine*).
    - *Discord Bot*: Sebagai kanal komunikasi tim otomatis via Outbound Rich Embed Webhook.
    - *React Web Dashboard*: Sebagai antarmuka pemantauan interaktif dengan pembaruan instan WebSocket.
  - **Standar Pertahanan Berlapis (*Defense-in-Depth*)**: Dilengkapi verifikasi HMAC-SHA256 constant-time, prepared statements, rate limiting, dan isolasi multi-repo.
- **Visual**: Arsitektur konseptual alur: Laptop Developer ➔ GitHub ➔ SI-PATIR Gateway ➔ (MySQL + Discord + WebSocket Dashboard).
- **🎙️ Naskah Bicara (Deni)**:
  > *"Solusi yang kami tawarkan adalah SI-PATIR. Konsepnya berorientasi 'DevOps Lite'. Anggota tim tidak perlu mengubah alur kerja mereka: cukup mengetik commit standar di terminal Git lokal atau Terminal Web yang kami sediakan di web. Ketika ada commit yang membawa tag tugas, sistem SI-PATIR langsung menangkap event tersebut secara otomatis, memvalidasi integritas datanya, memperbarui basis data relasional, mengumumkan kartu penyelesaian ke Discord, dan menyiarkan pembaruan ke dashboard web seketika tanpa perlu reload halaman."*

---

### 🖥️ Slide 4: Arsitektur Sistem & Perbandingan Multi-Protokol
- **Judul Slide**: Arsitektur Integrasi: Mengapa Kombinasi Tiga Protokol?
- **Tabel Perbandingan Protokol di Slide**:
  | Protokol | Tipe Komunikasi | Sifat Beban Jaringan | Implementasi di SI-PATIR |
  | :--- | :--- | :--- | :--- |
  | **Webhook API** | *Event-Driven (Push)* | Nol beban idle; hanya aktif saat terjadi push event riil | Menangkap commit dari GitHub & mengirim embed ke Discord |
  | **WebSocket (WSS)** | *Full-Duplex (Persisten)* | Efisien; koneksi dua arah terbuka dengan latensi milidetik | Menyiarkan pembaruan baris tabel dan grafik analitik secara instan |
  | **REST API v1** | *Request - Response (Pull)* | Modular, terstruktur, stateless, dan cacheable | CRUD tugas, manajemen anggota, konfigurasi proyek, & audit log |
  | *(Polling)* | *Terjadwal / Interval Loop* | *Boros bandwidth & CPU; membombardir server tanpa henti* | *Sengaja dieliminasi 100% dari sistem kami* |
- **Poin Arsitektur Three-Tier**:
  - *Tier 1 (Client)*: React 19 SPA, Terminal Web Git, dan Socket.io Client.
  - *Tier 2 (Gateway Server)*: Node.js 22 + Express 5, Security Middlewares, dan Event Emitter.
  - *Tier 3 (Storage & External Services)*: MySQL 8.0, In-Memory Fallback, GitHub API, dan Discord Webhook API.
- **Visual**: Diagram arsitektur 3-tier sistem SI-PATIR.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Dalam mata kuliah Pemrograman Integratif, pemilihan protokol merupakan keputusan arsitektural yang paling fundamental. Kami mengeliminasi teknik polling konvensional karena membebani CPU dan kuota server dengan jutaan request kosong. Sebagai gantinya, kami memadukan tiga protokol modern: Webhook untuk komunikasi Server-to-Server saat ada push commit; WebSocket Socket.io untuk transmisi data realtime Server-to-Browser; serta REST API v1 modular untuk operasi data terstruktur. Selanjutnya, penjelasan alur cara kerja sistem end-to-end dan arsitektur database akan disampaikan oleh rekan saya, Fatir."*

---

### 🖥️ Slide 5: Cara Kerja Sistem SI-PATIR (End-to-End Pipeline)
- **Judul Slide**: Cara Kerja Sistem: Alur Pemrosesan Dari Commit Hingga Realtime
- **8 Tahapan Alur Pemrosesan di Slide**:
  1. **Trigger Commit**: Developer melakukan commit kode dengan tag tugas, contoh: `git commit -m "fix(auth): validasi token [done #TASK-02]"` (baik via Git lokal maupun Terminal Web di dashboard).
  2. **Push Event Dispatch**: GitHub Remote mendeteksi push event dan mengirimkan payload HTTP POST JSON ke public tunnel endpoint `/api/v1/webhooks/github`.
  3. **Security Ingestion Gate**: Server mengecek IP Rate Limiter (maks 30 req/menit) dan ukuran payload (maks 100kb).
  4. **Kriptografi HMAC Verification**: Server mengekstrak header `X-Hub-Signature-256`, menghitung digest HMAC-SHA256 payload dengan secret key proyek, dan membandingkannya menggunakan `crypto.timingSafeEqual`.
  5. **Commit Parser & Sanitasi**: Pesan commit disanitasi dari tag HTML (anti-XSS), lalu tag tugas diekstrak menggunakan regex dengan batas panjang input (anti-ReDoS).
  6. **Mutasi Data Relasional di MySQL**: Status tugas `#TASK-02` diubah menjadi `Done`, total commit & tugas selesai author dinaikkan (+1), dan log audit dicatat ke `activity_logs` via *Prepared Statements*.
  7. **Outbound Discord Notification**: Layanan `DiscordNotificationService` menembakkan HTTP POST ke webhook Discord membawa Rich Embed hijau dengan metadata lengkap dan tautan commit GitHub.
  8. **WebSocket Real-Time Broadcast**: Server Socket.io menyiarkan event `activity_update` ke seluruh browser yang terhubung, sehingga baris tabel tugas dan grafik analitik langsung berpindah tanpa reload!
- **Visual**: Diagram alur sekuensial interaktif (8 kotak bernomor dengan warna gradien biru-hijau).
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Terima kasih Deni. Rekan-rekan dan Bapak/Ibu dosen, ini adalah jantung dari sistem SI-PATIR: bagaimana seluruh ekosistem bekerja secara harmonis dari ujung ke ujung. Saat developer melakukan commit berformat tag tugas, seluruh proses—mulai dari penerimaan webhook oleh server, verifikasi kriptografi HMAC, mutasi status di basis data MySQL, pengiriman notifikasi kartu hijau ke Discord, hingga perubahan tampilan di web dashboard via WebSocket—terjadi secara otomatis dalam waktu kurang dari 15 milidetik! Pengembang tidak perlu lagi memindahkan kartu kanban secara manual."*

---

### 🖥️ Slide 6: Perancangan Basis Data Relasional & Task State Engine
- **Judul Slide**: Arsitektur Basis Data: MySQL Relasional & Task State Engine
- **4 Tabel Utama di Database `sipatir_db`**:
  - `tasks`: Menyimpan kartu tugas sprint (`id`, `task_code`, `title`, `status`, `assignee`, `updated_at`). Status berupa ENUM: `'To Do'`, `'In Progress'`, `'Done'`.
  - `members`: Menyimpan direktori tim (`id`, `name`, `github_username`, `total_commits`, `tasks_done`).
  - `projects`: Mendukung isolasi multi-repo (`id`, `name`, `slug`, `github_repo`, `github_webhook_secret`, `discord_webhook_url`, `is_active`).
  - `activity_logs`: Riwayat audit stream (`id`, `event_type`, `author`, `commit_message`, `task_code`, `status`, `created_at`).
- **Keunggulan Teknis Database**:
  - **Prepared Statements (100% Parameterized Query)**: Kebal dari serangan SQL Injection.
  - **Tuning Indeks Komposit**: Indeks pada `idx_task_created`, `idx_author_created`, dan `idx_event_status` menjamin kueri audit logs tetap kilat meskipun data mencapai puluhan ribu baris.
  - **Subsistem In-Memory Fallback Otomatis**: Jika server MySQL lokal mati atau belum menyala, sistem secara cerdas beralih ke penyimpanan memori internal (RAM). Server tidak crash, API tetap merespons 200 OK, dan notifikasi Discord tetap terkirim normal (*Graceful Degradation*).
- **Visual**: Diagram Entity-Relationship (ERD) relasional 4 tabel dan status transisi Task State Engine.
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Pada lapisan basis data, kami merancang skema relasional di MySQL dengan 4 tabel: members, tasks, projects, dan activity_logs. Kami tidak bergantung pada layanan pihak ketiga seperti Trello; kami mengimplementasikan Task State Engine sendiri di backend. Semua kueri menggunakan Prepared Statements sehingga aman dari ancaman injeksi SQL. Selain itu, kami menyematkan fitur In-Memory Fallback: jika MySQL lokal mati saat presentasi, sistem tidak akan mengalami fatal error atau melempar kode 500, melainkan tetap melayani transaksi data secara mulus menggunakan penyimpanan memori terisolasi."*

---

### 🖥️ Slide 7: Katalog Lengkap Endpoint REST API v1 — Bagian 1 (Tasks & Members)
- **Judul Slide**: Katalog REST API v1: Modul Tugas & Anggota Tim
- **Tabel Spesifikasi Endpoint di Slide**:
  | Metode | Rute Endpoint | Kategori | Fungsi & Parameter | Kode Respons |
  | :---: | :--- | :---: | :--- | :---: |
  | `GET` | `/api/v1/tasks` | Tasks | Mengambil daftar seluruh kartu tugas dari MySQL beserta assignee dan status aktif | `200 OK` |
  | `GET` | `/api/v1/tasks/:id` | Tasks | Mengambil detail spesifik tugas berdasarkan ID numerik atau kode unik (misal: `TASK-02`) | `200 OK` / `404` |
  | `POST` | `/api/v1/tasks` | Tasks | Mendaftarkan kartu tugas baru (Payload: `taskCode`, `title`, `assignee`, `status`) | `201 Created` |
  | `PATCH` | `/api/v1/tasks/:id/status` | Tasks | Mengubah status tugas (`To Do` ➔ `In Progress` ➔ `Done`) & broadcast WebSocket | `200 OK` |
  | `DELETE` | `/api/v1/tasks/:id` | Tasks | Menghapus kartu tugas dari basis data | `200 OK` |
  | `POST` | `/api/v1/tasks/sync-github` | Tasks | Menarik daftar GitHub Issues aktif dan mengubahnya menjadi kartu tugas otomatis | `200 OK` |
  | `GET` | `/api/v1/members` | Members | Mengambil klasemen developer diurutkan berdasarkan total commit & tugas selesai | `200 OK` |
  | `GET` | `/api/v1/members/:username` | Members | Mengambil profil dan statistik kontribusi spesifik seorang developer | `200 OK` / `404` |
  | `POST` | `/api/v1/members` | Members | Mendaftarkan kontributor baru secara manual ke sistem | `201 Created` |
  | `POST` | `/api/v1/members/sync-github` | Members | Sinkronisasi kontributor riil (`denoyey`, `muhamadrafli16`, `Patirparkerr`, `AATTTRAWRRR`) | `200 OK` |
  | `POST` | `/api/v1/members/clear-dummy` | Members | Membersihkan data dummy bawaan agar hanya tersisa 4 anggota tim resmi | `200 OK` |
- **Visual**: Cuplikan respons JSON terformat rapi dari endpoint `/api/v1/tasks` dan `/api/v1/members`.
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Sebagai standar perangkat lunak terintegrasi, kami membangun arsitektur REST API v1 yang modular dan terstandarisasi. Pada modul Tasks dan Members, kami menyediakan total 11 endpoint lengkap dengan operasi CRUD, mutasi status tugas berbasis PATCH, dan sinkronisasi dua arah dengan GitHub. Melalui endpoint ini, frontend dapat memanipulasi data tugas secara aman dan langsung mendapatkan pembaruan seketika."*

---

### 🖥️ Slide 8: Katalog Lengkap Endpoint REST API v1 — Bagian 2 (Webhooks, System, Security & Projects)
- **Judul Slide**: Katalog REST API v1: Webhook, Keamanan, Sistem & Multi-Repo
- **Tabel Spesifikasi Endpoint di Slide**:
  | Metode | Rute Endpoint | Kategori | Fungsi & Fitur Keamanan | Kode Respons |
  | :---: | :--- | :---: | :--- | :---: |
  | `POST` | `/api/v1/webhooks/github` | Webhooks | Receiver utama GitHub Push Event; verifikasi tanda tangan HMAC SHA-256 | `200 OK` / `401` |
  | `POST` | `/api/v1/webhooks/simulate` | Webhooks | Simulator commit lokal untuk pengujian cepat Web Git Terminal tanpa internet | `200 OK` |
  | `GET` | `/api/v1/system/status` | System | Healthcheck status koneksi: MySQL, Discord, GitHub, memori, dan uptime | `200 OK` |
  | `GET` | `/api/v1/system/logs` | System | Mengambil 50 log aktivitas stream terbaru beserta status dan stempel waktu | `200 OK` |
  | `GET` | `/api/v1/system/docs` | System | OpenAPI Discovery: spesifikasi JSON seluruh endpoint API SI-PATIR | `200 OK` |
  | `GET` | `/api/v1/system/security/status` | Security | Laporan status aktif 7 lapisan keamanan siber (*Security Matrix*) | `200 OK` |
  | `POST` | `/api/v1/system/security/verify-hmac` | Security | Endpoint lab uji coba komputasi digest HMAC SHA-256 & timing evaluation | `200 OK` |
  | `GET` | `/api/v1/projects` | Projects | Daftar seluruh repositori/proyek multi-repo yang terdaftar | `200 OK` |
  | `GET` | `/api/v1/projects/active` | Projects | Mengambil detail profil repositori yang sedang aktif digunakan | `200 OK` |
  | `POST` | `/api/v1/projects` | Projects | Menambahkan konfigurasi repositori baru, secret token, dan Discord webhook | `201 Created` |
  | `PUT` | `/api/v1/projects/:id` | Projects | Mengubah pengaturan profil proyek dan kanal webhook | `200 OK` |
  | `POST` | `/api/v1/projects/:id/activate` | Projects | Mengalihkan target repositori aktif secara instan (*Hot-Switching*) | `200 OK` |
  | `DELETE` | `/api/v1/projects/:id` | Projects | Menghapus profil proyek tambahan (proyek utama ID 1 dilindungi) | `200 OK` / `403` |
- **Total Endpoint**: 24 Endpoint Terintegrasi (11 Tasks/Members + 2 Webhooks + 5 System/Security + 6 Projects).
- **Visual**: Diagram rute API berstruktur pohon modular (Prefix `/api/v1`).
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Melengkapi modul tugas, kami juga menyediakan 13 endpoint tingkat lanjut untuk Webhook Gateway, System Healthcheck, Lab Keamanan Siber, dan Multi-Repo Workspace. SI-PATIR tidak hanya mendukung satu repositori, melainkan mampu mengelola banyak repositori sekaligus melalui modul Projects, di mana masing-masing repositori memiliki secret key dan kanal Discord tersendiri tanpa ada kebocoran konfigurasi. Selanjutnya, penjelasan mendalam mengenai 7 lapisan keamanan siber akan dipaparkan oleh rekan saya, Fajri."*

---

### 🖥️ Slide 9: Matriks Keamanan Siber: 7 Lapisan Proteksi (Defense-in-Depth)
- **Judul Slide**: Keamanan Siber: 7 Lapisan Perlindungan (*Defense-in-Depth*)
- **7 Lapisan Pengamanan di SI-PATIR**:
  1. **Verifikasi Webhook Kriptografi HMAC-SHA256**: Memvalidasi integritas dan keaslian payload dari GitHub menggunakan secret key bersama.
  2. **Perlindungan Anti-Timing Attack (`crypto.timingSafeEqual`)**: Evaluasi tanda tangan dilakukan dalam durasi waktu konstan untuk mencegah kebocoran kunci melalui analisis perbedaan nanodetik.
  3. **Proteksi Anti-SQL Injection (Prepared Statements)**: Menggunakan parameterized queries `?` pada driver `mysql2/promise`. Data pengguna tidak pernah digabungkan secara mentah (*concatenation*) ke dalam kueri SQL.
  4. **Two-Tier IP Rate Limiting**:
     - *Webhook Endpoint*: Dibatasi ketat **30 request / menit** per IP untuk mencegah serangan banjir DoS.
     - *General REST API*: Dibatasi **120 request / menit** per IP untuk melindungi server dari scraping agresif.
  5. **Batas Ukuran Payload (Anti-JSON Bomb 100kb)**: `express.json({ limit: '100kb' })` menolak payload berukuran besar dengan kode status `413 Payload Too Large` sebelum server kehabisan memori (*Heap Exhaustion*).
  6. **Sanitasi Input, Anti-XSS & Anti-ReDoS**: Pembersihan tag HTML dari pesan commit, sanitasi karakter berbahaya, dan pembatasan panjang string sebelum pencocokan regex untuk mencegah *Catastrophic Backtracking*.
  7. **Security Headers (Helmet CSP) & Strict CORS**: Mengunci aplikasi dari pembajakan iframe (*Clickjacking*) via `X-Frame-Options: DENY`, mematikan sniffing tipe berkas (*nosniff*), serta membatasi origin domain terpercaya.
- **Visual**: Diagram perisai berlapis (*Layered Shield Diagram*) mengelilingi server backend.
- **🎙️ Naskah Bicara (Fajri)**:
  > *"Terima kasih Fatir. Aspek keamanan siber merupakan salah satu poin penilaian paling krusial dalam tugas mata kuliah ini. Karena gateway webhook terekspos ke jaringan publik, kami menerapkan prinsip Defense-in-Depth dengan 7 lapisan perlindungan. Sistem kami tidak hanya mengandalkan satu pintu; mulai dari pembatasan ukuran payload 100kb untuk menangkal serangan memori JSON Bomb, dua lapis Rate Limiter untuk menangkal banjir DoS, proteksi SQL Injection mutlak dengan Prepared Statements, hingga sanitasi pesan commit terhadap celah XSS dan ReDoS. Seluruh lapisan ini berjalan otomatis sebagai middleware di sisi server."*

---

### 🖥️ Slide 10: Pembuktian Kriptografi: HMAC-SHA256 & Anti-Timing Attack
- **Judul Slide**: Kriptografi Webhook: Menangkal Spoofing & Timing Attack
- **Perbandingan Teknis Validasi Tanda Tangan**:
  - **Celah Bahaya Komparasi String Biasa (`===`)**:
    ```typescript
    // ❌ RENTAN TIMING ATTACK (Early-Exit)
    if (incomingSignature === calculatedSignature) { ... }
    ```
    *Kelemahan*: Operator `===` langsung berhenti (*early-exit*) saat menemukan karakter pertama yang berbeda. Peretas dapat mengirim ribuan tebakan dan mengukur selisih waktu eksekusi dalam fraksi nanodetik untuk merekayasa token karakter demi karakter.
  - **Solusi Standar Industri di SI-PATIR (`crypto.timingSafeEqual`)**:
    ```typescript
    // ✅ AMAN & KEBAL TIMING ATTACK (Constant-Time Execution)
    const sigBuffer = Buffer.from(signatureHeader, 'utf8');
    const compBuffer = Buffer.from(computedDigest, 'utf8');
    if (sigBuffer.length === compBuffer.length) {
      return crypto.timingSafeEqual(sigBuffer, compBuffer);
    }
    ```
    *Keunggulan*: Seluruh byte buffer dievaluasi dari awal hingga akhir dalam durasi waktu yang **selalu konstan**, sehingga tidak ada celah informasi *side-channel* yang bocor ke penyerang.
- **Formula Matematika HMAC-SHA256**:
  $$\text{HMAC}(K, m) = \text{SHA256}\Big((K \oplus \text{opad}) \mathbin{\Vert} \text{SHA256}\big((K \oplus \text{ipad}) \mathbin{\Vert} m\big)\Big)$$
- **Visual**: Ilustrasi grafik perbandingan waktu eksekusi `===` (berfluktuasi) vs `timingSafeEqual` (garis horizontal lurus).
- **🎙️ Naskah Bicara (Fajri)**:
  > *"Di Slide 10 ini, kami ingin menekankan mengapa implementasi verifikasi webhook di SI-PATIR berbeda dengan aplikasi web biasa. Mayoritas aplikasi pemula membandingkan tanda tangan menggunakan operator 'sama dengan tiga kali' (===). Cara tersebut memiliki celah kritis bernama Timing Attack karena perbandingan langsung berhenti saat ada huruf yang beda di awal. Di SI-PATIR, kami menggunakan modul bawaan Node.js crypto.timingSafeEqual yang mengevaluasi buffer bit-per-bit dalam durasi waktu konstan nanodetik. Dengan demikian, pihak penyerang tidak akan pernah bisa menebak rahasia webhook proyek melalui analisis jeda waktu jaringan."*

---

### 🖥️ Slide 11: Desain Antarmuka Frontend & Terminal Web Git
- **Judul Slide**: Antarmuka Frontend Modern React 19 & Terminal Web Git
- **Poin Keunggulan Antarmuka di Slide**:
  - **React 19 + Tailwind CSS**: Antarmuka bersih, cepat, tipografi Poppins, dan konsisten menerapkan radius `rounded-md` serta `rounded-lg` sesuai standar desain manusia (*anti-AI generated clutter*).
  - **Tabel Tugas Interaktif Standar Filament v5**: Fitur pagination dinamis, pencarian cepat instan, filter status tugas, serta modal interaktif untuk menambah dan mengedit kartu tugas.
  - **Terminal Web Git Terintegrasi Langsung di Web**: Developer dapat mengeksekusi commit simulasi langsung di layar browser dengan tombol pintas tugas cepat (`#TASK-02` s/d `#TASK-05`) tanpa harus membuka terminal sistem operasi.
  - **Visualisasi Analitik SVG Presisi Tinggi**:
    - *Commit Bar Chart*: Diagram batang perbandingan produktivitas jumlah commit riil antar-anggota tim (`@denoyey`, `@Patirparkerr`, `@AATTTRAWRRR`, `@muhamadrafli16`).
    - *Sprint Status Donut Chart*: Diagram donat persentase penyelesaian tugas tim (*To Do*, *In Progress*, *Done*).
  - **Multi-Device Responsif & Theme Switcher**: Mendukung mode Gelap, Terang, dan Sistem OS, serta 100% responsif di desktop maupun layar smartphone.
- **Visual**: Tangkapan layar antarmuka dashboard utama, Terminal Web Git, dan grafik analitik SVG.
- **🎙️ Naskah Bicara (Rafli)**:
  > *"Terima kasih Fajri. Untuk antarmuka pengguna, kami membangun dashboard berbasis React 19 dan Tailwind CSS yang elegan dan mudah digunakan. Kami merancang tabel daftar tugas dengan standar Filament v5 yang responsif dan dilengkapi filter dinamis. Fitur unggulan yang kami banggakan adalah Terminal Web Git langsung di dashboard: dosen maupun anggota tim dapat menguji sistem secara instan hanya dengan mengklik pintasan tugas cepat tanpa perlu mengetik di terminal OS. Seluruh metrik capaian dan grafik analitik SVG juga terhubung langsung dengan WebSocket, sehingga tampilan terbarui secara otomatis saat ada aktivitas baru. Selanjutnya, pengujian mutu dan live demo akan kami tunjukkan langsung."*

---

### 🖥️ Slide 12: Penjaminan Mutu (QA) & Simulator Lab Keamanan di Web
- **Judul Slide**: Penjaminan Mutu: 28 Unit Tests & Simulator Lab `/docs`
- **Poin Pengujian di Slide**:
  - **Automated Unit Testing (Vitest)**: 28 skenario pengujian otomatis lulus 100%:
    - *13 Pengujian `CommitParserService`*: Validasi format casing variatif (`[DONE #TASK-01]`, `closes #TASK-02`), sanitasi anti-XSS, dan kekebalan ReDoS string panjang.
    - *9 Pengujian `WebhookSecurityService`*: Uji validitas tanda tangan HMAC SHA-256 asli, penolakan tanda tangan palsu, penanganan payload kosong, dan pembersihan CRLF.
    - *6 Pengujian `TaskStatusFlow`*: Siklus hidup transisi status tugas (`To Do` ➔ `In Progress` ➔ `Done`) dan integritas data riwayat.
  - **Laboratorium Keamanan Interaktif di Halaman `/docs`**:
    Disediakan portal uji coba live dengan tombol simulasi khusus untuk demonstrasi di depan dosen:
    - *Simulasi 1 (HMAC Valid vs Palsu)*: Membuktikan respons `200 OK` pada secret valid dan `401 Unauthorized` pada token palsu.
    - *Simulasi 2 (Banjir Rate Limiter)*: Menembakkan 35 request dalam 1 detik untuk membuktikan respon HTTP `429 Too Many Requests`.
    - *Simulasi 3 (Anti-SQL Injection)*: Mengirimkan string serangan `' OR '1'='1` untuk membuktikan basis data tetap utuh dan kueri berjalan aman.
- **Visual**: Cuplikan layar terminal kelulusan pengujian `vitest run` (28 passed) dan tampilan kartu kartu uji lab di `/docs`.
- **🎙️ Naskah Bicara (Fajri)**:
  > *"Untuk menjamin keandalan sistem, kami menyusun 28 skenario unit test otomatis menggunakan framework Vitest yang semuanya lulus 100%. Selain itu, untuk keperluan evaluasi di kelas, kami juga membangun Laboratorium Keamanan Siber interaktif pada rute `/docs`. Melalui portal ini, Bapak/Ibu dosen dan rekan-rekan dapat menguji langsung proteksi sistem kami: mulai dari membuktikan pemblokiran tanda tangan palsu, memicu blokir rate limiter saat diserang 35 request cepat, hingga membuktikan kekebalan database kami saat disuntik kode SQL Injection. Sekarang, mari kita beralih ke demonstrasi langsung alur sistem ini."*

---

### 🖥️ Slide 13: Skenario Demonstrasi Langsung (Live Demo Runbook)
- **Judul Slide**: Skenario Demonstrasi Langsung (Live Demo 30 Detik)
- **5 Langkah Skenario Demonstrasi di Depan Kelas**:
  1. **Tunjukkan Kondisi Awal Dashboard (10 Detik)**:
     - Buka `http://localhost:3000`. Perlihatkan bahwa indikator sistem semua hijau (`GitHub`, `Discord`, `MySQL`, `WebSocket`).
     - Tunjukkan bahwa kartu tugas **`[#TASK-02] Integrasi Basis Data & Task State Engine`** masih berstatus **`In Progress`**.
  2. **Eksekusi Commit di Terminal Web Git (10 Detik)**:
     - Di bagian bawah dashboard, pilih kontributor (misal: **Fatir** / `@Patirparkerr`).
     - Klik tombol pintas **`#TASK-02`**. Pesan otomatis terisi: `feat: selesaikan integrasi database [done #TASK-02]`.
     - Klik tombol biru **"Kirim Commit"**.
  3. **Amati Mutasi Real-Time di Dashboard (Instant)**:
     - Tanpa me-refresh halaman browser, kartu `#TASK-02` otomatis berubah menjadi hijau **`Done`**.
     - Grafik analitik commit Fatir dan donat status sprint langsung bergeser secara reaktif.
     - Notifikasi toast hijau muncul di pojok kanan bawah.
  4. **Periksa Notifikasi Outbound Discord (5 Detik)**:
     - Buka aplikasi Discord pada kanal tim. Tunjukkan bot **SI-PATIR** baru saja mengirimkan kartu *Rich Embed* hijau lengkap dengan identitas Fatir dan tautan commit.
  5. **Uji Keamanan di Portal `/docs` (5 Detik)**:
     - Buka menu **Docs & Security** (`/docs`) tab **Lab Simulasi Keamanan**.
     - Klik tombol **"Kirim 35 Request Cepat (Banjir Rate Limiter)"**.
     - Tunjukkan bahwa request ke-31 hingga ke-35 langsung diblokir dengan respons merah **`HTTP 429 Too Many Requests`**.
- **🎙️ Pembagian Peran Live Demo**:
  - **Deni**: Membuka dashboard dan menjelaskan skenario tugas awal kepada dosen.
  - **Rafli**: Menavigasi Terminal Web Git, memilih pintasan tugas, dan menekan tombol Kirim Commit.
  - **Fatir**: Membuka Discord dan memperlihatkan pesan bot embed yang baru saja masuk.
  - **Fajri**: Membuka halaman `/docs` dan mengklik simulator uji rate limiter untuk memperlihatkan respon HTTP 429 di depan dosen.

---

### 🖥️ Slide 14: Kesimpulan Proyek & Sesi Tanya Jawab (Q&A)
- **Judul Slide**: Kesimpulan & Sesi Tanya Jawab (Q&A)
- **4 Poin Kesimpulan Utama**:
  1. **Keberhasilan Integrasi Multi-Protokol**: Berhasil memadukan Webhook API, WebSocket, dan REST API v1 menjadi satu arsitektur otomasi yang kohesif.
  2. **Implementasi Keamanan Standar Industri**: Kriptografi HMAC SHA-256 constant-time, Prepared Statements, dan Rate Limiting melindungi gateway publik secara menyeluruh.
  3. **Efisiensi Sumber Daya Maksimal**: Arsitektur event-driven menghemat bandwidth server secara signifikan dibandingkan teknik polling berkala.
  4. **Kesiapan Kolaborasi Tim Nyata**: Proyek dikerjakan secara nyata oleh 4 akun GitHub terverifikasi dengan pembagian tugas yang jelas dan terdokumentasi rapi.
- **Tautan Repositori GitHub**: [github.com/denoyey/si-patir](https://github.com/denoyey/si-patir) *(Lengkap dengan source code, unit test suite, dan dokumentasi UML)*.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Sebagai penutup, melalui tugas mata kuliah Pemrograman Integratif ini, kelompok kami berhasil membuktikan bahwa sistem berbasis event-driven webhook dan websocket mampu menciptakan alur kerja kolaborasi yang jauh lebih cepat, hemat sumber daya, dan aman dibandingkan pendekatan polling konvensional. Seluruh kode sumber, dokumentasi arsitektur UML formal, serta rangkaian unit test telah kami publikasikan di repositori GitHub tim. Sekian presentasi dari kelompok kami. Kami membuka sesi tanya jawab jika Bapak/Ibu dosen atau rekan-rekan mahasiswa ingin berdiskusi atau memberikan masukan. Terima kasih!"*

---

## 🎯 Panduan Jawaban Cepat Pertanyaan Kritis Dosen (Cheat Sheet)

Berikut adalah rangkuman jawaban teknis jika dosen pengampu menanyakan detail sistem saat sesi tanya jawab:

1. **Dosen: "Mengapa kalian memilih Webhook dan bukan Polling berkala?"**
   - **Jawaban (Deni)**:
     > *"Webhook bekerja dengan model Push atau Event-Driven. Server kami hanya bekerja saat ada kejadian commit nyata dari GitHub, sehingga menghemat kuota bandwidth dan pemakaian CPU hingga lebih dari 90%. Sebaliknya, polling terus-menerus bertanya ke server setiap beberapa detik meskipun tidak ada perubahan, yang sangat boros dan menimbulkan latensi buatan."*

2. **Dosen: "Bagaimana cara server kalian membuktikan data webhook itu asli dari GitHub dan bukan kiriman hacker?"**
   - **Jawaban (Fajri)**:
     > *"Kami menggunakan verifikasi tanda tangan kriptografi HMAC SHA-256 yang dikirim GitHub pada header `X-Hub-Signature-256`. Server kami menghitung hash payload menggunakan secret key proyek. Jika tanda tangan tidak cocok atau tidak disertakan, server langsung menolak request dengan status HTTP 401 Unauthorized."*

3. **Dosen: "Kenapa komparasi tanda tangan HMAC harus menggunakan `crypto.timingSafeEqual` dan bukan operator `===`?"**
   - **Jawaban (Fajri)**:
     > *"Operator `===` melakukan early-exit: perbandingan langsung berhenti pada karakter pertama yang tidak cocok. Penyerang dapat mengukur perbedaan waktu eksekusi dalam fraksi nanodetik untuk merekonstruksi token rahasia (Timing Attack). `crypto.timingSafeEqual` mengevaluasi buffer dalam durasi waktu konstan tanpa membocorkan selisih waktu."*

4. **Dosen: "Bagaimana sistem kalian memastikan aman dari ancaman SQL Injection?"**
   - **Jawaban (Fatir)**:
     > *"Kami 100% menggunakan Prepared Statements (parameterized query dengan placeholder tanda tanya `?`) pada driver `mysql2/promise`. Input dari commit atau pengguna dipisahkan secara tegas dari struktur kueri SQL, sehingga masukan berbahaya seperti `' OR '1'='1` hanya dianggap sebagai teks biasa dan tidak dapat dieksekusi oleh mesin basis data."*

5. **Dosen: "Apa yang terjadi jika server database MySQL lokal mati saat ada commit masuk?"**
   - **Jawaban (Fatir)**:
     > *"Sistem kami menerapkan pola Graceful Degradation melalui subsistem In-Memory Fallback. Jika koneksi MySQL terputus, backend secara otomatis mengalihkan penyimpanan ke memori RAM terisolasi. Notifikasi Discord dan siaran WebSocket tetap berjalan 100% tanpa melempar fatal exception yang membuat server crash."*

6. **Dosen: "Bagaimana antarmuka web di browser bisa terbarui seketika tanpa refresh halaman?"**
   - **Jawaban (Rafli)**:
     > *"Menggunakan protokol WebSocket via Socket.io. Webhook adalah komunikasi antar-server, sehingga tidak bisa langsung menyentuh browser klien. Oleh karena itu, backend menginisialisasi server Socket.io. Begitu status tugas selesai dimutasi di basis data, backend memancarkan event `activity_update` ke browser, dan React langsung merender ulang baris tabel secara reaktif dalam hitungan milidetik."*

7. **Dosen: "Bagaimana kalian mencegah serangan banjir request (Denial of Service / DoS) pada endpoint webhook?"**
   - **Jawaban (Fajri)**:
     > *"Kami memasang Two-Tier IP Rate Limiting menggunakan middleware `express-rate-limit`. Endpoint webhook dibatasi ketat maksimal 30 request per menit per IP. Jika ada pihak yang membanjiri request lebih dari batas tersebut, sistem langsung memblokirnya dengan kode HTTP 429 Too Many Requests."*
