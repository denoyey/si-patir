import { DatabaseService } from '../DatabaseService.js';
import { IMember } from '../../types/interfaces.js';

export class MemberRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async findAll(): Promise<IMember[]> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows] = await this.db.getPool()!.query(
          'SELECT id, name, github_username, total_commits, tasks_done, updated_at FROM members ORDER BY total_commits DESC, tasks_done DESC'
        );
        return rows as IMember[];
      } catch (err: any) {
        console.error('[MemberRepository] DB Query Error:', err.message);
      }
    }
    return [...this.db.getMemoryMembers()].sort((a, b) => b.total_commits - a.total_commits);
  }

  public async findByUsername(username: string): Promise<IMember | null> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows]: any = await this.db.getPool()!.query(
          'SELECT * FROM members WHERE github_username = ? LIMIT 1',
          [username]
        );
        return rows.length > 0 ? (rows[0] as IMember) : null;
      } catch (err: any) {
        console.error('[MemberRepository] findByUsername error:', err.message);
      }
    }
    return this.db.getMemoryMembers().find((m) => m.github_username.toLowerCase() === username.toLowerCase()) || null;
  }

  public async incrementStats(username: string, incTaskDone: boolean): Promise<void> {
    const taskInc = incTaskDone ? 1 : 0;

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const existing = await this.findByUsername(username);
        if (existing) {
          await this.db.getPool()!.query(
            'UPDATE members SET total_commits = total_commits + 1, tasks_done = tasks_done + ? WHERE github_username = ?',
            [taskInc, username]
          );
        } else {
          await this.db.getPool()!.query(
            'INSERT INTO members (name, github_username, total_commits, tasks_done) VALUES (?, ?, 1, ?)',
            [username, username, taskInc]
          );
        }
        return;
      } catch (err: any) {
        console.error('[MemberRepository] incrementStats error:', err.message);
      }
    }

    // Memory Fallback
    const memoryMembers = this.db.getMemoryMembers();
    const mem = memoryMembers.find((m) => m.github_username.toLowerCase() === username.toLowerCase());
    if (mem) {
      mem.total_commits += 1;
      if (incTaskDone) mem.tasks_done += 1;
    } else {
      memoryMembers.push({
        id: memoryMembers.length + 1,
        name: username,
        github_username: username,
        total_commits: 1,
        tasks_done: taskInc,
      });
    }
  }

  public async clearDummyMembers(): Promise<void> {
    const dummyUsernames = ['andi_dev', 'budi99', 'citra_ui', 'doni_backend'];

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query(
          'DELETE FROM members WHERE github_username IN (?, ?, ?, ?)',
          dummyUsernames
        );
      } catch (err: any) {
        console.error('[MemberRepository] clearDummyMembers error:', err.message);
      }
    }

    // Clear memory fallback dummy
    const memory = this.db.getMemoryMembers();
    const filtered = memory.filter((m) => !dummyUsernames.includes(m.github_username.toLowerCase()));
    this.db.setMemoryMembers(filtered);
  }

  public async upsertContributor(
    username: string,
    contributions: number,
    displayName?: string,
    tasksDone?: number
  ): Promise<IMember> {
    const finalName = displayName || username;
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const existing = await this.findByUsername(username);
        if (existing) {
          await this.db.getPool()!.query(
            'UPDATE members SET total_commits = ?, name = COALESCE(?, name), tasks_done = COALESCE(?, tasks_done) WHERE github_username = ?',
            [contributions, displayName || null, tasksDone !== undefined ? tasksDone : null, username]
          );
          return {
            ...existing,
            total_commits: contributions,
            name: displayName || existing.name,
            tasks_done: tasksDone !== undefined ? tasksDone : existing.tasks_done,
          };
        } else {
          const [result]: any = await this.db.getPool()!.query(
            'INSERT INTO members (name, github_username, total_commits, tasks_done) VALUES (?, ?, ?, ?)',
            [finalName, username, contributions, tasksDone || 0]
          );
          return {
            id: result.insertId,
            name: finalName,
            github_username: username,
            total_commits: contributions,
            tasks_done: tasksDone || 0,
          };
        }
      } catch (err: any) {
        console.error('[MemberRepository] upsertContributor error:', err.message);
      }
    }

    // Memory Fallback
    let mem = this.db.getMemoryMembers().find((m) => m.github_username.toLowerCase() === username.toLowerCase());
    if (mem) {
      mem.total_commits = contributions;
      if (displayName) mem.name = displayName;
      if (tasksDone !== undefined) mem.tasks_done = tasksDone;
      return mem;
    } else {
      const newMember: IMember = {
        id: this.db.getMemoryMembers().length + 1,
        name: finalName,
        github_username: username,
        total_commits: contributions,
        tasks_done: tasksDone || 0,
      };
      this.db.getMemoryMembers().push(newMember);
      return newMember;
    }
  }

  public async createMember(name: string, username: string): Promise<IMember | null> {
    const cleanName = name.trim();
    const cleanUser = username.trim().replace(/^@/, '');

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [result]: any = await this.db.getPool()!.query(
          'INSERT INTO members (name, github_username, total_commits, tasks_done) VALUES (?, ?, 0, 0)',
          [cleanName, cleanUser]
        );
        return {
          id: result.insertId,
          name: cleanName,
          github_username: cleanUser,
          total_commits: 0,
          tasks_done: 0,
        };
      } catch (err: any) {
        console.error('[MemberRepository] createMember error:', err.message);
        return null;
      }
    }

    const newMem: IMember = {
      id: this.db.getMemoryMembers().length + 1,
      name: cleanName,
      github_username: cleanUser,
      total_commits: 0,
      tasks_done: 0,
    };
    this.db.getMemoryMembers().push(newMem);
    return newMem;
  }
}

