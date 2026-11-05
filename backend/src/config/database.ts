import mysql, { Pool } from 'mysql2/promise';
import { config } from './env.js';

export interface Member {
  id: number;
  name: string;
  github_username: string;
  total_commits: number;
  tasks_done: number;
}

export interface Task {
  id: number;
  task_code: string;
  title: string;
  status: string;
  trello_card_id?: string;
  assignee: string;
}

export interface ActivityLog {
  id: number;
  event_type: string;
  author: string;
  commit_message: string;
  task_code?: string;
  status: string;
  created_at: string;
}

// In-memory fallback if MySQL is not yet configured or temporarily offline
let isConnected = false;
let pool: Pool | null = null;

let memoryMembers: Member[] = [
  { id: 1, name: 'Andi Saputra', github_username: 'andi_dev', total_commits: 14, tasks_done: 3 },
  { id: 2, name: 'Budi Santoso', github_username: 'budi99', total_commits: 9, tasks_done: 1 },
  { id: 3, name: 'Citra Lestari', github_username: 'citra_ui', total_commits: 11, tasks_done: 2 },
  { id: 4, name: 'Doni Pratama', github_username: 'doni_backend', total_commits: 6, tasks_done: 1 },
];

let memoryTasks: Task[] = [
  { id: 1, task_code: 'TASK-01', title: 'Buat Database & Skema User', status: 'Done', assignee: 'andi_dev' },
  { id: 2, task_code: 'TASK-02', title: 'Integrasi Halaman Login & Auth', status: 'In Progress', assignee: 'budi99' },
  { id: 3, task_code: 'TASK-03', title: 'Desain Layout Dashboard & Sidebar', status: 'Done', assignee: 'citra_ui' },
  { id: 4, task_code: 'TASK-04', title: 'Setup Webhook Handler & Logger', status: 'Done', assignee: 'doni_backend' },
  { id: 5, task_code: 'TASK-05', title: 'Testing Otomasi Push ke Discord', status: 'To Do', assignee: 'budi99' },
];

let memoryLogs: ActivityLog[] = [
  {
    id: 1,
    event_type: 'WEBHOOK_INIT',
    author: 'system',
    commit_message: 'SI-PATIR system initialized successfully',
    task_code: '',
    status: 'SUCCESS',
    created_at: new Date().toLocaleTimeString('id-ID'),
  },
];

export async function initDatabase() {
  try {
    // Attempt connecting to MySQL server
    const rootConnection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      port: config.db.port,
    });

    // Create database if not exists
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.name}\`;`);
    await rootConnection.end();

    // Create persistent pool
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: 10,
    });

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        github_username VARCHAR(100) NOT NULL UNIQUE,
        total_commits INT DEFAULT 0,
        tasks_done INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'To Do',
        trello_card_id VARCHAR(100),
        assignee VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        commit_message TEXT,
        task_code VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed members if empty
    const [existingMembers]: any = await pool.query('SELECT COUNT(*) as count FROM members');
    if (existingMembers[0].count === 0) {
      for (const m of memoryMembers) {
        await pool.query(
          'INSERT INTO members (name, github_username, total_commits, tasks_done) VALUES (?, ?, ?, ?)',
          [m.name, m.github_username, m.total_commits, m.tasks_done]
        );
      }
    }

    // Seed tasks if empty
    const [existingTasks]: any = await pool.query('SELECT COUNT(*) as count FROM tasks');
    if (existingTasks[0].count === 0) {
      for (const t of memoryTasks) {
        await pool.query(
          'INSERT INTO tasks (task_code, title, status, assignee) VALUES (?, ?, ?, ?)',
          [t.task_code, t.title, t.status, t.assignee]
        );
      }
    }

    isConnected = true;
    console.log(`[Database] MySQL connected successfully to database "${config.db.name}".`);
  } catch (error: any) {
    isConnected = false;
    console.warn(`[Database] MySQL connection notice: ${error.message}`);
    console.log(`[Database] Running in active memory-mode fallback. Configure .env with valid MySQL credentials whenever ready.`);
  }
}

export async function getMembers(): Promise<Member[]> {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM members ORDER BY total_commits DESC, tasks_done DESC');
      return rows as Member[];
    } catch {
      // fallback
    }
  }
  return [...memoryMembers].sort((a, b) => b.total_commits - a.total_commits);
}

export async function getTasks(): Promise<Task[]> {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
      return rows as Task[];
    } catch {
      // fallback
    }
  }
  return memoryTasks;
}

export async function getLogs(): Promise<ActivityLog[]> {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50');
      return rows as ActivityLog[];
    } catch {
      // fallback
    }
  }
  return memoryLogs;
}

export async function recordCommitAndTask(authorGithub: string, taskCode: string | null, commitMsg: string) {
  const timeStr = new Date().toLocaleTimeString('id-ID');

  // Update in DB or memory
  if (isConnected && pool) {
    try {
      // Check if member exists, otherwise create
      const [members]: any = await pool.query('SELECT * FROM members WHERE github_username = ?', [authorGithub]);
      if (members.length > 0) {
        const incTask = taskCode ? 1 : 0;
        await pool.query(
          'UPDATE members SET total_commits = total_commits + 1, tasks_done = tasks_done + ? WHERE github_username = ?',
          [incTask, authorGithub]
        );
      } else {
        await pool.query(
          'INSERT INTO members (name, github_username, total_commits, tasks_done) VALUES (?, ?, 1, ?)',
          [authorGithub, authorGithub, taskCode ? 1 : 0]
        );
      }

      // If taskCode provided, mark task as Done
      if (taskCode) {
        await pool.query('UPDATE tasks SET status = ? WHERE task_code = ?', ['Done', taskCode]);
      }

      // Insert log
      await pool.query(
        'INSERT INTO activity_logs (event_type, author, commit_message, task_code, status) VALUES (?, ?, ?, ?, ?)',
        ['PUSH_EVENT', authorGithub, commitMsg, taskCode || '', 'SUCCESS']
      );
      return;
    } catch (err: any) {
      console.error('[Database] Failed to write commit to MySQL, falling back to memory:', err.message);
    }
  }

  // Memory fallback
  let member = memoryMembers.find((m) => m.github_username === authorGithub);
  if (member) {
    member.total_commits += 1;
    if (taskCode) member.tasks_done += 1;
  } else {
    memoryMembers.push({
      id: memoryMembers.length + 1,
      name: authorGithub,
      github_username: authorGithub,
      total_commits: 1,
      tasks_done: taskCode ? 1 : 0,
    });
  }

  if (taskCode) {
    const task = memoryTasks.find((t) => t.task_code.toLowerCase() === taskCode.toLowerCase());
    if (task) {
      task.status = 'Done';
    }
  }

  memoryLogs.unshift({
    id: memoryLogs.length + 1,
    event_type: 'PUSH_EVENT',
    author: authorGithub,
    commit_message: commitMsg,
    task_code: taskCode || '',
    status: 'SUCCESS',
    created_at: timeStr,
  });
}

export function isDbConnected(): boolean {
  return isConnected;
}

