/**
 * SI-PATIR: Core Domain Interfaces & Types
 * Clean Architecture Entity Contracts
 */

export interface IMember {
  id: number;
  name: string;
  github_username: string;
  total_commits: number;
  tasks_done: number;
  updated_at?: string;
}

export interface ITask {
  id: number;
  task_code: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  trello_card_id?: string;
  assignee: string;
  updated_at?: string;
}

export interface IActivityLog {
  id: number;
  event_type: 'PUSH_EVENT' | 'TASK_COMPLETED' | 'TRELLO_SYNC' | 'SYSTEM_ALERT';
  author: string;
  commit_message: string;
  task_code?: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  created_at: string;
}

export interface IGitCommit {
  id?: string;
  message: string;
  author: {
    name: string;
    username?: string;
    email?: string;
  };
  url?: string;
  timestamp?: string;
}

export interface IWebhookPayload {
  ref?: string;
  before?: string;
  after?: string;
  repository?: {
    name: string;
    full_name: string;
    html_url: string;
  };
  pusher?: {
    name: string;
    email?: string;
  };
  commits?: IGitCommit[];
  message?: string; // local hook fallback
}

export interface ISystemStatus {
  mysql: boolean;
  trello: boolean;
  discord: boolean;
  github: boolean;
  repository: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: string;
}

export interface ITaskNotificationDTO {
  developer: string;
  taskCode: string;
  taskTitle: string;
  commitMsg: string;
  commitUrl?: string;
  oldStatus?: string;
  newStatus?: string;
}

export interface IProject {
  id: number;
  name: string;
  slug: string;
  github_repo: string;
  github_webhook_secret?: string;
  trello_board_id?: string;
  trello_done_list_id?: string;
  discord_webhook_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}


