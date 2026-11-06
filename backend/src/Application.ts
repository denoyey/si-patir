import express, { Express } from 'express';
import http, { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { EnvironmentConfig } from './config/EnvironmentConfig.js';
import { DatabaseService } from './database/DatabaseService.js';
import { SecurityMiddleware } from './middlewares/SecurityMiddleware.js';
import { WebhookController } from './controllers/WebhookController.js';
import { TaskController } from './controllers/TaskController.js';
import { MemberController } from './controllers/MemberController.js';
import { SystemController } from './controllers/SystemController.js';
import { GitHubIntegrationService } from './services/GitHubIntegrationService.js';

export class Application {
  private app: Express;
  private server: HttpServer;
  private io: SocketServer;
  private config: EnvironmentConfig;
  private db: DatabaseService;

  constructor() {
    this.config = EnvironmentConfig.getInstance();
    this.db = DatabaseService.getInstance();
    this.app = express();
    this.server = http.createServer(this.app);

    // Socket.io with strict CORS
    this.io = new SocketServer(this.server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin || this.config.corsOrigins.includes(origin) || origin.includes('localhost')) {
            return callback(null, true);
          }
          return callback(new Error('Socket.io: Origin not allowed'));
        },
        methods: ['GET', 'POST'],
      },
    });

    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    // 1. Security Headers
    this.app.use(SecurityMiddleware.configureHelmet());

    // 2. Strict CORS
    this.app.use(SecurityMiddleware.configureCors());

    // 3. Body Parser with 100kb limit (Anti-DoS memory exhaustion)
    this.app.use(express.json({ limit: '100kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100kb' }));

    // 4. General Rate Limiter
    this.app.use(SecurityMiddleware.generalRateLimiter());
  }

  private configureRoutes(): void {
    const webhookController = new WebhookController(this.io);
    const taskController = new TaskController();
    const memberController = new MemberController();
    const systemController = new SystemController();

    // Webhook Route with dedicated tight rate limiter
    this.app.post(
      '/api/webhooks/github',
      SecurityMiddleware.webhookRateLimiter(),
      webhookController.handleGitHubWebhook
    );

    this.app.post('/api/simulate-commit', webhookController.handleSimulate);

    // Tasks API
    this.app.get('/api/tasks', taskController.getAllTasks);
    this.app.post('/api/tasks', taskController.createTask);
    this.app.delete('/api/tasks/:id', taskController.deleteTask);
    this.app.post('/api/tasks/sync', taskController.syncFromTrello);
    this.app.post('/api/tasks/sync-github', taskController.syncFromGitHubIssues);
    this.app.post('/api/tasks/clear-dummy', taskController.clearDummy);

    // Members API
    this.app.get('/api/members', memberController.getLeaderboard);
    this.app.post('/api/members/sync-github', memberController.syncFromGitHub);
    this.app.post('/api/members', memberController.createMember);
    this.app.post('/api/members/clear-dummy', memberController.clearDummy);

    this.app.get('/api/status', systemController.getStatus);
    this.app.get('/api/logs', systemController.getLogs);

    // Socket.io connection logging
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  private configureErrorHandling(): void {
    this.app.use(SecurityMiddleware.globalErrorHandler);
  }

  public async start(): Promise<void> {
    await this.db.initialize();

    // Auto-sync real contributors from GitHub
    const githubService = new GitHubIntegrationService();
    githubService.syncRealContributors().catch((e) => {
      console.warn('[Application] GitHub contributors sync notice:', e.message);
    });

    this.server.listen(this.config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SI-PATIR Enterprise Backend running on port ${this.config.port}`);
      console.log(`🛡️  Security Shield: Helmet, RateLimit, HMAC SHA-256 active`);
      console.log(`📡 GitHub Webhook Endpoint: http://localhost:${this.config.port}/api/webhooks/github`);
      console.log(`=======================================================`);
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('[Application] Server gracefully stopped.');
        resolve();
      });
    });
  }
}

