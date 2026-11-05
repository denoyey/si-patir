# PRD 03: Security Architecture & Threat Hardening
> **Module Code:** `SI-PATIR-PRD-03`  
> **Parent Document:** [`00-INDEX-AND-OVERVIEW.md`](file:///home/whoami/Documents/Projects/si-patir/docs/prd/00-INDEX-AND-OVERVIEW.md)  
> **Status:** `APPROVED` | **Subsystem:** Security & Compliance

---

## 1. Security Philosophy & Threat Modeling

SI-PATIR mengadopsi prinsip **Zero Trust Architecture** dan pertahanan berlapis (*Defense-in-Depth*). Mengacu pada metodologi analisis ancaman **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) dan panduan **OWASP Top 10 API Security Risks**.

---

## 2. Vektor Ancaman & Matriks Solusi Rekayasa

```
                  ┌───────────────────────────────────────────────┐
                  │          PERIMETER KEAMANAN SI-PATIR          │
                  └───────────────────────┬───────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│ ANTI-TIMING ATK  │            │ ANTI-INJECTION   │            │ ANTI-DOS / FLOOD │
│ crypto.timingSafe│            │ Prepared Query   │            │ 100kb Body Limit │
│ Equal (HMAC-256) │            │ Anti-ReDoS Regex │            │ RateLimiter (IP) │
└──────────────────┘            └──────────────────┘            └──────────────────┘
        │                                 │                                 │
        ▼                                 ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│ BROWSER SHIELD   │            │ SECRETS MASKING  │            │ ERROR SANITIZER  │
│ Helmet CSP, HSTS │            │ Isolasi di .env  │            │ Zero Stack Leak  │
│ X-Frame-Options  │            │ Masked di Logger │            │ Obfuscated Trace │
└──────────────────┘            └──────────────────┘            └──────────────────┘
```

---

## 3. Spesifikasi Rinci Pengamanan Teknis

### 3.1 Verifikasi Tanda Tangan Webhook (Anti-Timing Attack)
* **Ancaman**: Penyerang mengukur waktu respons server mikrodetik demi mikrodetik untuk menebak secret webhook karakter demi karakter (*Side-Channel Timing Attack*).
* **Solusi Teknis (`WebhookSecurityService.ts`)**:
  Perbandingan digest HMAC SHA-256 dilakukan secara waktu konstan menggunakan `crypto.timingSafeEqual`:
  ```typescript
  const sigBuffer = Buffer.from(signatureHeader, 'utf8');
  const compBuffer = Buffer.from(computedDigest, 'utf8');
  if (sigBuffer.length !== compBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, compBuffer);
  ```
  Komparasi standar JavaScript (`===`) dilarang keras pada modul ini karena menghentikan evaluasi pada karakter pertama yang berbeda (*early return leak*).

---

### 3.2 Proteksi SQL Injection (Tingkat Database)
* **Ancaman**: Injeksi payload SQL (`' OR '1'='1`) melalui author username atau commit message palsu.
* **Solusi Teknis (`repositories/*`)**:
  Seluruh manipulasi data menggunakan kueri berparameter:
  ```typescript
  await pool.query('SELECT * FROM tasks WHERE UPPER(task_code) = ? LIMIT 1', [cleanCode]);
  ```
  Driver MySQL2 memproses parameter sebagai nilai literal murni, sehingga karakter kutip, semicolon, atau statement SQL tidak dapat dieksekusi sebagai perintah.

---

### 3.3 Mitigasi Denial of Service (DoS) & Memory Exhaustion
* **Ancaman A: JSON Bomb / Payload Raksasa**: Penyerang mengirimkan payload JSON sebesar 50MB untuk menghabiskan memori RAM server (*Node.js heap out of memory*).
  * **Solusi**: Pembatasan muatan tubuh HTTP secara ketat pada `100kb`:
    ```typescript
    app.use(express.json({ limit: '100kb' }));
    ```
* **Ancaman B: Endpoint Flooding**: Penyerang membanjiri endpoint dengan ribuan request per detik.
  * **Solusi**: Pemasangan rate limiter bertingkat:
    * *General Limiter*: 120 request/menit untuk seluruh API.
    * *Webhook Limiter*: 30 request/menit per IP khusus endpoint `/api/webhooks/github`.

---

### 3.4 Proteksi ReDoS (Regular Expression Denial of Service)
* **Ancaman**: Pola Regex dengan percabangan bertumpuk (*catastrophic backtracking*) dapat mengunci thread CPU Node.js hingga 100% saat memproses string acak tertentu.
* **Solusi Teknis (`CommitParserService.ts`)**:
  * Input pesan commit dipotong maksimal 1000 karakter sebelum dievaluasi.
  * Pola regex dibatasi secara eksplisit dengan batas panjang karakter terdefinisi:
    ```typescript
    private readonly TASK_REGEX = /(?:\[done\s+#?([A-Za-z0-9_-]{2,20})\]|done\s+#?([A-Za-z0-9_-]{2,20}))/i;
    ```

---

### 3.5 Header Keamanan Browser (Helmet Integration)
Menggunakan paket **Helmet** untuk menginjeksi header standar pertahanan peramban:
* `Content-Security-Policy`: Menolak eksekusi skrip dari domain tidak tepercaya (anti-XSS).
* `X-Frame-Options: DENY`: Mencegah dashboard dimuat di dalam `<iframe>` situs berbahaya (*Anti-Clickjacking*).
* `X-Content-Type-Options: nosniff`: Mencegah peramban menebak tipe MIME selain yang dideklarasikan oleh server.
* `Strict-Transport-Security` (HSTS): Memaksa koneksi aman via HTTPS.

---

### 3.6 Pencegahan Kebocoran Informasi (Zero Stack Leak)
Middleware `SecurityMiddleware.globalErrorHandler` mencegat seluruh error internal. Dalam mode produksi, pesan error internal database dan *stack trace* tidak pernah dikirimkan ke respon HTTP publik, melainkan diganti dengan pesan status standar (*safe generic response*):
```json
{
  "success": false,
  "error": "Internal Server Error. Request safely handled.",
  "timestamp": "2026-11-05T22:20:00.000Z"
}
```

