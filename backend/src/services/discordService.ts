import axios from 'axios';
import { config } from '../config/env.js';

interface DiscordTaskNotification {
  developer: string;
  taskCode: string;
  taskTitle: string;
  commitMsg: string;
  commitUrl?: string;
  oldStatus?: string;
  newStatus?: string;
}

export async function sendDiscordNotification(data: DiscordTaskNotification): Promise<boolean> {
  const webhookUrl = config.discord.webhookUrl;

  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.log('[Discord] Webhook URL belum diisi di .env. Melewati pengiriman Discord.');
    return false;
  }

  try {
    const embed = {
      title: '✅ Tugas Selesai Otomatis! [SI-PATIR]',
      color: 0x2ecc71, // Green color
      description: `Commit terbaru dari **${data.developer}** telah menyelesaikan kartu tugas proyek.`,
      fields: [
        {
          name: '👤 Developer',
          value: `\`${data.developer}\``,
          inline: true,
        },
        {
          name: '📌 Tugas Trello',
          value: `**${data.taskCode}** - ${data.taskTitle}\n\`${data.oldStatus || 'In Progress'}\` ➔ \`${data.newStatus || 'Done'}\``,
          inline: false,
        },
        {
          name: '💬 Pesan Commit',
          value: `> *"${data.commitMsg}"*`,
          inline: false,
        },
        {
          name: '🔗 Bukti Commit GitHub',
          value: data.commitUrl ? `[Lihat Perubahan di GitHub](${data.commitUrl})` : `*Commit lokal tervalidasi*`,
          inline: false,
        },
      ],
      footer: {
        text: 'SI-PATIR • DevOps Lite Integration System',
      },
      timestamp: new Date().toISOString(),
    };

    await axios.post(webhookUrl, {
      username: 'DevSync Bot (SI-PATIR)',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/906/906324.png',
      embeds: [embed],
    });

    console.log(`[Discord] Berhasil mengirim notifikasi tugas ${data.taskCode} ke Discord!`);
    return true;
  } catch (error: any) {
    console.error('[Discord] Gagal mengirim ke Discord webhook:', error.response?.data || error.message);
    return false;
  }
}

