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

export const OFFICIAL_TEAM_COLLABORATORS = [
  { name: 'Deni', username: 'denoyey', defaultCommits: 18, defaultTasksDone: 2 },
  { name: 'Rafli', username: 'muhamadrafli16', defaultCommits: 0, defaultTasksDone: 1 },
  { name: 'Fatir', username: 'Patirparkerr', defaultCommits: 0, defaultTasksDone: 1 },
  { name: 'Fajri', username: 'AATTTRAWRRR', defaultCommits: 0, defaultTasksDone: 0 },
];

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
          'User-Agent': 'SI-PATIR-Integration-Engine',
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
          'User-Agent': 'SI-PATIR-Integration-Engine',
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
    // 1. Bersihkan data dummy lama (Andi, Budi, Citra, Doni)
    await this.memberRepo.clearDummyMembers();

    // 2. Fetch kontributor asli dari GitHub API
    const contributors = await this.fetchContributors();
    const synced = [];

    // 3. Pastikan 4 kolaborator resmi terdaftar dengan data commit asli GitHub jika ada
    for (const official of OFFICIAL_TEAM_COLLABORATORS) {
      const matched = contributors.find(
        (c) => c.login.toLowerCase() === official.username.toLowerCase()
      );
      const commitCount = matched ? matched.contributions : official.defaultCommits;
      const member = await this.memberRepo.upsertContributor(
        official.username,
        commitCount,
        official.name,
        official.defaultTasksDone
      );
      synced.push(member);
    }

    // 4. Daftarkan kontributor GitHub lain jika ada di luar tim resmi
    for (const c of contributors) {
      const isOfficial = OFFICIAL_TEAM_COLLABORATORS.some(
        (o) => o.username.toLowerCase() === c.login.toLowerCase()
      );
      if (!isOfficial) {
        const member = await this.memberRepo.upsertContributor(c.login, c.contributions);
        synced.push(member);
      }
    }

    console.log(
      `[GitHubIntegrationService] Berhasil menyinkronkan ${synced.length} kolaborator asli GitHub untuk ${this.config.githubRepo}`
    );
    return { success: true, count: synced.length, members: synced };
  }
}
