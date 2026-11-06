import { Request, Response } from 'express';
import { DatabaseService } from '../database/DatabaseService.js';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';
import { ActivityLogRepository } from '../database/repositories/ActivityLogRepository.js';
import { ISystemStatus } from '../types/interfaces.js';

export class SystemController {
  private db: DatabaseService;
  private config: EnvironmentConfig;
  private logRepo: ActivityLogRepository;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.config = EnvironmentConfig.getInstance();
    this.logRepo = new ActivityLogRepository();
  }

  public getStatus = (req: Request, res: Response): void => {
    const status: ISystemStatus = {
      mysql: this.db.isConnected(),
      trello: Boolean(this.config.trelloApiKey && this.config.trelloToken && this.config.trelloDoneListId),
      discord: Boolean(this.config.discordWebhookUrl),
      github: true,
      repository: this.config.githubRepo,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
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
}

