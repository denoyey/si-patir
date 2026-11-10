-- ====================================================================
-- SI-PATIR: Official Database Schema & Team Seeder
-- Penanggung Jawab: Fatir (@Patirparkerr) - Database Engineer
-- Target Database: MySQL (InnoDB, utf8mb4)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `sipatir_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sipatir_db`;

-- 1. Tabel Anggota Tim (Members)
CREATE TABLE IF NOT EXISTS `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `github_username` VARCHAR(100) NOT NULL UNIQUE,
  `total_commits` INT DEFAULT 0,
  `tasks_done` INT DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_commits` (`total_commits` DESC),
  INDEX `idx_username` (`github_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Kartu Tugas (Tasks)
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `task_code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `status` ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
  `trello_card_id` VARCHAR(100) NULL,
  `assignee` VARCHAR(100) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_task_code` (`task_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Log Aktivitas (Activity Logs) - Index Tuned for High-Throughput
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `commit_message` TEXT NOT NULL,
  `task_code` VARCHAR(50) NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_created` (`created_at` DESC),
  INDEX `idx_task_created` (`task_code`, `created_at` DESC),
  INDEX `idx_author_created` (`author`, `created_at` DESC),
  INDEX `idx_event_status` (`event_type`, `status`),
  INDEX `idx_commit_msg` (`commit_message`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- SEED DATA 4 ANGGOTA NYATA TIM & TUGAS AWAL
-- ====================================================================

-- Seed Anggota Tim Resmi
INSERT INTO `members` (`name`, `github_username`, `total_commits`, `tasks_done`)
VALUES 
  ('Deni', 'denoyey', 18, 2),
  ('Rafli', 'muhamadrafli16', 0, 1),
  ('Fatir', 'Patirparkerr', 0, 1),
  ('Fajri', 'AATTTRAWRRR', 0, 0)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `total_commits` = VALUES(`total_commits`),
  `tasks_done` = VALUES(`tasks_done`);

-- Seed Tugas Proyek Awal
INSERT INTO `tasks` (`task_code`, `title`, `status`, `assignee`)
VALUES 
  ('TASK-01', 'Buat Database & Skema User', 'Done', 'denoyey'),
  ('TASK-02', 'Integrasi Papan Kanban Trello', 'Done', 'Patirparkerr'),
  ('TASK-03', 'Desain Layout Dashboard & UI Realtime', 'Done', 'muhamadrafli16'),
  ('TASK-04', 'Setup Webhook Handler & Logger HMAC', 'Done', 'denoyey'),
  ('TASK-05', 'Testing Otomasi QA & Security Rate Limiter', 'In Progress', 'AATTTRAWRRR')
ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `status` = VALUES(`status`),
  `assignee` = VALUES(`assignee`);

-- Seed Log Inisialisasi
INSERT INTO `activity_logs` (`event_type`, `author`, `commit_message`, `task_code`, `status`)
VALUES 
  ('PUSH_EVENT', 'system', 'SI-PATIR Secure Subsystem Initialized', '', 'SUCCESS');

