import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { ProjectRepository } from '../database/repositories/ProjectRepository.js';

export class ProjectController {
  private projectRepo: ProjectRepository;
  private io?: SocketServer;

  constructor(io?: SocketServer) {
    this.projectRepo = new ProjectRepository();
    this.io = io;
  }

  public getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await this.projectRepo.findAll();
      res.status(200).json({ success: true, projects });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Gagal mengambil daftar proyek: ' + err.message });
    }
  };

  public getActiveProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await this.projectRepo.findActive();
      if (!project) {
        res.status(404).json({ success: false, error: 'Tidak ada proyek aktif yang ditemukan.' });
        return;
      }
      res.status(200).json({ success: true, project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Gagal mengambil proyek aktif: ' + err.message });
    }
  };

  public getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const numId = parseInt(idParam, 10);
      if (isNaN(numId)) {
        res.status(400).json({ success: false, error: 'ID proyek harus berupa angka.' });
        return;
      }

      const project = await this.projectRepo.findById(numId);
      if (!project) {
        res.status(404).json({ success: false, error: `Proyek dengan ID ${numId} tidak ditemukan.` });
        return;
      }

      res.status(200).json({ success: true, project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        slug,
        github_repo,
        github_webhook_secret,
        trello_board_id,
        trello_done_list_id,
        discord_webhook_url,
        is_active = false,
      } = req.body;

      if (!name || !github_repo) {
        res.status(400).json({
          success: false,
          error: 'Nama proyek (name) dan repositori GitHub (github_repo) wajib diisi.',
        });
        return;
      }

      const project = await this.projectRepo.create({
        name: name.trim(),
        slug: slug ? slug.trim() : '',
        github_repo: github_repo.trim(),
        github_webhook_secret: github_webhook_secret ? github_webhook_secret.trim() : undefined,
        trello_board_id: trello_board_id ? trello_board_id.trim() : undefined,
        trello_done_list_id: trello_done_list_id ? trello_done_list_id.trim() : undefined,
        discord_webhook_url: discord_webhook_url ? discord_webhook_url.trim() : undefined,
        is_active: Boolean(is_active),
      });

      if (!project) {
        res.status(500).json({ success: false, error: 'Gagal membuat proyek baru di database.' });
        return;
      }

      this.io?.emit('project_updated', { type: 'PROJECT_CREATED', project });

      res.status(201).json({
        success: true,
        message: `Proyek "${project.name}" berhasil didaftarkan.`,
        project,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const numId = parseInt(idParam, 10);
      if (isNaN(numId)) {
        res.status(400).json({ success: false, error: 'ID proyek tidak valid.' });
        return;
      }

      const updated = await this.projectRepo.update(numId, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: `Proyek dengan ID ${numId} tidak ditemukan.` });
        return;
      }

      this.io?.emit('project_updated', { type: 'PROJECT_UPDATED', project: updated });

      res.status(200).json({
        success: true,
        message: `Konfigurasi proyek "${updated.name}" berhasil diperbarui.`,
        project: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public setActiveProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const numId = parseInt(idParam, 10);
      if (isNaN(numId)) {
        res.status(400).json({ success: false, error: 'ID proyek tidak valid.' });
        return;
      }

      const activeProject = await this.projectRepo.setActive(numId);
      if (!activeProject) {
        res.status(404).json({ success: false, error: `Proyek ID ${numId} tidak ditemukan.` });
        return;
      }

      this.io?.emit('project_updated', { type: 'PROJECT_ACTIVATED', project: activeProject });

      res.status(200).json({
        success: true,
        message: `Proyek aktif berhasil dialihkan ke "${activeProject.name}".`,
        project: activeProject,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const numId = parseInt(idParam, 10);
      if (isNaN(numId)) {
        res.status(400).json({ success: false, error: 'ID proyek tidak valid.' });
        return;
      }

      if (numId === 1) {
        res.status(403).json({
          success: false,
          error: 'Proyek default SI-PATIR (ID: 1) dilindungi dan tidak dapat dihapus.',
        });
        return;
      }

      const deleted = await this.projectRepo.delete(numId);
      if (!deleted) {
        res.status(404).json({ success: false, error: `Proyek ID ${numId} tidak ditemukan atau gagal dihapus.` });
        return;
      }

      this.io?.emit('project_updated', { type: 'PROJECT_DELETED', projectId: numId });

      res.status(200).json({
        success: true,
        message: `Proyek ID ${numId} berhasil dihapus.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

