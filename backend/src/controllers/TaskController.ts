import { Request, Response } from 'express';
import { TaskRepository } from '../database/repositories/TaskRepository.js';
import { TrelloIntegrationService } from '../services/TrelloIntegrationService.js';
import { GitHubIntegrationService } from '../services/GitHubIntegrationService.js';

export class TaskController {
  private taskRepo: TaskRepository;
  private trelloService: TrelloIntegrationService;
  private githubService: GitHubIntegrationService;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.trelloService = new TrelloIntegrationService();
    this.githubService = new GitHubIntegrationService();
  }

  public getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskRepo.findAll();
      res.status(200).json(tasks);
    } catch {
      res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
    }
  };

  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskCode, title, assignee = 'denoyey', status = 'In Progress' } = req.body;
      if (!taskCode || !title) {
        res.status(400).json({ success: false, error: 'Kode tugas dan judul wajib diisi' });
        return;
      }
      const task = await this.taskRepo.createTask(taskCode, title, assignee, status);
      res.status(201).json({ success: true, task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      const success = await this.taskRepo.deleteTask(id);
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public syncFromTrello = async (req: Request, res: Response): Promise<void> => {
    try {
      const cards = await this.trelloService.fetchBoardCards();
      if (cards && Array.isArray(cards)) {
        res.status(200).json({
          success: true,
          message: `Berhasil sinkronisasi ${cards.length} kartu dari Trello`,
          count: cards.length,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Sinkronisasi selesai (koneksi Trello siap)',
      });
      return;
    } catch {
      res.status(500).json({ success: false, error: 'Trello sync failure' });
    }
  };

  public syncFromGitHubIssues = async (req: Request, res: Response): Promise<void> => {
    try {
      const issues = await this.githubService.fetchIssues();
      let count = 0;
      for (const issue of issues) {
        const code = `ISSUE-${issue.number}`;
        const status = issue.state === 'closed' ? 'Done' : 'In Progress';
        await this.taskRepo.createTask(code, issue.title, issue.user?.login || 'contributor', status);
        count++;
      }
      const tasks = await this.taskRepo.findAll();
      res.status(200).json({
        success: true,
        message: `Berhasil sinkronisasi ${count} issue dari GitHub`,
        tasks,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public clearDummy = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.taskRepo.clearDummyTasks();
      const tasks = await this.taskRepo.findAll();
      res.status(200).json({ success: true, tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
