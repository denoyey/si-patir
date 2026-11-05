# PRD 00: Master Index & Executive Product Overview
> **Project Name:** SI-PATIR (*Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori*)  
> **Classification:** DevOps Lite Integration & Team Activity Monitoring  
> **Target Audience:** Engineering Leads, Academic Evaluators, DevOps Developers, Collaborative Student Teams  
> **Document Status:** `APPROVED` | **Version:** `2.0.0`

---

## 1. Executive Summary & Vision

**SI-PATIR** adalah platform kontrol dan pemantau aktivitas tugas tim berbasis integrasi *DevOps Lite*. Sistem ini menghubungkan tiga ekosistem perangkat lunak eksternal yang heterogen (**GitHub**, **Trello**, dan **Discord**) ke dalam satu aplikasi dashboard monitoring berbasis **WebSocket Real-time** dan basis data **MySQL**.

### The Core Problem:
Dalam kolaborasi rekayasa perangkat lunak tim/kelompok, terdapat friksi koordinasi:
1. **Ketidaksinkronan Tugas**: Anggota sering lupa memperbarui status kartu di Trello setelah kode selesai di-push ke GitHub.
2. **Kurangnya Visibilitas Kontribusi**: Sulit memantau anggota tim mana yang aktif berkontribusi vs yang tidak aktif (*free-rider problem*).
3. **Keterlambatan Komunikasi**: Tim tidak mengetahui secara instan saat ada commit yang menyelesaikan tugas krusial tanpa memeriksa manual board tugas atau repo.

### The Solution:
SI-PATIR mengotomatisasi seluruh siklus hidup koordinasi tersebut:
* Cukup dengan menyertakan tag referensi tugas pada pesan commit (contoh: `git commit -m "Fix login [done #TASK-02]"`), sistem secara otomatis:
  1. Menangkap event push via Webhook.
  2. Menggeser kartu tugas bersangkutan di papan Trello dari kolom *In Progress* ke *Done* dan menyematkan link bukti commit.
  3. Mengirim notifikasi visual kaya (*Rich Embed*) ke kanal Discord tim.
  4. Memperbarui klasemen kontribusi (*Leaderboard*) dan log aktivitas secara real-time di Dashboard tanpa perlu refresh browser.

---

## 2. Master PRD Document Suite

Dokumentasi spesifikasi kebutuhan produk (PRD) SI-PATIR dipecah menjadi modul-modul terfokus agar mudah dikelola dan dimutakhirkan:

| Dokumen | Kode File | Fokus & Cakupan |
| :--- | :--- | :--- |
| **00. Overview & Index** | [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md) | Visi produk, persona, metrik keberhasilan, dan navigasi modul PRD. |
| **01. System Integration** | [`01-SYSTEM-INTEGRATION-PRD.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/01-SYSTEM-INTEGRATION-PRD.md) | Arsitektur integrasi GitHub Webhook, Trello REST API, Discord Webhook, & Socket.io. |
| **02. Database & Storage** | [`02-DATABASE-AND-STORAGE-PRD.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/02-DATABASE-AND-STORAGE-PRD.md) | Desain skema relasional MySQL, indeks performa, dan mekanisme *In-Memory Fallback*. |
| **03. Security & Hardening** | [`03-SECURITY-AND-HARDENING-PRD.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/03-SECURITY-AND-HARDENING-PRD.md) | Matriks pertahanan siber: Anti-Timing Attack, SQLi, ReDoS, DoS, Helmet, & Rate Limiting. |
| **04. Frontend UI/UX Spec** | [`04-FRONTEND-UI-UX-PRD.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/04-FRONTEND-UI-UX-PRD.md) | Standar desain rekayasa *Pure Human* (Anti-AI Slop), palet Zinc/Slate, & hierarki data. |
| **05. API & Webhook Contracts** | [`05-API-AND-WEBHOOK-CONTRACTS-PRD.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/05-API-AND-WEBHOOK-CONTRACTS-PRD.md) | Spesifikasi formal endpoint REST API, WebSocket event schema, & format payload. |
| **06. Operations & Demo Runbook** | [`06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/06-OPERATIONS-AND-DEMO-RUNBOOK-PRD.md) | Panduan eksekusi `start.sh` & `start.bat`, pembersih port, serta protokol demo 30 detik. |

---

## 3. Product Stakeholders & Personas

### Persona A: Lead Developer / Dosen Penguji (Evaluator)
* **Tujuan**: Memverifikasi bahwa mahasiswa membangun sistem terintegrasi yang nyata, aman, modular, dan memiliki arsitektur yang solid.
* **Kebutuhan**: Melihat transparansi aliran data antar sistem, verifikasi keamanan webhook, dan eksekusi demo instan yang mulus.

### Persona B: Anggota Tim Pengembang (Collaborator)
* **Tujuan**: Mengerjakan tugas kode harian tanpa beban administrasi manual.
* **Kebutuhan**: Cukup mengetik pesan commit standar Git, status tugas di Trello dan notifikasi Discord terotomatisasi secara instan.

### Persona C: Project Manager / Scrum Master
* **Tujuan**: Memantau kecepatan pengerjaan (*velocity*) dan kontribusi masing-masing anggota tim.
* **Kebutuhan**: Dashboard sentral dengan klasemen kontribusi (*Leaderboard*) dan daftar kartu tugas yang selalu sinkron.

---

## 4. Key Performance Indicators (KPIs) & Acceptance Criteria

1. **End-to-End Latency**: Waktu dari eksekusi commit hingga kartu Trello bergeser dan pesan Discord diterima adalah **< 2.5 detik**.
2. **Zero Port Collisions**: Skrip starter (`start.sh` / `start.bat`) harus 100% mematikan proses lama di port `5000` dan `3000` sebelum booting service baru.
3. **High Availability**: Backend harus tetap beroperasi penuh dengan *in-memory fallback* jika koneksi server MySQL lokal belum menyala atau mengalami *network hiccup*.
4. **Security Compliance**: Endpoint webhook harus menolak payload tidak sah dengan verifikasi biner konstan `crypto.timingSafeEqual` dan membatasi ukuran request maksimal `100kb`.
5. **Universal Device & iPhone Responsiveness**: Tampilan antarmuka wajib responsif 100% tanpa *layout breaking* di semua perangkat, mulai dari layar Ultrawide 4K hingga seluruh varian iPhone (termasuk penanganan *Dynamic Island*, *Notch*, dan *Home Indicator*).

---

## 5. Protokol Wajib Sinkronisasi PRD (Documentation-Code Sync Protocol)

> [!IMPORTANT]
> **ATURAN MUTLAK BAGI DEVELOPER & AI AGENTS:**
> **Setiap kali melakukan modifikasi kode, penambahan fitur, perubahan endpoint, atau refaktor arsitektur pada proyek SI-PATIR, DEVELOPER/AGENT WAJIB MEMPERBARUI DOKUMEN PRD TERKAIT PADA SAAT ITU JUGA.**
>
> * Tidak diperbolehkan membiarkan kode berubah tanpa memperbarui PRD spesifiknya (`01-SYSTEM-INTEGRATION-PRD.md`, `02-DATABASE-AND-STORAGE-PRD.md`, `03-SECURITY-AND-HARDENING-PRD.md`, `04-FRONTEND-UI-UX-PRD.md`, dll).
> * PRD adalah *Single Source of Truth* resmi yang harus selalu merefleksikan keadaan riil dari implementasi kode di lapangan.
> * **Protokol Git Auto-Push & Branching**: Setiap pembaruan kode yang berhasil diverifikasi wajib di-commit dengan standar *Conventional Commits v1.0.0* dan di-push otomatis ke **branch baru** (`feat/*`, `fix/*`, `docs/*`). **Dilarang keras push langsung ke branch `main`**.

