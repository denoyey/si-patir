import { Request, Response } from 'express';
import { MemberRepository } from '../database/repositories/MemberRepository.js';
import { GitHubIntegrationService } from '../services/GitHubIntegrationService.js';

export class MemberController {
  private memberRepo: MemberRepository;
  private githubService: GitHubIntegrationService;

  constructor() {
    this.memberRepo = new MemberRepository();
    this.githubService = new GitHubIntegrationService();
  }

  public getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const members = await this.memberRepo.findAll();
      res.status(200).json(members);
    } catch {
      res.status(500).json({ success: false, error: 'Failed to retrieve members' });
    }
  };

  public getMemberByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const usernameParam = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
      const member = await this.memberRepo.findByUsername(usernameParam);
      if (!member) {
        res.status(404).json({ success: false, error: `Anggota dengan username "${usernameParam}" tidak ditemukan.` });
        return;
      }
      res.status(200).json({ success: true, member });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public syncFromGitHub = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.githubService.syncRealContributors();
      const updatedMembers = await this.memberRepo.findAll();
      res.status(200).json({
        success: true,
        message: `Berhasil menyinkronkan ${result.count} kontributor asli dari GitHub.`,
        members: updatedMembers,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public createMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, username } = req.body;
      if (!name || !username) {
        res.status(400).json({ success: false, error: 'Nama dan username GitHub wajib diisi' });
        return;
      }
      const member = await this.memberRepo.createMember(name, username);
      res.status(201).json({ success: true, member });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public clearDummy = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.memberRepo.clearDummyMembers();
      const members = await this.memberRepo.findAll();
      res.status(200).json({ success: true, members });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
