import { DatabaseService } from '../DatabaseService.js';
import { IActivityLog } from '../../types/interfaces.js';

export class ActivityLogRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async findAll(limit: number = 50): Promise<IActivityLog[]> {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows] = await this.db.getPool()!.query(
          'SELECT id, event_type, author, commit_message, task_code, status, created_at FROM activity_logs ORDER BY id DESC LIMIT ?',
          [safeLimit]
        );
        return rows as IActivityLog[];
      } catch (err: any) {
        console.error('[ActivityLogRepository] DB Query Error:', err.message);
      }
    }
    return this.db.getMemoryLogs().slice(0, safeLimit);
  }

  public async record(
    eventType: 'PUSH_EVENT' | 'TASK_COMPLETED' | 'TRELLO_SYNC' | 'SYSTEM_ALERT',
    author: string,
    commitMsg: string,
    taskCode: string = '',
    status: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS'
  ): Promise<void> {
    const timeStr = new Date().toLocaleTimeString('id-ID');

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query(
          'INSERT INTO activity_logs (event_type, author, commit_message, task_code, status) VALUES (?, ?, ?, ?, ?)',
          [eventType, author, commitMsg, taskCode, status]
        );
        return;
      } catch (err: any) {
        console.error('[ActivityLogRepository] record error:', err.message);
      }
    }

    const memoryLogs = this.db.getMemoryLogs();
    memoryLogs.unshift({
      id: memoryLogs.length + 1,
      event_type: eventType,
      author,
      commit_message: commitMsg,
      task_code: taskCode,
      status,
      created_at: timeStr,
    });
  }
}

