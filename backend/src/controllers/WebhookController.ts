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
import { ProjectRepository } from '../database/repositories/ProjectRepository.js';

export class WebhookController {
  private config: EnvironmentConfig;
  private securityService: WebhookSecurityService;
  private parserService: CommitParserService;
  private discordService: DiscordNotificationService;
  private trelloService: TrelloIntegrationService;
  private memberRepo: MemberRepository;
  private taskRepo: TaskRepository;
  private logRepo: ActivityLogRepository;
  private projectRepo: ProjectRepository;
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
    this.projectRepo = new ProjectRepository();
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

    // Identify project by payload repo or active project fallback
    const repoFullName = payload.repository?.full_name;
    let targetProject = repoFullName ? await this.projectRepo.findByRepo(repoFullName) : null;
    if (!targetProject) {
      targetProject = await this.projectRepo.findActive();
    }

    const trelloConfig = {
      boardId: targetProject?.trello_board_id,
      doneListId: targetProject?.trello_done_list_id,
    };
    const discordWebhookUrl = targetProject?.discord_webhook_url;

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

        // External System Integrations (Trello & Discord per Project)
        await this.trelloService.moveCardToDone(taskCode, commitMsg, commitUrl, trelloConfig);
        await this.discordService.sendTaskCompletion({
          developer: author,
          taskCode,
          taskTitle,
          commitMsg,
          commitUrl,
          oldStatus,
          newStatus: 'Done',
        }, discordWebhookUrl);

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
    const activeProject = await this.projectRepo.findActive();
    const currentRepo = activeProject?.github_repo || this.config.githubRepo;
    const defaultDev = currentRepo.split('/')[0] || 'denoyey';
    const { developer, message = 'Fix bug tombol login [done #TASK-02]' } = req.body;

    const commitMsg = this.parserService.sanitizeCommitMessage(message);
    const taskCode = this.parserService.extractTaskCode(commitMsg);

    const trelloConfig = {
      boardId: activeProject?.trello_board_id,
      doneListId: activeProject?.trello_done_list_id,
    };
    const discordWebhookUrl = activeProject?.discord_webhook_url;

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
    const commitSha = Math.random().toString(16).substring(2, 9);
    const commitUrl = `https://github.com/${currentRepo}/commit/${commitSha}`;

    if (taskCode) {
      const task = await this.taskRepo.findByCode(taskCode);
      const taskTitle = task ? task.title : 'Integrasi Fitur';

      await this.taskRepo.updateStatus(taskCode, 'Done');
      await this.memberRepo.incrementStats(author, true);
      await this.logRepo.record('TASK_COMPLETED', author, commitMsg, taskCode, 'SUCCESS');

      await this.trelloService.moveCardToDone(taskCode, commitMsg, commitUrl, trelloConfig);
      
      // Kirim notifikasi Discord jika penyelesaian tugas nyata
      if (req.body.notifyDiscord === true) {
        await this.discordService.sendTaskCompletion({
          taskCode,
          taskTitle,
          developer: author,
          commitMsg,
          commitUrl,
        }, discordWebhookUrl);
      }

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

    res.status(200).json({
      success: true,
      author,
      taskCode,
      commitMsg,
      commitUrl,
      message: 'Commit web berhasil diproses dan disinkronkan ke Trello & Database.',
    });
  };

  /**
   * Trello Webhook Handshake Validation (HEAD / GET)
   * Trello requires a 200 OK response upon webhook registration to confirm reachability.
   */
  public handleTrelloWebhookValidation = (_req: Request, res: Response): void => {
    res.status(200).send('OK');
  };

  /**
   * Trello Inbound Webhook Listener (POST)
   * Handles real-time card move/update events directly from Trello.com.
   * Updates task status in MySQL/Memory, recalculates metrics, logs activity, and emits Socket.io event.
   */
  public handleTrelloWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const action = payload?.action;

      if (!action) {
        res.status(200).json({ success: true, message: 'Acknowledged empty Trello event' });
        return;
      }

      const actionType = action.type;
      const data = action.data || {};
      const card = data.card;
      const memberCreator = action.memberCreator || {};
      const actorName = memberCreator.username || memberCreator.fullName || 'Trello User';

      console.log(`[WebhookController] 📥 Trello Inbound Event: ${actionType} oleh @${actorName}`);

      // Deteksi pergeseran kartu antar list di Trello
      if (actionType === 'updateCard' && card) {
        const cardName = card.name || '';
        const listAfterName = data.listAfter?.name || '';
        const listBeforeName = data.listBefore?.name || '';

        // Ekstraksi kode tugas e.g. "Integrasi Papan Kanban Trello [#TASK-02]"
        let taskCode = this.parserService.extractTaskCode(cardName);
        if (!taskCode) {
          const match = cardName.match(/#?(TASK-\d+)/i);
          if (match) taskCode = match[1].toUpperCase();
        }

        // Petakan nama kolom tujuan Trello ke status internal sistem
        let targetStatus: 'To Do' | 'In Progress' | 'Done' | null = null;
        const listLower = listAfterName.toLowerCase();

        if (listLower.includes('done') || listLower.includes('selesai')) {
          targetStatus = 'Done';
        } else if (listLower.includes('progress') || listLower.includes('doing') || listLower.includes('sedang')) {
          targetStatus = 'In Progress';
        } else if (listLower.includes('to do') || listLower.includes('todo') || listLower.includes('backlog')) {
          targetStatus = 'To Do';
        }

        if (taskCode && targetStatus) {
          const existingTask = await this.taskRepo.findByCode(taskCode);
          if (existingTask) {
            const oldStatus = existingTask.status;

            if (oldStatus !== targetStatus) {
              await this.taskRepo.updateStatus(taskCode, targetStatus);
              if (card.id) {
                await this.taskRepo.updateTrelloCardId(taskCode, card.id);
              }

              // Sinkronkan ulang akumulasi tasks_done anggota tim
              await this.memberRepo.recalculateTasksDone();

              const logMsg = `Trello Inbound: Kartu [${taskCode}] digeser dari "${listBeforeName || oldStatus}" ke "${listAfterName || targetStatus}" di Trello.com`;
              await this.logRepo.record('TRELLO_SYNC', actorName, logMsg, taskCode, 'SUCCESS');

              // Siarkan pembaruan real-time ke seluruh klien Dashboard
              this.io.emit('activity_update', {
                type: 'TRELLO_SYNC',
                author: actorName,
                taskCode,
                taskTitle: existingTask.title,
                oldStatus,
                newStatus: targetStatus,
                commitMsg: logMsg,
                time: new Date().toLocaleTimeString('id-ID'),
              });

              this.io.emit('tasks:changed');

              console.log(`[WebhookController] 🔄 Sinkronisasi berhasil: [${taskCode}] -> "${targetStatus}" dari Trello.com`);
              res.status(200).json({
                success: true,
                message: `Status tugas ${taskCode} berhasil diperbarui ke "${targetStatus}" dari Trello inbound webhook.`,
                taskCode,
                status: targetStatus,
              });
              return;
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Trello event acknowledged',
        actionType,
      });
    } catch (err: any) {
      console.error('[WebhookController] Trello Webhook Error:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

