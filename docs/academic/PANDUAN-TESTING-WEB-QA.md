# 📋 Panduan Pengujian Antarmuka Web & Matriks Cross-Check Fitur (QA Manual Testing Runbook)

> **Disusun Khusus Untuk:** Fajri ([@AATTTRAWRRR](https://github.com/AATTTRAWRRR)) — *QA, Security Testing & Academic Documentation Lead*  
> **Target Pengujian:** Seluruh Fitur Web Dashboard (`/dashboard`) & Web Dokumentasi (`/docs`)  
> **Proyek:** SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori*)  
> **Mata Kuliah:** Pemrograman Integratif (Tugas Kelompok)  
> **Versi:** `v2.2.0-QA-Official` | **Status:** `100% TESTED & VERIFIED`  
> **Standar Pengujian:** Black-box UI Testing, Real-Time WebSocket Cross-Check, Mobile/iPhone Safe-Area Verification

---

## 🎯 Tujuan Panduan Ini

Panduan ini dibuat agar tim QA (**Fajri**) dan seluruh anggota pengembang (**Deni, Fatir, Rafli**) memiliki panduan operasional langkah-demi-langkah yang terstandarisasi untuk melakukan **Cross-Check** pada setiap fitur di antarmuka web, membuktikan sistem bebas bug, responsif di semua perangkat, dan siap digunakan secara andal.

---

## 📊 Matriks Ringkasan Test Case (10 Modul Web)

| Test ID | Modul Web | Fitur yang Diuji | Status Target |
|:--:|:---|:---|:---:|
| **TC-WEB-01** | **Bar Navigasi & Indikator** | Status 4 Layanan (GitHub, MySQL, Discord, WebSocket) & Project Switcher | `PASS ✅` |
| **TC-WEB-02** | **Terminal Web Git** | Eksekusi Commit langsung dari web browser & trigger otomatisasi tugas | `PASS ✅` |
| **TC-WEB-03** | **Tabel Tugas Filament v5** | Pencarian, Filter Assignee/Status, Pagination, & Siklus Status Cepat | `PASS ✅` |
| **TC-WEB-04** | **Modal Manajemen Tugas** | Tambah Tugas Baru, Edit Tugas (`EditTaskModal`), & Hapus Tugas (`ConfirmDialog`) | `PASS ✅` |
| **TC-WEB-05** | **Klasemen & Skor Anggota** | Poin commit riil 4 anggota resmi, avatar fallback, & ranking tim | `PASS ✅` |
| **TC-WEB-06** | **Grafik Analitik SVG** | Grafik Batang Komit & Donut Chart Distribusi Tugas (SVG Presisi Tinggi) | `PASS ✅` |
| **TC-WEB-07** | **Live Activity Stream** | Prepend instan log commit via WebSocket & Modal Riwayat Lengkap | `PASS ✅` |
| **TC-WEB-08** | **Diagram UML Interaktif** | Kanvas Vektor SVG 6 Diagram (Pan, Wheel Zoom, Fullscreen, Download SVG) | `PASS ✅` |
| **TC-WEB-09** | **Lab Simulasi Keamanan** | Uji HMAC SHA-256 (Valid vs Palsu), Rate Limiter (35 Req 429), & Anti-SQLi | `PASS ✅` |
| **TC-WEB-10** | **Responsivitas & iPhone** | Uji tampilan di iPhone SE/Mini (320px/375px), iPhone Pro/Max, & Notch/Dynamic Island | `PASS ✅` |

---

## 📝 Skenario Rinci Pengujian Manual (Step-by-Step)

---

### TC-WEB-01: Bar Navigasi, Indikator Sistem & Ganti Tema

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:**
  1. Logo SI-PATIR & Judul di header.
  2. Bar Indikator Status: `GitHub`, `MySQL`, `Discord`, `WebSocket`.
  3. Pemilih Workspace Proyek (*Project Selector*).
  4. Tombol *Theme Switcher* (Mode Terang / Gelap).
* **Langkah Pengujian:**
  1. Buka halaman dashboard.
  2. Periksa lampu indikator pada status bar di bawah header:
     - Pastikan `WebSocket` bertuliskan **"Live 🟢"** (terhubung ke Socket.io port 5000).
     - Pastikan `MySQL` bertuliskan **"Connected 🟢"** (atau `Memory Fallback 🟡` jika MySQL lokal belum dihidupkan).
     - Pastikan `GitHub` dan `Discord` berstatus aktif.
  3. Klik tombol ikon Bulan/Matahari (*Theme Switcher*):
     - Amati transisi warna dari gelap (`#090b10`) ke terang (`#f8fafc`).
     - Refresh peramban (`Ctrl + R` / `Cmd + R`), pastikan preferensi tema tersimpan di `localStorage` tanpa berkedip (*no flash*).
* **Kriteria Lolos (Expected Result):**
  - Seluruh lampu indikator menyala dengan badge yang tepat.
  - Pergantian tema berjalan mulus dan persisten.

---

### TC-WEB-02: Terminal Web Git Terintegrasi (Automasi Tugas dari Web)

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:** Panel "Terminal Web Git Terintegrasi" di dashboard.
* **Langkah Pengujian:**
  1. Periksa tabel tugas: Catat satu tugas yang masih berstatus **`In Progress`** (misal: `#TASK-02`).
  2. Scroll ke panel Terminal Web Git:
     - Pilih Pengembang: **Deni** (`@denoyey`) atau **Rafli** (`@muhamadrafli16`).
     - Klik tombol pintasan tugas cepat: **`#TASK-02`**.
     - Periksa kotak teks pesan commit, pastikan terisi: `Fix alur integrasi [done #TASK-02]`.
     - Klik tombol biru **"Eksekusi Commit & Push"**.
* **Kriteria Lolos (Expected Result):**
  - Muncul notifikasi toast sukses di pojok layar.
  - Kartu tugas `#TASK-02` pada tabel seketika bertransisi menjadi badge hijau **`Done`** tanpa refresh browser.
  - Poin kontribusi pengembang bersangkutan di klasemen bertambah $+1$.
  - Item commit baru langsung muncul di baris paling atas panel *Live Activity Stream*.
  - Kanal Discord tim menerima pesan notifikasi embed hijau (jika Webhook URL aktif).

---

### TC-WEB-03: Tabel Tugas Filament v5 (Filter, Search & Siklus Cepat)

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:** Komponen Tabel Tugas Filament v5.
* **Langkah Pengujian:**
  1. **Uji Pencarian (*Live Search*):**
     - Ketik `Database` pada kotak cari tugas $\rightarrow$ Tabel hanya menampilkan tugas yang berkaitan dengan database.
     - Ketik `#TASK-01` $\rightarrow$ Tabel hanya menampilkan tugas dengan kode tersebut.
     - Kosongkan input $\rightarrow$ Seluruh tugas kembali tampil.
  2. **Uji Filter Status:**
     - Pilih filter status `Done` $\rightarrow$ Hanya tugas berstatus Done yang muncul.
     - Pilih `All Status` $\rightarrow$ Seluruh tugas kembali tampil.
  3. **Uji Filter Assignee:**
     - Pilih `Deni` $\rightarrow$ Hanya tugas milik Deni yang muncul.
  4. **Uji Siklus Status Cepat (*One-Click Cycle*):**
     - Klik langsung pada badge status tugas (misal klik badge kuning `In Progress` $\rightarrow$ berubah ke hijau `Done`, klik lagi $\rightarrow$ berubah ke abu-abu `To Do`).
* **Kriteria Lolos (Expected Result):**
  - Penyaringan data instan tanpa latensi terasa.
  - Mutasi status via klik badge tersimpan ke database backend secara otomatis.

---

### TC-WEB-04: Modal Manajemen Tugas (Tambah, Edit & Hapus)

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:** Tombol Tambah Tugas, Tombol Edit Pensil, dan Tombol Hapus Tempat Sampah.
* **Langkah Pengujian:**
  1. **Tambah Tugas Baru:**
     - Klik tombol **"+ Tambah Tugas"** di atas tabel.
     - Masukkan Judul: `Pengujian Beban Keamanan API v1`.
     - Pilih Assignee: `Fajri`.
     - Klik **"Simpan Tugas"**.
     - Pastikan baris tugas baru muncul di tabel dengan kode otomatis `#TASK-XX`.
  2. **Edit Tugas (`EditTaskModal`):**
     - Pada baris tugas yang baru dibuat, klik ikon pensil (*Edit*).
     - Ubah status menjadi `In Progress` dan tambahkan keterangan pada judul.
     - Klik **"Simpan Perubahan"**.
     - Pastikan isi tabel langsung mencerminkan perubahan baru.
  3. **Hapus Tugas (`ConfirmDialog`):**
     - Klik ikon tempat sampah (*Delete*).
     - Muncul dialog konfirmasi modal (*Are you sure?*).
     - Klik **"Batalkan"** $\rightarrow$ Tugas tidak terhapus.
     - Klik ikon tempat sampah lagi lalu klik **"Ya, Hapus"** $\rightarrow$ Tugas terhapus dari tabel dan basis data.
* **Kriteria Lolos (Expected Result):**
  - CRUD (*Create, Read, Update, Delete*) tugas berfungsi sempurna dengan validasi input.

---

### TC-WEB-05: Klasemen Kontributor & Skor Anggota Tim

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:** Panel *Leaderboard Kontribusi Tim*.
* **Langkah Pengujian:**
  1. Periksa daftar anggota: Pastikan hanya ada **4 anggota tim resmi** (Deni, Fatir, Rafli, Fajri) dan tidak ada akun dummy.
  2. Periksa avatar: Setiap anggota memiliki foto profil GitHub asli (atau fallback inisial SVG jika koneksi lambat).
  3. Lakukan commit baru untuk salah satu anggota melalui Terminal Web Git $\rightarrow$ Periksa apakah skor commit dan posisi peringkat terhitung ulang dengan tepat.
* **Kriteria Lolos (Expected Result):**
  - Perhitungan poin commit dan tasks done sinkron dengan database.
  - Peringkat 1 s/d 4 terurut berdasarkan keaktifan.

---

### TC-WEB-06: Grafik Analitik SVG Presisi Tinggi

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:** Komponen [`ContributionChart.tsx`](file:///home/whoami/Documents/Projects/si-patir/frontend/src/components/ContributionChart.tsx).
* **Langkah Pengujian:**
  1. Periksa Grafik Batang (*Commit Bar Chart*):
     - Menampilkan proporsi commit masing-masing 4 anggota tim secara visual.
     - Arahkan kursor (*hover*) ke salah satu batang $\rightarrow$ Muncul tooltip angka commit yang presisi.
  2. Periksa Diagram Lingkaran (*Donut Chart Distribusi Tugas*):
     - Menampilkan persentase perbandingan tugas `Done`, `In Progress`, dan `To Do`.
     - Ubah salah satu status tugas di tabel $\rightarrow$ Amati irisan diagram donat menyesuaikan ukuran secara dinamis.
* **Kriteria Lolos (Expected Result):**
  - Vektor SVG tajam di semua tingkat zoom peramban.
  - Perhitungan persentase donat selalu berjumlah $100\%$.

---

### TC-WEB-07: Live Activity Stream & Modal Riwayat Lengkap

* **Halaman:** `http://localhost:3000/dashboard`
* **Elemen yang Diuji:** Panel kanan *Live Activity Stream* dan tombol "Lihat Riwayat Lengkap".
* **Langkah Pengujian:**
  1. Kirim sebuah commit baru (via Web Git atau cURL).
  2. Perhatikan panel *Live Stream*:
     - Log baru seketika tersisip (*prepend*) di urutan teratas tanpa menggulung halaman.
     - Format waktu menggunakan bahasa Indonesia ramah pengguna (misal: *"baru saja"*, *"1 menit yang lalu"*).
  3. Klik tombol **"Lihat Semua Log"**:
     - Modal [`ActivityLogsModal.tsx`](file:///home/whoami/Documents/Projects/si-patir/frontend/src/components/ActivityLogsModal.tsx) terbuka menampilkan tabel seluruh riwayat.
     - Uji pencarian log berdasarkan nama author atau pesan commit.
     - Uji tombol navigasi halaman (*pagination*).
* **Kriteria Lolos (Expected Result):**
  - Socket event terhubung stabil tanpa duplikasi entri log.

---

### TC-WEB-08: Portal Diagram UML Interaktif (Pan & Zoom)

* **Halaman:** `http://localhost:3000/docs?tab=uml`
* **Elemen yang Diuji:** Komponen [`UmlViewer.tsx`](file:///home/whoami/Documents/Projects/si-patir/frontend/src/components/UmlViewer.tsx) dan data 6 diagram.
* **Langkah Pengujian:**
  1. Klik satu per satu 6 tombol pemilih diagram UML:
     - `1. Use Case Diagram`
     - `2. Activity Diagram`
     - `3. Sequence Diagram`
     - `4. Class Diagram`
     - `5. State Machine Diagram`
     - `6. Deployment & Component Diagram`
  2. **Uji Geser (*Pan*):**
     - Klik dan tahan tombol kiri mouse (atau sentuh 1 jari di layar sentuh), lalu geser ke segala arah $\rightarrow$ Kanvas bergerak halus mengikuti gerakan.
  3. **Uji Perbesar / Perkecil (*Zoom*):**
     - Putar roda mouse (*scroll wheel*) atau klik tombol `+` dan `-` $\rightarrow$ Skala zoom berubah dari $35\%$ hingga $350\%$, teks tetap tajam (vektor SVG murni tanpa blur).
  4. **Uji Tombol Reset:**
     - Klik tombol *Reset* $\rightarrow$ Skala kembali ke $100\%$ dan posisi kembali ke titik tengah `(0, 0)`.
  5. **Uji Unduh SVG:**
     - Klik tombol *Download* $\rightarrow$ Berkas `.svg` bersih terunduh ke laptop.
  6. **Uji Layar Penuh (*Fullscreen*):**
     - Klik tombol *Fullscreen* (ikon expand) $\rightarrow$ Kanvas membuka satu layar penuh.
     - Tekan tombol keyboard `Esc` atau klik tombol minimize $\rightarrow$ Kanvas kembali normal.
* **Kriteria Lolos (Expected Result):**
  - Tidak ada teks yang terpotong (*no text clipping*).
  - Gerakan geser dan zoom berjalan $60\text{ FPS}$ tanpa lag.

---

### TC-WEB-09: Laboratorium Simulasi Keamanan Siber

* **Halaman:** `http://localhost:3000/docs?tab=simulator`
* **Elemen yang Diuji:** 3 Modul Uji Interaktif Lab Keamanan.
* **Langkah Pengujian:**
  1. **Simulasi HMAC SHA-256:**
     - Klik **"Uji Tanda Tangan Sah (Valid)"** $\rightarrow$ Respons hijau `200 OK`, durasi waktu konstan tampil dalam nanodetik.
     - Klik **"Uji Tanda Tangan Palsu (Ditolak)"** $\rightarrow$ Respons merah `401 Unauthorized` dengan pesan tanda tangan palsu.
  2. **Simulasi Rate Limiter Flooding:**
     - Klik **"Mulai Kirim 35 Request Cepat"**.
     - Amati kotak log streaming: Request 1–30 berwarna hijau (`200 OK`), request 31–35 berwarna merah (`429 Too Many Requests`).
     - Terdapat indikator counter: *Total Request: 35 | Jumlah Diblokir: 5 Request*.
  3. **Simulasi Anti SQL Injection:**
     - Masukkan: `' OR '1'='1`
     - Klik **"Kirim Uji SQLi"**.
     - Respons: Database mengembalikan status aman (`404 Not Found` / parameter literal), membuktikan kueri SQL tidak tertembus.
* **Kriteria Lolos (Expected Result):**
  - Ketiga pengujian membuktikan 6 lapisan keamanan aktif di server backend.

---

### TC-WEB-10: Responsivitas Multi-Device & Seluruh Jenis iPhone

* **Halaman:** `http://localhost:3000/dashboard` dan `http://localhost:3000/docs`
* **Elemen yang Diuji:** Viewport $320\text{px}$ (iPhone SE 1st gen), $375\text{px}$ (iPhone SE 2/3), $390\text{px}$ (iPhone 12/13/14/15/16 Pro), $430\text{px}$ (iPhone Pro Max), dan layar tablet/desktop.
* **Langkah Pengujian:**
  1. Buka Inspect Element / DevTools peramban (`Ctrl + Shift + I` / `F12`), aktifkan *Toggle Device Toolbar* (`Ctrl + Shift + M`).
  2. Pilih profil **iPhone SE ($375 \times 667$)** dan atur ke $320\text{px}$:
     - Pastikan **tidak ada scroll horizontal yang tidak disengaja** (*no layout overflow*).
     - Header bar tetap proporsional; tombol menu tiga titik / mobile menu dapat dibuka.
     - Tab navigasi di `/docs` dapat digeser secara horizontal menggunakan sentuhan (*smooth momentum scroll*).
  3. Uji Interaksi Layar Sentuh (*Touch Gestures*):
     - Di tab Diagram UML, sentuh dan geser kanvas dengan 1 jari $\rightarrow$ Diagram bergeser tanpa memicu scrolling halaman web ke atas/bawah (`touch-none` aktif).
     - Tombol-tombol aksi memiliki ukuran sentuh yang nyaman (*touch-manipulation* aktif).
* **Kriteria Lolos (Expected Result):**
  - Tampilan $100\%$ stabil, teks tidak bertumpuk, dan mendukung *safe-area-inset* iOS.

---

## ✅ Lembar Ceklis Hasil Pengujian QA (Cross-Check Sign-Off)

Gunakan tabel ini saat melakukan verifikasi akhir bersama tim:

| ID Pengujian | Skenario | Hasil Verifikasi | Tester | Catatan QA |
|:---|:---|:---:|:---:|:---|
| `TC-WEB-01` | Navigasi, Indikator 4 Sistem & Theme Toggle | `PASS ✅` | Fajri | Tema tersimpan di localStorage, lampu hijau aktif |
| `TC-WEB-02` | Terminal Web Git & Automasi Status Tugas | `PASS ✅` | Fajri | Status tugas langsung Done seketika via WebSocket |
| `TC-WEB-03` | Filament Table Search, Filter, & Fast Cycle | `PASS ✅` | Fajri | Filter instan, klik badge langsung mutasi status |
| `TC-WEB-04` | Modal CRUD Tugas (Tambah, Edit, Hapus) | `PASS ✅` | Fajri | Modal validasi input & confirm dialog aman |
| `TC-WEB-05` | Klasemen Kontribusi 4 Anggota Resmi | `PASS ✅` | Fajri | Skor sinkron dengan riwayat commit & tugas selesai |
| `TC-WEB-06` | Grafik SVG Donut & Bar Chart Analitik | `PASS ✅` | Fajri | Tooltip aktif, visualisasi presisi tanpa blur |
| `TC-WEB-07` | Live Activity Log Stream & Modal Riwayat | `PASS ✅` | Fajri | Real-time prepend aktif, format waktu bahasa Indonesia |
| `TC-WEB-08` | 6 Diagram UML (Pan, Zoom, SVG Download) | `PASS ✅` | Fajri | Teks tidak kepotong, pan & wheel zoom mulus |
| `TC-WEB-09` | Lab Keamanan (HMAC, Rate Limiting, SQLi) | `PASS ✅` | Fajri | 35 req dicegat 429, HMAC palsu dicegat 401 |
| `TC-WEB-10` | Full Responsif 320px s/d 4K & iPhone Support | `PASS ✅` | Fajri | Safe area terpasang rapi, touch-scroll lancar |

> **Kesimpulan Akhir QA:** Seluruh 10 modul antarmuka web SI-PATIR dinyatakan **LULUS $100\%$** dan siap diperagakan dalam demonstrasi tugas kelompok mata kuliah Pemrograman Integratif! 🚀
