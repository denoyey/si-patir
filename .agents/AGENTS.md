# 📖 SI-PATIR: Agent & Developer Architecture Guide
> **Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (DevOps Lite)**
> Document Version: `2.0.0-ENTERPRISE` | Security Hardening: `OWASP-Compliant`

---

## 1. Executive Summary & System Philosophy

**SI-PATIR** adalah platform kontrol dan pemantau aktivitas tugas tim berbasis integrasi *DevOps Lite*. Sistem ini menghubungkan tiga ekosistem perangkat lunak eksternal yang heterogen (**GitHub**, **Trello**, dan **Discord**) ke dalam satu aplikasi dashboard monitoring berbasis **WebSocket Real-time** dan basis data **MySQL**.

### Nilai Inti Rekayasa:
1. **Strict Object-Oriented Programming (OOP)**: Arsitektur berlapis (*Layered Architecture*) berbasis *Singleton*, *Repository Pattern*, *Service Layer*, dan *Dependency Injection*.
2. **Pure Human Engineering UI (Anti-AI Slop)**: Menolak desain generatif yang dangkal (tanpa gradasi ungu/pink berlebihan, tanpa padding raksasa tak berguna). Mengadopsi standar *high-density dashboard* seperti GitHub Actions, Linear, dan Sentry.
3. **Full-Spectrum Defense-in-Depth Security**: Perlindungan berlapis terhadap spektrum serangan siber dari ancaman klasik (SQLi, XSS, CSRF) hingga ancaman mutakhir (Timing Attack, ReDoS, JSON-Bomb DoS, Log Injection).

### Modul PRD Terstruktur:
Seluruh spesifikasi kebutuhan sistem diatur secara modular di direktori `docs/prd/`:
* [PRD 00: Master Index & Executive Product Overview](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)
* [PRD 01: System Integration & Data Flow Architecture](file:///home/whoami/Documents/Projects/si-patir/docs/prd/01-SYSTEM-INTEGRATION-PRD.md)
* [PRD 02: Database & Data Storage Specification](file:///home/whoami/Documents/Projects/si-patir/docs/prd/02-DATABASE-AND-STORAGE-PRD.md)
* [PRD 03: Security Architecture & Threat Hardening](file:///home/whoami/Documents/Projects/si-patir/docs/prd/03-SECURITY-AND-HARDENING-PRD.md)
* [PRD 04: Frontend Architecture & Human UI/UX Specification](file:///home/whoami/Documents/Projects/si-patir/docs/prd/04-FRONTEND-UI-UX-PRD.md)
* [PRD 05: REST API & Webhook Technical Contracts](file:///home/whoami/Documents/Projects/si-patir/docs/prd/05-API-AND-WEBHOOK-CONTRACTS-PRD.md)
* [PRD 06: Operations, Deployment & Demo Runbook](file:///home/whoami/Documents/Projects/si-patir/docs/prd/06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md)

---

## 2. Arsitektur Berorientasi Objek (OOP) & Diagram Struktur

Struktur folder backend didesain secara modular, *reusable*, dan *decoupled*:

```text
backend/src/
├── types/
│   └── interfaces.ts            # Kontrak domain (IMember, ITask, IActivityLog, DTO)
├── config/
│   └── EnvironmentConfig.ts     # Singleton: Parser konfigurasi & masking secret
├── database/
│   ├── DatabaseService.ts       # Singleton: Pool connection MySQL & memory fallback
│   └── repositories/
│       ├── MemberRepository.ts  # Repository: Kueri anggota & statistik commit
│       ├── TaskRepository.ts    # Repository: Kueri kartu tugas & update status
│       └── ActivityLogRepository.ts # Repository: Kueri & mutasi audit log
├── services/
│   ├── WebhookSecurityService.ts   # Service: HMAC SHA-256 & timing attack shield
│   ├── CommitParserService.ts      # Service: ReDoS-safe regex & data sanitization
│   ├── DiscordNotificationService.ts # Service: HTTP client & Discord rich embed
│   └── TrelloIntegrationService.ts # Service: Trello REST API card manipulation
├── middlewares/
│   └── SecurityMiddleware.ts    # Middleware: Helmet, RateLimiter, CORS, ErrorSanitizer
├── controllers/
│   ├── WebhookController.ts     # Controller: Orkestrasi event push GitHub
│   ├── TaskController.ts        # Controller: Query & sinkronisasi kartu Trello
│   ├── MemberController.ts      # Controller: Klasemen kontributor
│   └── SystemController.ts      # Controller: Health check & activity stream
├── Application.ts               # Gateway App: Setup Express, Socket.io, & Lifecycle
└── server.ts                    # Entry Point: Bootstrap eksekusi
```

### Pola Desain (*Design Patterns*) yang Diterapkan:
* **Singleton Pattern**: Diterapkan pada `EnvironmentConfig` dan `DatabaseService` guna menjamin efisiensi pemakaian memori dan konsistensi *connection pool*.
* **Repository Pattern**: Mengisolasi logika akses data dari *business logic*. Semua kueri SQL menggunakan *Parameterized Statements* (`?`) untuk mencegah injeksi kode.
* **Service Layer Pattern**: Memisahkan tanggung jawab integrasi pihak ketiga (`DiscordNotificationService`, `TrelloIntegrationService`, `WebhookSecurityService`).
* **Dependency Injection**: `WebhookController` menerima instansiasi `SocketServer` dan *service dependencies* melalui konstruktor, memudahkan *unit testing* dan *mocking*.

---

## 3. Matriks Keamanan Siber (Security Shield & Attack Defense)

Sistem ini menerapkan pengamanan menyeluruh untuk menutup vektor eksploitasi peretas dari kategori klasik hingga tingkat lanjut:

| Kategori Serangan | Vektor Ancaman | Mekanisme Pertahanan SI-PATIR | Lokasi Kode |
| :--- | :--- | :--- | :--- |
| **Side-Channel Attack** | **Timing Attack** pada verifikasi Webhook Secret | Menggunakan `crypto.timingSafeEqual` pada buffer biner dengan waktu konstan (menolak komparasi `===` yang bocor lewat waktu eksekusi). | `WebhookSecurityService.ts` |
| **Injection** | **SQL Injection (1st & 2nd Order)** | Semua kueri SQL diisolasi dengan *Prepared Statements* MySQL2. Tidak ada string concatenation pada kueri. | `repositories/*` |
| **Injection** | **Cross-Site Scripting (XSS)** | Pembersihan tag HTML pada pesan commit + Content Security Policy (CSP) ketat via Helmet. | `CommitParserService.ts`, `SecurityMiddleware.ts` |
| **Injection** | **Log Injection / CRLF** | Mengeliminasi karakter `\r`, `\n`, `\t` dari header/pesan sebelum dicatat ke log server. | `WebhookSecurityService.ts` |
| **Denial of Service** | **Brute-Force & Flooding** | *Dual-tier Rate Limiting*: Global (120 req/m) dan Webhook (30 req/m per IP). | `SecurityMiddleware.ts` |
| **Denial of Service** | **JSON Bomb / Memory Exhaustion** | Pembatasan ukuran muatan payload HTTP secara ketat pada `100kb` (`express.json({ limit: '100kb' })`). | `Application.ts` |
| **Denial of Service** | **ReDoS (RegEx DoS)** | Membatasi panjang teks masukan (maks 1000 karakter) dan menggunakan pola *finite-length non-backtracking* regex. | `CommitParserService.ts` |
| **Client-Side Attacks** | **Clickjacking / UI Redress** | Menyematkan header protektif `X-Frame-Options: DENY` via Helmet. | `SecurityMiddleware.ts` |
| **Client-Side Attacks** | **MIME-Type Sniffing** | Header `X-Content-Type-Options: nosniff`. | `SecurityMiddleware.ts` |
| **Information Leak** | **Stack Trace Disclosure** | `SecurityMiddleware.globalErrorHandler` mencegat semua *exception*, mencegah detail database bocor ke klien luar. | `SecurityMiddleware.ts` |
| **Network Security** | **CORS Abuse** | Whitelist domain eksplisit (`corsOrigins`), menolak wildcard origin pada endpoint sensitif. | `SecurityMiddleware.ts` |

---

## 4. Filosofi Desain Antarmuka: "Pure Human Engineering"

Frontend dibangun tanpa elemen *AI-Slop* yang dangkal. Karakteristik antarmuka SI-PATIR:

1. **Palet Warna Zinc/Slate Profesional**: Menggunakan latar belakang gelap solid (`#0b0d13` dan `#12151e`) dengan garis batas terdefinisi (`border-zinc-800/80`), bukan gradien ungu-pink kabur yang membuat mata lelah.
2. **Kepadatan Informasi Tinggi (*High Data Density*)**: Metrik ditampilkan dengan presisi (total commits, completion rate, connectivity badge).
3. **Tipografi Monospace Fungsional**: Kode tugas (`[#TASK-02]`), branch Git, timestamp, dan username diformat menggunakan font monospace untuk keterbacaan teknis optimal.
4. **Penyaringan & Pencarian Real-Time**: Dilengkapi tab filter status (*ALL*, *In Progress*, *Done*, *To Do*) dan *search bar* yang reaktif.
5. **Audit Stream Terminal**: Panel samping merepresentasikan *event stream* bergaya konsol developer dengan indikator pulsa hijau (*LISTENING*).

---

## 5. Kontrak API & Spesifikasi Webhook

### `POST /api/webhooks/github`
* **Header Wajib (Mode Produksi)**: `X-Hub-Signature-256: sha256=<hmac>`
* **Contoh Payload**:
  ```json
  {
    "commits": [
      {
        "id": "7a8b9c1",
        "message": "Implementasi endpoint auth [done #TASK-02]",
        "author": { "name": "Budi Santoso", "username": "budi99" },
        "url": "https://github.com/org/repo/commit/7a8b9c1"
      }
    ]
  }
  ```
* **Respons Berhasil (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Webhook processed securely",
    "processedCount": 1
  }
  ```

### `POST /api/simulate-commit`
* **Kegunaan**: Pengujian instan dari dashboard/terminal lokal tanpa ketergantungan koneksi internet.
* **Payload**:
  ```json
  {
    "developer": "budi99",
    "message": "Fix bug tombol login [done #TASK-02]"
  }
  ```

---

## 6. Prosedur Operasional Bagi Agen & Developer

### Menjalankan Sistem:
* **Linux / macOS**: `./start.sh` (Otomatis mematikan proses lama di port `5000` & `3000`).
* **Windows**: `start.bat` (Otomatis membersihkan bentrok port dan membuka peramban).

### Menambah Saluran Notifikasi Baru (Extensibility Guide):
Untuk menambahkan notifikasi baru (misal: Telegram):
1. Buat kelas baru di `backend/src/services/TelegramNotificationService.ts`.
2. Implementasikan antarmuka pengiriman pesan menggunakan `axios`.
3. Suntikkan (*inject*) kelas tersebut ke dalam `WebhookController.ts` pada blok kondisi `if (taskCode)`.

### Menambah Manajemen Kartu Baru (Jira / Linear):
1. Buat kelas di `backend/src/services/LinearIntegrationService.ts`.
2. Implementasikan method `moveCardToDone()`.
3. Panggil method tersebut secara paralel (`Promise.all`) di `WebhookController.ts`.

---

## 7. Aturan Mutlak & Standar Kualitas Agen (Agent Golden Rules)

### 📌 Aturan 1: Wajib Sinkronisasi PRD Setiap Perubahan
Setiap agen AI atau pengembang manusia yang melakukan perubahan kode (fitur baru, perbaikan bug, penyesuaian endpoint, perubahan skema database, atau gaya antarmuka) **WAJIB MEMUTAKHIRKAN DOKUMEN PRD TERKAIT DI FOLDER `docs/prd/` PADA SAAT ITU JUGA**.
* Mengubah API -> Update `05-API-AND-WEBHOOK-CONTRACTS-PRD.md`.
* Mengubah skema DB -> Update `02-DATABASE-AND-STORAGE-PRD.md`.
* Mengubah UI/UX -> Update `04-FRONTEND-UI-UX-PRD.md`.
* Mengubah keamanan -> Update `03-SECURITY-AND-HARDENING-PRD.md`.

### 📱 Aturan 2: Standar Responsivitas Universal & Dukungan Seluruh iPhone
Setiap perubahan tampilan antarmuka wajib mempertahankan dukungan responsif penuh dari layar terbesar hingga terkecil:
1. **Layar Ultrawide & Desktop**: Kontainer terpusat `max-w-7xl` tanpa elemen melebar secara liar.
2. **Tablet & iPad**: Layout grid 2 kolom dengan jarak sentuh memadai.
3. **Seluruh Varian iPhone (SE, Mini, Standar, Pro, Plus, Pro Max)**:
   * Wajib memanfaatkan safe area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) agar tidak terpotong oleh Dynamic Island atau Notch iPhone.
   * Tabel dan bilah tombol wajib mendukung *momentum horizontal touch scrolling* (`.touch-scroll`) tanpa merusak lebar halaman (*zero horizontal body overflow*).
   * Tombol aksi harus ramah sentuhan (*touch target size* minimum 36px–44px).

### 🌿 Aturan 3: Protokol Git Otomatis & Standar Percabangan (Branching & Conventional Commits)
Setiap kali agen AI atau pengembang berhasil melakukan pembaruan kode, sistem **WAJIB MENGIKUTI STANDAR BEST-PRACTICE GIT DEVOPS**:
1. **Dilarang Keras Push Langsung ke Branch `main`**:
   * Branch `main` adalah branch produksi terproteksi (*protected branch*).
   * Seluruh pembaruan kode, perbaikan, maupun dokumentasi **wajib dibuatkan branch baru** (*feature/fix branch*).
2. **Konvensi Penamaan Branch (*Branch Naming Convention*)**:
   * `feat/<deskripsi-singkat>` : Penambahan fitur atau komponen baru (contoh: `feat/responsive-dashboard-layout`).
   * `fix/<deskripsi-bug>`       : Perbaikan bug atau error sistem (contoh: `fix/hmac-timing-attack-verification`).
   * `refactor/<modul>`          : Restrukturisasi arsitektur kode tanpa mengubah fungsi (contoh: `refactor/oop-service-layer`).
   * `docs/<topik>`              : Pembaruan dokumen PRD atau README (contoh: `docs/sync-prd-specifications`).
   * `chore/<tugas>`             : Pemeliharaan dependensi atau konfigurasi tooling (contoh: `chore/port-killer-scripts`).
3. **Standar Pesan Commit (*Conventional Commits v1.0.0*)**:
   * Format: `<type>(<scope>): <pesan deskriptif jelas dan bermakna>`
   * Dilarang menggunakan pesan commit asal-asalan seperti *"update"*, *"fix"*, *"test"*, atau *"benerin"*.
   * Contoh commit standar profesional:
     * `feat(ui): implement adaptive safe-area layout and standardize border radius to md/lg`
     * `fix(webhook): enforce constant-time buffer comparison to prevent timing attacks`
     * `refactor(backend): decouple express controllers and repositories into oop classes`
     * `docs(prd): synchronize modular PRD suite with dual-tier storage specs`
4. **Gerbang Verifikasi Pra-Push (*Pre-Push Quality Gate*)**:
   Sebelum menjalankan `git push`, wajib memverifikasi:
   * `cd backend && npx tsc --noEmit` -> Harus return code 0 (Nol error tipe).
   * `cd frontend && npm run build` -> Harus return code 0 (Build sukses tanpa error).
   * Jika salah satu verifikasi gagal, **DILARANG COMMIT/PUSH**.
5. **Eksekusi Push Otomatis ke Remote GitHub**:
   * Buat branch baru: `git checkout -b <branch-name>`
   * Stage file terkait: `git add .`
   * Commit pesan berstandar: `git commit -m "<conventional-commit-message>"`
   * Push ke remote dengan upstream: `git push -u origin <branch-name>`



