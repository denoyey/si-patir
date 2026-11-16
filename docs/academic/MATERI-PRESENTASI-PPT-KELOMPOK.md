# 📊 Panduan & Materi Presentasi Tugas Kelompok (Simple Slide Deck)
**Mata Kuliah**: Pemrograman Integratif  
**Proyek**: SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori - DevOps Lite*)  
**Format Tayang**: PowerPoint / Canva / Google Slides  
**Alokasi Waktu**: 10 – 15 Menit (Presentasi 8 Menit + Live Demo 3 Menit + Tanya Jawab 4 Menit)

---

## 👥 Pembagian Giliran Bicara (4 Anggota Tim)

| No | Anggota | Akun GitHub | Peran | Bagian Slide yang Dijelaskan |
|:--:|:--------|:------------|:------|:-----------------------------|
| **1** | **Deni** | `@denoyey` | *Project Lead & Architect* | **Slide 1, 2, 4, 9** (Pembuka, Masalah & Solusi, Protokol, Penutup) |
| **2** | **Fatir** | `@Patirparkerr` | *Database & Integrations* | **Slide 3, 5** (Alur Cara Kerja Sistem & Ringkasan Endpoint API) |
| **3** | **Fajri** | `@AATTTRAWRRR` | *QA & Security* | **Slide 6, 8** (Keamanan Siber Berlapis, Hasil Testing & Lab `/docs`) |
| **4** | **Rafli** | `@muhamadrafli16` | *Frontend UI & Visualizer* | **Slide 7, 8** (Desain Dashboard, Terminal Web Git & Pemandu Live Demo) |

---

## 🖥️ Rincian 9 Slide Presentasi (Simpel & Mudah Dijelaskan)

---

### 🔹 Slide 1: Judul Proyek & Tim Pengembang
- **Poin di Slide**:
  - **SI-PATIR**: Platform Integrasi Pemantau Tugas & Aktivitas Repositori Git
  - *Tugas Kelompok Mata Kuliah Pemrograman Integratif*
  - **Anggota Tim**:
    - Deni (`@denoyey`) — *Project Lead & Backend Architecture*
    - Fatir (`@Patirparkerr`) — *Database Design & Integrations*
    - Fajri (`@AATTTRAWRRR`) — *QA, Security Testing & Documentation*
    - Rafli (`@muhamadrafli16`) — *Frontend Dashboard & UI/UX*
- **🎙️ Naskah Bicara (Deni)**:
  > *"Selamat pagi/siang Bapak/Ibu dosen dan teman-teman. Kami dari tim SI-PATIR beranggotakan Deni, Fatir, Fajri, dan Rafli. Hari ini kami akan mempresentasikan sistem integrasi berbasis event-driven yang menghubungkan repositori Git, basis data MySQL, chat bot Discord, dan web dashboard secara otomatis dan aman."*

---

### 🔹 Slide 2: Latar Belakang & Solusi SI-PATIR
- **Poin di Slide**:
  - **Masalah Nyata**:
    1. Developer sering lupa update status tugas di papan kerja setelah selesai coding di Git.
    2. Notifikasi terpecah-pecah di banyak aplikasi terpisah (GitHub, chat, kanban).
    3. Cara pemantauan lama menggunakan *polling* berkala sangat boros kuota dan membebani server.
  - **Solusi SI-PATIR (*DevOps Lite*)**:
    - Cukup buat commit Git berformat tugas, misalnya `[done #TASK-02]`.
    - Status tugas otomatis berubah menjadi 'Done' di database dan dashboard seketika (*zero-manual update*).
- **🎙️ Naskah Bicara (Deni)**:
  > *"Masalah yang sering terjadi saat kerja kelompok adalah status tugas tidak sinkron: kodingan sudah selesai di-push ke Git, tapi papan tugas masih 'In Progress' karena lupa digeser manual. Memakai polling berkala juga sangat boros sumber daya. Solusi kami adalah SI-PATIR: developer cukup mengetik commit seperti biasa di Git, dan sistem kami yang akan otomatis memproses perubahan status ke database, mengirim notifikasi ke Discord, dan meng-update dashboard web secara instan."*

---

### 🔹 Slide 3: Cara Kerja Sistem (Alur 4 Langkah Otomatis)
- **Poin di Slide**:
  - **1. Push Commit**: Developer mengetik commit `git commit -m "feat: login [done #TASK-02]"`.
  - **2. Webhook Ingest**: GitHub mengirim HTTPS POST Webhook ke gateway SI-PATIR.
  - **3. Verifikasi & Mutasi DB**: Server memvalidasi tanda tangan HMAC-SHA256, mengekstrak kode tugas, lalu mengubah status tugas `#TASK-02` menjadi `Done` di database MySQL.
  - **4. Notifikasi & Broadcast**: Bot Discord mengirim kartu notifikasi hijau ke grup, dan WebSocket memancarkan pembaruan ke web dashboard seketika tanpa reload.
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Berikut adalah alur cara kerja SI-PATIR dari awal sampai akhir. Seluruh proses dari Langkah 1 saat developer push commit, melewati verifikasi keamanan server, update database MySQL, hingga notifikasi muncul di Discord dan dashboard web, berjalan otomatis dalam waktu kurang dari 1 detik tanpa perlu reload halaman."*

---

### 🔹 Slide 4: Arsitektur Multi-Protokol (Kenapa 3 Protokol?)
- **Poin di Slide**:
  - **Webhook API (*Event-Driven / Push*)**: Komunikasi antar-server yang hemat sumber daya karena hanya aktif saat ada commit baru dari GitHub atau pengiriman ke Discord.
  - **WebSocket (*Full-Duplex Real-Time*)**: Jalur komunikasi persisten dua arah ke browser agar antarmuka web langsung terbarui dalam hitungan milidetik.
  - **REST API v1 (*Stateless Request-Response*)**: Mengelola operasi data terstruktur seperti CRUD tugas, daftar anggota, dan konfigurasi multi-repo.
  - *(Catatan: Polling berkala sengaja kami eliminasi karena memboroskan kuota internet dan CPU server).*
- **🎙️ Naskah Bicara (Deni)**:
  > *"Dalam tugas integrasi ini, kami menggabungkan tiga protokol sesuai fungsinya masing-masing: Webhook untuk menangkap event push dari GitHub; WebSocket untuk streaming data realtime ke browser pengguna; dan REST API v1 untuk manajemen data tugas. Kami tidak memakai polling karena teknik itu terus-menerus menembak server meskipun tidak ada data baru."*

---

### 🔹 Slide 5: Ringkasan Endpoint REST API v1
- **Poin di Slide**:
  - **Modul Tasks (Kelola Tugas)**:
    - `GET /api/v1/tasks` (Ambil semua tugas) & `GET /api/v1/tasks/:id` (Detail tugas)
    - `POST /api/v1/tasks` (Buat tugas baru) & `PATCH /api/v1/tasks/:id/status` (Update status tugas)
    - `DELETE /api/v1/tasks/:id` (Hapus tugas) & `POST /api/v1/tasks/sync-github` (Sinkron issue GitHub)
  - **Modul Members (Klasemen Tim)**:
    - `GET /api/v1/members` (Klasemen kontribusi) & `POST /api/v1/members/sync-github` (Sinkron kontributor riil)
  - **Modul Webhooks (Pintu Integrasi)**:
    - `POST /api/v1/webhooks/github` (Receiver resmi ber-HMAC) & `POST /api/v1/webhooks/simulate` (Simulator web)
  - **Modul System & Projects**:
    - `GET /api/v1/system/status` (Healthcheck koneksi) & `GET /api/v1/system/logs` (50 audit log)
    - `GET/POST /api/v1/projects` (Manajemen multi-repo terisolasi)
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Seluruh layanan di backend kami sediakan melalui REST API v1 yang modular. Kami membaginya ke dalam 5 kategori utama: modul Tasks untuk CRUD tugas, modul Members untuk peringkat kontribusi commit tim, modul Webhooks sebagai gerbang penerima data Git, serta modul System dan Multi-Repo Projects untuk monitoring status koneksi server."*

---

### 🔹 Slide 6: Keamanan Siber: 4 Pilar Pertahanan Utama
- **Poin di Slide**:
  - **1. Verifikasi Kriptografi HMAC-SHA256**:
    - Memastikan payload benar-benar berasal dari GitHub resmi.
    - Menggunakan fungsi waktu konstan `crypto.timingSafeEqual` untuk **menangkal Timing Attack** (kebal dari analisis selisih nanodetik).
  - **2. Proteksi Anti-SQL Injection**:
    - 100% kueri database menggunakan *Prepared Statements* (parameterized query `?` pada driver `mysql2/promise`).
  - **3. Two-Tier IP Rate Limiting**:
    - Webhook dibatasi 30 request/menit dan API umum 120 request/menit untuk **mencegah serangan banjir DoS/spam**.
  - **4. Anti-JSON Bomb & Sanitasi Input**:
    - Batas body payload ketat 100kb mencegah memori server jebol, plus pembersihan tag HTML (anti-XSS) dan regex aman (anti-ReDoS).
- **🎙️ Naskah Bicara (Fajri)**:
  > *"Untuk aspek keamanan siber, gateway kami dilindungi oleh 4 pilar utama. Yang paling penting adalah verifikasi HMAC SHA-256: kami tidak membandingkan tanda tangan dengan operator biasa (===) karena rawan serangan Timing Attack, melainkan menggunakan crypto.timingSafeEqual dalam waktu konstan. Selain itu, database kami aman dari SQL Injection berkat Prepared Statements, dan server dilindungi Rate Limiter agar tidak down saat diserang spam."*

---

### 🔹 Slide 7: Antarmuka Dashboard & Fitur Unggulan
- **Poin di Slide**:
  - **React 19 + Tailwind CSS**: Desain simpel, bersih, radius konsisten `rounded-md` & `rounded-lg`, serta mendukung mode Gelap & Terang.
  - **Terminal Web Git di Dashboard**: Developer atau penguji bisa langsung mengetik atau mengklik tombol pintas tugas (`#TASK-02`) untuk simulasi commit langsung dari browser tanpa buka terminal laptop.
  - **Visualisasi Analitik SVG**: Diagram batang perbandingan jumlah commit riil anggota tim dan diagram donat persentase tugas selesai (*To Do*, *In Progress*, *Done*).
  - **Pembaruan Real-Time**: Status tugas, diagram, dan riwayat aktivitas terbarui otomatis via WebSocket.
- **🎙️ Naskah Bicara (Rafli)**:
  > *"Pada bagian antarmuka pengguna, kami membangun dashboard berbasis React 19 dengan tampilan yang simpel dan rapi. Fitur unggulan kami adalah Terminal Web Git langsung di dashboard, di mana penguji maupun anggota tim bisa mencoba simulasi commit secara instan hanya dengan mengklik tombol pintas tugas. Seluruh grafik analitik dan papan tugas terhubung langsung dengan WebSocket, sehingga tampilan berubah otomatis begitu ada commit baru."*

---

### 🔹 Slide 8: Penjaminan Mutu (QA) & Live Demo 30 Detik
- **Poin di Slide**:
  - **28 Automated Unit Tests (Vitest)**: Lulus 100% mencakup pengujian parser commit, verifikasi HMAC, dan transisi siklus hidup tugas.
  - **Simulator Lab Keamanan di Halaman `/docs`**:
    - Uji penolakan tanda tangan palsu (`HTTP 401 Unauthorized`).
    - Uji banjir 35 request cepat membuktikan blokir Rate Limiter (`HTTP 429 Too Many Requests`).
  - **Skenario Live Demo 30 Detik**:
    1. Tunjukkan tugas `#TASK-02` masih berstatus `In Progress`.
    2. Kirim commit `#TASK-02` melalui Terminal Web Git di dashboard.
    3. Amati tugas otomatis berubah jadi hijau `Done` dan grafik terbarui tanpa refresh.
    4. Perlihatkan kartu notifikasi bot baru saja masuk di Discord.
- **🎙️ Naskah Bicara (Fajri & Rafli)**:
  > *"Untuk menjamin keandalan sistem, kami membuat 28 skenario unit test otomatis yang lulus 100%, serta portal lab keamanan di rute `/docs` untuk menguji pemblokiran token palsu dan rate limiter secara langsung. Sekarang, mari kita saksikan live demo 30 detik: kami akan mengeksekusi commit tugas #TASK-02 di Web Git Terminal, dan kita saksikan status di dashboard dan Discord terbarui secara instan."*

---

### 🔹 Slide 9: Kesimpulan & Tanya Jawab (Q&A)
- **Poin di Slide**:
  - **Capaian Utama**: Berhasil mengintegrasikan GitHub, MySQL, Discord, dan React Web ke dalam satu platform otomasi *DevOps Lite*.
  - **Efisiensi & Keamanan**: Arsitektur event-driven menghemat bandwidth server, diperkuat proteksi HMAC constant-time dan prepared statements.
  - **Kolaborasi Nyata**: Dikerjakan secara kolaboratif oleh 4 akun GitHub resmi.
  - **Repositori Proyek**: `github.com/denoyey/si-patir` (Open Source).
- **🎙️ Naskah Bicara (Deni)**:
  > *"Sebagai kesimpulan, melalui proyek SI-PATIR ini kami berhasil membuktikan bahwa sistem berbasis event-driven webhook dan websocket mampu menciptakan alur kerja kolaborasi yang jauh lebih efisien dan aman dibandingkan pendekatan konvensional. Seluruh source code dan dokumentasi pengujian telah kami sediakan di repositori GitHub tim. Sekian presentasi dari kelompok kami, kami persilakan jika Bapak/Ibu dosen atau rekan mahasiswa memiliki pertanyaan. Terima kasih!"*

---

## 🎯 Panduan Cepat Menjawab Pertanyaan Dosen (Cheat Sheet)

1. **"Kenapa pilih Webhook dibanding Polling?"**
   - *Jawaban*: *"Webhook bersifat push/event-driven, server hanya bekerja saat ada event commit nyata sehingga menghemat kuota dan CPU lebih dari 90% dibanding polling yang bertanya terus-menerus tiap detik."*

2. **"Bagaimana cara membuktikan data webhook asli dari GitHub?"**
   - *Jawaban*: *"Melalui verifikasi tanda tangan HMAC SHA-256 pada header `X-Hub-Signature-256`. Jika tanda tangan tidak cocok dengan secret key server, request langsung ditolak dengan kode 401 Unauthorized."*

3. **"Kenapa verifikasi tanda tangan memakai `crypto.timingSafeEqual`?"**
   - *Jawaban*: *"Karena operator perbandingan biasa (`===`) langsung berhenti pada karakter pertama yang salah (early-exit), sehingga rentan Timing Attack. `timingSafeEqual` mengevaluasi buffer dalam waktu yang selalu konstan."*

4. **"Bagaimana sistem mencegah SQL Injection?"**
   - *Jawaban*: *"100% kueri database menggunakan Prepared Statements dengan parameterized query placeholder `?` pada driver `mysql2/promise`."*

5. **"Bagaimana web dashboard bisa update seketika tanpa refresh?"**
   - *Jawaban*: *"Melalui koneksi WebSocket Socket.io. Begitu status tugas selesai dimutasi di MySQL, backend memancarkan event `activity_update` ke browser, dan React langsung merender ulang baris tabel reaktif."*
