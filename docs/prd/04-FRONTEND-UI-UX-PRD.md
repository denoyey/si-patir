# PRD 04: Frontend Architecture & Human UI/UX Specification
> **Module Code:** `SI-PATIR-PRD-04`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Client Dashboard

---

## 1. Design Philosophy: "Pure Human Engineering" (Anti-AI Slop)

Frontend SI-PATIR secara tegas menolak tren desain generatif dangkal (*AI-generated slop*). Prinsip antarmuka kami adalah:

1. **Nol Gradasi Klise & Zero Decorative Clutter**: Tidak menggunakan gradasi ungu-ke-merah-muda sintetis maupun footer dekoratif tanpa fungsi praktis.
2. **Standar Border Radius Ketat (`rounded-md` & `rounded-lg`)**: Seluruh elemen antarmuka secara disiplin hanya menggunakan radius sudut berstandar industri: terkecil `rounded-md` (untuk tombol, badge, input) dan terbesar `rounded-lg` (untuk kartu kontainer). Dilarang memakai `rounded-xl`, `rounded-2xl`, atau `rounded-full` pada kartu.
3. **Lebar Kanvas Maksimal (`max-w-7xl`)**: Memberikan bentang pandang desktop yang luas, proporsional, dan nyaman tanpa pemborosan margin samping.
4. **Kepadatan Informasi Tinggi (*High Information Density*)**: Memaksimalkan efisiensi ruang tanpa memboroskan layar dengan padding kosong raksasa. Mencontoh platform developer papan atas seperti **Linear**, **GitHub Actions**, dan **Sentry**.
3. **Presisi Tipografi Teknis**:
   * Kode tugas, hash git commit, timestamp, dan alamat IP menggunakan tipografi **Monospace** yang tajam dan mudah dipindai secara visual.
4. **Kontras & Kejelasan Status**: Indikator status menggunakan badge pill yang tenang (*subtle badge*) dengan titik pulsa hijau untuk menandakan koneksi aktif.

---

## 2. Palet Desain Token (Design Tokens)

| Token Name | Hex Code / Tailwind Class | Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Surface Dark** | `#090b10` | Latar belakang kanvas utama | Hitam industrial pekat, anti-glare |
| **Surface Card** | `#11141d` | Latar kartu metrik, tabel, konsol log | Elevasi rendah, kontras presisi |
| **Border Subdued** | `#27272a` (`border-zinc-800`) | Garis tepi 1px di seluruh kartu & section | Rapi, jelas, konsisten |
| **Border Radius Small**| `rounded-md` (6px) | Tombol, input teks, filter tabs, badge kode | Radius terkecil berstandar industri |
| **Border Radius Large**| `rounded-lg` (8px) | Kartu metrik, kontainer tabel, konsol log | Radius terbesar berstandar industri |
| **Max Container Width**| `max-w-7xl` (1280px) | Kontainer desktop utama | Lebar penuh, proporsional, luas |
| **Text Primary** | `#f4f4f5` (`zinc-100`) | Angka metrik, judul, teks aktif | Kontras tinggi |
| **Status Done** | `#10b981` (`emerald-500`)| Kartu selesai, status koneksi aktif | Hijau emerald alami |
| **Status Progress** | `#f59e0b` (`amber-500`)| Kartu dalam pengerjaan | Oranye/Kuning peringatan tenang |

---

## 3. Komponen Utama Dashboard

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ [SP] SI-PATIR  DevOps Control              [Sync GitHub]  [Sync Trello]  [⚡ Test Commit]     │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Target Repo: denoyey/si-patir:main   │ GitHub: Ready 🟢 │ Trello: Synced 🟢 │ Discord: Active 🟢│
├──────────────────────────────────────┬────────────────────────────────────────────────────────┤
│ [Total Commits: 9]                   │ [Tasks Done: 4 / 5]  │ [Rate: 80%] │ [Sec: HMAC-256]    │
├──────────────────────────────────────┴──────────────────────┬─────────────────────────────────┤
│ 🏆 KLASEMEN KONTRIBUSI ANGGOTA (REAL DATA)                  │ 💻 LIVE WEBHOOK AUDIT STREAM    │
│ 🥇 denoyey (@denoyey) • 9 commits • 1 task (Lead)           │ // Menunggu sinyal push git...  │
│    [+ Tambah Anggota Tim]                                   │ [TASK_COMPLETED] 20:45:10       │
│                                                             │ Author: @denoyey                │
│                                                             │ Msg: "Fix bug [done #TASK-01]"  │
├─────────────────────────────────────────────────────────────┤ Trello #TASK-01 shifted to Done │
│ 📋 DAFTAR KARTU TUGAS (REAL-TIME SYNC)                      │                                 │
│ [Filter: ALL | In Progress | Done | To Do]   [+ Tambah Tugas]│                                │
│ [#TASK-01] Buat Database User       [Done]                  │                                 │
│ [#TASK-02] Integrasi Halaman Login  [Done]                  │                                 │
│ [#TASK-05] Testing Push ke Discord  [To Do]                 │                                 │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────┘
```

### 3.1 Top Navigation Bar
* **Branding:** Logo inisial `[SP]` berbingkai dan label versi *DevOps Control*.
* **Action Controls:**
  * Tombol **"Sync GitHub"** (menarik data kontributor & commit asli dari repositori GitHub).
  * Tombol **"Sync Trello"** (dengan ikon loading spin saat proses fetch berlangsung).
  * Tombol aksi cepat **"Test Commit"** (otomatis menggunakan nama developer nyata yang aktif).

### 3.2 Connectivity & Dynamic Repository Strip
Menampilkan target repositori asli secara dinamis (`denoyey/si-patir:main`) dan status kesehatan seluruh subsistem eksternal secara berdampingan:
* `GitHub: Ready 🟢`
* `Trello: Synced 🟢`
* `Discord: Active 🟢`
* `MySQL: Connected 🟢` (atau `Memory Fallback 🟡` jika database lokal offline).

### 3.3 Manajemen Anggota & Tugas Nyata (Interactive Modals)
* Tombol **"+ Tambah Anggota"**: Mendaftarkan anggota kelompok nyata beserta username GitHub aslinya ke dalam sistem.
* Tombol **"+ Tambah Tugas"**: Mendaftarkan tugas-tugas riil kelompok beserta kode unik (`#TASK-XX` / `#FEAT-XX`).
* Tombol **"Hapus Dummy"**: Membersihkan seluruh data contoh bawaan agar sistem bersih 100% dengan data nyata.

### 3.3 Summary Metrics Cards
Empat metrik visual berpresisi tinggi:
1. **Total Commits**: Akumulasi seluruh commit yang masuk ke sistem.
2. **Tugas Selesai**: Rasio tugas selesai terhadap total tugas yang tercatat di Trello.
3. **Tingkat Penyelesaian**: Progress bar dinamis dengan persentase kemajuan sprint kelompok.
4. **Protokol Keamanan**: Indikator enkripsi aktif (*HMAC SHA-256 & Anti-ReDoS*).

### 3.4 Interactive Task List with Search & Filtering
* **Search Input**: Pencarian instan (kode tugas, judul, atau nama penanggung jawab).
* **Filter Tabs**: Tab tombol untuk memilah tugas berdasarkan status (*ALL*, *In Progress*, *Done*, *To Do*).

### 3.5 Live Webhook Audit Stream
* Konsol terminal *dark mode* di sisi kanan layar.
* Menerima event push detik demi detik via **WebSocket**.
* Memberikan umpan balik instan saat kartu Trello bergeser atau pesan Discord terkirim.

---

## 4. State Management & Real-Time Sync Strategy

1. **Mount Hook (`useEffect`)**: Mengambil data komprehensif saat halaman pertama kali dibuka via `Promise.all`:
   * `/api/members`
   * `/api/tasks`
   * `/api/logs`
   * `/api/status`
2. **WebSocket Event Listener**: Mendengarkan kanal `activity_update`. Begitu sinyal masuk:
   * Menampilkan **Toast Banner** transparan di sudut kanan atas selama 5 detik.
   * Melakukan pembaruan state lokal secara reaktif tanpa me-*reload* seluruh halaman browser.

---

## 5. Matriks Responsivitas Universal & Dukungan Penuh Seluruh iPhone

Antarmuka SI-PATIR diuji dan dioptimalkan secara ketat untuk seluruh spektrum perangkat:

| Kelas Perangkat | Rentang Resolusi (Viewport) | Strategi Layout UI | Penanganan Khusus |
| :--- | :--- | :--- | :--- |
| **Ultrawide & 4K Monitor** | `> 1536px` (`2xl`) | Kontainer `max-w-7xl` terpusat, 4 kolom metrik, visual density optimal. | Padding proporsional, font tajam tanpa peregangan berlebih. |
| **Desktop Standar & Laptop** | `1024px - 1536px` (`lg` / `xl`) | Layout 2 kolom: Kiri (Leaderboard & Tasks), Kanan (Live Stream Console 640px). | Sticky navbar, hover state aktif. |
| **Tablet & iPad (Air/Pro/Mini)** | `768px - 1024px` (`md`) | Grid 2 kolom metrik, tabel tugas dengan padding adaptif. | Dukungan sentuhan (*touch target* >= 40px). |
| **iPhone Plus & Pro Max** | `414px - 430px` (iPhone 11-16 Plus/Pro Max) | Tata letak bertumpuk (*stacked*), 2 kolom metrik, Live stream 540px. | Integrasi `safe-area-inset-top` untuk *Dynamic Island* / *Notch*. |
| **iPhone Standar & Pro** | `375px - 393px` (iPhone X/11/12/13/14/15/16 Pro) | Tata letak bertumpuk, tombol aksi responsif (ikon + label ringkas), tabel horizontal swipe. | Momentum scrolling `-webkit-overflow-scrolling: touch`. |
| **iPhone Mini & iPhone SE** | `320px - 375px` (iPhone SE 1st/2nd/3rd gen, Mini) | Zero horizontal overflow, search bar fleksibel, badge status compact. | Pencegahan auto-zoom form Safari via `font-size: 16px` equivalent. |

### Spesifikasi Khusus Dukungan iPhone / iOS:
1. **Viewport Meta & Notch Protection**:
   Menggunakan `viewport-fit=cover` pada meta tag peramban dan variabel CSS `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` agar elemen header tidak tertabrak oleh Dynamic Island atau sensor notch iPhone.
2. **Anti-Accidental Zoom**:
   Menonaktifkan auto-zoom yang mengganggu saat mengetik di Safari iOS dengan konfigurasi meta viewport `maximum-scale=1.0, user-scalable=no`.
3. **Smooth Momentum Touch Scrolling**:
   Tabel klasemen dan daftar filter dilengkapi kelas utilitas `.touch-scroll` dengan `-webkit-overflow-scrolling: touch; overscroll-behavior: contain;` sehingga pengguna iPhone dapat menggeser tabel data secara alami dan mulus.
4. **Touch Target Size**:
   Semua tombol aksi memiliki tinggi minimum `h-9` (36px–44px) dengan padding sentuh luas untuk menghindari salah tekan (*fat-finger prevention*).

