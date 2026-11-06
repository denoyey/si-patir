import axios from 'axios';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';
import { MemberRepository } from '../database/repositories/MemberRepository.js';
import { TaskRepository } from '../database/repositories/TaskRepository.js';

export interface IGitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
}

export interface IGitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  user: {
    login: string;
  };
}

export class GitHubIntegrationService {
  private config: EnvironmentConfig;
  private memberRepo: MemberRepository;
  private taskRepo: TaskRepository;

  constructor() {
    this.config = EnvironmentConfig.getInstance();
    this.memberRepo = new MemberRepository();
    this.taskRepo = new TaskRepository();
  }

  /**
   * Mengambil kontributor asli dari repositori GitHub
   */
  public async fetchContributors(): Promise<IGitHubContributor[]> {
    const repo = this.config.githubRepo;
    try {
      const response = await axios.get(`https://api.github.com/repos/${repo}/contributors`, {
        headers: {
          'User-Agent': 'SI-PATIR-DevOps-Engine',
          Accept: 'application/vnd.github.v3+json',
        },
        timeout: 8000,
      });
      return response.data as IGitHubContributor[];
    } catch (err: any) {
      console.warn(`[GitHubIntegrationService] Gagal fetch kontributor dari ${repo}:`, err.message);
      return [];
    }
  }

  /**
   * Mengambil issue/PR asli dari repositori GitHub
   */
  public async fetchIssues(): Promise<IGitHubIssue[]> {
    const repo = this.config.githubRepo;
    try {
      const response = await axios.get(`https://api.github.com/repos/${repo}/issues?state=all`, {
        headers: {
          'User-Agent': 'SI-PATIR-DevOps-Engine',
          Accept: 'application/vnd.github.v3+json',
        },
        timeout: 8000,
      });
      return response.data as IGitHubIssue[];
    } catch (err: any) {
      console.warn(`[GitHubIntegrationService] Gagal fetch issues dari ${repo}:`, err.message);
      return [];
    }
  }

  /**
   * Sinkronisasi data kontributor nyata dari GitHub ke dalam Database
   */
  public async syncRealContributors(): Promise<{ success: boolean; count: number; members: any[] }> {
    const contributors = await this.fetchContributors();

    if (contributors.length === 0) {
      return { success: false, count: 0, members: [] };
    }

    // Bersihkan data dummy lama (Andi, Budi, Citra, Doni) jika ditemukan data asli GitHub
    await this.memberRepo.clearDummyMembers();

    const synced = [];
    for (const c of contributors) {
      // Upsert kontributor asli
      const member = await this.memberRepo.upsertContributor(c.login, c.contributions);
      synced.push(member);
    }

    console.log(`[GitHubIntegrationService] Berhasil menyinkronkan ${synced.length} developer asli dari GitHub ${this.config.githubRepo}`);
    return { success: true, count: synced.length, members: synced };
  }
}

