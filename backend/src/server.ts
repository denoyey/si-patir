import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
import { config } from './config/env.js';
import {
  initDatabase,
  getMembers,
  getTasks,
  getLogs,
  recordCommitAndTask,
  isDbConnected,
} from './config/database.js';
import { extractTaskCode } from './services/webhookParser.js';
import { sendDiscordNotification } from './services/discordService.js';
import { moveTrelloCard, fetchTrelloCards } from './services/trelloService.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Verify GitHub HMAC signature if header exists
function verifyGitHubSignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature || !config.github.webhookSecret) return true; // allow if no secret required

  try {
    const hmac = crypto.createHmac('sha256', config.github.webhookSecret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

// 1. GitHub Webhook / Local Git Hook Endpoint
app.post('/api/webhooks/github', async (req: Request, res: Response) => {
  console.log('[Webhook] Menerima push event...');

  // Security check
  if (!verifyGitHubSignature(req)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  const payload = req.body;
  const commits = payload.commits || (payload.message ? [payload] : []);

  if (commits.length === 0) {
    return res.json({ message: 'No commits detected in payload' });
  }

  const tasks = await getTasks();

  for (const commit of commits) {
    const commitMsg = commit.message || '';
    const author = commit.author?.username || commit.author?.name || payload.pusher?.name || 'unknown_dev';
    const commitUrl = commit.url || '';

    const taskCode = extractTaskCode(commitMsg);

    if (taskCode) {
      console.log(`[Webhook] Terdeteksi penyelesaian tugas: ${taskCode} oleh ${author}`);
      const matchingTask = tasks.find((t) => t.task_code.toUpperCase() === taskCode.toUpperCase());
      const taskTitle = matchingTask ? matchingTask.title : 'Integrasi Proyek';

      // 1. Pindahkan kartu Trello
      await moveTrelloCard(taskCode, commitMsg, commitUrl);

      // 2. Kirim notifikasi ke Discord
      await sendDiscordNotification({
        developer: author,
        taskCode: taskCode,
        taskTitle: taskTitle,
        commitMsg: commitMsg,
        commitUrl: commitUrl,
        oldStatus: matchingTask?.status || 'In Progress',
        newStatus: 'Done',
      });

      // 3. Update database MySQL & Memory
      await recordCommitAndTask(author, taskCode, commitMsg);

      // 4. Pancarkan live update ke Frontend via Socket.io
      io.emit('activity_update', {
        type: 'TASK_COMPLETED',
        author,
        taskCode,
        taskTitle,
        commitMsg,
        commitUrl,
        time: new Date().toLocaleTimeString('id-ID'),
      });
    } else {
      // Regular commit without task code
      await recordCommitAndTask(author, null, commitMsg);

      io.emit('activity_update', {
        type: 'COMMIT_PUSHED',
        author,
        commitMsg,
        commitUrl,
        time: new Date().toLocaleTimeString('id-ID'),
      });
    }
  }

  return res.json({
    success: true,
    message: 'Webhook processed successfully',
    commitsCount: commits.length,
  });
});

// 2. Simulator Endpoint (Untuk Pengujian & Demo 1-Klik)
app.post('/api/simulate-commit', async (req: Request, res: Response) => {
  const { developer = 'budi99', message = 'Fix bug tombol login [done #TASK-02]' } = req.body;

  console.log(`[Simulasi] Memicu commit simulasi dari ${developer}: "${message}"`);

  const taskCode = extractTaskCode(message);
  const tasks = await getTasks();
  const matchingTask = taskCode
    ? tasks.find((t) => t.task_code.toUpperCase() === taskCode.toUpperCase())
    : null;
  const taskTitle = matchingTask ? matchingTask.title : 'Integrasi Fitur';

  if (taskCode) {
    await moveTrelloCard(taskCode, message);
    await sendDiscordNotification({
      developer,
      taskCode,
      taskTitle,
      commitMsg: message,
      commitUrl: 'https://github.com/kelompok-sipatir/project/commit/7a8b9c1',
      oldStatus: matchingTask?.status || 'In Progress',
      newStatus: 'Done',
    });
    await recordCommitAndTask(developer, taskCode, message);

    io.emit('activity_update', {
      type: 'TASK_COMPLETED',
      author: developer,
      taskCode,
      taskTitle,
      commitMsg: message,
      commitUrl: 'https://github.com/kelompok-sipatir/project/commit/7a8b9c1',
      time: new Date().toLocaleTimeString('id-ID'),
    });
  } else {
    await recordCommitAndTask(developer, null, message);
    io.emit('activity_update', {
      type: 'COMMIT_PUSHED',
      author: developer,
      commitMsg: message,
      time: new Date().toLocaleTimeString('id-ID'),
    });
  }

  return res.json({
    success: true,
    taskCode,
    message: 'Simulated commit executed successfully',
  });
});

// 3. API Status Koneksi
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    mysql: isDbConnected(),
    trello: Boolean(config.trello.apiKey && config.trello.token && config.trello.doneListId),
    discord: Boolean(config.discord.webhookUrl),
    github: true,
    serverTime: new Date().toISOString(),
  });
});

// 4. API Members (Klasemen Kontribusi)
app.get('/api/members', async (req: Request, res: Response) => {
  const members = await getMembers();
  res.json(members);
});

// 5. API Tasks (Daftar Tugas)
app.get('/api/tasks', async (req: Request, res: Response) => {
  const tasks = await getTasks();
  res.json(tasks);
});

// 6. API Logs (Live Activity Logs)
app.get('/api/logs', async (req: Request, res: Response) => {
  const logs = await getLogs();
  res.json(logs);
});

// 7. Sync Tugas dari Trello
app.post('/api/tasks/sync', async (req: Request, res: Response) => {
  const cards = await fetchTrelloCards();
  if (cards) {
    // Process synced cards
    return res.json({ success: true, message: 'Berhasil sinkronisasi kartu dari Trello', count: cards.length });
  }
  return res.json({ success: true, message: 'Sinkronisasi selesai (menggunakan data lokal/cache)' });
});

// Socket.io connection logging
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = config.port;
server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 SI-PATIR Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 GitHub Webhook Endpoint: http://localhost:${PORT}/api/webhooks/github`);
  console.log(`=======================================================`);
  await initDatabase();
});

