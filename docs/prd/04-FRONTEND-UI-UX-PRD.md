# PRD 04: Frontend Architecture & Human UI/UX Specification
> **Module Code:** `SI-PATIR-PRD-04`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Client Dashboard

---

## 1. Design Philosophy: "Pure Human Engineering" (Anti-AI Slop)

Frontend SI-PATIR secara tegas menolak tren desain generatif dangkal (*AI-generated slop*). Prinsip antarmuka kami adalah:

1. **Nol Emoji Spam & Zero Decorative Clutter**: Menghapus seluruh ikon dekoratif repetitif dan spam emoji (seperti medali `🥇`, `🥈`, `🥉`, dan api `🔥`). Seluruh indikator digantikan oleh tipografi peringkat bersih (`#1`, `#2`, `#3`, `#{rank}`) dan badge status kerja alami (`● Aktif` / `Standby`).
2. **Ikonografi Fungsional Tunggal (Lucide Icons Only)**: Ikon hanya digunakan dari pustaka `lucide-react` untuk tujuan fungsional nyata (navigasi, indikator tipe tugas, status audit stream). Tidak ada ikon dekoratif ganda atau elemen visual tanpa makna.
3. **Standar Border Radius Ketat (`rounded-md` & `rounded-lg`)**: Seluruh elemen antarmuka secara disiplin hanya menggunakan radius sudut berstandar industri: terkecil `rounded-md` (untuk tombol, badge, input) dan terbesar `rounded-lg` (untuk kartu kontainer). Dilarang memakai `rounded-xl`, `rounded-2xl`, atau `rounded-full` pada kartu.
4. **Lebar Kanvas Maksimal (`max-w-7xl`)**: Memberikan bentang pandang desktop yang luas, proporsional, dan nyaman tanpa pemborosan margin samping (`max-w-7xl mx-auto`).
5. **Keselarasan Ritme Visual (*Uniform Spacing, Width & Height Rhythm*)**:
   - Seluruh 4 kartu metrik memiliki padding seragam `p-5` dan tinggi seragam `min-h-[124px]`.
   - Header panel Klasemen dan Live Stream memiliki tinggi identik `min-h-[52px]` dan padding `px-5 py-3.5` sehingga sejajar secara horizontal di desktop.
   - Tombol aksi memiliki tinggi baku: `h-8.5` (navbar), `h-8` (tabel/panel), dan `h-9` (modal dan form input).
6. **Tipografi Geometris Humanis (Poppins & JetBrains Mono)**:
   - Font primer antarmuka menggunakan **Poppins** (bobot 300, 400, 500, 600, 700) via `@fontsource/poppins` untuk keterbacaan modern, ramah pengguna, dan estetika engineering dashboard berstandar Silicon Valley.
   - Kode tugas, hash git commit, timestamp, dan alamat IP menggunakan tipografi **Monospace** yang tajam dan presisi.

---

## 2. Palet Desain Token (Design Tokens)

| Token Name | Hex Code / Tailwind Class | Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Primary Typography** | `Poppins, -apple-system, sans-serif` | Tipografi umum seluruh teks | Geometris, bersih, humanis |
| **Mono Typography** | `JetBrains Mono, Fira Code, monospace` | Kode commit, task code, status log | Presisi teknis, tabular |
| **Surface Dark** | `#090b10` | Latar belakang kanvas utama | Hitam industrial pekat, anti-glare |
| **Surface Card** | `#11141e` | Latar kartu metrik, tabel, konsol log | Elevasi rendah, kontras presisi |
| **Surface Header** | `#0d1017` | Latar bilah navigasi dan header panel | Pembeda section yang subtle |
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
│ [SP] SI-PATIR  Sistem Monitoring              [Sync GitHub]  [Sync Trello]  [⚡ Test Commit]     │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Target Repo: denoyey/si-patir:main   │ GitHub: Ready 🟢 │ Trello: Synced 🟢 │ Discord: Active 🟢│
├──────────────────────────────────────┬────────────────────────────────────────────────────────┤
│ [Total Commits: 9]                   │ [Tasks Done: 4 / 5]  │ [Rate: 80%] │ [Sec: HMAC-256]    │
├──────────────────────────────────────┴──────────────────────┬─────────────────────────────────┤
│ 🏆 KLASEMEN KONTRIBUSI ANGGOTA (REAL DATA)                  │ 💻 LIVE WEBHOOK AUDIT STREAM    │
│ #1 denoyey (@denoyey) • 9 commits • 1 task (Lead)           │ // Menunggu sinyal push git...  │
│    [+ Tambah Anggota]  [Hapus Dummy]                        │ [TASK_COMPLETED] 20:45:10       │
│                                                             │ Author: @denoyey                │
│                                                             │ Msg: "Fix bug [done #TASK-01]"  │
├─────────────────────────────────────────────────────────────┤ Trello #TASK-01 shifted to Done │
│ 📋 DAFTAR KARTU TUGAS                                       │                                 │
│ [Filter: ALL | In Progress | Done | To Do]   [+ Tambah Tugas]│                                │
│ [#TASK-01] Buat Database User       [Done]                  │                                 │
│ [#TASK-02] Integrasi Halaman Login  [Done]                  │                                 │
│ [#TASK-05] Testing Push ke Discord  [To Do]                 │                                 │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────┘
```

### 3.1 Top Navigation Bar
* **Branding:** Logo inisial `[SP]` berbingkai dan label badge *Sistem Monitoring*.
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
1. **PWA Mobile-Web-App Standards Compliance**:
   Mengatasi peringatan peramban modern (*`<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated`*) dengan menyematkan tag standar HTML5 peramban modern `<meta name="mobile-web-app-capable" content="yes" />` berdampingan dengan fallback warisan iOS `<meta name="apple-mobile-web-app-capable" content="yes" />` serta status bar style `black-translucent` untuk tampilan fullscreen PWA yang konsisten.
2. **Viewport Meta & Notch Protection**:
   Menggunakan `viewport-fit=cover` pada meta tag peramban dan variabel CSS `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` agar elemen header tidak tertabrak oleh Dynamic Island atau sensor notch iPhone.
3. **Anti-Accidental Zoom**:
   Menonaktifkan auto-zoom yang mengganggu saat mengetik di Safari iOS dengan konfigurasi meta viewport `maximum-scale=5.0` dan form input berukuran `16px` (`text-base sm:text-xs`).
4. **Smooth Momentum Touch Scrolling**:
   Tabel klasemen dan daftar filter dilengkapi kelas utilitas `.touch-scroll` dengan `-webkit-overflow-scrolling: touch; overscroll-behavior: contain;` sehingga pengguna iPhone dapat menggeser tabel data secara alami dan mulus.
5. **Touch Target Size**:
   Semua tombol aksi memiliki tinggi minimum `h-8.5` hingga `h-9` (34px–44px) dengan padding sentuh luas untuk menghindari salah tekan (*fat-finger prevention*).

---

## 6. Arsitektur Animasi OOP GSAP (Modern Interactive Engine)

Untuk menghadirkan pengalaman visual web modern berstandar enterprise yang "hidup" dan interaktif tanpa jatuh ke dalam perangkap efek berlebihan (*AI-slop*), SI-PATIR mengimplementasikan sistem animasi berbasis **Object-Oriented Programming (OOP)** menggunakan **GSAP (GreenSock Animation Platform)**:

### 6.1 Struktur Modul Animasi
* **`interfaces/IAnimationStrategy.ts`**: Kontrak antarmuka yang mendefinisikan operasi animasi standar (`animateDashboardEntrance`, `animateStatCounter`, `animateProgressBar`, `animateLogArrival`, `animateModalEntrance`, `animateToastEntrance`).
* **`services/GsapAnimationEngine.ts`**: Kelas Singleton konkret yang mengimplementasikan `IAnimationStrategy`, membungkus pemanggilan GSAP secara aman, dan menyediakan konfigurasi *easing* teknis presisi (`power2.out`, `power3.out`, `back.out(1.4)`).
* **`hooks/useGsapScope.ts`**: React Hook khusus yang memanfaatkan `gsap.context()` untuk memastikan seluruh timeline animasi dibersihkan secara otomatis (*memory-leak proof*) saat komponen di-unmount.

### 6.2 Pola Perilaku Animasi
1. **Staggered Layout Entrance**: Saat dashboard dimuat, header, kartu ringkasan metrik, dan grid konsol audit muncul secara bertahap (*staggered*) dengan translasi vertikal halus.
2. **Smooth Numeric Counters**: Nilai Total Commits, Tugas Selesai, dan Persentase Penyelesaian menggunakan interpolasi numerik GSAP yang bertransisi secara mulus saat data diperbarui.
3. **Reactive Log Arrival Highlight**: Setiap ada komit baru yang diterima melalui WebSocket, baris log paling atas di Live Stream disorot dengan kilatan hijau lembut dan pergeseran horizontal (*slide-in*).
4. **Interactive Modal & Toast**: Dialog pop-up dan banner notifikasi menggunakan kurva pegas (*spring entrance*) yang responsif terhadap interaksi pengguna.

---

## 7. Optimasi SEO & Google Search Console 100%

SI-PATIR dilengkapi metadata dan konfigurasi peramban berstandar Search Engine Optimization (SEO) modern dan siap diindeks 100% oleh Google Search Console:

1. **Structured Data (Schema.org JSON-LD)**:
   Menggunakan tipe `WebApplication` terverifikasi dengan data pembuat (`author`), lisensi, fitur inti, dan metadata peramban.
2. **Open Graph & Twitter Cards**:
   Protokol kartu sosial lengkap (`og:title`, `og:description`, `og:image`, `og:url`, `og:locale`, `twitter:card`) untuk tampilan tautan kaya saat dibagikan di WhatsApp, Discord, Telegram, LinkedIn, dan X.
3. **Google Site Verification**:
   Disematkan tag `<meta name="google-site-verification" content="..." />` untuk verifikasi instan pemilikan situs di Google Search Console.
4. **Sitemap & Crawl Control**:
   - `robots.txt`: Membuka akses perayapan (*crawlable*) untuk seluruh Googlebot dan perayap web lainnya.
   - `sitemap.xml`: XML sitemap resmi dengan deklarasi prioritas dan frekuensi perubahan berkala.
   - `site.webmanifest`: Berkas manifes PWA untuk instalasi dan indexing peramban modern.

---

## 8. Prinsip Aksesibilitas Touch Mobile (Anti-Hover Dependency)

Mengatasi kelemahan fundamental layar sentuh ponsel (di mana *hover state* tidak ada):

1. **Permanen Visible Action Triggers**:
   Seluruh tombol aksi (misalnya tombol hapus tugas, navigasi tab, tombol sinkronisasi) **dilarang disembunyikan di balik `opacity-0 group-hover:opacity-100`**. Seluruh tombol dibuat tampak jelas setiap saat di layar ponsel.
2. **Tactile Feedback (`active:scale-95`)**:
   Sebagai pengganti hover, seluruh tombol dilengkapi umpan balik taktil saat disentuh (`active:scale-95` dan `active:bg-...`) serta kelas `touch-manipulation` untuk menghilangkan penundaan sentuh 300ms (*tap delay*).
3. **Anti-Zooming Form Fields**:
   Ukuran teks pada seluruh elemen input form diatur pada `text-base sm:text-xs` (16px pada viewport ponsel) untuk mencegah peramban Safari iOS melakukan auto-zoom yang merusak tata letak layar saat pengguna mengetik.



