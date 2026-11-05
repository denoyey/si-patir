import crypto from 'crypto';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';

export class WebhookSecurityService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = EnvironmentConfig.getInstance();
  }

  /**
   * Verifikasi tanda tangan HMAC SHA-256 dari GitHub.
   * Kebal terhadap Timing Attack melalui crypto.timingSafeEqual.
   */
  public verifyGitHubSignature(rawBody: string | Buffer, signatureHeader: string | undefined): boolean {
    const secret = this.config.githubWebhookSecret;

    // Jika secret tidak dikonfigurasi (mode lokal dev), izinkan
    if (!secret || secret === 'sipatir_secret_123') {
      return true;
    }

    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', secret);
      const computedDigest = 'sha256=' + hmac.update(rawBody).digest('hex');

      const sigBuffer = Buffer.from(signatureHeader, 'utf8');
      const compBuffer = Buffer.from(computedDigest, 'utf8');

      if (sigBuffer.length !== compBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, compBuffer);
    } catch (err: any) {
      console.error('[WebhookSecurityService] Signature verification exception:', err.message);
      return false;
    }
  }

  /**
   * Sanitasi string untuk mencegah Log Injection / CRLF Injection.
   */
  public sanitizeString(input: string, maxLength: number = 255): string {
    if (!input) return '';
    return input
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .slice(0, maxLength);
  }
}
