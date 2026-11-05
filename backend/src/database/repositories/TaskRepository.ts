import { DatabaseService } from '../DatabaseService.js';
import { ITask } from '../../types/interfaces.js';

export class TaskRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async findAll(): Promise<ITask[]> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows] = await this.db.getPool()!.query(
          'SELECT id, task_code, title, status, trello_card_id, assignee, updated_at FROM tasks ORDER BY id ASC'
        );
        return rows as ITask[];
      } catch (err: any) {
        console.error('[TaskRepository] DB Query Error:', err.message);
      }
    }
    return this.db.getMemoryTasks();
  }

  public async findByCode(code: string): Promise<ITask | null> {
    const cleanCode = code.trim().toUpperCase();

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows]: any = await this.db.getPool()!.query(
          'SELECT * FROM tasks WHERE UPPER(task_code) = ? LIMIT 1',
          [cleanCode]
        );
        return rows.length > 0 ? (rows[0] as ITask) : null;
      } catch (err: any) {
        console.error('[TaskRepository] findByCode error:', err.message);
      }
    }
    return this.db.getMemoryTasks().find((t) => t.task_code.toUpperCase() === cleanCode) || null;
  }

  public async updateStatus(code: string, newStatus: 'To Do' | 'In Progress' | 'Done'): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [result]: any = await this.db.getPool()!.query(
          'UPDATE tasks SET status = ? WHERE UPPER(task_code) = ?',
          [newStatus, cleanCode]
        );
        return result.affectedRows > 0;
      } catch (err: any) {
        console.error('[TaskRepository] updateStatus error:', err.message);
      }
    }

    const task = this.db.getMemoryTasks().find((t) => t.task_code.toUpperCase() === cleanCode);
    if (task) {
      task.status = newStatus;
      return true;
    }
    return false;
  }
}
