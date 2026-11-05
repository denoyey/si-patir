import axios from 'axios';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';
import { ITaskNotificationDTO } from '../types/interfaces.js';

export class DiscordNotificationService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = EnvironmentConfig.getInstance();
  }

  public async sendTaskCompletion(dto: ITaskNotificationDTO): Promise<boolean> {
    const webhookUrl = this.config.discordWebhookUrl;

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      console.log('[DiscordNotificationService] Webhook URL belum diisi. Lewati dispatch.');
      return false;
    }

    try {
      const embedPayload = {
        title: '✅ Tugas Selesai Otomatis! [SI-PATIR]',
        color: 0x10b981, // Crisp Emerald Green
        description: `Commit terbaru dari **${dto.developer}** telah menyelesaikan kartu tugas proyek.`,
        fields: [
          {
            name: '👤 Developer',
            value: `\`${dto.developer}\``,
            inline: true,
          },
          {
            name: '📌 Tugas Trello',
            value: `**${dto.taskCode}** - ${dto.taskTitle}\n\`${dto.oldStatus || 'In Progress'}\` ➔ \`${dto.newStatus || 'Done'}\``,
            inline: false,
          },
          {
            name: '💬 Pesan Commit',
            value: `> *"${dto.commitMsg}"*`,
            inline: false,
          },
          {
            name: '🔗 Bukti Commit GitHub',
            value: dto.commitUrl ? `[Lihat Perubahan di GitHub](${dto.commitUrl})` : `*Commit lokal terverifikasi*`,
            inline: false,
          },
        ],
        footer: {
          text: 'SI-PATIR DevOps Lite Integration Engine',
        },
        timestamp: new Date().toISOString(),
      };

      await axios.post(
        webhookUrl,
        {
          username: 'SI-PATIR Bot',
          avatar_url: 'https://cdn-icons-png.flaticon.com/512/906/906324.png',
          embeds: [embedPayload],
        },
        {
          timeout: 5000, // 5 detik timeout agar backend tidak freeze
        }
      );

      console.log(`[DiscordNotificationService] Sukses dispatch notifikasi tugas ${dto.taskCode}`);
      return true;
    } catch (error: any) {
      console.error('[DiscordNotificationService] Error:', error.response?.data || error.message);
      return false;
    }
  }
}

