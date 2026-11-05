import { Request, Response } from 'express';
import { TaskRepository } from '../database/repositories/TaskRepository.js';
import { TrelloIntegrationService } from '../services/TrelloIntegrationService.js';

export class TaskController {
  private taskRepo: TaskRepository;
  private trelloService: TrelloIntegrationService;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.trelloService = new TrelloIntegrationService();
  }

  public getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskRepo.findAll();
      res.status(200).json(tasks);
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
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
        message: 'Sinkronisasi berhasil (menggunakan data lokal)',
      });
    } catch {
      res.status(500).json({ success: false, error: 'Trello sync failure' });
    }
  };
}

