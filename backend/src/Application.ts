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
    const taskController = new TaskController(this.io);
    const memberController = new MemberController();
    const systemController = new SystemController();

    // ==========================================
    // 1. Root Discovery & Interactive API Docs
    // ==========================================
    this.app.get('/', (req, res) => {
      // Jika request menerima HTML (misal dari browser), arahkan ke /api/docs
      if (req.accepts('html')) {
        res.redirect('/api/docs');
        return;
      }
      systemController.getRootCatalog(req, res);
    });
    this.app.get('/api', systemController.getRootCatalog);
    this.app.get('/api/v1', systemController.getRootCatalog);

    // Interactive Swagger / HTML API Explorer
    this.app.get('/docs', systemController.getSwaggerHtml);
    this.app.get('/api/docs', systemController.getSwaggerHtml);
    this.app.get('/api/v1/docs', systemController.getSwaggerHtml);
    this.app.get('/api/docs/json', systemController.getApiDocs);
    this.app.get('/api/v1/system/docs', systemController.getApiDocs);

    // ==========================================
    // 2. Webhook Routes (GitHub Push & Simulation)
    // ==========================================
    this.app.post(
      '/api/v1/webhooks/github',
      SecurityMiddleware.webhookRateLimiter(),
      webhookController.handleGitHubWebhook
    );
    this.app.post(
      '/api/webhooks/github',
      SecurityMiddleware.webhookRateLimiter(),
      webhookController.handleGitHubWebhook
    );
    this.app.post('/api/v1/webhooks/simulate', webhookController.handleSimulate);
    this.app.post('/api/simulate-commit', webhookController.handleSimulate);

    // ==========================================
    // 3. Tasks API (CRUD, Status Update, Sync)
    // ==========================================
    // List & Detail
    this.app.get('/api/v1/tasks', taskController.getAllTasks);
    this.app.get('/api/tasks', taskController.getAllTasks);
    this.app.get('/api/v1/tasks/:id', taskController.getTaskById);
    this.app.get('/api/tasks/:id', taskController.getTaskById);

    // Create & Update (Full & Status-only)
    this.app.post('/api/v1/tasks', taskController.createTask);
    this.app.post('/api/tasks', taskController.createTask);
    this.app.put('/api/v1/tasks/:id', taskController.updateTask);
    this.app.put('/api/tasks/:id', taskController.updateTask);
    this.app.patch('/api/v1/tasks/:id', taskController.updateTask);
    this.app.patch('/api/tasks/:id', taskController.updateTask);
    this.app.patch('/api/v1/tasks/:id/status', taskController.updateTaskStatus);
    this.app.patch('/api/tasks/:id/status', taskController.updateTaskStatus);

    // Delete
    this.app.delete('/api/v1/tasks/:id', taskController.deleteTask);
    this.app.delete('/api/tasks/:id', taskController.deleteTask);

    // Sync Trello & GitHub
    this.app.post('/api/v1/tasks/sync-trello', taskController.syncFromTrello);
    this.app.post('/api/tasks/sync', taskController.syncFromTrello);
    this.app.post('/api/v1/tasks/sync-github', taskController.syncFromGitHubIssues);
    this.app.post('/api/tasks/sync-github', taskController.syncFromGitHubIssues);
    this.app.post('/api/v1/tasks/clear-dummy', taskController.clearDummy);
    this.app.post('/api/tasks/clear-dummy', taskController.clearDummy);

    // ==========================================
    // 4. Members API (Leaderboard & Profile)
    // ==========================================
    this.app.get('/api/v1/members', memberController.getLeaderboard);
    this.app.get('/api/members', memberController.getLeaderboard);
    this.app.get('/api/v1/members/:username', memberController.getMemberByUsername);
    this.app.get('/api/members/:username', memberController.getMemberByUsername);

    this.app.post('/api/v1/members', memberController.createMember);
    this.app.post('/api/members', memberController.createMember);
    this.app.post('/api/v1/members/sync-github', memberController.syncFromGitHub);
    this.app.post('/api/members/sync-github', memberController.syncFromGitHub);
    this.app.post('/api/v1/members/clear-dummy', memberController.clearDummy);
    this.app.post('/api/members/clear-dummy', memberController.clearDummy);

    // ==========================================
    // 5. System API (Health, Logs, Specs)
    // ==========================================
    this.app.get('/api/v1/system/status', systemController.getStatus);
    this.app.get('/api/status', systemController.getStatus);
    this.app.get('/api/v1/system/logs', systemController.getLogs);
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

