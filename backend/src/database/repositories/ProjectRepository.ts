import { DatabaseService } from '../DatabaseService.js';
import { IProject } from '../../types/interfaces.js';

export class ProjectRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async findAll(): Promise<IProject[]> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows] = await this.db.getPool()!.query(
          'SELECT * FROM projects ORDER BY is_active DESC, id ASC'
        );
        return rows as IProject[];
      } catch (err: any) {
        console.error('[ProjectRepository] findAll query error:', err.message);
      }
    }
    return [...this.db.getMemoryProjects()];
  }

  public async findById(id: number): Promise<IProject | null> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows]: any = await this.db.getPool()!.query(
          'SELECT * FROM projects WHERE id = ? LIMIT 1',
          [id]
        );
        return rows.length > 0 ? (rows[0] as IProject) : null;
      } catch (err: any) {
        console.error('[ProjectRepository] findById error:', err.message);
      }
    }
    return this.db.getMemoryProjects().find((p) => p.id === id) || null;
  }

  public async findActive(): Promise<IProject | null> {
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows]: any = await this.db.getPool()!.query(
          'SELECT * FROM projects WHERE is_active = TRUE LIMIT 1'
        );
        if (rows.length > 0) return rows[0] as IProject;
      } catch (err: any) {
        console.error('[ProjectRepository] findActive error:', err.message);
      }
    }
    const memProjects = this.db.getMemoryProjects();
    return memProjects.find((p) => p.is_active) || memProjects[0] || null;
  }

  public async findByRepo(githubRepo: string): Promise<IProject | null> {
    const cleanRepo = githubRepo.trim().toLowerCase();
    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [rows]: any = await this.db.getPool()!.query(
          'SELECT * FROM projects WHERE LOWER(github_repo) = ? LIMIT 1',
          [cleanRepo]
        );
        if (rows.length > 0) return rows[0] as IProject;
      } catch (err: any) {
        console.error('[ProjectRepository] findByRepo error:', err.message);
      }
    }
    return (
      this.db.getMemoryProjects().find((p) => p.github_repo.toLowerCase() === cleanRepo) || null
    );
  }

  public async create(
    data: Omit<IProject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IProject | null> {
    const cleanName = data.name.trim();
    const cleanSlug = (data.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
    const cleanRepo = data.github_repo.trim();

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        // If this new project is marked active, deactivate others
        if (data.is_active) {
          await this.db.getPool()!.query('UPDATE projects SET is_active = FALSE');
        }

        const [result]: any = await this.db.getPool()!.query(
          `INSERT INTO projects (name, slug, github_repo, github_webhook_secret, trello_board_id, trello_done_list_id, discord_webhook_url, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cleanName,
            cleanSlug,
            cleanRepo,
            data.github_webhook_secret || null,
            data.trello_board_id || null,
            data.trello_done_list_id || null,
            data.discord_webhook_url || null,
            data.is_active ? 1 : 0,
          ]
        );
        return this.findById(result.insertId);
      } catch (err: any) {
        console.error('[ProjectRepository] create error:', err.message);
        return null;
      }
    }

    // Memory fallback
    if (data.is_active) {
      this.db.getMemoryProjects().forEach((p) => (p.is_active = false));
    }

    const newProject: IProject = {
      id: this.db.getMemoryProjects().length + 1,
      name: cleanName,
      slug: cleanSlug,
      github_repo: cleanRepo,
      github_webhook_secret: data.github_webhook_secret,
      trello_board_id: data.trello_board_id,
      trello_done_list_id: data.trello_done_list_id,
      discord_webhook_url: data.discord_webhook_url,
      is_active: Boolean(data.is_active),
      created_at: new Date().toISOString(),
    };
    this.db.getMemoryProjects().push(newProject);
    return newProject;
  }

  public async update(id: number, data: Partial<IProject>): Promise<IProject | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = {
      name: data.name !== undefined ? data.name.trim() : existing.name,
      slug: data.slug !== undefined ? data.slug.trim() : existing.slug,
      github_repo: data.github_repo !== undefined ? data.github_repo.trim() : existing.github_repo,
      github_webhook_secret:
        data.github_webhook_secret !== undefined
          ? data.github_webhook_secret.trim()
          : existing.github_webhook_secret,
      trello_board_id:
        data.trello_board_id !== undefined ? data.trello_board_id.trim() : existing.trello_board_id,
      trello_done_list_id:
        data.trello_done_list_id !== undefined
          ? data.trello_done_list_id.trim()
          : existing.trello_done_list_id,
      discord_webhook_url:
        data.discord_webhook_url !== undefined
          ? data.discord_webhook_url.trim()
          : existing.discord_webhook_url,
    };

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query(
          `UPDATE projects
           SET name = ?, slug = ?, github_repo = ?, github_webhook_secret = ?,
               trello_board_id = ?, trello_done_list_id = ?, discord_webhook_url = ?
           WHERE id = ?`,
          [
            updated.name,
            updated.slug,
            updated.github_repo,
            updated.github_webhook_secret,
            updated.trello_board_id,
            updated.trello_done_list_id,
            updated.discord_webhook_url,
            id,
          ]
        );
        return this.findById(id);
      } catch (err: any) {
        console.error('[ProjectRepository] update error:', err.message);
        return null;
      }
    }

    const mem = this.db.getMemoryProjects().find((p) => p.id === id);
    if (mem) {
      Object.assign(mem, updated);
      return mem;
    }
    return null;
  }

  public async setActive(id: number): Promise<IProject | null> {
    const project = await this.findById(id);
    if (!project) return null;

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        await this.db.getPool()!.query('UPDATE projects SET is_active = FALSE');
        await this.db.getPool()!.query('UPDATE projects SET is_active = TRUE WHERE id = ?', [id]);
        return this.findById(id);
      } catch (err: any) {
        console.error('[ProjectRepository] setActive error:', err.message);
        return null;
      }
    }

    this.db.getMemoryProjects().forEach((p) => {
      p.is_active = p.id === id;
    });
    return this.findById(id);
  }

  public async delete(id: number): Promise<boolean> {
    // Protect default project (id = 1) from deletion
    if (id === 1) {
      return false;
    }

    if (this.db.isConnected() && this.db.getPool()) {
      try {
        const [result]: any = await this.db.getPool()!.query('DELETE FROM projects WHERE id = ?', [
          id,
        ]);
        return result.affectedRows > 0;
      } catch (err: any) {
        console.error('[ProjectRepository] delete error:', err.message);
        return false;
      }
    }

    const idx = this.db.getMemoryProjects().findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.db.getMemoryProjects().splice(idx, 1);
      return true;
    }
    return false;
  }
}

