# PRD 04: Frontend Architecture & Human UI/UX Specification
> **Module Code:** `SI-PATIR-PRD-04`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Client Dashboard

---

## 1. Design Philosophy: "Pure Human Engineering" (Anti-AI Slop)

Frontend SI-PATIR secara tegas menolak tren desain generatif dangkal (*AI-generated slop*). Prinsip antarmuka kami adalah:

1. **Nol Gradasi Klise**: Tidak menggunakan gradasi ungu-ke-merah-muda raksasa (*pink-purple glowing blobs*) yang sering dihasilkan AI.
2. **Kepadatan Informasi Tinggi (*High Information Density*)**: Memaksimalkan efisiensi ruang tanpa memboroskan layar dengan padding kosong raksasa. Mencontoh platform developer papan atas seperti **Linear**, **GitHub Actions**, dan **Sentry**.
3. **Presisi Tipografi Teknis**:
   * Kode tugas, hash git commit, timestamp, dan alamat IP menggunakan tipografi **Monospace** yang tajam dan mudah dipindai secara visual.
4. **Kontras & Kejelasan Status**: Indikator status menggunakan badge pill yang tenang (*subtle badge*) dengan titik pulsa hijau untuk menandakan koneksi aktif.

---

## 2. Palet Desain Token (Design Tokens)

| Token Name | Hex Code | Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Surface Dark** | `#0b0d13` | Warna latar belakang layar utama | Sangat gelap, pekat, tidak silau |
| **Surface Card** | `#12151e` | Latar kartu, tabel, dan wadah panel | Sedikit lebih terang dengan elevasi rendah |
| **Border Subdued** | `#27272a` (`zinc-800`) | Garis pemisah 1px antar panel | Tegas, presisi, tidak pudar |
| **Text Primary** | `#f4f4f5` (`zinc-100`) | Teks judul, angka metrik, dan teks aktif | Kontras tinggi, mudah dibaca |
| **Text Muted** | `#71717a` (`zinc-500`) | Keterangan tambahan, label sekunder | Redup, tidak mendominasi visual |
| **Status Done** | `#10b981` (`emerald-500`)| Kartu tugas selesai, status terhubung | Hijau emerald alami |
| **Status Progress** | `#f59e0b` (`amber-500`)| Kartu dalam pengerjaan | Oranye/Kuning peringatan tenang |
| **Status Inactive** | `#3f3f46` (`zinc-700`)| Tugas To Do, status terputus | Abu-abu netral |

---

## 3. Komponen Utama Dashboard

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ [SP] SI-PATIR  DevOps Control              [Sync Trello]  [⚡ Test Commit [done #TASK-02]]    │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Target Repo: kelompok/si-patir:main  │ GitHub: Ready 🟢 │ Trello: Synced 🟢 │ Discord: Active 🟢│
├──────────────────────────────────────┬────────────────────────────────────────────────────────┤
│ [Total Commits: 40]                  │ [Tasks Done: 3 / 5]  │ [Rate: 60%] │ [Sec: HMAC-256]    │
├──────────────────────────────────────┴──────────────────────┬─────────────────────────────────┤
│ 🏆 KLASEMEN KONTRIBUSI ANGGOTA                              │ 💻 LIVE WEBHOOK AUDIT STREAM    │
│ 🥇 Andi Saputra (@andi_dev)  • 14 commits • 3 tasks (Lead) │ // Menunggu sinyal push git...  │
│ 🥈 Citra Lestari (@citra_ui) • 11 commits • 2 tasks         │ [TASK_COMPLETED] 20:45:10       │
│ 🥉 Budi Santoso (@budi99)    • 9 commits  • 1 task          │ Author: @budi99                 │
│                                                             │ Msg: "Fix bug [done #TASK-02]"  │
├─────────────────────────────────────────────────────────────┤ Trello #TASK-02 shifted to Done │
│ 📋 DAFTAR KARTU TUGAS (Trello Sync)                         │                                 │
│ [Filter: ALL | In Progress | Done | To Do]   [Search Task]  │                                 │
│ [#TASK-01] Buat Database User       [Done]                  │                                 │
│ [#TASK-02] Integrasi Halaman Login  [In Progress]           │                                 │
│ [#TASK-05] Testing Push ke Discord  [To Do]                 │                                 │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────┘
```

### 3.1 Top Navigation Bar
* **Branding:** Logo inisial `[SP]` berbingkai dan label versi *DevOps Control*.
* **Action Controls:**
  * Tombol **"Sync Trello"** (dengan ikon loading spin saat proses fetch berlangsung).
  * Tombol aksi cepat **"Test Commit [done #TASK-02]"** untuk menguji end-to-end integrasi hanya dalam satu klik saat presentasi.

### 3.2 Connectivity Strip
Menampilkan status kesehatan seluruh subsistem eksternal secara berdampingan:
* `GitHub: Ready 🟢`
* `Trello: Synced 🟢`
* `Discord: Active 🟢`
* `MySQL: Connected 🟢` (atau `Memory Fallback 🟡` jika database lokal offline).

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

