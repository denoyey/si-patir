# PRD 01: System Integration & Data Flow Architecture
> **Module Code:** `SI-PATIR-PRD-01`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Integration Engine

---

## 1. System Integration Scope & Boundaries

SI-PATIR bertindak sebagai **Orchestrator Gateway** yang menjembatani protokol Inbound (menerima event) dan Outbound (mengirim perintah automasi ke sistem pihak ketiga):

```
                        ┌────────────────────────────────────────────────────────┐
                        │             SI-PATIR INTEGRATION GATEWAY               │
                        │                                                        │
                        │   1. Security Gate: HMAC SHA-256 + Rate Limiter        │
                        │   2. Commit Message Parser & Sanitizer Engine          │
                        │   3. Database & Memory State Synchronization           │
                        │   4. Async Broadcast Engine (Socket.io WebSocket)      │
                        └───────────▲─────────────────┬──────────────────┬───────┘
                                    │                 │                  │
        ┌───────────────────────────┘                 │                  └───────────────────────────┐
        │                                             │                                              │
[ Inbound Event ]                           [ Task State Engine ]                          [ Outbound Notification ]
        ▼                                             ▼                                              ▼
┌───────────────────────┐                   ┌───────────────────┐                          ┌───────────────────┐
│     SISTEM 1 (Git)    │                   │ SISTEM 2 (State)  │                          │ SISTEM 3 (Chat)   │
│   GitHub Webhook /    │                   │ Task State Engine │                          │  Discord Webhook  │
│   Local Git Hook      │                   │ (MySQL2 Storage)  │                          │                   │
│                       │                   │ - Match Task Code │                          │ - Rich Embed      │
│ - Push Event Payload  │                   │ - Transition Done │                          │ - Color Coding    │
│ - Author, Message, Url│                   │ - Record Evidence │                          │ - Direct Git Link │
└───────────────────────┘                   └───────────────────┘                          └───────────────────┘
```

---

## 2. Inbound Pipeline: GitHub Webhooks & Local Git Hook

### 2.1 Alur Penerimaan Data (Ingestion Flow)
1. Developer melakukan `git commit` dan `git push` dengan pesan berformat referensi tugas, contoh:
   ```bash
   git commit -m "Integrasi auth modul login [done #TASK-02]"
   ```
2. Endpoint penerima: `POST /api/webhooks/github`.
3. Verifikasi Keamanan:
   - Evaluasi header `X-Hub-Signature-256`.
   - Validasi rate limit (maks 30 req/menit).
   - Validasi ukuran payload (maksimal 100kb).
4. Ekstraksi Payload:
   - Mengambil array `commits[]`.
   - Parsing atribut: `message`, `author.name`, `author.username`, `url`.

### 2.2 Local Hook Support (Tanpa Internet / Tunnel)
Sistem menyediakan skrip `scripts/setup-local-git-hook.sh` yang menyematkan skrip `post-commit` di `.git/hooks/`. Setiap kali developer mengetik `git commit` di laptop, Git lokal langsung menembakkan payload JSON terformat ke `http://localhost:5000/api/webhooks/github`.

### 2.3 Sinkronisasi Real-Time Kontributor GitHub (REST API Inbound)
Menggunakan `GitHubIntegrationService` untuk memanggil endpoint resmi `https://api.github.com/repos/{owner}/{repo}/contributors`.
Sistem secara otomatis:
1. Menarik akun GitHub pengembang nyata dan jumlah commit aslinya (contoh: `@denoyey` dengan 8 commits).
2. Membersihkan data dummy contoh awal (`andi_dev`, `budi99`, dll).
3. Menyimpan dan memperbarui data pengembang nyata ke dalam basis data MySQL.

---

## 3. Internal Task State Engine & GitHub Issues Integration

### 3.1 Spesifikasi Komunikasi & Manajemen Status
* **Penyimpanan:** Relasional MySQL2 (`tasks` table) dengan In-Memory Fallback.
* **Siklus Hidup Tugas:** `To Do` ➔ `In Progress` ➔ `Done`.
* **Latency:** < 10 milidetik (eksekusi kueri terindeks lokal).

### 3.2 Langkah Eksekusi Automasi Tugas
1. **Pencocokan Kode Tugas (`TaskRepository.findByCode`)**:
   Mencari record tugas berdasarkan kode yang diekstraksi dari pesan commit (contoh: `#TASK-02`).
2. **Transisi Status Tugas (`TaskRepository.updateStatusByCode`)**:
   Mengubah status tugas menjadi `Done` dan mencatat timestamp pembaruan di database.
3. **Penyematan Bukti Aktivitas (`ActivityLogRepository.createLog`)**:
   Mencatat jejak audit ke tabel `activity_logs`:
   ```text
   Event: TASK_UPDATED
   Author: @Patirparkerr
   Message: Commit [done #TASK-02] - Tugas berhasil diselesaikan
   ```

### 3.3 Sinkronisasi Opsional GitHub Issues API
Sistem mendukung sinkronisasi issue langsung dari repositori GitHub via endpoint `/api/v1/tasks/sync-github-issues`:
1. Menghubungi GitHub REST API (`GET /repos/{owner}/{repo}/issues`).
2. Mengonversi issue GitHub menjadi entitas tugas lokal (`#TASK-XX`).
3. Menyelaraskan status open/closed dengan status internal.

---

## 4. Outbound Pipeline: Discord Webhook Integration

### 4.1 Spesifikasi Komunikasi
* **Protokol:** HTTPS POST
* **Payload:** Discord Rich Embed Object (JSON)
* **Warna Aksen:** `#10b981` (Crisp Emerald Green)

### 4.2 Struktur Embed Discord
* **Title:** `✅ Tugas Selesai Otomatis! [SI-PATIR]`
* **Fields:**
  * `👤 Developer`: Username pengembang yang melakukan commit.
  * `📌 Rincian Tugas`: Kode tugas, judul tugas, dan transisi status (`In Progress ➔ Done`).
  * `💬 Pesan Commit`: Kutipan teks commit asli dari Git.
  * `🔗 Bukti Commit GitHub`: Tautan langsung yang dapat diklik ke halaman commit GitHub.
* **Footer & Timestamp:** Stempel waktu ISO 8601 dan identitas `SI-PATIR DevOps Lite Integration Engine`.

---

## 5. Internal Real-Time Gateway: Socket.io

Untuk memastikan Dashboard di browser web ter-update instan tanpa refresh:
1. Backend menginisialisasi `SocketServer` yang menempel pada HTTP Server.
2. Saat event commit diproses, controller memicu:
   ```typescript
   io.emit('activity_update', {
     type: 'TASK_COMPLETED',
     author: 'budi99',
     taskCode: 'TASK-02',
     taskTitle: 'Integrasi Halaman Login & Auth',
     commitMsg: 'Fix bug tombol login [done #TASK-02]',
     time: '20:45:10'
   });
   ```
3. Frontend yang terhubung via `socket.io-client` menerima event, memperbarui state lokal React, dan memicu notifikasi toast transparan di layar.

