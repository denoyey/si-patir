import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';
import { IMember, ITask, IActivityLog } from '../types/interfaces.js';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool | null = null;
  private connected: boolean = false;
  private config: EnvironmentConfig;

  // In-memory persistent fallback if MySQL is offline or not yet configured
  private memoryMembers: IMember[] = [
    { id: 1, name: 'Andi Saputra', github_username: 'andi_dev', total_commits: 14, tasks_done: 3 },
    { id: 2, name: 'Budi Santoso', github_username: 'budi99', total_commits: 9, tasks_done: 1 },
    { id: 3, name: 'Citra Lestari', github_username: 'citra_ui', total_commits: 11, tasks_done: 2 },
    { id: 4, name: 'Doni Pratama', github_username: 'doni_backend', total_commits: 6, tasks_done: 1 },
  ];

  private memoryTasks: ITask[] = [
    { id: 1, task_code: 'TASK-01', title: 'Buat Database & Skema User', status: 'Done', assignee: 'andi_dev' },
    { id: 2, task_code: 'TASK-02', title: 'Integrasi Halaman Login & Auth', status: 'In Progress', assignee: 'budi99' },
    { id: 3, task_code: 'TASK-03', title: 'Desain Layout Dashboard & Sidebar', status: 'Done', assignee: 'citra_ui' },
    { id: 4, task_code: 'TASK-04', title: 'Setup Webhook Handler & Logger', status: 'Done', assignee: 'doni_backend' },
    { id: 5, task_code: 'TASK-05', title: 'Testing Otomasi Push ke Discord', status: 'To Do', assignee: 'budi99' },
  ];

  private memoryLogs: IActivityLog[] = [
    {
      id: 1,
      event_type: 'PUSH_EVENT',
      author: 'system',
      commit_message: 'SI-PATIR Secure Subsystem Initialized',
      task_code: '',
      status: 'SUCCESS',
      created_at: new Date().toLocaleTimeString('id-ID'),
    },
  ];

  private constructor() {
    this.config = EnvironmentConfig.getInstance();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // 1. Initial connection to guarantee database existence
      const rootConn = await mysql.createConnection({
        host: this.config.dbHost,
        user: this.config.dbUser,
        password: this.config.dbPassword,
        port: this.config.dbPort,
      });

      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${this.config.dbName}\`;`);
      await rootConn.end();

      // 2. Instantiate production connection pool with strict security limits
      this.pool = mysql.createPool({
        host: this.config.dbHost,
        user: this.config.dbUser,
        password: this.config.dbPassword,
        database: this.config.dbName,
        port: this.config.dbPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      await this.runMigrations();
      this.connected = true;
      console.log(`[DatabaseService] MySQL Pool connected successfully to "${this.config.dbName}".`);
    } catch (error: any) {
      this.connected = false;
      console.warn(`[DatabaseService] Notice: MySQL unavailable (${error.message}).`);
      console.log(`[DatabaseService] Active Memory Fallback engaged. System will seamlessly operate.`);
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.pool) return;

    // Prepared DDL with constraints and indexes
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        github_username VARCHAR(100) NOT NULL UNIQUE,
        total_commits INT DEFAULT 0,
        tasks_done INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_commits (total_commits DESC),
        INDEX idx_username (github_username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
        trello_card_id VARCHAR(100),
        assignee VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_task_code (task_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        commit_message TEXT NOT NULL,
        task_code VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed defaults if empty
    const [memberCount]: any = await this.pool.query('SELECT COUNT(*) as count FROM members');
    if (memberCount[0].count === 0) {
      for (const m of this.memoryMembers) {
        await this.pool.query(
          'INSERT INTO members (name, github_username, total_commits, tasks_done) VALUES (?, ?, ?, ?)',
          [m.name, m.github_username, m.total_commits, m.tasks_done]
        );
      }
    }

    const [taskCount]: any = await this.pool.query('SELECT COUNT(*) as count FROM tasks');
    if (taskCount[0].count === 0) {
      for (const t of this.memoryTasks) {
        await this.pool.query(
          'INSERT INTO tasks (task_code, title, status, assignee) VALUES (?, ?, ?, ?)',
          [t.task_code, t.title, t.status, t.assignee]
        );
      }
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getPool(): Pool | null {
    return this.pool;
  }

  // Memory fallbacks accessors
  public getMemoryMembers(): IMember[] {
    return this.memoryMembers;
  }

  public getMemoryTasks(): ITask[] {
    return this.memoryTasks;
  }

  public getMemoryLogs(): IActivityLog[] {
    return this.memoryLogs;
  }
}
