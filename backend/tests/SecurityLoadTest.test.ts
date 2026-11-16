import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Application } from '../src/Application.js';
import { TaskRepository } from '../src/database/repositories/TaskRepository.js';
import { CommitParserService } from '../src/services/CommitParserService.js';
import { Server as HttpServer } from 'http';

describe('Security & Load Testing Suite (OWASP Hardening)', () => {
  let appInstance: Application;
  let server: HttpServer;
  let baseUrl: string;

  beforeAll(async () => {
    appInstance = new Application();
    server = appInstance.getServer();

    // Jalankan server pada port acak yang dialokasikan sistem operasi
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr: any = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('1. Webhook Rate Limiter (Max 30 req/min)', () => {
    it('harus membatasi request ke-31 hingga ke-35 dengan status HTTP 429 Too Many Requests', async () => {
      const results: { index: number; status: number; data?: any }[] = [];

      // Lakukan 35 request berturut-turut ke endpoint webhook
      for (let i = 1; i <= 35; i++) {
        const res = await fetch(`${baseUrl}/api/v1/webhooks/github`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repository: { full_name: 'denoyey/si-patir' },
            commits: [{ id: `load-test-${i}`, message: 'chore: audit load test' }],
          }),
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
          // Abaikan jika non-json
        }

        results.push({ index: i, status: res.status, data });
      }

      // Validasi 30 request pertama: tidak boleh 429 (harus diproses, status 200)
      const allowedRequests = results.slice(0, 30);
      for (const req of allowedRequests) {
        expect(req.status).not.toBe(429);
      }

      // Validasi request ke-31 hingga ke-35: WAJIB diblokir dengan HTTP 429
      const blockedRequests = results.slice(30);
      expect(blockedRequests.length).toBe(5);

      for (const blocked of blockedRequests) {
        expect(blocked.status).toBe(429);
        expect(blocked.data).toBeDefined();
        expect(blocked.data.success).toBe(false);
        expect(blocked.data.error).toMatch(/rate limit exceeded/i);
      }
    });
  });

  describe('2. Anti-DoS Payload Size Limit (Max 100KB)', () => {
    it('harus menolak muatan raksasa (>100KB) dengan status HTTP 413 Payload Too Large', async () => {
      // Buat muatan data sebesar ~125KB (melebihi batas aman 100KB)
      const oversizedPayload = {
        title: 'Beban Uji DoS',
        task_code: 'TASK-OVERSIZE',
        padding: 'A'.repeat(125 * 1024),
      };

      const res = await fetch(`${baseUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oversizedPayload),
      });

      // Express body-parser harus mencegat dan mengembalikan 413
      expect(res.status).toBe(413);
    });

    it('harus mengizinkan muatan normal (<100KB) diproses dengan baik', async () => {
      const normalPayload = {
        title: 'Tugas Normal Keamanan',
        task_code: 'TASK-NORMAL-SEC',
        assignee: 'AATTTRAWRRR',
      };

      const res = await fetch(`${baseUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalPayload),
      });

      // Status 201 Created atau 200 OK (bukan 413)
      expect(res.status).not.toBe(413);
    });
  });

  describe('3. SQL Injection Defense (Prepared Statements Sanitization)', () => {
    const taskRepo = new TaskRepository();

    it('harus menolak injeksi tautologi Boolean: \' OR \'1\'=\'1', async () => {
      const maliciousCode = "' OR '1'='1";
      const result = await taskRepo.findByCode(maliciousCode);

      // Kueri terisolasi dengan tanda tanya (?) sehingga diperlakukan sebagai literal string
      expect(result).toBeNull();
    });

    it('harus menolak injeksi multi-query destruktif: \'; DROP TABLE tasks; --', async () => {
      const maliciousDrop = "'; DROP TABLE tasks; --";
      const result = await taskRepo.findByCode(maliciousDrop);

      expect(result).toBeNull();

      // Pastikan tabel / data tetap utuh dan fungsi normal masih berjalan
      const allTasks = await taskRepo.findAll();
      expect(Array.isArray(allTasks)).toBe(true);
      expect(allTasks.length).toBeGreaterThan(0);
    });

    it('harus menolak injeksi UNION SELECT untuk kebocoran data anggota', async () => {
      const maliciousUnion = "' UNION SELECT id, name, github_username, total_commits, tasks_done, updated_at FROM members --";
      const result = await taskRepo.findByCode(maliciousUnion);

      expect(result).toBeNull();
    });
  });

  describe('4. Cross-Site Scripting (XSS) Sanitization', () => {
    const parser = new CommitParserService();

    it('harus membersihkan tag script jahat: <script>alert("pwned")</script>', () => {
      const maliciousMsg = 'Update fitur login <script>alert("pwned")</script> [done #TASK-02]';
      const clean = parser.sanitizeCommitMessage(maliciousMsg);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('</script>');
      expect(clean).not.toContain('<script>alert("pwned")</script>');
    });

    it('harus membersihkan payload event handler gambar: <img src=x onerror=alert(1)>', () => {
      const imgXss = 'Selesai modul <img src=x onerror=alert(1)> [done #TASK-03]';
      const clean = parser.sanitizeCommitMessage(imgXss);

      expect(clean).not.toContain('<img');
      expect(clean).not.toContain('onerror');
    });

    it('harus membersihkan iframe dan link javascript berbahaya', () => {
      const iframeXss = 'Halaman login <iframe src="javascript:alert(1)"></iframe>';
      const clean = parser.sanitizeCommitMessage(iframeXss);

      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('</iframe>');
    });
  });
});

