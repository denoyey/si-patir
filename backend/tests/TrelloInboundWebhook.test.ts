import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookController } from '../src/controllers/WebhookController.js';
import { TaskRepository } from '../src/database/repositories/TaskRepository.js';
import { DatabaseService } from '../src/database/DatabaseService.js';
import { Server as SocketServer } from 'socket.io';

describe('Trello Inbound Webhook Listener (Task 3.7 - Fatir)', () => {
  let webhookController: WebhookController;
  let taskRepo: TaskRepository;
  let dbService: DatabaseService;
  let mockIo: any;

  beforeEach(() => {
    dbService = DatabaseService.getInstance();
    taskRepo = new TaskRepository();

    mockIo = {
      emit: () => {},
    };

    webhookController = new WebhookController(mockIo as SocketServer);

    // Setup dummy test task in memory
    const memoryTasks = dbService.getMemoryTasks();
    const existing = memoryTasks.find((t) => t.task_code === 'TASK-02');
    if (existing) {
      existing.status = 'In Progress';
    } else {
      memoryTasks.push({
        id: 2,
        task_code: 'TASK-02',
        title: 'Integrasi Papan Kanban Trello',
        status: 'In Progress',
        assignee: 'Patirparkerr',
      });
    }
  });

  it('Handshake: harus merespon 200 OK untuk request HEAD/GET validasi webhook Trello', () => {
    let statusCode = 0;
    let bodySent = '';

    const mockReq: any = {};
    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          send: (body: string) => {
            bodySent = body;
          },
        };
      },
    };

    webhookController.handleTrelloWebhookValidation(mockReq, mockRes);
    expect(statusCode).toBe(200);
    expect(bodySent).toBe('OK');
  });

  it('Inbound Move: harus memindahkan status tugas ke "Done" saat kartu digeser ke list Done di Trello', async () => {
    let statusCode = 0;
    let jsonResponse: any = null;

    const mockReq: any = {
      body: {
        action: {
          id: 'action-test-123',
          type: 'updateCard',
          memberCreator: {
            username: 'patirparkerr',
            fullName: 'Fatir',
          },
          data: {
            card: {
              id: '6aeda6d293f584ec047b6396',
              name: 'Integrasi Papan Kanban Trello [#TASK-02]',
            },
            listBefore: {
              id: 'list-prog',
              name: 'in progress',
            },
            listAfter: {
              id: 'list-done',
              name: 'Done',
            },
          },
        },
      },
    };

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          },
        };
      },
    };

    await webhookController.handleTrelloWebhook(mockReq, mockRes);

    expect(statusCode).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.status).toBe('Done');

    const updatedTask = await taskRepo.findByCode('TASK-02');
    expect(updatedTask?.status).toBe('Done');
  });

  it('Inbound Move: harus memindahkan status tugas ke "In Progress" saat kartu digeser ke kolom in progress', async () => {
    // Set status ke To Do dulu
    await taskRepo.updateStatus('TASK-02', 'To Do');

    let statusCode = 0;
    let jsonResponse: any = null;

    const mockReq: any = {
      body: {
        action: {
          id: 'action-test-456',
          type: 'updateCard',
          memberCreator: {
            username: 'patirparkerr',
          },
          data: {
            card: {
              id: '6aeda6d293f584ec047b6396',
              name: 'Integrasi Papan Kanban Trello [#TASK-02]',
            },
            listBefore: {
              name: 'To Do',
            },
            listAfter: {
              name: 'in progress',
            },
          },
        },
      },
    };

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          },
        };
      },
    };

    await webhookController.handleTrelloWebhook(mockReq, mockRes);

    expect(statusCode).toBe(200);
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.status).toBe('In Progress');

    const updatedTask = await taskRepo.findByCode('TASK-02');
    expect(updatedTask?.status).toBe('In Progress');
  });

  it('Acknowledge: harus tetap merespon 200 OK untuk event Trello tanpa kode tugas atau tipe event lain', async () => {
    let statusCode = 0;
    let jsonResponse: any = null;

    const mockReq: any = {
      body: {
        action: {
          type: 'commentCard',
          data: {
            card: {
              name: 'Random Card Without Task Code',
            },
          },
        },
      },
    };

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          },
        };
      },
    };

    await webhookController.handleTrelloWebhook(mockReq, mockRes);
    expect(statusCode).toBe(200);
    expect(jsonResponse.success).toBe(true);
  });
});
