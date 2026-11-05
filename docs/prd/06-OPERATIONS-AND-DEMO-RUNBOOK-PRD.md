# PRD 06: Operations, Deployment & Demo Runbook
> **Module Code:** `SI-PATIR-PRD-06`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** DevOps Runbook

---

## 1. One-Click Automation Philosophy

Salah satu kegagalan umum presentasi tugas besar/skripsi adalah terjadinya **bentrok port (*Port Conflict*)** atau service lama yang belum dimatikan saat membuka terminal baru. 

SI-PATIR mengatasi hal ini dengan menyediakan file *starter script* tunggal yang memiliki fungsi **auto-detect dan auto-kill port** sebelum menyalakan server.

---

## 2. Prosedur Eksekusi Sistem

### 2.1 Di Linux / macOS
Gunakan skrip `start.sh`:
```bash
cd /home/whoami/Documents/Projects/si-patir
./start.sh
```

**Mekanisme Otomatis `start.sh`:**
1. Memeriksa apakah port `5000` (Backend) atau `3000` (Frontend) sedang diduduki proses lain menggunakan `lsof` atau `fuser`.
2. Jika ada, skrip langsung mematikan PID tersebut (`kill -9 $PID`) dan memberi umpan balik hijau.
3. Menyalakan Backend Server di latar belakang.
4. Menyalakan Frontend Vite Dashboard.
5. Memasang *trap handler*: Begitu Anda menekan `Ctrl + C`, kedua server otomatis dimatikan dan kedua port dijamin kembali bersih (*completely free*).

---

### 2.2 Di Windows
Cukup klik ganda (double-click):
```cmd
start.bat
```

**Mekanisme Otomatis `start.bat`:**
1. Menjalankan `netstat -aon` untuk mendeteksi listener pada port `5000` dan `3000`.
2. Menjalankan `taskkill /F /PID %a` untuk mematikan proses lama.
3. Membuka jendela Backend dan Frontend secara independen.
4. Otomatis meluncurkan peramban bawaan ke alamat `http://localhost:3000`.

---

## 3. Protokol Demonstrasi ke Dosen (Skenario 30 Detik)

Saat giliran Anda presentasi di depan dosen atau penguji, ikuti skenario 30 detik berikut untuk mendemonstrasikan keunggulan integrasi 3 sistem secara instan:

### Langkah 1: Tampilkan Kondisi Awal (10 Detik)
1. Buka Dashboard SI-PATIR di browser (`http://localhost:3000`).
2. Tunjukkan ke dosen:
   * Lampu indikator: `GitHub: Ready 🟢`, `Trello: Synced 🟢`, `Discord: Active 🟢`.
   * Pada tabel tugas, tunjukkan kartu **`[#TASK-02] Integrasi Halaman Login`** masih berstatus **`In Progress`**.
   * Buka tab Trello di browser sampingnya dan tunjukkan kartu `#TASK-02` masih ada di kolom *In Progress*.

### Langkah 2: Lakukan Pemicu Automasi (10 Detik)
Pilih salah satu dari 2 opsi pemicu:
* **Opsi A (Paling Cepat)**: Klik tombol putih di header dashboard:  
  **`⚡ Test Commit [done #TASK-02]`**
* **Opsi B (Paling Keren di Terminal)**: Di terminal repo Git, ketik:  
  ```bash
  git commit -m "Selesai modul login auth [done #TASK-02]"
  ```

### Langkah 3: Tunjukkan Bukti Tiga Sistem Berespons (10 Detik)
1. **Layar Dashboard Web**:
   * Status `#TASK-02` langsung berubah menjadi badge hijau **`Done`**.
   * Di panel kanan *Live Webhook Stream*, muncul log baru: `Trello card #TASK-02 shifted to Done & Discord notified`.
   * Poin commit developer bersangkutan di tabel klasemen langsung bertambah otomatis.
2. **Layar Trello**:
   * Kartu `#TASK-02` otomatis loncat sendiri ke kolom **`Done`** dan terdapat komentar link bukti commit.
3. **Layar Discord**:
   * Kanal Discord grup berbunyi notifikasi, menampilkan pesan embed hijau rapi dari *SI-PATIR Bot*.

---

## 4. Panduan Troubleshooting Cepat

| Kendala | Penyebab Umum | Solusi Cepat |
| :--- | :--- | :--- |
| **MySQL: Memory Fallback 🟡** | Service MySQL lokal belum dinyalakan atau password salah | Cek service MySQL (`sudo service mysql start`) dan pastikan password di `backend/.env` sesuai. Sistem tetap berjalan normal dengan memory fallback. |
| **Discord Tidak Menerima Notifikasi** | URL Webhook di `.env` masih kosong | Buka Discord -> Channel Settings -> Integrations -> Webhooks -> Buat Webhook baru dan tempel URL-nya di `backend/.env`. |
| **Trello Tidak Bergeser** | Kredensial Trello belum diisi | Ambil API Key & Token di [trello.com/app-key](https://trello.com/app-key), isi Board ID & Done List ID di `backend/.env`. Jika kosong, sistem otomatis masuk ke mode simulasi sukses. |

---

## 5. Alur Kerja Git Otomatis & Standar Percabangan (DevOps Git Best Practices)

Setiap agen pengembang atau developer di proyek SI-PATIR wajib mengikuti alur kerja *Git Feature Branch Workflow* dan *Conventional Commits*:

### 5.1 Larangan Push Langsung ke Branch `main`
* Branch `main` adalah branch produksi terproteksi (*protected branch*).
* Segala bentuk commit langsung (`direct commit / push`) ke `main` dilarang keras. Semua perubahan wajib melalui branch terisolasi (*Feature Branch*).

### 5.2 Standar Konvensi Nama Branch
* **Format**: `<tipe>/<nama-singkat-fitur-atau-isu>`
* **Daftar Prefix Resmi**:
  * `feat/*` : Penambahan fungsionalitas baru (misal: `feat/realtime-socket-filter`).
  * `fix/*` : Perbaikan bug / insiden (misal: `fix/trello-token-fallback`).
  * `refactor/*` : Pembersihan dan restrukturisasi kode (misal: `refactor/repository-oop`).
  * `docs/*` : Pembaruan dokumentasi PRD / panduan (misal: `docs/update-git-workflow-prd`).
  * `chore/*` : Pembaruan skrip otomasi & perkakas (misal: `chore/port-killer-scripts`).

### 5.3 Standar Pesan Commit (Conventional Commits v1.0.0)
Format penulisan pesan commit wajib terstruktur dan bermakna:
```text
<type>(<scope>): <deskripsi singkat imperative>

[optional body: penjelasan latar belakang masalah dan solusi teknis]

[optional footer: referensi tugas, e.g., Resolves #TASK-02]
```
* **Contoh Pesan Commit Berkualitas Tinggi**:
  * `feat(ui): refine dashboard layout and enforce rounded-md/lg design tokens`
  * `fix(security): implement constant-time buffer comparison against timing attacks`
  * `refactor(database): decouple database pool into singleton DatabaseService`
  * `docs(prd): add autonomous git workflow and conventional branching protocol`

### 5.4 Pre-Push Quality Gate (Verifikasi Otomatis)
Sebelum branch di-push ke remote GitHub, gerbang verifikasi berikut harus lolos tanpa error:
```bash
# 1. Typecheck Backend
cd backend && npx tsc --noEmit
# 2. Build Production Frontend
cd ../frontend && npm run build
```
Jika kedua pengujian menghasilkan status lolos (`exit code 0`), branch baru di-push ke GitHub:
```bash
git checkout -b feat/nama-fitur-baru
git add .
git commit -m "feat(scope): deskripsi bermakna"
git push -u origin feat/nama-fitur-baru
```

