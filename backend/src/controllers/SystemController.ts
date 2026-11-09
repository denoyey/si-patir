import { Request, Response } from 'express';
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
    const trelloConfigured = Boolean(
      (activeProject?.trello_board_id || this.config.trelloBoardId) &&
      this.config.trelloApiKey &&
      this.config.trelloToken
    );
    const discordConfigured = Boolean(activeProject?.discord_webhook_url || this.config.discordWebhookUrl);

    const status: ISystemStatus & { activeProject?: any } = {
      mysql: this.db.isConnected(),
      trello: trelloConfigured,
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
