import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { TaskRepository } from '../database/repositories/TaskRepository.js';
import { MemberRepository } from '../database/repositories/MemberRepository.js';
import { TrelloIntegrationService } from '../services/TrelloIntegrationService.js';
import { GitHubIntegrationService } from '../services/GitHubIntegrationService.js';

export class TaskController {
  private taskRepo: TaskRepository;
  private memberRepo: MemberRepository;
  private trelloService: TrelloIntegrationService;
  private githubService: GitHubIntegrationService;
  private io?: SocketServer;

  constructor(io?: SocketServer) {
    this.taskRepo = new TaskRepository();
    this.memberRepo = new MemberRepository();
    this.trelloService = new TrelloIntegrationService();
    this.githubService = new GitHubIntegrationService();
    this.io = io;
  }

  public getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskRepo.findAll();
      res.status(200).json(tasks);
    } catch {
      res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
    }
  };

  public getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const numId = parseInt(idParam, 10);

      const task = !isNaN(numId)
        ? await this.taskRepo.findById(numId)
        : await this.taskRepo.findByCode(idParam);

      if (!task) {
        res.status(404).json({ success: false, error: `Kartu tugas "${idParam}" tidak ditemukan.` });
        return;
      }

      res.status(200).json({ success: true, task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
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
      if (this.io) {
        this.io.emit('activity_update', {
          type: 'TASK_CREATED',
          taskCode,
          title,
          assignee,
          status,
        });
      }
      res.status(201).json({ success: true, task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;

      if (!status || !['To Do', 'In Progress', 'Done'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Status tidak valid. Pilihan: "To Do", "In Progress", "Done"',
        });
        return;
      }

      const numId = parseInt(idParam, 10);
      const existingTask = !isNaN(numId)
        ? await this.taskRepo.findById(numId)
        : await this.taskRepo.findByCode(idParam);

      if (!existingTask) {
        res.status(404).json({ success: false, error: `Kartu tugas "${idParam}" tidak ditemukan.` });
        return;
      }

      const updatedTask = await this.taskRepo.updateStatusById(existingTask.id, status);

      // Sinkronisasi dua arah ke Trello
      let trelloSyncNotice = '';
      try {
        const trelloResult = await this.trelloService.moveCardByStatus(
          existingTask.trello_card_id || existingTask.task_code,
          status
        );
        trelloSyncNotice = trelloResult.message;
      } catch (trelloErr: any) {
        trelloSyncNotice = `Trello sync skipped: ${trelloErr.message}`;
      }

      // Hitung ulang perolehan task selesai untuk anggota
      await this.memberRepo.recalculateTasksDone();

      // Broadcast pembaruan real-time via WebSocket
      if (this.io) {
        this.io.emit('activity_update', {
          type: 'TASK_STATUS_UPDATED',
          taskCode: existingTask.task_code,
          status,
          assignee: existingTask.assignee,
        });
      }

      res.status(200).json({
        success: true,
        message: `Status tugas ${existingTask.task_code} berhasil diperbarui ke "${status}".`,
        trello_notice: trelloSyncNotice,
        task: updatedTask || { ...existingTask, status },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      const success = await this.taskRepo.deleteTask(id);
      if (this.io) {
        this.io.emit('activity_update', { type: 'TASK_DELETED', id });
      }
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public syncFromTrello = async (req: Request, res: Response): Promise<void> => {
    try {
      const [lists, cards] = await Promise.all([
        this.trelloService.fetchBoardLists(),
        this.trelloService.fetchBoardCards(),
      ]);

      if (!cards || !Array.isArray(cards) || cards.length === 0) {
        res.status(200).json({
          success: true,
          message: 'Papan Trello kosong atau koneksi API Trello belum dikonfigurasi.',
          count: 0,
        });
        return;
      }

      // Buat mapping status dari nama list di Trello
      const listStatusMap = new Map<string, 'To Do' | 'In Progress' | 'Done'>();
      if (lists && Array.isArray(lists)) {
        for (const list of lists) {
          const lname = list.name.toLowerCase();
          if (lname.includes('done')) {
            listStatusMap.set(list.id, 'Done');
          } else if (lname.includes('progress') || lname.includes('doing')) {
            listStatusMap.set(list.id, 'In Progress');
          } else {
            listStatusMap.set(list.id, 'To Do');
          }
        }
      }

      let syncedCount = 0;
      for (const card of cards) {
        // Ekstrak kode task dari format nama: [#TASK-01], #TASK-01, TASK-01
        const taskCodeMatch = card.name.match(/(?:#)?(TASK-\d+)/i);
        const taskCode = taskCodeMatch ? taskCodeMatch[1].toUpperCase() : `TRL-${card.idShort || card.id.slice(-4)}`;

        // Bersihkan title dari tag kode
        const cleanTitle = card.name
          .replace(/\[\s*(?:#)?TASK-\d+\s*\]/gi, '')
          .replace(/(?:#)?TASK-\d+/gi, '')
          .trim() || card.name;

        // Tentukan status dari list
        const status = listStatusMap.get(card.idList) || (card.idList === lists?.[2]?.id ? 'Done' : 'In Progress');

        // Pertahankan assignee jika task sudah ada di DB, atau tetapkan default
        const existing = await this.taskRepo.findByCode(taskCode);
        const assignee = existing?.assignee || 'denoyey';

        await this.taskRepo.upsertTask({
          taskCode,
          title: cleanTitle,
          assignee,
          status,
          trelloCardId: card.id,
        });
        syncedCount++;
      }

      // Hitung ulang perolehan task selesai untuk klasemen anggota
      await this.memberRepo.recalculateTasksDone();

      const allTasks = await this.taskRepo.findAll();

      if (this.io) {
        this.io.emit('activity_update', {
          type: 'TRELLO_SYNCED',
          count: syncedCount,
        });
      }

      res.status(200).json({
        success: true,
        message: `Berhasil menyinkronkan ${syncedCount} kartu nyata dari papan Kanban Trello ke sistem.`,
        count: syncedCount,
        tasks: allTasks,
      });
    } catch (err: any) {
      console.error('[TaskController] Trello sync failure:', err);
      res.status(500).json({ success: false, error: err.message || 'Trello sync failure' });
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
