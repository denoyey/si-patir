import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;

  public readonly port: number;
  public readonly nodeEnv: string;
  public readonly dbHost: string;
  public readonly dbUser: string;
  public readonly dbPassword: string;
  public readonly dbName: string;
  public readonly dbPort: number;
  public readonly discordWebhookUrl: string;
  public readonly trelloApiKey: string;
  public readonly trelloToken: string;
  public readonly trelloBoardId: string;
  public readonly trelloDoneListId: string;
  public readonly githubWebhookSecret: string;
  public readonly githubRepo: string;
  public readonly corsOrigins: string[];

  private constructor() {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const backendEnvPath = path.resolve(currentDir, '../../.env');
    dotenv.config({ path: backendEnvPath });
    dotenv.config(); // fallback to process.cwd()

    this.port = this.parseInteger(process.env.PORT, 5000);
    this.nodeEnv = process.env.NODE_ENV || 'development';

    // MySQL Database Config
    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbUser = process.env.DB_USER || 'root';
    this.dbPassword = process.env.DB_PASSWORD || '';
    this.dbName = process.env.DB_NAME || 'sipatir_db';
    this.dbPort = this.parseInteger(process.env.DB_PORT, 3306);

    // External Integrations
    this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.trelloApiKey = process.env.TRELLO_API_KEY || '';
    this.trelloToken = process.env.TRELLO_TOKEN || '';
    this.trelloBoardId = process.env.TRELLO_BOARD_ID || '';
    this.trelloDoneListId = process.env.TRELLO_DONE_LIST_ID || '';
    this.githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'sipatir_secret_123';
    this.githubRepo = process.env.GITHUB_REPO || 'denoyey/si-patir';

    // CORS Whitelist
    const rawOrigins = process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000';
    this.corsOrigins = rawOrigins.split(',').map((o) => o.trim());
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private parseInteger(val: string | undefined, fallback: number): number {
    if (!val) return fallback;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  public getMaskedConfig(): Record<string, string | number | boolean> {
    return {
      port: this.port,
      nodeEnv: this.nodeEnv,
      dbHost: this.dbHost,
      dbName: this.dbName,
      dbUser: this.dbUser,
      discordConfigured: Boolean(this.discordWebhookUrl),
      trelloConfigured: Boolean(this.trelloApiKey && this.trelloToken && this.trelloDoneListId),
      githubSecretProtected: Boolean(this.githubWebhookSecret),
      githubRepo: this.githubRepo,
    };
  }
}

