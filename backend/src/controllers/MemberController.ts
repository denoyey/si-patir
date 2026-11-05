import { Request, Response } from 'express';
import { MemberRepository } from '../database/repositories/MemberRepository.js';

export class MemberController {
  private memberRepo: MemberRepository;

  constructor() {
    this.memberRepo = new MemberRepository();
  }

  public getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const members = await this.memberRepo.findAll();
      res.status(200).json(members);
    } catch {
      res.status(500).json({ success: false, error: 'Failed to retrieve members' });
    }
  };
}

