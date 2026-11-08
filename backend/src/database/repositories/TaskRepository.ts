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

  public async findById(id: number): Promise<ITask | null> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows]: any = await this.db.getPool()!.query(
          'SELECT * FROM tasks WHERE id = ? LIMIT 1',
          [id]
        );
        return rows.length > 0 ? (rows[0] as ITask) : null;
      } catch (err: any) {
        console.error('[TaskRepository] findById error:', err.message);
      }
    }
    return this.db.getMemoryTasks().find((t) => t.id === id) || null;
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

  public async updateStatusById(id: number, newStatus: 'To Do' | 'In Progress' | 'Done'): Promise<ITask | null> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query(
          'UPDATE tasks SET status = ? WHERE id = ?',
          [newStatus, id]
        );
        return this.findById(id);
      } catch (err: any) {
        console.error('[TaskRepository] updateStatusById error:', err.message);
      }
    }

    const task = this.db.getMemoryTasks().find((t) => t.id === id);
    if (task) {
      task.status = newStatus;
      return task;
    }
    return null;
  }

  public async updateTrelloCardId(taskCode: string, cardId: string): Promise<boolean> {
    const cleanCode = taskCode.trim().toUpperCase().replace(/^#/, '');
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [result]: any = await this.db.getPool()!.query(
          'UPDATE tasks SET trello_card_id = ? WHERE UPPER(task_code) = ?',
          [cardId, cleanCode]
        );
        return result.affectedRows > 0;
      } catch (err: any) {
        console.error('[TaskRepository] updateTrelloCardId error:', err.message);
      }
    }
    const task = this.db.getMemoryTasks().find((t) => t.task_code.toUpperCase() === cleanCode);
    if (task) {
      task.trello_card_id = cardId;
      return true;
    }
    return false;
  }

  public async upsertTask(data: {
    taskCode: string;
    title: string;
    assignee: string;
    status: 'To Do' | 'In Progress' | 'Done';
    trelloCardId?: string;
  }): Promise<ITask | null> {
    const cleanCode = data.taskCode.trim().toUpperCase().replace(/^#/, '');
    const cleanTitle = data.title.trim();
    const cleanAssignee = data.assignee.trim().replace(/^@/, '');

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query(
          `INSERT INTO tasks (task_code, title, assignee, status, trello_card_id)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             status = VALUES(status),
             trello_card_id = COALESCE(VALUES(trello_card_id), trello_card_id)`,
          [cleanCode, cleanTitle, cleanAssignee, data.status, data.trelloCardId || null]
        );
        return this.findByCode(cleanCode);
      } catch (err: any) {
        console.error('[TaskRepository] upsertTask error:', err.message);
        return null;
      }
    }

    const existing = this.db.getMemoryTasks().find((t) => t.task_code.toUpperCase() === cleanCode);
    if (existing) {
      existing.title = cleanTitle;
      existing.status = data.status;
      if (data.trelloCardId) existing.trello_card_id = data.trelloCardId;
      return existing;
    }

    const newTask: ITask = {
      id: this.db.getMemoryTasks().length + 1,
      task_code: cleanCode,
      title: cleanTitle,
      status: data.status,
      assignee: cleanAssignee,
      trello_card_id: data.trelloCardId,
    };
    this.db.getMemoryTasks().push(newTask);
    return newTask;
  }

  public async createTask(taskCode: string, title: string, assignee: string, status: 'To Do' | 'In Progress' | 'Done' = 'In Progress'): Promise<ITask | null> {
    const cleanCode = taskCode.trim().toUpperCase().replace(/^#/, '');
    const cleanTitle = title.trim();
    const cleanAssignee = assignee.trim().replace(/^@/, '');

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [result]: any = await this.db.getPool()!.query(
          'INSERT INTO tasks (task_code, title, assignee, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), assignee = VALUES(assignee), status = VALUES(status)',
          [cleanCode, cleanTitle, cleanAssignee, status]
        );
        return {
          id: result.insertId || 1,
          task_code: cleanCode,
          title: cleanTitle,
          status,
          assignee: cleanAssignee,
        };
      } catch (err: any) {
        console.error('[TaskRepository] createTask error:', err.message);
        return null;
      }
    }

    const newTask: ITask = {
      id: this.db.getMemoryTasks().length + 1,
      task_code: cleanCode,
      title: cleanTitle,
      status,
      assignee: cleanAssignee,
    };
    this.db.getMemoryTasks().push(newTask);
    return newTask;
  }

  public async deleteTask(id: number): Promise<boolean> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [result]: any = await this.db.getPool()!.query('DELETE FROM tasks WHERE id = ?', [id]);
        return result.affectedRows > 0;
      } catch (err: any) {
        console.error('[TaskRepository] deleteTask error:', err.message);
        return false;
      }
    }
    const idx = this.db.getMemoryTasks().findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.db.getMemoryTasks().splice(idx, 1);
      return true;
    }
    return false;
  }

  public async clearDummyTasks(): Promise<void> {
    const dummyCodes = ['TASK-01', 'TASK-02', 'TASK-03', 'TASK-04', 'TASK-05'];
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query('DELETE FROM tasks WHERE task_code IN (?, ?, ?, ?, ?)', dummyCodes);
      } catch (err: any) {
        console.error('[TaskRepository] clearDummyTasks error:', err.message);
      }
    }
  }
}

