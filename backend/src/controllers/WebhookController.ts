import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';
import { WebhookSecurityService } from '../services/WebhookSecurityService.js';
import { CommitParserService } from '../services/CommitParserService.js';
import { DiscordNotificationService } from '../services/DiscordNotificationService.js';
import { TrelloIntegrationService } from '../services/TrelloIntegrationService.js';
import { MemberRepository } from '../database/repositories/MemberRepository.js';
import { TaskRepository } from '../database/repositories/TaskRepository.js';
import { ActivityLogRepository } from '../database/repositories/ActivityLogRepository.js';

export class WebhookController {
  private config: EnvironmentConfig;
  private securityService: WebhookSecurityService;
  private parserService: CommitParserService;
  private discordService: DiscordNotificationService;
  private trelloService: TrelloIntegrationService;
  private memberRepo: MemberRepository;
  private taskRepo: TaskRepository;
  private logRepo: ActivityLogRepository;
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.config = EnvironmentConfig.getInstance();
    this.securityService = new WebhookSecurityService();
    this.parserService = new CommitParserService();
    this.discordService = new DiscordNotificationService();
    this.trelloService = new TrelloIntegrationService();
    this.memberRepo = new MemberRepository();
    this.taskRepo = new TaskRepository();
    this.logRepo = new ActivityLogRepository();
    this.io = io;
  }

  public handleGitHubWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const rawBody = JSON.stringify(req.body);

    // 1. Signature Security Verification (Timing Attack Protection)
    if (!this.securityService.verifyGitHubSignature(rawBody, signature)) {
      console.warn('[WebhookController] Permintaan ditolak: Signature HMAC tidak valid!');
      res.status(401).json({ success: false, error: 'Unauthorized: Invalid signature' });
      return;
    }

    const payload = req.body;
    const commits = payload.commits || (payload.message ? [payload] : []);

    if (!Array.isArray(commits) || commits.length === 0) {
      res.status(200).json({ success: true, message: 'No actionable commits found.' });
      return;
    }

    for (const commit of commits) {
      const rawMsg = commit.message || '';
      const rawAuthor = commit.author?.username || commit.author?.name || payload.pusher?.name || 'unknown_dev';
      const commitUrl = commit.url || '';

      const commitMsg = this.parserService.sanitizeCommitMessage(rawMsg);
      const author = this.parserService.sanitizeAuthor(rawAuthor);
      const taskCode = this.parserService.extractTaskCode(commitMsg);

      if (taskCode) {
        console.log(`[WebhookController] 🎯 Terdeteksi task close: [${taskCode}] oleh @${author}`);

        const task = await this.taskRepo.findByCode(taskCode);
        const taskTitle = task ? task.title : 'Integrasi Fitur Proyek';
        const oldStatus = task ? task.status : 'In Progress';

        // Update Repositories
        await this.taskRepo.updateStatus(taskCode, 'Done');
        await this.memberRepo.incrementStats(author, true);
        await this.logRepo.record('TASK_COMPLETED', author, commitMsg, taskCode, 'SUCCESS');

        // External System Integrations (Trello & Discord)
        await this.trelloService.moveCardToDone(taskCode, commitMsg, commitUrl);
        await this.discordService.sendTaskCompletion({
          developer: author,
          taskCode,
          taskTitle,
          commitMsg,
          commitUrl,
          oldStatus,
          newStatus: 'Done',
        });

        // Real-time Event to Frontend Dashboard
        this.io.emit('activity_update', {
          type: 'TASK_COMPLETED',
          author,
          taskCode,
          taskTitle,
          commitMsg,
          commitUrl,
          time: new Date().toLocaleTimeString('id-ID'),
        });
      } else {
        // Regular commit
        await this.memberRepo.incrementStats(author, false);
        await this.logRepo.record('PUSH_EVENT', author, commitMsg, '', 'SUCCESS');

        this.io.emit('activity_update', {
          type: 'COMMIT_PUSHED',
          author,
          commitMsg,
          commitUrl,
          time: new Date().toLocaleTimeString('id-ID'),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed securely',
      processedCount: commits.length,
    });
  };

  public handleSimulate = async (req: Request, res: Response): Promise<void> => {
    const defaultDev = this.config.githubRepo.split('/')[0] || 'denoyey';
    const { developer, message = 'Fix bug tombol login [done #TASK-02]' } = req.body;

    const commitMsg = this.parserService.sanitizeCommitMessage(message);
    const taskCode = this.parserService.extractTaskCode(commitMsg);

    // Syarat penentuan author penguji commit:
    // 1. Jika developer dikirim eksplisit oleh klien/UI
    // 2. Jika tidak ada dan pesan memuat taskCode, deteksi otomatis assignee kartu tugas di database
    // 3. Fallback ke default repository owner
    let targetAuthor = developer ? this.parserService.sanitizeAuthor(developer) : '';

    if (!targetAuthor && taskCode) {
      const task = await this.taskRepo.findByCode(taskCode);
      if (task && task.assignee) {
        targetAuthor = this.parserService.sanitizeAuthor(task.assignee);
      }
    }

    if (!targetAuthor) {
      targetAuthor = this.parserService.sanitizeAuthor(defaultDev);
    }

    const author = targetAuthor;
    const simulatedCommitUrl = `https://github.com/${this.config.githubRepo}/commit/7a8b9c1`;

    if (taskCode) {
      const task = await this.taskRepo.findByCode(taskCode);
      const taskTitle = task ? task.title : 'Integrasi Fitur';
      const oldStatus = task ? task.status : 'In Progress';

      await this.taskRepo.updateStatus(taskCode, 'Done');
      await this.memberRepo.incrementStats(author, true);
      await this.logRepo.record('TASK_COMPLETED', author, commitMsg, taskCode, 'SUCCESS');

      await this.trelloService.moveCardToDone(taskCode, commitMsg, simulatedCommitUrl);
      await this.discordService.sendTaskCompletion({
        developer: author,
        taskCode,
        taskTitle,
        commitMsg,
        commitUrl: simulatedCommitUrl,
        oldStatus,
        newStatus: 'Done',
      });

      this.io.emit('activity_update', {
        type: 'TASK_COMPLETED',
        author,
        taskCode,
        taskTitle,
        commitMsg,
        commitUrl: simulatedCommitUrl,
        time: new Date().toLocaleTimeString('id-ID'),
      });
    } else {
      await this.memberRepo.incrementStats(author, false);
      await this.logRepo.record('PUSH_EVENT', author, commitMsg, '', 'SUCCESS');

      this.io.emit('activity_update', {
        type: 'COMMIT_PUSHED',
        author,
        commitMsg,
        commitUrl: simulatedCommitUrl,
        time: new Date().toLocaleTimeString('id-ID'),
      });
    }

    res.status(200).json({
      success: true,
      taskCode,
      message: 'Simulated commit executed safely',
    });
  };
}

