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

