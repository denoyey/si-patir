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
[ Inbound Event ]                           [ Outbound Task Sync ]                         [ Outbound Notification ]
        ▼                                             ▼                                              ▼
┌───────────────────────┐                   ┌───────────────────┐                          ┌───────────────────┐
│     SISTEM 1 (Git)    │                   │ SISTEM 2 (Kanban) │                          │ SISTEM 3 (Chat)   │
│   GitHub Webhook /    │                   │   Trello REST API │                          │  Discord Webhook  │
│   Local Git Hook      │                   │                   │                          │                   │
│                       │                   │ - Search Card     │                          │ - Rich Embed      │
│ - Push Event Payload  │                   │ - Shift to Done   │                          │ - Color Coding    │
│ - Author, Message, Url│                   │ - Attach Comment  │                          │ - Direct Git Link │
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

## 3. Outbound Pipeline 1: Trello REST API Integration

### 3.1 Spesifikasi Komunikasi
* **Protokol:** HTTPS REST API
* **Base URL:** `https://api.trello.com/1`
* **Autentikasi:** Parameter kueri `key` (API Key) dan `token` (Server Token).
* **Timeout Budget:** 5000 milidetik (mencegah *thread pool starvation* di backend).

### 3.2 Langkah Eksekusi Automasi Kartu
1. **Pencarian Kartu (`GET /boards/{boardId}/cards`)**:
   Mencari kartu yang judulnya memuat kode tugas, contoh: `c.name.includes("TASK-02")`.
2. **Pemindahan Kolom (`PUT /cards/{cardId}`)**:
   Mengirim parameter `idList = TRELLO_DONE_LIST_ID` untuk menggeser kartu ke kolom *Done*.
3. **Penyematan Komentar Bukti (`POST /cards/{cardId}/actions/comments`)**:
   Membuat komentar otomatis:
   ```text
   🤖 SI-PATIR Engine: Tugas otomatis ditutup via commit GitHub!
   Pesan: "Integrasi auth modul login [done #TASK-02]"
   Bukti: https://github.com/org/repo/commit/7a8b9c1
   ```

### 3.3 Graceful Degradation / Mock Mode
Jika kredensial Trello belum dikonfigurasi di file `.env`, `TrelloIntegrationService` secara otomatis beralih ke mode simulasi, mencetak status log simulasi, dan memperbarui database lokal tanpa menyebabkan *crash* pada server.

---

## 4. Outbound Pipeline 2: Discord Webhook Integration

### 4.1 Spesifikasi Komunikasi
* **Protokol:** HTTPS POST
* **Payload:** Discord Rich Embed Object (JSON)
* **Warna Aksen:** `#10b981` (Crisp Emerald Green)

### 4.2 Struktur Embed Discord
* **Title:** `✅ Tugas Selesai Otomatis! [SI-PATIR]`
* **Fields:**
  * `👤 Developer`: Username pengembang yang melakukan commit.
  * `📌 Tugas Trello`: Kode tugas, judul tugas, dan transisi status (`In Progress ➔ Done`).
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

