# PRD 02: Database & Data Storage Specification
> **Module Code:** `SI-PATIR-PRD-02`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Data Layer

---

## 1. Storage Philosophy & Dual-Tier Architecture

SI-PATIR menggunakan arsitektur penyimpanan bertingkat ganda (*Dual-Tier Storage Architecture*):

1. **Primary Tier (Production MySQL Pool)**:
   * Menggunakan engine `InnoDB` dengan charset `utf8mb4` untuk mendukung karakter internasional dan simbol emoji commit.
   * Dikelola melalui koneksi terpusat `mysql2/promise` dengan pooling otomatis (`connectionLimit: 10`).
   * Menjamin integritas transaksional, indexing cepat, dan persistensi permanen.
2. **Resilience Tier (Active In-Memory Fallback)**:
   * Jika server MySQL lokal pengguna belum aktif atau kredensial password salah pada saat startup, `DatabaseService` secara otomatis mengaktifkan *In-Memory Array State*.
   * Sistem tetap berjalan 100% tanpa melempar *fatal crash*, sehingga presentasi atau pengujian lokal tidak pernah terganggu.

---

## 2. Entity-Relationship Model (ERD) & Table Definitions

```
┌─────────────────────────┐               ┌─────────────────────────┐
│         members         │               │          tasks          │
├─────────────────────────┤               ├─────────────────────────┤
│ id (PK)                 │               │ id (PK)                 │
│ name                    │       ┌───────┤ task_code (UNIQUE)      │
│ github_username (UNIQUE)│       │       │ title                   │
│ total_commits           │       │       │ status (ENUM)           │
│ tasks_done              │       │       │ trello_card_id          │
│ updated_at              │       │       │ assignee                │
└─────────────────────────┘       │       │ updated_at              │
                                  │       └─────────────────────────┘
                                  │
                                  │       ┌─────────────────────────┐
                                  │       │      activity_logs      │
                                  │       ├─────────────────────────┤
                                  │       │ id (PK)                 │
                                  │       │ event_type              │
                                  └───────┤ task_code (FK-like)     │
                                          │ author                  │
                                          │ commit_message          │
                                          │ status                  │
                                          │ created_at              │
                                          └─────────────────────────┘
```

---

## 3. Skema Rinci Tabel Basis Data

### 3.1 Tabel `members` (Statistik Anggota Tim)
Menyimpan profil anggota tim pengembang dan akumulasi metrik kontribusi kode.

```sql
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  github_username VARCHAR(100) NOT NULL UNIQUE,
  total_commits INT DEFAULT 0,
  tasks_done INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_commits (total_commits DESC),
  INDEX idx_username (github_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

* **Indeks `idx_commits`**: Mengoptimalkan query pengurutan papan klasemen kontribusi (*Leaderboard*) sehingga bernilai `O(log N)`.
* **Indeks `idx_username`**: Mempercepat pencarian saat terjadi *upsert* data push commit.

---

### 3.2 Tabel `tasks` (Daftar & Status Tugas Proyek)
Menyimpan pemetaan kartu tugas Trello ke dalam sistem lokal.

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
  trello_card_id VARCHAR(100),
  assignee VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_code (task_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

* **Kolom `task_code`**: Kode unik pengenal tugas (contoh: `TASK-01`, `TASK-02`). Wajib berstatus `UNIQUE`.
* **Kolom `status`**: Tipe `ENUM` untuk menjamin integritas data (mencegah nilai status acak di luar alur kerja).

---

### 3.3 Tabel `activity_logs` (Audit Trail & Stream Aktivitas)
Menyimpan riwayat kronologis seluruh webhook dan aksi automasi yang dieksekusi oleh sistem.

```sql
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  author VARCHAR(100) NOT NULL,
  commit_message TEXT NOT NULL,
  task_code VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

* **Indeks `idx_created`**: Mendukung pembacaan *feed* log terbaru secara cepat (`ORDER BY id DESC LIMIT 50`).

---

## 4. Pola Akses Data & Parameterized Queries

Semua operasi query dienkapsulasi di dalam kelas repositori (`MemberRepository`, `TaskRepository`, `ActivityLogRepository`):
* **Nol String Concatenation**: Tidak ada penyusunan query string dengan penggabungan tanda kutip (`"SELECT ... '" + input + "'"`).
* **Prepared Statements**: Menggunakan placeholder `?` dari driver `mysql2/promise` yang di-*escape* pada level biner oleh server database, memberikan proteksi mutlak terhadap serangan SQL Injection tingkat lanjut.

---

## 5. Sinkronisasi Data Nyata & Auto-Migration

Pada saat inisialisasi pertama kali (`DatabaseService.initialize()`), sistem menerapkan arsitektur data riil:
* **Kontributor Nyata**: Mengambil data kontributor riil langsung dari repositori GitHub yang dikonfigurasi (`denoyey/si-patir`) via GitHub REST API (`GitHubIntegrationService.syncRealContributors()`). Anggota dummy lama secara otomatis dibersihkan (`clearDummyMembers()`) sehingga hanya kontributor nyata (`denoyey` dkk) yang tersimpan di database.
* **Tugas Nyata**: Mengelola daftar tugas riil (`#TASK-01` s/d `#TASK-05`) yang dialokasikan ke developer riil, dan mendukung penambahan anggota/tugas baru secara dinamis melalui antarmuka web.
* **In-Memory Fallback Persistence**: Menyediakan data fallback yang diselaraskan dengan identitas kontributor aktif (`denoyey`) jika MySQL berada dalam mode simulasi sementara.

