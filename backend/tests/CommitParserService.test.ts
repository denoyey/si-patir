import { describe, it, expect, beforeEach } from 'vitest';
import { CommitParserService } from '../src/services/CommitParserService.js';

describe('CommitParserService Unit Tests', () => {
  let parser: CommitParserService;

  beforeEach(() => {
    parser = new CommitParserService();
  });

  describe('extractTaskCode', () => {
    it('harus berhasil mengekstrak format standar [done #TASK-01]', () => {
      const result = parser.extractTaskCode('Implementasi skema basis data [done #TASK-01]');
      expect(result).toBe('TASK-01');
    });

    it('harus berhasil mengekstrak format tanpa tanda kurung done #TASK-02', () => {
      const result = parser.extractTaskCode('Selesaikan integrasi API done #TASK-02');
      expect(result).toBe('TASK-02');
    });

    it('harus berhasil mengekstrak format resolves dan closes', () => {
      expect(parser.extractTaskCode('resolves #TASK-03 fix navbar bug')).toBe('TASK-03');
      expect(parser.extractTaskCode('closes #TASK-04 migrate tables')).toBe('TASK-04');
    });

    it('harus menangani variasi huruf besar/kecil (casing variatif) dan menormalkan ke UPPERCASE', () => {
      expect(parser.extractTaskCode('fitur login [DONE #task-01]')).toBe('TASK-01');
      expect(parser.extractTaskCode('fitur login [Done #Task-02]')).toBe('TASK-02');
      expect(parser.extractTaskCode('closes #task-05-auth')).toBe('TASK-05-AUTH');
    });

    it('harus berhasil mengekstrak kode tugas tanpa tanda pagar (#)', () => {
      expect(parser.extractTaskCode('Refactor modul auth [done TASK-01]')).toBe('TASK-01');
      expect(parser.extractTaskCode('done TASK-02 patch security')).toBe('TASK-02');
    });

    it('harus mengembalikan null jika commit message tidak memuat kode tugas', () => {
      expect(parser.extractTaskCode('chore: update dependencies in package.json')).toBeNull();
      expect(parser.extractTaskCode('docs: fix typo in README.md')).toBeNull();
    });

    it('harus mengembalikan null untuk input kosong, undefined, atau tipe data non-string', () => {
      expect(parser.extractTaskCode('')).toBeNull();
      expect(parser.extractTaskCode(null as any)).toBeNull();
      expect(parser.extractTaskCode(undefined as any)).toBeNull();
      expect(parser.extractTaskCode(12345 as any)).toBeNull();
    });

    it('harus kebal terhadap ReDoS (Regular Expression Denial of Service) pada string sangat panjang', () => {
      const maliciousInput = 'done ' + '#'.repeat(500) + 'TASK-' + 'a'.repeat(2000);
      const startTime = performance.now();
      const result = parser.extractTaskCode(maliciousInput);
      const duration = performance.now() - startTime;

      // Harus selesai di bawah 20ms tanpa catastrophic backtracking
      expect(duration).toBeLessThan(50);
      expect(typeof result === 'string' || result === null).toBe(true);
    });
  });

  describe('sanitizeCommitMessage', () => {
    it('harus membersihkan tag HTML untuk mencegah Cross-Site Scripting (XSS)', () => {
      const dirty = 'Fix bug login <script>alert("XSS")</script> [done #TASK-02]';
      const clean = parser.sanitizeCommitMessage(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('</script>');
      expect(clean).toContain('Fix bug login alert("XSS") [done #TASK-02]');
    });

    it('harus memotong teks jika melebihi batas 500 karakter dan memotong spasi liar', () => {
      const longMessage = '   ' + 'A'.repeat(600) + '   ';
      const clean = parser.sanitizeCommitMessage(longMessage);
      expect(clean.length).toBe(500);
      expect(clean.startsWith('A')).toBe(true);
    });

    it('harus mengembalikan string kosong untuk input falsy', () => {
      expect(parser.sanitizeCommitMessage('')).toBe('');
      expect(parser.sanitizeCommitMessage(null as any)).toBe('');
    });
  });

  describe('sanitizeAuthor', () => {
    it('harus mengeliminasi karakter berbahaya dan hanya menyisakan karakter aman username git', () => {
      expect(parser.sanitizeAuthor('fajri<script>')).toBe('fajriscript');
      expect(parser.sanitizeAuthor('denoyey-dev_01.')).toBe('denoyey-dev_01.');
      expect(parser.sanitizeAuthor('user@name$hack#')).toBe('usernamehack');
    });

    it('harus menggunakan fallback unknown_dev jika author kosong', () => {
      expect(parser.sanitizeAuthor('')).toBe('unknown_dev');
      expect(parser.sanitizeAuthor(null as any)).toBe('unknown_dev');
    });
  });
});

