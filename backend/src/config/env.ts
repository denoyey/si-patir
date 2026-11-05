import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'sipatir_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  },
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  },
  trello: {
    apiKey: process.env.TRELLO_API_KEY || '',
    token: process.env.TRELLO_TOKEN || '',
    boardId: process.env.TRELLO_BOARD_ID || '',
    doneListId: process.env.TRELLO_DONE_LIST_ID || '',
  },
  github: {
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || 'sipatir_secret_123',
  },
};

