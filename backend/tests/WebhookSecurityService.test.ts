import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { WebhookSecurityService } from '../src/services/WebhookSecurityService.js';
import { EnvironmentConfig } from '../src/config/EnvironmentConfig.js';

describe('WebhookSecurityService Unit Tests', () => {
  let securityService: WebhookSecurityService;
  const TEST_SECRET = 'production_super_secret_webhook_key_2026_xyz';

  beforeEach(() => {
    // Set secret produksi untuk pengujian keamanan kriptografi
    const config = EnvironmentConfig.getInstance();
    (config as any).githubWebhookSecret = TEST_SECRET;
    securityService = new WebhookSecurityService();
  });

  describe('verifyGitHubSignature', () => {
    it('harus menerima payload valid dengan signature HMAC SHA-256 yang sah', () => {
      const payload = JSON.stringify({
        repository: { full_name: 'denoyey/si-patir' },
        commits: [{ id: 'abc1234', message: 'feat: valid commit [done #TASK-01]' }],
      });

      const validHash = crypto.createHmac('sha256', TEST_SECRET).update(payload).digest('hex');
      const validSignature = `sha256=${validHash}`;

      const isValid = securityService.verifyGitHubSignature(payload, validSignature);
      expect(isValid).toBe(true);
    });

    it('harus menolak request dengan signature palsu (spoofed / tampered)', () => {
      const payload = JSON.stringify({ commits: [{ message: 'hacker commit' }] });
      const fakeSignature = 'sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

      const isValid = securityService.verifyGitHubSignature(payload, fakeSignature);
      expect(isValid).toBe(false);
    });

    it('harus menolak request jika payload telah diubah (tampered) setelah ditandatangani', () => {
      const originalPayload = JSON.stringify({ amount: 100 });
      const tamperedPayload = JSON.stringify({ amount: 1000000 });

      const signature = 'sha256=' + crypto.createHmac('sha256', TEST_SECRET).update(originalPayload).digest('hex');

      const isValid = securityService.verifyGitHubSignature(tamperedPayload, signature);
      expect(isValid).toBe(false);
    });

    it('harus menolak request jika header signature tidak ada (undefined / null)', () => {
      const payload = JSON.stringify({ test: 'no header' });
      expect(securityService.verifyGitHubSignature(payload, undefined)).toBe(false);
      expect(securityService.verifyGitHubSignature(payload, '')).toBe(false);
    });

    it('harus menolak request jika format signature tidak diawali sha256=', () => {
      const payload = JSON.stringify({ test: 'malformed header' });
      const malformedHeader = 'md5=d41d8cd98f00b204e9800998ecf8427e';
      expect(securityService.verifyGitHubSignature(payload, malformedHeader)).toBe(false);
    });

    it('harus menolak signature yang panjang buffernya berbeda dengan aman (tanpa crash)', () => {
      const payload = JSON.stringify({ test: 'length mismatch' });
      const shortHeader = 'sha256=12345';
      expect(securityService.verifyGitHubSignature(payload, shortHeader)).toBe(false);
    });
  });

  describe('sanitizeString (Anti CRLF / Log Injection)', () => {
    it('harus membersihkan karakter newline (\r, \n) dan tab (\t) untuk mencegah Log Injection', () => {
      const maliciousLogInput = 'UserAdmin\r\n[CRITICAL] System breached!\n\tStatus: OK';
      const cleanString = securityService.sanitizeString(maliciousLogInput);

      expect(cleanString).not.toContain('\r');
      expect(cleanString).not.toContain('\n');
      expect(cleanString).not.toContain('\t');
      expect(cleanString).toBe('UserAdmin  [CRITICAL] System breached!  Status: OK');
    });

    it('harus membatasi panjang string sesuai parameter maxLength', () => {
      const longInput = 'X'.repeat(500);
      const sanitized = securityService.sanitizeString(longInput, 100);
      expect(sanitized.length).toBe(100);
    });

    it('harus mengembalikan string kosong untuk input falsy', () => {
      expect(securityService.sanitizeString('')).toBe('');
      expect(securityService.sanitizeString(null as any)).toBe('');
    });
  });
});
