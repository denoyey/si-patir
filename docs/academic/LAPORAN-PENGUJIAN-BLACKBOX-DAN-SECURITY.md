# 🛡️ LAPORAN PENGUJIAN BLACKBOX TESTING & AUDIT KEAMANAN (SECURITY & LOAD TESTING)
> **Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (SI-PATIR)**  
> **Dokumen QA Resmi Versi:** `2.0.0-ENTERPRISE` | **Standar:** `OWASP API Security Top 10` & `ISO/IEC/IEEE 29119`  
> **Penanggung Jawab / QA Engineer:** **Fajri (`@AATTTRAWRRR`)**  
> **Tanggal Pelaksanaan:** 16 November 2026 | **Status Hasil:** `PASSED (100% VALID)`

---

## 1. Pendahuluan & Ruang Lingkup Pengujian

Laporan ini disusun oleh **Fajri (`@AATTTRAWRRR`)** selaku *Quality Assurance (QA) & Security Specialist* tim SI-PATIR untuk mendokumentasikan hasil pengujian sistem secara komprehensif, mencakup pengujian fungsionalitas (*Functional Blackbox Testing*) dan pengujian ketahanan keamanan siber serta beban (*Security & Load Testing*).

### 1.1 Metodologi Pengujian
1. **Black Box Testing**: Menguji fungsionalitas antarmuka dan endpoint tanpa memanipulasi struktur kode internal. Menggunakan teknik *Equivalence Partitioning* dan *Boundary Value Analysis*.
2. **Automated Unit & Integration Testing**: Pengujian otomatis menggunakan framework **Vitest** pada direktori `backend/tests/`.
3. **Penetration & Stress Testing**: Simulasi serangan injeksi (SQLi, XSS, CRLF, Timing Attack), serangan *Denial of Service* (JSON-Bomb Payload >100KB, Catastrophic Regex Backtracking / ReDoS), dan pengujian batas *Rate Limiter* (35 request beruntun dalam 1 menit).

---

## 2. Tabel Matriks Pengujian Fungsionalitas (Functional Blackbox Testing)

| No | ID Kasus | Modul / Fitur | Masukan Uji (*Test Input*) | Hasil yang Diharapkan (*Expected Output*) | Hasil Aktual (*Actual Output*) | Status |
|:--:|:---------|:--------------|:---------------------------|:------------------------------------------|:-------------------------------|:------:|
| **1** | `BB-FUNC-01` | Commit Parser | String: `Implementasi DB [done #TASK-01]` | Kode tugas `TASK-01` terekstrak dengan benar. | Output string: `"TASK-01"`. | **VALID** ✅ |
| **2** | `BB-FUNC-02` | Commit Parser | String: `done #TASK-02 selesaikan modul auth` | Kode tugas `TASK-02` terekstrak tanpa tanda kurung siku. | Output string: `"TASK-02"`. | **VALID** ✅ |
| **3** | `BB-FUNC-03` | Commit Parser | Variasi Casing: `closes #task-05-auth` | Normalisasi otomatis ke format huruf kapital (*UPPERCASE*). | Output string: `"TASK-05-AUTH"`. | **VALID** ✅ |
| **4** | `BB-FUNC-04` | Commit Parser | String tanpa hashtag: `[done TASK-03]` | Berhasil mendeteksi kode `TASK-03` tanpa `#`. | Output string: `"TASK-03"`. | **VALID** ✅ |
| **5** | `BB-FUNC-05` | Commit Parser | Pesan reguler: `chore: update dependencies` | Mengembalikan nilai `null` (tidak memicu pergeseran kartu tugas). | Output: `null`. | **VALID** ✅ |
| **6** | `BB-FUNC-06` | Commit Parser | Masukan kosong / `null` / `undefined` | Mengembalikan nilai `null` tanpa memicu *server exception/crash*. | Output: `null`. | **VALID** ✅ |
| **7** | `BB-FUNC-07` | Task State Engine | Transisi Status: `To Do` ➔ `In Progress` | Status tugas pada repositori/database berubah menjadi `In Progress`. | Kolom status bernilai `"In Progress"`. | **VALID** ✅ |
| **8** | `BB-FUNC-08` | Task State Engine | Transisi Status: `In Progress` ➔ `Done` | Status tugas berubah menjadi `Done` dan timestamp diperbarui. | Kolom status bernilai `"Done"`. | **VALID** ✅ |
| **9** | `BB-FUNC-09` | Task State Engine | Idempotensi: `Done` ➔ `Done` | Sistem tetap mengembalikan status sukses tanpa merusak data (*safe idempotency*). | Operasi berhasil, status tetap `"Done"`. | **VALID** ✅ |
| **10** | `BB-FUNC-10` | Task State Engine | Update tugas dengan kode tidak terdaftar (`TASK-GHAIB-404`) | Sistem mengembalikan nilai `false` dan tidak melakukan mutasi data. | Return `false`, record database tidak berubah. | **VALID** ✅ |

---

## 3. Tabel Matriks Pengujian Keamanan & Ketahanan Beban (Security & Load Testing)

Pengujian di bawah ini dieksekusi secara otomatis melalui berkas pengujian `backend/tests/SecurityLoadTest.test.ts` dan `backend/tests/WebhookSecurityService.test.ts`.

| No | ID Kasus | Kategori Ancaman | Masukan Uji (*Malicious / Heavy Input*) | Hasil yang Diharapkan (*Security Barrier*) | Hasil Aktual (*Actual Response*) | Status |
|:--:|:---------|:-----------------|:---------------------------------------|:-------------------------------------------|:---------------------------------|:------:|
| **1** | `SEC-RATE-01` | **Flooding / DoS (Rate Limit)** | Mengirimkan 30 request berturut-turut ke `/api/v1/webhooks/github` dalam 1 menit | Seluruh 30 request pertama diterima dan diproses sesuai kuota normal. | HTTP Status `200 OK` / diproses. | **VALID** ✅ |
| **2** | `SEC-RATE-02` | **Flooding / DoS (Rate Limit)** | Mengirimkan request ke-31 hingga ke-35 ke `/api/v1/webhooks/github` pada menit yang sama | Sistem mencegat request berlebih dan mengembalikan HTTP `429 Too Many Requests`. | HTTP Status `429`, pesan: `"Webhook rate limit exceeded."`. | **VALID** ✅ |
| **3** | `SEC-BODY-01` | **JSON-Bomb / Memory Exhaustion** | Mengirimkan payload JSON berukuran raksasa **~125 KB** (melebihi limit 100 KB) | Express `body-parser` menolak muatan sebelum dialokasikan ke memori. | HTTP Status `413 Payload Too Large`. | **VALID** ✅ |
| **4** | `SEC-BODY-02` | **Normal Payload Integrity** | Mengirimkan payload JSON berukuran normal (~1.5 KB) | Diterima dan diproses tanpa kendala ukuran muatan. | HTTP Status `200` / `201 Created` (Bukan 413). | **VALID** ✅ |
| **5** | `SEC-SQLI-01` | **SQL Injection (Tautologi)** | Parameter input: `' OR '1'='1` pada pencarian tugas | Parameterized query (`?`) mengisolasi input sebagai string literal, data tabel tidak bocor. | Output: `null`, tidak ada rekaman tak berhak yang muncul. | **VALID** ✅ |
| **6** | `SEC-SQLI-02` | **SQL Injection (Destruktif)** | Parameter input: `'; DROP TABLE tasks; --` | Injeksi multi-statement ditolak, tabel `tasks` tetap utuh dan beroperasi normal. | Output: `null`, seluruh data tugas tetap aman. | **VALID** ✅ |
| **7** | `SEC-SQLI-03` | **SQL Injection (Data Leak)** | Parameter input: `' UNION SELECT id, name, ... FROM members --` | Injeksi penggabungan tabel ditolak, kredensial anggota tidak bocor. | Output: `null`. | **VALID** ✅ |
| **8** | `SEC-XSS-01` | **Cross-Site Scripting (XSS)** | Pesan commit: `Fix login <script>alert("pwned")</script> [done #TASK-02]` | Tag `<script>` dieliminasi total dari string pesan sebelum disimpan ke DB. | Output: `"Fix login alert(\"pwned\") [done #TASK-02]"`. | **VALID** ✅ |
| **9** | `SEC-XSS-02` | **Cross-Site Scripting (XSS)** | Pesan commit: `Selesai <img src=x onerror=alert(1)> [done #TASK-03]` | Atribut berbahaya (`<img`, `onerror`) dibersihkan total. | Output: `"Selesai [done #TASK-03]"`. | **VALID** ✅ |
| **10** | `SEC-HMAC-01` | **Side-Channel Timing Attack** | Verifikasi tanda tangan GitHub Webhook palsu (*Spoofed Signature*) | Menggunakan `crypto.timingSafeEqual` pada buffer biner dengan waktu evaluasi konstan. | Verifikasi mengembalikan `false`, request palsu ditolak. | **VALID** ✅ |
| **11** | `SEC-REDOS-01` | **ReDoS (RegEx Denial of Service)** | String pola repetisi ekstrem 1000 karakter: `'done ' + '#'.repeat(500) + 'a'.repeat(2000)` | Pembatasan panjang input (`slice(0, 1000)`) mencegah *catastrophic backtracking*. | Evaluasi regex selesai dalam waktu **< 10 ms** tanpa membekukan event loop Node.js. | **VALID** ✅ |
| **12** | `SEC-CRLF-01` | **CRLF / Log Injection** | Input header/author memuat karakter injeksi baris: `Admin\r\n[CRITICAL] Server Breached!\t` | Karakter `\r`, `\n`, dan `\t` dinetralkan menjadi spasi tunggal. | Output: `"Admin  [CRITICAL] Server Breached! "`. | **VALID** ✅ |

---

## 4. Bukti Eksekusi Suite Pengujian Otomatis (Test Execution Proof)

Hasil tangkapan eksekusi pengujian otomatis pada terminal lokal:

```text
> si-patir-backend@1.0.0 test
> vitest run

 RUN  v5.1.0 C:/Users/Fajri/Downloads/si-patir/backend

 ✓ tests/CommitParserService.test.ts (13 tests) 7ms
 ✓ tests/WebhookSecurityService.test.ts (9 tests) 9ms
 ✓ tests/TaskStatusFlow.test.ts (6 tests) 8ms
 ✓ tests/SecurityLoadTest.test.ts (9 tests) 174ms

 Test Files  4 passed (4)
      Tests  37 passed (37)
   Start at  20:37:34
   Duration  1.00s (import 69%, tests 18%, transform 10%, worker 3%)
```

---

## 5. Ringkasan Statistik Evaluasi Mutu & Kesimpulan QA

* **Total Skenario Uji Blackbox & Security**: **22 Skenario Pengujian**
  - Fungsionalitas Aplikasi: 10 Kasus Uji (Tingkat Keberhasilan: **100%**)
  - Keamanan & Ketahanan Beban: 12 Kasus Uji (Tingkat Keberhasilan: **100%**)
* **Total Automated Unit & Load Tests**: **37 Tests** (Lulus: **37**, Gagal: **0**)
* **Kecepatan Rata-rata Eksekusi**: **1.00 detik** untuk 37 pengujian menyeluruh.

### Kesimpulan Akhir Quality Assurance:
Sistem **SI-PATIR (DevOps Lite)** telah melalui audit ketat penjaminan mutu dan dinyatakan **SANGAT LAYAK (PRODUCTION-GRADE)**. Seluruh pertahanan keamanan berlapis (*Defense-in-Depth*) terbukti efektif menolak serangan Denial of Service (DoS), SQL Injection, XSS, Timing Attack, dan ReDoS sesuai standar **OWASP API Security Top 10**.

---
*Dokumen ini disusun dan divalidasi secara resmi oleh **Fajri (`@AATTTRAWRRR`)** untuk pemenuhan Bab 4 Laporan Tugas Besar / Skripsi Sistem SI-PATIR.*
