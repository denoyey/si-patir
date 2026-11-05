import axios from 'axios';
import { config } from '../config/env.js';

export async function moveTrelloCard(taskCode: string, commitMsg: string, commitUrl?: string): Promise<{ success: boolean; message: string }> {
  const { apiKey, token, doneListId, boardId } = config.trello;

  // Check if Trello credentials are configured
  if (!apiKey || !token || !doneListId) {
    console.log(`[Trello] Credentials belum lengkap di .env. Mensimulasikan pemindahan kartu ${taskCode} ke 'Done'.`);
    return {
      success: true,
      message: `[Simulasi] Kartu ${taskCode} berhasil dipindahkan ke Done di Trello.`,
    };
  }

  try {
    // 1. Get all cards on the board to find the card with matching taskCode
    const cardsRes = await axios.get(`https://api.trello.com/1/boards/${boardId}/cards`, {
      params: { key: apiKey, token: token },
    });

    const cards = cardsRes.data;
    const targetCard = cards.find((c: any) =>
      c.name.toUpperCase().includes(taskCode.toUpperCase())
    );

    if (!targetCard) {
      console.warn(`[Trello] Kartu dengan kode ${taskCode} tidak ditemukan di papan Trello.`);
      return { success: false, message: `Kartu ${taskCode} tidak ditemukan di Trello.` };
    }

    // 2. Move the card to Done list
    await axios.put(`https://api.trello.com/1/cards/${targetCard.id}`, null, {
      params: {
        idList: doneListId,
        key: apiKey,
        token: token,
      },
    });

    // 3. Post a comment on the card with commit proof
    const commentText = `🤖 **SI-PATIR Bot**: Tugas otomatis selesai via commit GitHub!\n\nPesan Commit: "${commitMsg}"\nBukti: ${commitUrl || 'Commit tervalidasi'}`;
    await axios.post(`https://api.trello.com/1/cards/${targetCard.id}/actions/comments`, null, {
      params: {
        text: commentText,
        key: apiKey,
        token: token,
      },
    });

    console.log(`[Trello] Kartu "${targetCard.name}" berhasil dipindahkan ke kolom Done!`);
    return { success: true, message: `Kartu ${taskCode} berhasil dipindahkan ke Done.` };
  } catch (error: any) {
    console.error('[Trello] Error saat update kartu Trello:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
}

export async function fetchTrelloCards() {
  const { apiKey, token, boardId } = config.trello;
  if (!apiKey || !token || !boardId) {
    return null;
  }

  try {
    const res = await axios.get(`https://api.trello.com/1/boards/${boardId}/cards`, {
      params: { key: apiKey, token: token },
    });
    return res.data;
  } catch (error: any) {
    console.error('[Trello] Error fetching cards:', error.response?.data || error.message);
    return null;
  }
}

