# 📊 Panduan & Materi Presentasi Tugas Kelompok (Slide Deck)
**Mata Kuliah**: Pemrograman Integratif  
**Proyek**: SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori - DevOps Lite*)  
**Format Tayang**: PowerPoint / Canva / Google Slides  
**Alokasi Waktu Total**: 15 – 20 Menit (Presentasi Materi 12 Menit + Live Demo 4 Menit + Tanya Jawab 4 Menit)

---

## 👥 Struktur Tim & Pembagian Giliran Bicara di Depan Kelas

Setiap anggota tim memiliki alokasi segmen materi dan demonstrasi yang berimbang sesuai spesialisasi teknis masing-masing:

| No | Anggota & Akun GitHub | Peran di Proyek | Segmen Slide yang Dipresentasikan | Peran Saat Live Demo |
|:--:|:----------------------|:----------------|:-----------------------------------|:---------------------|
| **1** | **Deni**<br>(`@denoyey`) | *Project Lead & Lead Architect* | **Slide 1 – Slide 4**<br>(Pembukaan, Latar Belakang Masalah, Solusi SI-PATIR, Arsitektur Multi-Protokol API) | Moderator pembuka, memimpin eksekusi commit Git di terminal. |
| **2** | **Fatir**<br>(`@Patirparkerr`) | *Integrations Lead & Database Engineer* | **Slide 5 – Slide 7**<br>(Alur Kerja End-to-End, Skema MySQL Relasional, Mesin State Tugas & Bot Discord) | Memperlihatkan hasil mutasi data di MySQL dan pesan bot di channel Discord. |
| **3** | **Rafli**<br>(`@muhamadrafli16`) | *Frontend UI & Data Visualization Engineer* | **Slide 8 – Slide 9**<br>(Desain Dashboard React 19, Terminal Web Git, Tabel Filament, Grafik Analitik SVG) | Memandu navigasi antarmuka dashboard web dan interaksi realtime WebSocket. |
| **4** | **Fajri**<br>(`@AATTTRAWRRR`) | *QA, Security Testing & Documentation Specialist* | **Slide 10 – Slide 13**<br>(6 Lapisan Keamanan Siber, Hasil Unit Test Vitest 28/28, Lab Simulasi `/docs`, Kesimpulan) | Menjalankan simulator rate limiter 35 req (HTTP 429) & uji SQLi di hadapan dosen. |

---

## 📑 Materi Slide per Slide (Lengkap dengan Poin Tayang & Naskah Bicara)

---

### 🖥️ Slide 1: Judul Proyek & Pengenalan Tim
- **Judul Slide**: SI-PATIR: Platform Integrasi Pemantau Tugas & Aktivitas Repositori Git
- **Sub-judul**: Otomasi Pemantauan Kolaborasi Berbasis API Webhook, WebSocket Realtime, dan Keamanan Berlapis
- **Informasi Mata Kuliah**: Tugas Kelompok Mata Kuliah Pemrograman Integratif
- **Poin Anggota di Slide**:
  - Deni (`@denoyey`) — *Project Lead & Backend Gateway Architecture*
  - Rafli (`@muhamadrafli16`) — *Frontend Dashboard & Data Visualization*
  - Fatir (`@Patirparkerr`) — *Database Design & System Integrations*
  - Fajri (`@AATTTRAWRRR`) — *Quality Assurance, Security Testing & Documentation*
- **Visual**: Foto tim / avatar GitHub + logo SI-PATIR + logo GitHub, Discord, MySQL, dan React.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Selamat pagi/siang kepada Bapak/Ibu Dosen pengampu dan rekan-rekan mahasiswa sekalian. Kami dari Kelompok Pengembang SI-PATIR beranggotakan Deni, Rafli, Fatir, dan Fajri. Pada kesempatan hari ini, kami akan mempresentasikan sistem yang kami bangun untuk memenuhi tugas mata kuliah Pemrograman Integratif. Kami membangun platform bernama SI-PATIR, yaitu sistem integrasi cerdas yang menghubungkan repositori Git, basis data relasional, chat bot Discord, dan dashboard web interaktif secara otomatis dan aman."*

---

### 🖥️ Slide 2: Latar Belakang & Masalah Nyata
- **Judul Slide**: Latar Belakang Masalah: Tantangan Kolaborasi Tim Developer
- **Poin Masalah di Slide**:
  1. **Status Tugas Sering Tidak Sinkron**: Developer sering lupa memperbarui papan tugas manual setelah menyelesaikan kodingan di Git.
  2. **Notifikasi yang Terfragmentasi**: Anggota tim harus membuka banyak tab terpisah (GitHub, papan tugas, dan aplikasi chat) untuk mengetahui progres rekan setim.
  3. **Polling yang Memboroskan Sumber Daya**: Sistem pemantauan tradisional kerap menggunakan *polling* berkala yang membebani server dan memboroskan kuota internet.
  4. **Ancaman Keamanan pada Integrasi Publik**: Webhook publik tanpa pengamanan rentan terhadap pemalsuan data (*spoofing*) dan serangan *brute force*.
- **Visual**: Ilustrasi developer yang kewalahan membuka banyak tab vs ilustrasi sistem terintegrasi yang terpusat.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Dalam proyek perangkat lunak berkelompok, masalah paling umum adalah ketidaksinkronan antara kode yang ditulis di Git dengan status tugas di papan proyek. Seringkali tugas sudah selesai di-push, tetapi status di papan kerja masih 'In Progress' karena anggota tim lupa menggesernya secara manual. Selain itu, cara lama memantau perubahan dengan teknik polling berkala sangat tidak efisien dan boros sumber daya server. Oleh karena itu, kami merancang SI-PATIR untuk menyelesaikan masalah ini dengan pendekatan integrasi heterogen berbasis event."*

---

### 🖥️ Slide 3: Solusi yang Dibangun — Platform SI-PATIR
- **Judul Slide**: Solusi: SI-PATIR (DevOps Lite Berbasis Event-Driven)
- **Poin Solusi di Slide**:
  - **Zero-Manual Tracking**: Status tugas otomatis berubah menjadi 'Done' hanya dengan menambahkan tag `[done #TASK-XX]` pada pesan commit Git.
  - **Heterogeneous System Integration**: Menggabungkan 4 ekosistem berbeda: GitHub (Version Control), MySQL (Persistent Storage), Discord (Team Chat Bot), dan React Web (Realtime Monitoring).
  - **Real-Time Synchronous Broadcast**: Perubahan langsung tampil di antarmuka web dalam hitungan milidetik tanpa perlu me-refresh halaman (*zero-reload*).
  - **Standar Keamanan Defense-in-Depth**: Dilengkapi verifikasi tanda tangan digital HMAC SHA-256 konstan, anti-SQL Injection, dan pembatas laju request (*Rate Limiter*).
- **Visual**: Diagram sederhana yang menghubungkan laptop developer ➔ GitHub ➔ Server SI-PATIR ➔ MySQL, Discord, dan Browser.
- **🎙️ Naskah Bicara (Deni)**:
  > *"Solusi yang kami hadirkan adalah SI-PATIR. Konsep utamanya sangat sederhana bagi pengguna: developer cukup menulis commit seperti biasa di laptop mereka, misalnya `git commit -m 'Perbaiki login [done #TASK-02]'`. Begitu di-push, sistem SI-PATIR langsung menangkap sinyal tersebut, memvalidasi keamanannya, mengubah status tugas di database MySQL, mengirimkan kartu notifikasi ke grup Discord tim, dan menyiarkan perubahan ke layar web dashboard secara seketika."*

---

### 🖥️ Slide 4: Arsitektur Integrasi & Pemilihan Protokol
- **Judul Slide**: Arsitektur Integrasi: Mengapa Kombinasi Tiga Protokol?
- **Tabel Ringkas di Slide**:
  | Protokol | Sifat Komunikasi | Karakteristik Beban | Fungsi di SI-PATIR |
  | :--- | :--- | :--- | :--- |
  | **Webhook** | Event-Driven (Push) | Sangat hemat kuota (hanya jalan saat ada commit) | Ingest commit dari GitHub & kirim pesan ke Discord |
  | **WebSocket** | Full-Duplex Realtime | Efisien, koneksi persisten dua arah | Update tabel & grafik web seketika tanpa reload |
  | **REST API v1** | Request - Response (Pull) | Standar modular terstruktur | CRUD tugas, manajemen repositori, & cek status |
  | *(Polling)* | *Request Terjadwal (Loop)* | *Boros memori & CPU* | *Sengaja dieliminasi dari sistem kami* |
- **Visual**: Diagram arsitektur multi-protokol (Client Tier ➔ Gateway Server ➔ External Cloud).
- **🎙️ Naskah Bicara (Deni)**:
  > *"Dalam mata kuliah Pemrograman Integratif, pemilihan protokol komunikasi sangatlah krusial. Kami tidak menggunakan polling karena teknik tersebut terus menembak server meskipun tidak ada data baru. Sebagai gantinya, kami memadukan tiga protokol modern: Webhook untuk menerima event commit dari GitHub dan mengirim embed ke Discord; WebSocket melalui Socket.io untuk streaming realtime ke antarmuka web; serta REST API v1 untuk transaksi data standar seperti penambahan tugas dan manajemen repositori. Selanjutnya, alur kerja detail dan basis data akan dijelaskan oleh rekan saya, Fatir."*

---

### 🖥️ Slide 5: Alur Kerja Integrasi End-to-End
- **Judul Slide**: Alur Kerja Otomatis: Dari Push Git Hingga Dashboard
- **4 Tahapan Alur di Slide**:
  1. **Langkah 1 (Git Commit)**: Developer mengetik pesan commit berformat tugas, contoh: `git commit -m "Fix bug [done #TASK-02]"`.
  2. **Langkah 2 (GitHub Webhook)**: GitHub mengirimkan payload HTTP POST JSON ke server gateway lengkap dengan header tanda tangan `X-Hub-Signature-256`.
  3. **Langkah 3 (Verifikasi & Mutasi DB)**: Backend memverifikasi tanda tangan HMAC, mengekstrak kode tugas `#TASK-02`, dan mengubah statusnya menjadi `Done` di MySQL.
  4. **Langkah 4 (Notifikasi & Siaran Realtime)**: Bot Discord memposting pesan embed kaya, dan server memancarkan event WebSocket ke seluruh browser yang sedang aktif.
- **Visual**: Diagram alur 4 langkah berurutan (*Activity Diagram* ringkas dengan ikon menarik).
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Terima kasih Deni. Rekan-rekan dan Bapak/Ibu dosen, ini adalah alur integrasi end-to-end yang berjalan di balik layar. Seluruh proses dari Langkah 1 hingga Langkah 4 terjadi secara otomatis dalam durasi kurang dari 1 detik. Tidak ada intervensi manual yang dibutuhkan oleh developer selain melakukan commit dengan tag tugas standar."*

---

### 🖥️ Slide 6: Perancangan Basis Data Relasional MySQL
- **Judul Slide**: Arsitektur Basis Data: MySQL Relasional & State Machine
- **Poin Teknis di Slide**:
  - **Skema 4 Tabel Terindeks**:
    - `members`: Menyimpan profil developer, statistik total commit, dan akumulasi tugas selesai.
    - `tasks`: Menyimpan kode tugas unik (`TASK-02`), judul, penanggung jawab, dan status pengerjaan.
    - `projects`: Mendukung isolasi multi-repo dan webhook Discord terpisah (*anti-cross pollution*).
    - `activity_logs`: Mencatat riwayat audit seluruh aktivitas webhook dan commit.
  - **Task State Engine Internal**: Mesin transisi siklus hidup tugas (`To Do` ➔ `In Progress` ➔ `Done`) yang berjalan murni di basis data lokal tanpa dependensi vendor pihak ketiga (seperti Trello).
  - **Mekanisme In-Memory Fallback**: Jika server MySQL offline atau sedang dalam perbaikan, sistem otomatis mengalihkan penyimpanan data ke RAM sehingga aplikasi tidak mengalami crash.
- **Visual**: Skema Relasi Antar-Tabel (ERD ringkas) dan bagan transisi state mesin tugas.
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Pada lapisan penyimpanan, kami merancang skema relasional di MySQL dengan 4 tabel utama: members, tasks, projects, dan activity_logs. Kueri telah dioptimalkan dengan indeks komposit pada kolom-kolom pencarian. Yang terpenting, kami membangun Task State Engine sendiri di dalam backend. Jadi sistem tidak bergantung pada layanan Kanban pihak ketiga. Jika database MySQL lokal mati sekalipun, kami telah menyediakan subsistem In-Memory Fallback sehingga server tetap melayani request dan notifikasi Discord tetap terkirim normal."*

---

### 🖥️ Slide 7: Notifikasi Outbound Discord Bot
- **Judul Slide**: Integrasi Outbound: Notifikasi Discord Rich Embed
- **Poin Fitur di Slide**:
  - **Rich Embed Card**: Pesan bot Discord memuat warna status (hijau untuk penyelesaian), nama penanggung jawab, kode tugas, judul tugas, dan tautan langsung ke commit GitHub.
  - **Isolasi Multi-Project**: Setiap repositori proyek dapat diarahkan ke kanal Discord yang berbeda sesuai konfigurasi di database.
  - **Asynchronous Non-Blocking**: Pengiriman HTTP request ke webhook Discord diproses secara asynchronous sehingga respons ke GitHub tidak tertahan (*low latency*).
- **Visual**: Tangkapan layar (*screenshot*) kartu notifikasi Discord bot yang rapi dan berwarna hijau.
- **🎙️ Naskah Bicara (Fatir)**:
  > *"Selain mencatat ke basis data, sistem kami langsung mengirimkan notifikasi ke kanal Discord tim. Kami memanfaatkan format Discord Rich Embed, sehingga pesan yang muncul bukan sekadar teks biasa, melainkan kartu rapi berwana hijau yang menampilkan detail tugas, siapa yang menyelesaikan, dan tautan commit ke GitHub. Selanjutnya, desain antarmuka web dan visualisasi analitik akan dijelaskan oleh rekan saya, Rafli."*

---

### 🖥️ Slide 8: Desain Antarmuka Frontend & Terminal Web Git
- **Judul Slide**: Frontend Modern React 19 & Terminal Web Git
- **Poin Desain di Slide**:
  - **React 19 + Tailwind CSS**: Dibangun dengan arsitektur komponen modern, layout `max-w-7xl`, tipografi Poppins, dan desain konsisten berstandar radius `rounded-md` serta `rounded-lg`.
  - **Tabel Tugas Gaya Filament v5**: Fitur pagination dinamis (navigasi halaman, pemilih jumlah baris), pencarian instan teks, dan filter status maupun assignee.
  - **Terminal Web Git Interaktif**: Developer dapat mensimulasikan commit Git langsung dari peramban web tanpa perlu membuka aplikasi terminal OS, lengkap dengan tombol pintas tugas cepat (`#TASK-02` s/d `#TASK-05`).
  - **Theme Switcher & Responsif Penuh**: Mendukung mode Light, Dark, dan System OS, serta 100% responsif pada layar laptop, tablet, hingga smartphone iPhone.
- **Visual**: Mockup screenshot Dashboard SI-PATIR dan tampilan Terminal Web Git.
- **🎙️ Naskah Bicara (Rafli)**:
  > *"Terima kasih Fatir. Untuk antarmuka pengguna, kami membangun dashboard berbasis React 19 dan Tailwind CSS. Kami merancang tabel daftar tugas dengan standar Filament v5 yang memiliki fitur pencarian cepat, filter status, dan pagination dinamis. Kami juga menyediakan fitur unggulan yaitu Terminal Web Git langsung di dashboard. Fitur ini memungkinkan pengguna atau dosen melakukan uji coba commit langsung dari browser dengan mengklik pintasan tugas cepat tanpa harus membuka terminal sistem operasi. Desain ini juga sepenuhnya responsif di semua resolusi layar."*

---

### 🖥️ Slide 9: Visualisasi Data Analitik & Ekspor Laporan
- **Judul Slide**: Visualisasi Data Analitik & Ekspor Sprint Tim
- **Poin Analitik di Slide**:
  - **SVG Charts Presisi Tinggi**:
    - *Commit Bar Chart*: Diagram batang interaktif perbandingan produktivitas jumlah commit riil antar-anggota tim.
    - *Donut Chart Status Sprint*: Diagram donat persentase penyelesaian tugas tim (*To Do*, *In Progress*, *Done*).
  - **Klasemen Kontribusi Riil**: Mengambil data kompilasi asli dari riwayat commit GitHub (`denoyey`, `muhamadrafli16`, `Patirparkerr`, `AATTTRAWRRR`).
  - **Ekspor Laporan Tugas (CSV & PDF)**: Memudahkan pelaporan tugas kelompok ke dosen dengan fitur cetak bersih `@media print` (PDF) dan berkas spreadsheet CSV berstandar UTF-8 BOM.
- **Visual**: Screenshot diagram batang commit per anggota dan diagram donat tugas selesai.
- **🎙️ Naskah Bicara (Rafli)**:
  > *"Selain pengelolaan tugas, dashboard kami dilengkapi grafik visualisasi analitik SVG. Dosen dan anggota kelompok dapat melihat diagram batang perbandingan jumlah commit yang ditarik langsung dari GitHub riil, serta diagram donat rasio tugas sprint. Kami juga menyediakan tombol ekspor laporan sprint ke format CSV dan cetak PDF yang rapi, sehingga rekapitulasi pekerjaan kelompok dapat langsung diunduh dan diserahkan kepada dosen. Selanjutnya, aspek keamanan siber dan penjaminan mutu akan dipresentasikan oleh rekan saya, Fajri."*

---

### 🖥️ Slide 10: Enam Lapisan Keamanan Siber (Security Layer)
- **Judul Slide**: Keamanan Siber: 6 Lapisan Proteksi Backend Gateway
- **Poin 6 Lapisan Keamanan di Slide**:
  1. **Verifikasi Webhook HMAC SHA-256**: Memastikan payload berasal dari GitHub sah menggunakan kunci rahasia bersama dan komparasi konstan waktu (`crypto.timingSafeEqual`) untuk menangkal *timing attacks*.
  2. **Anti-SQL Injection (Prepared Statements)**: Semua kueri database diparameterisasi menggunakan placeholder (`?`) pada driver `mysql2/promise`.
  3. **IP Rate Limiting Ketat**: Membatasi 30 request/menit untuk endpoint webhook dan 120 request/menit untuk endpoint umum guna mencegah serangan banjir spam/DoS.
  4. **Batas Ukuran Data (Payload Limit 100kb)**: Mencegah serangan memori jebol akibat berkas JSON raksasa (*JSON Bomb*).
  5. **Sanitasi Input Pesan Commit**: Membersihkan karakter khusus baris baru palsu dan tag HTML untuk menangkal serangan *Cross-Site Scripting (XSS)*.
  6. **Security Headers (Helmet CSP)**: Menutup celah pembajakan klik dalam iframe (*Clickjacking*) via `X-Frame-Options: DENY`.
- **Visual**: Diagram perisai pelindung bertingkat (*Defense-in-Depth*).
- **🎙️ Naskah Bicara (Fajri)**:
  > *"Terima kasih Rafli. Aspek keamanan siber merupakan salah satu kriteria penilaian utama dalam tugas Pemrograman Integratif ini. Kami menerapkan prinsip Defense-in-Depth dengan 6 lapisan proteksi. Yang paling krusial adalah verifikasi HMAC SHA-256. Kami tidak membandingkan tanda tangan menggunakan operator sama dengan biasa (===) karena rentan celah Timing Attack, melainkan menggunakan fungsi bawaan Node.js crypto.timingSafeEqual yang membandingkan buffer dalam durasi waktu konstan. Selain itu, database kami terbebas dari ancaman SQL Injection berkat Prepared Statements, dan server dilindungi Rate Limiter agar tidak down diserang spam."*

---

### 🖥️ Slide 11: Pengujian Otomasi (QA) & Lab Simulasi di Web
- **Judul Slide**: Penjaminan Mutu (QA) & Simulator Lab Interaktif
- **Poin Pengujian di Slide**:
  - **Automated Unit Testing (Vitest)**: 28 skenario pengujian otomatis lolos 100%:
    - 13 pengujian untuk `CommitParserService` (regex casing variatif, anti-XSS, anti-ReDoS).
    - 9 pengujian untuk `WebhookSecurityService` (signature valid, signature palsu, payload kosong).
    - 6 pengujian untuk `TaskStatusFlow` (transisi siklus hidup To Do ➔ In Progress ➔ Done).
  - **Halaman Lab Interaktif (`/docs`)**: Disediakan khusus untuk pengujian langsung saat presentasi:
    - *Simulasi 1*: Uji signature HMAC asli (200 OK) vs signature palsu (401 Unauthorized).
    - *Simulasi 2*: Uji banjir 35 request cepat membuktikan blokir rate limiter (HTTP 429).
    - *Simulasi 3*: Uji coba serangan SQL Injection (`' OR '1'='1`) membuktikan kueri tetap aman.
- **Visual**: Screenshot terminal hasil `vitest run` (28 passed) dan tampilan kartu simulator di portal `/docs`.
- **🎙️ Naskah Bicara (Fajri)**:
  > *"Untuk memastikan sistem andal, kami menyusun rangkaian unit test otomatis menggunakan Vitest dengan total 28 skenario pengujian yang semuanya lulus 100%. Kami juga membuat portal pengujian interaktif pada rute `/docs`. Melalui portal ini, dosen maupun mahasiswa dapat melakukan simulasi langsung, seperti menguji penolakan tanda tangan palsu, membuktikan blokir rate limiter saat diserang 35 request sekaligus, dan menguji kekebalan kueri terhadap injeksi kode SQL. Sekarang, mari kita saksikan demonstrasi langsung alur sistem ini."*

---

### 🖥️ Slide 12: Skenario Demonstrasi Langsung (Live Demo Runbook)
- **Judul Slide**: Skenario Demonstrasi Langsung (Live Demo 30 Detik)
- **Langkah Demo yang Dijalankan di Kelas**:
  1. **Tunjukkan Dashboard Awal**: Perlihatkan bahwa tugas `#TASK-02` atau tugas baru berada di status `In Progress`.
  2. **Eksekusi Commit di Terminal Web Git**: Pilih kontributor Deni/Fatir, ketik pesan commit `fix: selesaikan integrasi modul [done #TASK-02]`, lalu klik Kirim Commit.
  3. **Amati Perubahan Realtime di Dashboard**: Status tugas di tabel langsung berubah menjadi `Done` secara otomatis dengan highlight hijau tanpa klik refresh.
  4. **Periksa Notifikasi di Discord**: Tampilkan layar channel Discord di mana bot baru saja mengirimkan kartu Rich Embed informasi penyelesaian tugas.
  5. **Uji Coba Lab Keamanan di `/docs`**: Buka tab Simulator di `/docs`, klik tombol 'Uji Signature Palsu' (muncul 401 Unauthorized), dan klik 'Mulai Kirim 35 Request Cepat' (muncul blokir 429 Too Many Requests).
- **Visual**: Diagram alur skenario demo dan screenshot hasil uji coba.
- **🎙️ Panduan Pembagian Peran Live Demo (Seluruh Tim)**:
  - **Deni**: Membuka dashboard dan menjelaskan skenario awal kepada dosen.
  - **Rafli**: Mengetik commit di Terminal Web Git dan menekan tombol kirim.
  - **Fatir**: Membuka tab Discord dan memperlihatkan pesan bot embed yang baru saja masuk secara instan.
  - **Fajri**: Membuka halaman `/docs` dan mengklik tombol uji rate limiter untuk memperlihatkan respons HTTP 429 di depan dosen.

---

### 🖥️ Slide 13: Kesimpulan & Sesi Tanya Jawab (Q&A)
- **Judul Slide**: Kesimpulan & Sesi Tanya Jawab
- **Poin Kesimpulan di Slide**:
  - **Ketercapaian Tugas Integrasi**: Berhasil mengintegrasikan ekosistem heterogen (Git, Webhook, MySQL, Discord, WebSocket) menjadi satu alur otomatis yang mulus.
  - **Standar Keamanan Tinggi**: Penerapan HMAC SHA-256 konstan, Prepared Statements, dan Rate Limiting menjamin sistem aman dari manipulasi payload dan spam.
  - **Pengalaman Pengguna Ramah**: Antarmuka React 19 yang responsif di seluruh perangkat dengan visualisasi analitik memudahkan pemantauan kerja tim.
  - **Pelajaran Akademis Berharga**: Memahami secara mendalam konsep *Event-Driven Architecture*, komunikasi *Full-Duplex*, serta perancangan perangkat lunak modular yang *maintainable*.
- **Informasi Repositori**: `github.com/denoyey/si-patir` (Open Source & Kolaborasi 4 Akun Resmi)
- **🎙️ Naskah Bicara (Deni)**:
  > *"Sebagai penutup, melalui tugas kelompok Pemrograman Integratif ini, kami berhasil membuktikan bahwa sistem berbasis event-driven webhook dan websocket mampu menciptakan alur kerja yang jauh lebih efisien, hemat sumber daya, dan aman dibandingkan pendekatan polling konvensional. Seluruh kode sumber, dokumentasi UML, serta skrip otomatisasi telah kami simpan di repositori GitHub tim. Sekian presentasi dari kelompok kami. Kami membuka sesi tanya jawab jika Bapak/Ibu dosen atau rekan-rekan mahasiswa memiliki pertanyaan atau tanggapan. Terima kasih!"*

---

## 🎯 Panduan Menjawab Pertanyaan Dosen Saat Presentasi

Berikut adalah rangkuman jawaban cepat jika dosen pengampu menanyakan hal-hal teknis berikut:

1. **Dosen: "Mengapa kalian memakai Webhook dan bukan Polling?"**
   - **Jawaban (Deni)**: *"Webhook bersifat event-driven atau push. Server kami hanya bekerja saat ada event commit riil dari GitHub, sehingga menghemat kuota bandwidth dan memori CPU server hingga lebih dari 90% dibandingkan polling yang terus-menerus bertanya tiap detik meski datanya kosong."*
2. **Dosen: "Bagaimana cara server kalian memastikan data webhook itu asli dari GitHub?"**
   - **Jawaban (Fajri)**: *"Melalui verifikasi tanda tangan digital HMAC SHA-256 pada header X-Hub-Signature-256. Server dan GitHub memegang satu Secret Token yang sama. Data yang tidak memiliki tanda tangan cocok langsung ditolak dengan kode status 401 Unauthorized."*
3. **Dosen: "Kenapa verifikasi signature memakai `crypto.timingSafeEqual`?"**
   - **Jawaban (Fajri)**: *"Operator perbandingan biasa (===) langsung berhenti saat ada satu karakter yang salah di awal, sehingga menciptakan perbedaan durasi waktu eksekusi dalam nanodetik yang bisa dianalisis hacker melalui Timing Attack. timingSafeEqual membandingkan buffer dengan durasi waktu yang selalu sama konstan."*
4. **Dosen: "Bagaimana jika database MySQL lokal mati saat ada webhook masuk?"**
   - **Jawaban (Fatir)**: *"Sistem kami memiliki subsistem In-Memory Fallback. Data tugas dan log sementara disimpan di memori RAM server, dan pesan Discord tetap terkirim lancar, sehingga sistem tidak crash atau down."*
5. **Dosen: "Bagaimana web frontend bisa ter-update seketika tanpa refresh?"**
   - **Jawaban (Rafli)**: *"Menggunakan koneksi WebSocket melalui Socket.io. Begitu database MySQL selesai diupdate oleh controller, server langsung menyiarkan event 'activity_update' ke klien React, dan React langsung merender ulang baris tabel secara reaktif."*
