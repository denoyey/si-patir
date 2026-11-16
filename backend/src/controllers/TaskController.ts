import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { TaskRepository } from '../database/repositories/TaskRepository.js';
import { MemberRepository } from '../database/repositories/MemberRepository.js';
import { GitHubIntegrationService } from '../services/GitHubIntegrationService.js';

export class TaskController {
  private taskRepo: TaskRepository;
  private memberRepo: MemberRepository;
  private githubService: GitHubIntegrationService;
  private io?: SocketServer;

  constructor(io?: SocketServer) {
    this.taskRepo = new TaskRepository();
    this.memberRepo = new MemberRepository();
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

  public updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { title, assignee, status } = req.body;

      const numId = parseInt(idParam, 10);
      const existingTask = !isNaN(numId)
        ? await this.taskRepo.findById(numId)
        : await this.taskRepo.findByCode(idParam);

      if (!existingTask) {
        res.status(404).json({ success: false, error: `Kartu tugas "${idParam}" tidak ditemukan.` });
        return;
      }

      if (status && !['To Do', 'In Progress', 'Done'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Status tidak valid. Pilihan: "To Do", "In Progress", "Done"',
        });
        return;
      }

      const updatedTask = await this.taskRepo.updateTaskDetails(existingTask.id, {
        title,
        assignee,
        status,
      });

      // Hitung ulang perolehan task selesai untuk anggota
      await this.memberRepo.recalculateTasksDone();

      // Broadcast pembaruan real-time via WebSocket
      if (this.io) {
        this.io.emit('activity_update', {
          type: 'TASK_UPDATED',
          taskCode: existingTask.task_code,
          task: updatedTask || { ...existingTask, title: title || existingTask.title, assignee: assignee || existingTask.assignee, status: status || existingTask.status },
        });
      }

      res.status(200).json({
        success: true,
        message: `Tugas ${existingTask.task_code} berhasil diperbarui.`,
        task: updatedTask || { ...existingTask, title: title || existingTask.title, assignee: assignee || existingTask.assignee, status: status || existingTask.status },
      });
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
