import { Request, Response } from 'express';
import crypto from 'crypto';
import { DatabaseService } from '../database/DatabaseService.js';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';
import { ActivityLogRepository } from '../database/repositories/ActivityLogRepository.js';
import { ProjectRepository } from '../database/repositories/ProjectRepository.js';
import { ISystemStatus } from '../types/interfaces.js';
import { API_METADATA, API_ENDPOINTS } from '../docs/apiSpec.js';
import { renderApiDocsHtml } from '../docs/renderApiDocsHtml.js';

export class SystemController {
  private db: DatabaseService;
  private config: EnvironmentConfig;
  private logRepo: ActivityLogRepository;
  private projectRepo: ProjectRepository;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.config = EnvironmentConfig.getInstance();
    this.logRepo = new ActivityLogRepository();
    this.projectRepo = new ProjectRepository();
  }

  public getStatus = async (req: Request, res: Response): Promise<void> => {
    const activeProject = await this.projectRepo.findActive();
    const currentRepo = activeProject?.github_repo || this.config.githubRepo;
    const discordConfigured = Boolean(activeProject?.discord_webhook_url || this.config.discordWebhookUrl);

    const status: ISystemStatus & { activeProject?: any } = {
      mysql: this.db.isConnected(),
      discord: discordConfigured,
      github: true,
      repository: currentRepo,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      activeProject: activeProject || undefined,
    };
    res.status(200).json(status);
  };

  public getSecurityReport = (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      security: {
        hmacVerification: {
          algorithm: 'HMAC-SHA256',
          timingAttackProtection: true,
          method: 'crypto.timingSafeEqual',
          secretConfigured: Boolean(this.config.githubWebhookSecret),
          secretMasked: this.config.githubWebhookSecret
            ? `${this.config.githubWebhookSecret.slice(0, 4)}••••••••`
            : 'not-set',
          header: 'X-Hub-Signature-256',
        },
        rateLimiting: {
          generalLimit: '120 req / minute per IP',
          webhookLimit: '30 req / minute per IP',
          strategy: 'In-Memory Sliding Window Bucket',
          headers: 'Retry-After, X-RateLimit-Limit',
        },
        sqlInjectionDefense: {
          driver: 'MySQL2 Prepared Statements',
          parameterizedQueries: '100% kueri menggunakan placeholder (?)',
          firstAndSecondOrderProtection: true,
        },
        xssAndCsp: {
          helmetInstalled: true,
          contentSecurityPolicy: "script-src-attr 'unsafe-inline'; default-src 'self'",
          frameGuard: 'X-Frame-Options: DENY (Anti-Clickjacking)',
          noSniff: 'X-Content-Type-Options: nosniff (Anti-MIME Sniffing)',
          commitMessageSanitizer: 'Pembersihan tag HTML + eliminasi karakter CRLF',
        },
        payloadLimit: {
          maxJsonBody: '100kb (Anti-JSON Bomb & Memory Exhaustion)',
          strictJsonParser: true,
        },
        reDosDefense: {
          regexPattern: 'Finite-length non-backtracking',
          maxInputLength: 1000,
        },
      },
    });
  };

  public verifyHmacSimulation = (req: Request, res: Response): void => {
    const { payload, signature, customSecret } = req.body || {};
    const secret = customSecret || this.config.githubWebhookSecret || 'sipatir_secret_123';
    const rawString = typeof payload === 'string' ? payload : JSON.stringify(payload || {});

    const start = process.hrtime.bigint();
    const hmac = crypto.createHmac('sha256', secret);
    const computedDigest = 'sha256=' + hmac.update(rawString).digest('hex');

    let isValid = false;
    let timingSafeUsed = false;

    if (signature && typeof signature === 'string') {
      const sigBuffer = Buffer.from(signature, 'utf8');
      const compBuffer = Buffer.from(computedDigest, 'utf8');

      if (sigBuffer.length === compBuffer.length) {
        isValid = crypto.timingSafeEqual(sigBuffer, compBuffer);
        timingSafeUsed = true;
      }
    }
    const end = process.hrtime.bigint();
    const latencyNs = Number(end - start);

    res.status(200).json({
      success: true,
      valid: isValid,
      providedSignature: signature || null,
      computedDigest,
      algorithm: 'HMAC-SHA256',
      timingSafeUsed,
      executionDurationNs: latencyNs,
      message: isValid
        ? 'Tanda tangan VALID: Integritas payload terjamin dan berasal dari sumber terpercaya (GitHub).'
        : 'Tanda tangan TIDAK COCOK: Payload mungkin telah diubah di perjalanan atau signature dipalsukan penyerang.',
    });
  };

  public getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await this.logRepo.findAll(50);
      res.status(200).json(logs);
    } catch {
      res.status(500).json({ success: false, error: 'Failed to retrieve logs' });
    }
  };

  public getRootCatalog = (req: Request, res: Response): void => {
    const groupedEndpoints: Record<string, Record<string, string>> = {};
    for (const ep of API_ENDPOINTS) {
      const cat = ep.category.toLowerCase();
      if (!groupedEndpoints[cat]) groupedEndpoints[cat] = {};
      groupedEndpoints[cat][`${ep.method} ${ep.path}`] = `${ep.summary}: ${ep.description}`;
    }

    res.status(200).json({
      name: API_METADATA.name,
      version: API_METADATA.version,
      description: API_METADATA.description,
      status: 'operational',
      documentation: `${req.protocol}://${req.get('host')}/api/docs`,
      endpoints_count: API_ENDPOINTS.length,
      endpoints: groupedEndpoints,
    });
  };

  public getApiDocs = (req: Request, res: Response): void => {
    res.status(200).json({
      metadata: API_METADATA,
      endpoints: API_ENDPOINTS,
    });
  };

  public getSwaggerHtml = (req: Request, res: Response): void => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(renderApiDocsHtml());
  };
}
