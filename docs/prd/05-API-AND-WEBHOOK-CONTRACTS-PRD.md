# PRD 05: REST API & Webhook Technical Contracts
> **Module Code:** `SI-PATIR-PRD-05`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Interface Contracts

---

## 1. General Specifications
* **Base URL:** `http://localhost:5000/api`
* **Transport:** HTTP/1.1 (JSON Over REST) & WebSocket (Socket.io)
* **Default Content-Type:** `application/json; charset=utf-8`
* **Rate Limits:** 120 req/menit (Global), 30 req/menit (Webhook)

---

## 2. REST Endpoints Specification

### 2.1 Inbound GitHub Webhook
Menangkap event push dari GitHub atau Local Git Hook.

* **Method:** `POST`
* **Path:** `/webhooks/github`
* **Headers:**
  * `Content-Type: application/json`
  * `X-Hub-Signature-256: sha256=<hmac_hex_digest>` *(Opsional pada mode dev)*
* **Request Body Schema:**
  ```json
  {
    "commits": [
      {
        "id": "7a8b9c1d",
        "message": "Selesai modul login auth [done #TASK-02]",
        "author": {
          "name": "Budi Santoso",
          "username": "budi99"
        },
        "url": "https://github.com/kelompok-devops/si-patir-core/commit/7a8b9c1d"
      }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Webhook processed securely",
    "processedCount": 1
  }
  ```
* **Error Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "error": "Unauthorized: Invalid signature"
  }
  ```

---

### 2.2 Instant Commit Simulator
Memicu automasi tugas secara instan tanpa perlu git push fisik (sangat berguna untuk demo cepat).

* **Method:** `POST`
* **Path:** `/simulate-commit`
* **Request Body:**
  ```json
  {
    "developer": "budi99",
    "message": "Fix bug tombol login [done #TASK-02]"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "taskCode": "TASK-02",
    "message": "Simulated commit executed safely"
  }
  ```

---

### 2.3 Daftar Tugas Proyek
Mengambil semua daftar tugas lokal/cache Trello.

* **Method:** `GET`
* **Path:** `/tasks`
* **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "task_code": "TASK-01",
      "title": "Buat Database & Skema User",
      "status": "Done",
      "assignee": "denoyey",
      "updated_at": "2026-11-06T07:29:02.000Z"
    },
    {
      "id": 2,
      "task_code": "TASK-02",
      "title": "Integrasi Halaman Login & Auth",
      "status": "Done",
      "assignee": "denoyey",
      "updated_at": "2026-11-06T07:29:02.000Z"
    }
  ]
  ```

---

### 2.4 Sinkronisasi Manual Trello
Menarik pembaruan kartu langsung dari board Trello publik/privat ke database lokal.

* **Method:** `POST`
* **Path:** `/tasks/sync` (atau `/api/v1/tasks/sync-trello`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Berhasil sinkronisasi 5 kartu dari Trello",
    "count": 5
  }
  ```

---

### 2.4.1 Mutasi & Edit Kartu Tugas
Memperbarui judul tugas, developer penanggung jawab (*assignee*), serta status siklus kerja (*To Do*, *In Progress*, *Done*).

* **Method:** `PUT` / `PATCH`
* **Path:** `/api/v1/tasks/:id` (atau `/api/tasks/:id`)
* **Request Body:**
  ```json
  {
    "title": "Implementasi Autentikasi JWT & Guard",
    "assignee": "muhamadrafli16",
    "status": "Done"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tugas TASK-02 berhasil diperbarui.",
    "task": {
      "id": 2,
      "task_code": "TASK-02",
      "title": "Implementasi Autentikasi JWT & Guard",
      "assignee": "muhamadrafli16",
      "status": "Done"
    }
  }
  ```

---

### 2.5 Klasemen Kontributor Anggota
Menampilkan urutan kontribusi anggota tim terurut berdasarkan commit terbanyak.

* **Method:** `GET`
* **Path:** `/members`
* **Success Response (200 OK):**
  ```json
  [
    {
      "id": 5,
      "name": "denoyey",
      "github_username": "denoyey",
      "total_commits": 8,
      "tasks_done": 1
    }
  ]
  ```

---

### 2.6 Sinkronisasi Kontributor Nyata dari GitHub
Menarik data kontributor dan jumlah commit asli dari repositori GitHub.

* **Method:** `POST`
* **Path:** `/members/sync-github`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Berhasil menyinkronkan 1 kontributor asli dari GitHub.",
    "members": [...]
  }
  ```

---

### 2.7 Tambah Tugas & Anggota Nyata
* `POST /tasks`: Mendaftarkan kartu tugas baru (`taskCode`, `title`, `assignee`, `status`).
* `DELETE /tasks/:id`: Menghapus tugas dari sistem.
* `POST /members`: Mendaftarkan anggota kelompok nyata (`name`, `username`).
* `POST /members/clear-dummy`: Menghapus data contoh bawaan sistem.

---

### 2.8 Status Kesehatan Sistem
Menampilkan status kesiapan koneksi seluruh subsistem.

* **Method:** `GET`
* **Path:** `/status`
* **Success Response (200 OK):**
  ```json
  {
    "mysql": true,
    "trello": true,
    "discord": true,
    "github": true,
    "uptime": 1420.55,
    "timestamp": "2026-11-05T22:20:00.000Z"
  }
  ```

---

## 3. WebSocket Real-Time Event Contracts

SI-PATIR menggunakan **Socket.io** untuk memancarkan event ke semua klien yang terhubung.

### Event Name: `activity_update`

#### Payload Tipe A: `TASK_COMPLETED`
Dipancarkan saat pesan commit memuat kode penyelesaian tugas (`[done #TASK-XX]`):
```json
{
  "type": "TASK_COMPLETED",
  "author": "denoyey",
  "taskCode": "TASK-02",
  "taskTitle": "Integrasi Halaman Login & Auth",
  "commitMsg": "Fix bug tombol login [done #TASK-02]",
  "commitUrl": "https://github.com/denoyey/si-patir/commit/7a8b9c1",
  "time": "20:45:10"
}
```

#### Payload Tipe B: `COMMIT_PUSHED`
Dipancarkan saat ada commit biasa tanpa penyelesaian tugas:
```json
{
  "type": "COMMIT_PUSHED",
  "author": "denoyey",
  "commitMsg": "Refactor styling button",
  "commitUrl": "https://github.com/denoyey/si-patir/commit/8b9c1d2",
  "time": "20:46:22"
}
```

