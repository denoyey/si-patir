import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRepository } from '../src/database/repositories/TaskRepository.js';
import { DatabaseService } from '../src/database/DatabaseService.js';

describe('TaskStatusFlow Unit & Integration Tests', () => {
  let taskRepo: TaskRepository;
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = DatabaseService.getInstance();
    taskRepo = new TaskRepository();

    // Reset state tugas in-memory untuk pengujian flow yang deterministik
    const memoryTasks = dbService.getMemoryTasks();
    const targetTask = memoryTasks.find((t) => t.task_code === 'TASK-TEST-FLOW');
    if (!targetTask) {
      memoryTasks.push({
        id: 999,
        task_code: 'TASK-TEST-FLOW',
        title: 'Tugas Pengujian Alur Transisi Status',
        status: 'To Do',
        assignee: 'AATTTRAWRRR',
      });
    } else {
      targetTask.status = 'To Do';
    }
  });

  describe('Alur Transisi Status Tugas (To Do -> In Progress -> Done)', () => {
    it('Langkah 1: Status awal tugas harus "To Do"', async () => {
      const task = await taskRepo.findByCode('TASK-TEST-FLOW');
      expect(task).not.toBeNull();
      expect(task?.status).toBe('To Do');
    });

    it('Langkah 2: Transisi status dari "To Do" menjadi "In Progress"', async () => {
      const updated = await taskRepo.updateStatus('TASK-TEST-FLOW', 'In Progress');
      expect(updated).toBe(true);

      const task = await taskRepo.findByCode('TASK-TEST-FLOW');
      expect(task?.status).toBe('In Progress');
    });

    it('Langkah 3: Transisi status dari "In Progress" menjadi "Done" (Otomasi Commit Git)', async () => {
      // Pindahkan ke In Progress terlebih dahulu
      await taskRepo.updateStatus('TASK-TEST-FLOW', 'In Progress');

      // Pemicu sinyal commit [done #TASK-TEST-FLOW]
      const updatedToDone = await taskRepo.updateStatus('TASK-TEST-FLOW', 'Done');
      expect(updatedToDone).toBe(true);

      const task = await taskRepo.findByCode('TASK-TEST-FLOW');
      expect(task?.status).toBe('Done');
    });

    it('harus mendukung pencarian kode tugas yang case-insensitive (huruf kecil maupun besar)', async () => {
      const taskUpper = await taskRepo.findByCode('TASK-TEST-FLOW');
      const taskLower = await taskRepo.findByCode('task-test-flow');

      expect(taskUpper).not.toBeNull();
      expect(taskLower).not.toBeNull();
      expect(taskUpper?.id).toBe(taskLower?.id);
    });

    it('harus mengembalikan false jika mencoba memperbarui kode tugas yang tidak terdaftar', async () => {
      const nonExistentResult = await taskRepo.updateStatus('TASK-GHAIB-404', 'Done');
      expect(nonExistentResult).toBe(false);

      const searchResult = await taskRepo.findByCode('TASK-GHAIB-404');
      expect(searchResult).toBeNull();
    });

    it('harus idempotent saat tugas yang sudah "Done" diperbarui kembali ke "Done"', async () => {
      await taskRepo.updateStatus('TASK-TEST-FLOW', 'Done');
      const secondUpdate = await taskRepo.updateStatus('TASK-TEST-FLOW', 'Done');

      expect(secondUpdate).toBe(true);
      const task = await taskRepo.findByCode('TASK-TEST-FLOW');
      expect(task?.status).toBe('Done');
    });
  });
});

