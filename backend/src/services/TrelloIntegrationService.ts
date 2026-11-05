import axios from 'axios';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';

export class TrelloIntegrationService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = EnvironmentConfig.getInstance();
  }

  public async moveCardToDone(
    taskCode: string,
    commitMsg: string,
    commitUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    const { trelloApiKey: key, trelloToken: token, trelloDoneListId: doneListId, trelloBoardId: boardId } = this.config;

    // Graceful fallback jika token belum diset saat demo offline
    if (!key || !token || !doneListId) {
      console.log(`[TrelloIntegrationService] API keys belum dikonfigurasi. Simulasi gerak kartu ${taskCode} aktif.`);
      return {
        success: true,
        message: `[Simulasi] Kartu ${taskCode} berhasil dipindahkan ke Done di Trello.`,
      };
    }

    try {
      // 1. Ambil kartu dari board untuk mencari ID kartu berdasarkan kode task
      const cardsResponse = await axios.get(`https://api.trello.com/1/boards/${boardId}/cards`, {
        params: { key, token },
        timeout: 5000,
      });

      const cards = cardsResponse.data;
      const targetCard = cards.find((c: any) =>
        c.name.toUpperCase().includes(taskCode.toUpperCase())
      );

      if (!targetCard) {
        return { success: false, message: `Kartu ${taskCode} tidak ditemukan di papan Trello.` };
      }

      // 2. Pindahkan kartu ke kolom Done
      await axios.put(
        `https://api.trello.com/1/cards/${targetCard.id}`,
        null,
        {
          params: { idList: doneListId, key, token },
          timeout: 5000,
        }
      );

      // 3. Beri komentar bukti penyelesaian commit
      const comment = `🤖 **SI-PATIR Engine**: Tugas otomatis ditutup via commit GitHub!\n\nPesan: "${commitMsg}"\nBukti: ${commitUrl || 'Commit tervalidasi'}`;
      await axios.post(
        `https://api.trello.com/1/cards/${targetCard.id}/actions/comments`,
        null,
        {
          params: { text: comment, key, token },
          timeout: 5000,
        }
      );

      return { success: true, message: `Kartu ${taskCode} berhasil dipindahkan ke Done.` };
    } catch (err: any) {
      console.error('[TrelloIntegrationService] Gagal update Trello:', err.response?.data || err.message);
      return { success: false, message: err.message };
    }
  }

  public async fetchBoardCards(): Promise<any[] | null> {
    const { trelloApiKey: key, trelloToken: token, trelloBoardId: boardId } = this.config;
    if (!key || !token || !boardId) return null;

    try {
      const res = await axios.get(`https://api.trello.com/1/boards/${boardId}/cards`, {
        params: { key, token },
        timeout: 5000,
      });
      return res.data;
    } catch {
      return null;
    }
  }
}

