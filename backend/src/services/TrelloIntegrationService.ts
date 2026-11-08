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

  public async fetchBoardLists(): Promise<{ id: string; name: string }[] | null> {
    const { trelloApiKey: key, trelloToken: token, trelloBoardId: boardId } = this.config;
    if (!key || !token || !boardId) return null;

    try {
      const res = await axios.get(`https://api.trello.com/1/boards/${boardId}/lists`, {
        params: { key, token },
        timeout: 5000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('[TrelloIntegrationService] Gagal fetch lists dari Trello:', err.message);
      return null;
    }
  }

  public async moveCardByStatus(
    cardIdOrTaskCode: string,
    targetStatus: 'To Do' | 'In Progress' | 'Done'
  ): Promise<{ success: boolean; message: string; targetListId?: string }> {
    const { trelloApiKey: key, trelloToken: token, trelloBoardId: boardId, trelloDoneListId: doneListId } = this.config;

    // Graceful fallback jika token belum diset
    if (!key || !token || !boardId) {
      console.log(`[TrelloIntegrationService] API keys belum dikonfigurasi. Simulasi gerak kartu ${cardIdOrTaskCode} ke ${targetStatus}.`);
      return {
        success: true,
        message: `[Simulasi] Kartu ${cardIdOrTaskCode} berhasil dipindahkan ke "${targetStatus}" di Trello.`,
      };
    }

    try {
      const lists = await this.fetchBoardLists();
      let targetListId = '';

      if (lists && lists.length > 0) {
        if (targetStatus === 'Done') {
          targetListId = lists.find((l) => l.name.toLowerCase().includes('done'))?.id || doneListId;
        } else if (targetStatus === 'In Progress') {
          targetListId = lists.find((l) => l.name.toLowerCase().includes('progress') || l.name.toLowerCase().includes('doing'))?.id || '';
        } else {
          targetListId = lists.find((l) => l.name.toLowerCase().includes('to do') || l.name.toLowerCase().includes('todo') || l.name.toLowerCase().includes('backlog'))?.id || '';
        }
      }

      if (!targetListId && targetStatus === 'Done') {
        targetListId = doneListId;
      }

      if (!targetListId) {
        return { success: false, message: `Kolom daftar Trello untuk status "${targetStatus}" tidak ditemukan.` };
      }

      let cardId = cardIdOrTaskCode;
      // Jika bukan 24 karakter hex Trello ID, cari kartu berdasarkan nama/kode
      if (!/^[0-9a-fA-F]{24}$/.test(cardIdOrTaskCode)) {
        const cards = await this.fetchBoardCards();
        const targetCard = cards?.find((c: any) =>
          c.name.toUpperCase().includes(cardIdOrTaskCode.toUpperCase())
        );
        if (!targetCard) {
          return { success: false, message: `Kartu ${cardIdOrTaskCode} tidak ditemukan di papan Trello.` };
        }
        cardId = targetCard.id;
      }

      await axios.put(
        `https://api.trello.com/1/cards/${cardId}`,
        null,
        {
          params: { idList: targetListId, key, token },
          timeout: 5000,
        }
      );

      return {
        success: true,
        message: `Kartu ${cardIdOrTaskCode} berhasil dipindahkan ke kolom "${targetStatus}" di Trello.`,
        targetListId,
      };
    } catch (err: any) {
      console.error('[TrelloIntegrationService] Gagal ubah status kartu di Trello:', err.response?.data || err.message);
      return { success: false, message: err.message };
    }
  }
}

