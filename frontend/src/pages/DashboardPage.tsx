import { useState, useEffect, useLayoutEffect, useMemo, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useGsapScope } from '../animations/hooks/useGsapScope';
import { LenisScrollEngine } from '../services/scroll/LenisScrollEngine';
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Trophy,
  CheckSquare,
  Database,
  Search,
  Activity,
  ShieldCheck,
  Plus,
  Trash2,
  Pencil,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Code2,
  Play,
  Download,
  Printer,
} from 'lucide-react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useNavbarVisibility } from '../services/scroll/hooks/useNavbarVisibility';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ApiExplorerModal } from '../components/ApiExplorerModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { ContributionChart } from '../components/ContributionChart';

function formatLogTime(timestamp: string): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return timestamp;
  }
}

function AvatarWithFallback({ username, name, className }: { username: string; name?: string; className?: string }) {
  const [error, setError] = useState(false);
  const initials = name
    ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : username.slice(0, 2).toUpperCase();

  const defaultClasses = "w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-zinc-300 dark:border-zinc-700 object-cover shrink-0 bg-zinc-200 dark:bg-zinc-800 shadow-xs";

  if (error || !username) {
    return (
      <div className={className || "w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 shrink-0 shadow-xs"}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://github.com/${username}.png?size=200`}
      alt={name || username}
      onError={() => setError(true)}
      className={className || defaultClasses}
      loading="lazy"
    />
  );
}

interface Member {
  id: number;
  name: string;
  github_username: string;
  total_commits: number;
  tasks_done: number;
}

interface Task {
  id: number;
  task_code: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee: string;
}

interface ActivityLog {
  id: number;
  event_type: string;
  author: string;
  commit_message: string;
  task_code?: string;
  status: string;
  created_at: string;
}

interface SystemStatus {
  mysql: boolean;
  trello: boolean;
  discord: boolean;
  github: boolean;
  repository?: string;
  uptime?: number;
  timestamp?: string;
}

export function DashboardPage() {
  const { containerRef, engine } = useGsapScope();
  const isNavbarVisible = useNavbarVisibility({ threshold: 60 });

  // Ensure dashboard starts at the top (0, 0) upon navigating to this page
  useLayoutEffect(() => {
    LenisScrollEngine.getInstance().resetToTop();
  }, []);

  // GSAP Animation Element References
  const totalCommitsRef = useRef<HTMLDivElement | null>(null);
  const totalDoneRef = useRef<HTMLDivElement | null>(null);
  const completionRateRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const toastRef = useRef<HTMLElement | null>(null);
  const topLogRef = useRef<HTMLDivElement | null>(null);
  const modalTaskRef = useRef<HTMLDivElement | null>(null);
  const modalTaskBackdropRef = useRef<HTMLDivElement | null>(null);
  const modalMemberRef = useRef<HTMLDivElement | null>(null);
  const modalMemberBackdropRef = useRef<HTMLDivElement | null>(null);
  const streamContainerRef = useRef<HTMLDivElement | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [status, setStatus] = useState<SystemStatus>({
    mysql: false,
    trello: true,
    discord: true,
    github: true,
    repository: 'denoyey/si-patir',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'In Progress' | 'Done' | 'To Do'>('ALL');
  const [isSyncingTrello, setIsSyncingTrello] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string } | null>(null);

  // Filament v5 Data Table Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);

  // Modals state for team management & API Explorer
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Live Webhook Stream Search & Filter State (Point 2.9)
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logAuthorFilter, setLogAuthorFilter] = useState<string>('ALL');

  // Active filter for developer in Leaderboard
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  // Form states
  const [newTaskCode, setNewTaskCode] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<'To Do' | 'In Progress' | 'Done'>('In Progress');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');

  // Integrated Web Git Terminal State
  const [selectedTerminalAuthor, setSelectedTerminalAuthor] = useState<string>('');
  const [terminalCommand, setTerminalCommand] = useState<string>(
    'git commit -m "Selesaikan implementasi fitur [done #TASK-01]"'
  );
  const [isTerminalSubmitting, setIsTerminalSubmitting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>(
    'SI-PATIR Web Git Terminal Ready. Ketik perintah git commit di bawah & tekan Kirim.'
  );

  // Sync Dropdown State
  const [isSyncMenuOpen, setIsSyncMenuOpen] = useState(false);
  const syncMenuRef = useRef<HTMLDivElement | null>(null);

  // Reusable custom confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });

  // Fetch initial system state
  const refreshData = async () => {
    try {
      const [membersRes, tasksRes, logsRes, statusRes] = await Promise.all([
        axios.get('/api/members'),
        axios.get('/api/tasks'),
        axios.get('/api/logs'),
        axios.get('/api/status'),
      ]);
      setMembers(membersRes.data);
      setTasks(tasksRes.data);
      setLogs(logsRes.data);
      setStatus(statusRes.data);
    } catch (err) {
      console.error('[SI-PATIR Client] Sync Failure:', err);
    }
  };

  useEffect(() => {
    refreshData();

    // WebSocket real-time subscription
    const socket = io();

    socket.on('activity_update', (event) => {
      if (event.type === 'TASK_COMPLETED') {
        setActiveToast({
          title: `Tugas #${event.taskCode} Selesai`,
          desc: `@${event.author || 'tim'} menutup tugas via commit. Papan Trello & Discord terupdate.`,
        });
        setTimeout(() => setActiveToast(null), 4500);
      } else if (event.type === 'TASK_STATUS_UPDATED') {
        setActiveToast({
          title: `Status #${event.taskCode} Diperbarui`,
          desc: `Status berhasil diubah ke "${event.status}" & tersinkronisasi ke Trello.`,
        });
        setTimeout(() => setActiveToast(null), 3500);
      } else if (event.type === 'TRELLO_SYNCED') {
        setActiveToast({
          title: 'Sinkronisasi Trello Berhasil',
          desc: `${event.count || 0} kartu dari papan Kanban Trello berhasil disinkronkan.`,
        });
        setTimeout(() => setActiveToast(null), 3500);
      } else if (event.type === 'TASK_CREATED') {
        setActiveToast({
          title: `Tugas Baru #${event.taskCode}`,
          desc: `"${event.title}" berhasil ditambahkan ke sistem.`,
        });
        setTimeout(() => setActiveToast(null), 3500);
      } else if (event.author && event.commitMsg) {
        setActiveToast({
          title: 'Commit Baru Diterima',
          desc: `@${event.author}: "${event.commitMsg}"`,
        });
        setTimeout(() => setActiveToast(null), 4000);
      }
      refreshData();
      streamContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

      // Highlight new log item with GSAP
      setTimeout(() => {
        if (topLogRef.current) {
          engine.animateLogArrival(topLogRef.current);
        }
      }, 120);
    });

    return () => {
      socket.disconnect();
    };
  }, [engine]);

  // Filter tasks based on search, status, and selected developer assignee
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.task_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchAssignee = !selectedAssignee || task.assignee.toLowerCase() === selectedAssignee.toLowerCase();

      return matchSearch && matchStatus && matchAssignee;
    });
  }, [tasks, searchQuery, statusFilter, selectedAssignee]);

  // Paginated tasks slice for Filament v5 Table
  const totalResults = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = totalResults === 0 ? 0 : (activePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalResults);
  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(startIndex, startIndex + perPage);
  }, [filteredTasks, startIndex, perPage]);

  // Unique authors for Live Stream filtering (Point 2.9)
  const logAuthors = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => set.add(m.github_username));
    logs.forEach((l) => set.add(l.author));
    return Array.from(set).filter(Boolean);
  }, [members, logs]);

  // Filtered Live Webhook Activity Stream (Point 2.9)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = logSearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        log.commit_message.toLowerCase().includes(q) ||
        log.author.toLowerCase().includes(q) ||
        log.event_type.toLowerCase().includes(q) ||
        (log.task_code && log.task_code.toLowerCase().includes(q));

      const matchAuthor =
        logAuthorFilter === 'ALL' || log.author.toLowerCase() === logAuthorFilter.toLowerCase();

      return matchSearch && matchAuthor;
    });
  }, [logs, logSearchQuery, logAuthorFilter]);

  // Save edited task details (Point 2.7)
  const handleSaveEditTask = async (
    taskId: number,
    data: { title: string; assignee: string; status: 'To Do' | 'In Progress' | 'Done' }
  ) => {
    const res = await axios.patch(`/api/v1/tasks/${taskId}`, data);
    setActiveToast({
      title: 'Tugas Berhasil Diperbarui',
      desc: res.data?.message || `Detail tugas #${taskId} berhasil disimpan.`,
    });
    setTimeout(() => setActiveToast(null), 3500);
    await refreshData();
  };

  // Export Sprint Report to CSV (Point 2.8)
  const handleExportCSV = () => {
    const lines: string[] = [];

    lines.push(`SI-PATIR - Laporan Sprint & Aktivitas Repositori`);
    lines.push(`Tanggal Export: ${new Date().toLocaleString('id-ID')}`);
    lines.push(`Target Repositori: ${status.repository || 'denoyey/si-patir'}`);
    lines.push(``);

    // Section 1: Members Summary
    lines.push(`=== KLASIFIKASI KONTRIBUSI ANGGOTA ===`);
    lines.push(`No,Nama,GitHub Username,Total Commit,Tugas Selesai`);
    members.forEach((m, idx) => {
      lines.push(`${idx + 1},"${m.name}","@${m.github_username}",${m.total_commits},${m.tasks_done}`);
    });
    lines.push(``);

    // Section 2: Tasks List
    lines.push(`=== DAFTAR KARTU TUGAS SPRINT KANBAN ===`);
    lines.push(`No,Kode Tugas,Judul Tugas,Penanggung Jawab,Status`);
    tasks.forEach((t, idx) => {
      lines.push(`${idx + 1},"#${t.task_code}","${t.title.replace(/"/g, '""')}","@${t.assignee}","${t.status}"`);
    });
    lines.push(``);

    // Section 3: Activity Logs
    lines.push(`=== RIWAYAT LOG AKTIVITAS WEBHOOK STREAM ===`);
    lines.push(`No,Waktu,Event,Author,Kode Tugas,Status,Pesan Commit`);
    logs.forEach((l, idx) => {
      lines.push(`${idx + 1},"${l.created_at}","${l.event_type}","@${l.author}","${l.task_code || '-'}","${l.status}","${l.commit_message.replace(/"/g, '""')}"`);
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-sprint-sipatir-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActiveToast({
      title: 'Laporan CSV Diunduh',
      desc: 'Berkas laporan-sprint-sipatir.csv berhasil dibuat dan diunduh.',
    });
    setTimeout(() => setActiveToast(null), 3500);
  };

  // Print or Export PDF (Point 2.8)
  const handlePrint = () => {
    window.print();
  };

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCommits = members.reduce((acc, m) => acc + m.total_commits, 0);
    const totalDone = tasks.filter((t) => t.status === 'Done').length;
    const completionRate = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;
    return { totalCommits, totalDone, completionRate };
  }, [members, tasks]);

  // Reactive GSAP Animations for Dynamic Metric Changes
  useEffect(() => {
    if (totalCommitsRef.current) {
      engine.animateStatCounter(totalCommitsRef.current, metrics.totalCommits);
    }
    if (totalDoneRef.current) {
      engine.animateStatCounter(totalDoneRef.current, metrics.totalDone);
    }
    if (completionRateRef.current) {
      engine.animateStatCounter(completionRateRef.current, metrics.completionRate, '%');
    }
    if (progressBarRef.current) {
      engine.animateProgressBar(progressBarRef.current, metrics.completionRate);
    }
  }, [metrics, engine]);

  // GSAP Modal Entrance Effects
  useEffect(() => {
    if (showAddTaskModal && modalTaskRef.current && modalTaskBackdropRef.current) {
      engine.animateModalEntrance(modalTaskRef.current, modalTaskBackdropRef.current);
    }
  }, [showAddTaskModal, engine]);

  useEffect(() => {
    if (showAddMemberModal && modalMemberRef.current && modalMemberBackdropRef.current) {
      engine.animateModalEntrance(modalMemberRef.current, modalMemberBackdropRef.current);
    }
  }, [showAddMemberModal, engine]);

  // GSAP Toast Entrance Effect
  useEffect(() => {
    if (activeToast && toastRef.current) {
      engine.animateToastEntrance(toastRef.current);
    }
  }, [activeToast, engine]);

  // Sync Dropdown Click-Outside & Keyboard Escape Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (syncMenuRef.current && !syncMenuRef.current.contains(event.target as Node)) {
        setIsSyncMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSyncMenuOpen(false);
      }
    };

    if (isSyncMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSyncMenuOpen]);

  // Sync real contributors from GitHub repository
  const handleSyncGitHub = async () => {
    setIsSyncingGitHub(true);
    try {
      const res = await axios.post('/api/members/sync-github');
      setActiveToast({
        title: 'GitHub Synced',
        desc: res.data.message || 'Kontributor nyata dari repositori berhasil disinkronkan.',
      });
      setTimeout(() => setActiveToast(null), 4000);
      await refreshData();
    } catch (err: any) {
      console.error('GitHub sync error:', err);
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // Sync tasks from Trello (bidirectional)
  const handleSyncTrello = async () => {
    setIsSyncingTrello(true);
    try {
      const res = await axios.post('/api/v1/tasks/sync-trello');
      await refreshData();
      setActiveToast({
        title: 'Trello Tersinkronisasi',
        desc: res.data.message || 'Kartu dan kolom dari papan Trello berhasil disinkronkan.',
      });
      setTimeout(() => setActiveToast(null), 4000);
    } catch (err: any) {
      console.error('Trello sync error:', err);
      setActiveToast({
        title: 'Gagal Sinkronisasi Trello',
        desc: err.response?.data?.error || err.message,
      });
      setTimeout(() => setActiveToast(null), 4000);
    } finally {
      setIsSyncingTrello(false);
    }
  };

  // Inline update task status with bidirectional Trello move
  const handleUpdateTaskStatus = async (taskId: number, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    setUpdatingTaskId(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await axios.patch(`/api/v1/tasks/${taskId}/status`, { status: newStatus });
      setActiveToast({
        title: 'Status Diperbarui',
        desc: res.data.message || `Tugas #${taskId} diubah ke "${newStatus}". Sinkronisasi Trello aktif.`,
      });
      setTimeout(() => setActiveToast(null), 3500);
      await refreshData();
    } catch (err: any) {
      console.error('Update status error:', err);
      setActiveToast({
        title: 'Gagal Mengubah Status',
        desc: err.response?.data?.error || err.message,
      });
      setTimeout(() => setActiveToast(null), 4000);
      await refreshData();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Clear dummy data and keep real data only
  const handleClearDummy = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Bersihkan Data Dummy',
      description: 'Hapus seluruh data dummy bawaan agar hanya tersisa anggota nyata dan data tersinkronisasi?',
      confirmText: 'Ya, Bersihkan',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await Promise.all([
            axios.post('/api/members/clear-dummy'),
            axios.post('/api/members/sync-github'),
          ]);
          await refreshData();
          setActiveToast({
            title: 'Data Bersih',
            desc: 'Hanya kontributor nyata dari GitHub yang dipertahankan.',
          });
          setTimeout(() => setActiveToast(null), 4000);
        } catch (err) {
          console.error('Clear dummy error:', err);
        }
      },
    });
  };

  // Create real task
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskCode || !newTaskTitle) return;

    try {
      await axios.post('/api/tasks', {
        taskCode: newTaskCode,
        title: newTaskTitle,
        assignee: newTaskAssignee || members[0]?.github_username || 'denoyey',
        status: newTaskStatus,
      });
      setShowAddTaskModal(false);
      setNewTaskCode('');
      setNewTaskTitle('');
      setNewTaskAssignee('');
      await refreshData();
      setActiveToast({
        title: 'Tugas Ditambahkan',
        desc: `Kartu [${newTaskCode}] berhasil didaftarkan ke sistem.`,
      });
      setTimeout(() => setActiveToast(null), 4000);
    } catch (err: any) {
      setActiveToast({
        title: 'Gagal Menambahkan Tugas',
        desc: err.response?.data?.error || 'Gagal menambahkan tugas ke database.',
      });
      setTimeout(() => setActiveToast(null), 4000);
    }
  };

  // Delete task
  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const taskLabel = taskToDelete ? `[${taskToDelete.task_code}] "${taskToDelete.title}"` : 'kartu tugas ini';

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kartu Tugas',
      description: `Apakah Anda yakin ingin menghapus ${taskLabel}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await axios.delete(`/api/tasks/${id}`);
          await refreshData();
          setActiveToast({
            title: 'Tugas Dihapus',
            desc: `Kartu ${taskToDelete ? `[${taskToDelete.task_code}]` : ''} berhasil dihapus dari sistem.`,
          });
          setTimeout(() => setActiveToast(null), 4000);
        } catch (err) {
          console.error('Delete task error:', err);
        }
      },
    });
  };

  // Create real team member
  const handleCreateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberUsername) return;

    try {
      await axios.post('/api/members', {
        name: newMemberName,
        username: newMemberUsername,
      });
      setShowAddMemberModal(false);
      setNewMemberName('');
      setNewMemberUsername('');
      await refreshData();
      setActiveToast({
        title: 'Anggota Ditambahkan',
        desc: `@${newMemberUsername} berhasil terdaftar di tim.`,
      });
      setTimeout(() => setActiveToast(null), 4000);
    } catch (err: any) {
      setActiveToast({
        title: 'Gagal Menambahkan Anggota',
        desc: err.response?.data?.error || 'Gagal menambahkan anggota ke database.',
      });
      setTimeout(() => setActiveToast(null), 4000);
    }
  };

  const handleExecuteTerminal = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!terminalCommand.trim() || isTerminalSubmitting) return;

    const effectiveAuthor = selectedTerminalAuthor || (members.length > 0 ? members[0].github_username : 'denoyey');
    setIsTerminalSubmitting(true);

    let commitMsg = terminalCommand.trim();
    const msgMatch = commitMsg.match(/git commit -m\s+["'](.*)["']/i);
    if (msgMatch && msgMatch[1]) {
      commitMsg = msgMatch[1];
    } else if (commitMsg.toLowerCase().startsWith('git commit')) {
      commitMsg = commitMsg.replace(/^git commit\s*(-m)?\s*/i, '').replace(/^["']|["']$/g, '');
    }

    const taskMatch = commitMsg.match(/\[done\s+#(TASK-\d+)\]/i) || terminalCommand.match(/#(TASK-\d+)/i);
    const taskCode = taskMatch ? taskMatch[1].toUpperCase() : undefined;

    try {
      await axios.post('/api/v1/webhooks/simulate', {
        developer: effectiveAuthor,
        commitMsg: commitMsg || 'Update fitur via terminal simulator',
        taskCode,
      });

      setTerminalOutput(
        `[OK] Commit berhasil disimulasikan untuk @${effectiveAuthor}! ${taskCode ? `Task #${taskCode} selesai & Trello tersinkron.` : 'Push event tercatat di stream.'}`
      );

      setActiveToast({
        title: taskCode ? `Simulasi Selesai #${taskCode}` : 'Simulasi Commit Berhasil',
        desc: `@${effectiveAuthor}: "${commitMsg}". Trello & Klasemen terupdate (Discord tetap tenang tanpa spam).`,
      });
      setTimeout(() => setActiveToast(null), 4000);

      await refreshData();
    } catch (err: any) {
      console.error('[Terminal Simulator Error]', err);
      setTerminalOutput(`[ERR] Gagal menjalankan simulasi: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsTerminalSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-50 dark:bg-[#090b10] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col antialiased transition-colors duration-150"
    >
      {/* Top Floating Notification Toast */}
      {activeToast && (
        <aside
          ref={toastRef}
          aria-live="polite"
          className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-6 z-50 bg-white dark:bg-[#12151f] border border-emerald-500/50 text-zinc-900 dark:text-zinc-200 px-4 py-3 rounded-lg shadow-xl flex items-start gap-3 backdrop-blur-md sm:max-w-md"
        >
          <div className="p-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-zinc-950 dark:text-white tracking-tight truncate">
              {activeToast.title}
            </h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
              {activeToast.desc}
            </p>
          </div>
        </aside>
      )}

      {/* TOP NAVBAR - FIXED & SMART SCROLL AUTO-HIDE */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#0d1017]/90 backdrop-blur-md pt-[env(safe-area-inset-top,0px)] transition-transform duration-300 ease-in-out will-change-transform ${isNavbarVisible
            ? 'translate-y-0 shadow-xs pointer-events-auto'
            : '-translate-y-full shadow-none pointer-events-none'
          }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 min-h-[3.25rem] sm:min-h-[3.5rem] py-1.5 sm:py-0 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Brand Logo & Back to Landing */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
            <Link
              to="/"
              className="p-1 sm:p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition flex items-center gap-1 text-xs shrink-0"
              title="Kembali ke Landing Page"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
              SP
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white whitespace-nowrap">
                SI-PATIR
              </span>
              <span className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 shrink-0">
                Live Monitoring
              </span>
            </div>
          </div>

          {/* Action Buttons & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* API Explorer & Webhooks Trigger Button */}
            <button
              type="button"
              onClick={() => setShowApiModal(true)}
              className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-95 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer touch-manipulation shadow-xs shrink-0"
              title="Katalog & Playground API SI-PATIR"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline text-xs font-medium">API Docs</span>
            </button>

            {/* Export CSV Button (Point 2.8) */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="no-print h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-95 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer touch-manipulation shadow-xs shrink-0"
              title="Unduh laporan sprint format CSV (Excel)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline text-xs font-medium">CSV</span>
            </button>

            {/* Print / PDF Button (Point 2.8) */}
            <button
              type="button"
              onClick={handlePrint}
              className="no-print h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-95 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer touch-manipulation shadow-xs shrink-0"
              title="Cetak dashboard ke format PDF untuk evaluasi dosen"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              <span className="hidden md:inline text-xs font-medium">Cetak PDF</span>
            </button>

            {/* Theme Switcher Dropdown */}
            <ThemeSwitcher />

            {/* Unified Sync Dropdown Menu */}
            <div ref={syncMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  engine.animateButtonPress(e.currentTarget);
                  setIsSyncMenuOpen((prev) => !prev);
                }}
                aria-haspopup="menu"
                aria-expanded={isSyncMenuOpen}
                aria-label="Menu Sinkronisasi Data"
                className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-95 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer touch-manipulation shadow-xs shrink-0"
                title="Pilihan sinkronisasi GitHub & Trello"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncingGitHub || isSyncingTrello
                      ? 'animate-spin text-emerald-500'
                      : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                />
                <span className="hidden sm:inline text-xs font-medium">Sync</span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-400 dark:text-zinc-500 transition-transform duration-150 ${isSyncMenuOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {isSyncMenuOpen && (
                <div
                  role="menu"
                  aria-label="Pilihan sinkronisasi data"
                  className="absolute right-0 mt-1.5 w-60 sm:w-64 rounded-md bg-white dark:bg-[#12151f] border border-zinc-200 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                    Sinkronisasi Data
                  </div>

                  {/* Sync GitHub */}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isSyncingGitHub}
                    onClick={() => {
                      setIsSyncMenuOpen(false);
                      handleSyncGitHub();
                    }}
                    className="w-full p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left flex items-start gap-2.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                        <span>Sync GitHub</span>
                        {isSyncingGitHub && <span className="text-[10px] font-normal text-emerald-500">Memproses...</span>}
                      </div>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                        Tarik kontributor & commit nyata dari repositori
                      </p>
                    </div>
                  </button>

                  {/* Sync Trello */}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isSyncingTrello}
                    onClick={() => {
                      setIsSyncMenuOpen(false);
                      handleSyncTrello();
                    }}
                    className="w-full p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left flex items-start gap-2.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                      <CheckSquare className={`w-3.5 h-3.5 ${isSyncingTrello ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                        <span>Sync Trello</span>
                        {isSyncingTrello && <span className="text-[10px] font-normal text-blue-500">Memproses...</span>}
                      </div>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                        Perbarui kartu tugas & status dari papan Trello
                      </p>
                    </div>
                  </button>

                  <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                  {/* Clear Dummy Data */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsSyncMenuOpen(false);
                      handleClearDummy();
                    }}
                    className="w-full p-2 rounded-md hover:bg-rose-500/10 text-left flex items-start gap-2.5 transition cursor-pointer text-rose-600 dark:text-rose-400"
                  >
                    <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0 mt-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold">Bersihkan Data Dummy</div>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                        Hapus data pengujian & sisakan data nyata
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to reserve layout height under fixed top navbar */}
      <div className="h-[3.25rem] sm:h-[3.5rem] pt-[env(safe-area-inset-top,0px)] shrink-0" aria-hidden="true" />

      {/* REPOSITORY & SYSTEM CONNECTIVITY BAR */}
      <section
        data-anim="header"
        className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-[#0b0e14] py-2.5 px-3 sm:px-6 lg:px-8 text-xs font-mono"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Target Repo Info */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-500 dark:text-zinc-400 truncate">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="hidden sm:inline">Repository:</span>
            <a
              href={`https://github.com/${status.repository || 'denoyey/si-patir'}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-900 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-white hover:bg-zinc-50 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 px-2 py-0.5 rounded-md border border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600 truncate text-[11px] font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Buka repositori GitHub di tab baru"
            >
              <span>{status.repository || 'denoyey/si-patir'}:main</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>

          {/* Connection Status Badges - 2x2 grid on mobile, flex on sm+ */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-white dark:bg-zinc-900 px-2 sm:px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">GitHub:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-white dark:bg-zinc-900 px-2 sm:px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Trello:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-white dark:bg-zinc-900 px-2 sm:px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Discord:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-white dark:bg-zinc-900 px-2 sm:px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] shadow-xs">
              <Database className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="text-zinc-500 dark:text-zinc-400">MySQL:</span>
              <span className={status.mysql ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                {status.mysql ? 'Connected' : 'Memory Sync'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-12 space-y-6 flex-1 safe-bottom">
        {/* SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            data-anim="stat-card"
            className="bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-150 rounded-lg p-3.5 sm:p-5 min-h-[120px] sm:min-h-[132px] flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Total Commits</span>
              <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                <GitCommit className="w-4 h-4" />
              </div>
            </div>
            <div ref={totalCommitsRef} className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight mt-1">
              {metrics.totalCommits}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
              <span className="hidden sm:inline">Tercatat di Git repositori</span>
              <span className="sm:hidden">Tercatat di Git</span>
            </div>
          </div>

          <div
            data-anim="stat-card"
            className="bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-150 rounded-lg p-3.5 sm:p-5 min-h-[120px] sm:min-h-[132px] flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Tugas Selesai</span>
              <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 flex items-baseline gap-1.5">
              <span ref={totalDoneRef}>{metrics.totalDone}</span>
              <span className="text-zinc-400 text-sm font-normal">/ {tasks.length}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="hidden sm:inline">Status sinkron real-time Trello</span>
              <span className="sm:hidden">Sinkron real-time</span>
            </div>
          </div>

          <div
            data-anim="stat-card"
            className="bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-150 rounded-lg p-3.5 sm:p-5 min-h-[120px] sm:min-h-[132px] flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Penyelesaian Sprint</span>
              <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div ref={completionRateRef} className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight mt-1">
              {metrics.completionRate}%
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800/80 h-2 rounded-md overflow-hidden">
              <div
                ref={progressBarRef}
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-md transition-all duration-300"
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
          </div>

          <div
            data-anim="stat-card"
            className="bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-150 rounded-lg p-3.5 sm:p-5 min-h-[120px] sm:min-h-[132px] flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Proteksi Webhook</span>
              <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm xs:text-base sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-300 tracking-tight mt-0.5">
              HMAC SHA-256
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
              <span className="hidden sm:inline">Anti-Timing Attack &amp; DoS Guard</span>
              <span className="sm:hidden">Anti-Timing Attack</span>
            </div>
          </div>
        </div>

        {/* VISUAL ANALYTICS SPRINT CHARTS (Point 2.6) */}
        <ContributionChart members={members} tasks={tasks} />

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT 2 COLUMNS: Leaderboard & Task Management */}
          <div data-anim="content-grid" className="lg:col-span-2 space-y-5">
            {/* 1. KLASEMEN KONTRIBUSI ANGGOTA NYATA */}
            <section className="bg-white dark:bg-[#0e121b] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
              <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 min-h-[52px] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121623] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950 dark:text-white">
                      Klasemen Kontribusi Anggota
                    </h2>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{members.length} Developer Terdaftar</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={(e) => {
                      engine.animateButtonPress(e.currentTarget);
                      setShowAddMemberModal(true);
                    }}
                    className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-95 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer touch-manipulation shadow-xs"
                    title="Tambah anggota kelompok nyata"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Tambah Anggota</span>
                    <span className="sm:hidden">Tambah</span>
                  </button>

                  <button
                    onClick={(e) => {
                      engine.animateButtonPress(e.currentTarget);
                      handleClearDummy();
                    }}
                    className="h-8 sm:h-8.5 px-2.5 rounded-md bg-zinc-100 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/40 active:scale-95 border border-zinc-300 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-800/50 text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-300 transition cursor-pointer touch-manipulation"
                    title="Hapus data dummy bawaan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table with Safe Horizontal Scroll & Clean Fit on Mobile */}
              <div className="overflow-x-auto touch-scroll no-scrollbar" data-lenis-prevent>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-[#0a0d14] text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      <th className="py-2.5 sm:py-3 px-1.5 sm:px-4 w-10 sm:w-16 text-center">RANK</th>
                      <th className="py-2.5 sm:py-3 px-1.5 sm:px-4">DEVELOPER</th>
                      <th className="py-2.5 sm:py-3 px-1.5 sm:px-4 text-center">COMMITS</th>
                      <th className="py-2.5 sm:py-3 px-1.5 sm:px-4 text-center">TASKS</th>
                      <th className="hidden md:table-cell py-2.5 sm:py-3 px-4 text-right" title="Aktif jika memiliki minimal 1 commit di repositori">
                        STATUS KERJA
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {members.map((member, index) => {
                      const isTop = index === 0;
                      // Developer dinyatakan aktif murni berdasarkan jumlah commit (> 0)
                      const isActive = member.total_commits > 0;
                      const isSelected = selectedAssignee?.toLowerCase() === member.github_username.toLowerCase();

                      return (
                        <tr
                          key={member.id}
                          onClick={() => {
                            setSelectedAssignee((prev) => (prev?.toLowerCase() === member.github_username.toLowerCase() ? null : member.github_username));
                            setCurrentPage(1);
                          }}
                          className={`hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition cursor-pointer ${isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/30'
                              : ''
                            }`}
                          title={`Klik untuk memfilter kartu tugas @${member.github_username}`}
                        >
                          <td className="py-2.5 sm:py-3 px-1.5 sm:px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center font-mono text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md ${index === 0
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs'
                                  : index === 1
                                    ? 'bg-zinc-200 dark:bg-zinc-700/40 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600/50 shadow-xs'
                                    : index === 2
                                      ? 'bg-amber-900/15 text-amber-800 dark:text-amber-400 border border-amber-800/30 shadow-xs'
                                      : 'text-zinc-500'
                                }`}
                            >
                              #{index + 1}
                            </span>
                          </td>
                          <td className="py-2.5 sm:py-3 px-1.5 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <AvatarWithFallback username={member.github_username} name={member.name} />
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-950 dark:text-white flex items-center gap-1.5 flex-wrap">
                                  <span>{member.name}</span>
                                  {isSelected && (
                                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-md font-mono font-medium">
                                      Difilter
                                    </span>
                                  )}
                                  {isTop && (
                                    <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded-md border border-amber-500/30 font-mono font-medium">
                                      Lead
                                    </span>
                                  )}
                                  {isActive && (
                                    <span className="md:hidden w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Aktif Berkontribusi"></span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <a
                                    href={`https://github.com/${member.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-mono text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 group/gh transition"
                                  >
                                    <span>@{member.github_username}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/gh:opacity-100 transition shrink-0" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 sm:py-3 px-1.5 sm:px-4 text-center">
                            <span className="font-mono text-xs font-bold px-2 sm:px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-xs">
                              {member.total_commits}
                            </span>
                          </td>
                          <td className="py-2.5 sm:py-3 px-1.5 sm:px-4 text-center">
                            <span className="font-mono text-xs font-bold px-2 sm:px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                              {member.tasks_done}
                            </span>
                          </td>
                          <td className="hidden md:table-cell py-2.5 sm:py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {isActive ? (
                                <span
                                  className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium"
                                  title="Developer aktif: telah melakukan minimal 1 commit di repositori"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Aktif Berkontribusi
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs"
                                  title="Standby: belum ada riwayat commit di repositori"
                                >
                                  Standby
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. DAFTAR TUGAS PROYEK - FILAMENT V5 DATA TABLE */}
            <section className="bg-white dark:bg-[#0e121b] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
              {/* Table Top Toolbar */}
              <div className="p-3.5 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#121623] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950 dark:text-white">
                        Daftar Kartu Tugas
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                        {totalResults} tugas
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Sinkronisasi otomatis dengan papan Trello &amp; GitHub
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      engine.animateButtonPress(e.currentTarget);
                      setShowAddTaskModal(true);
                    }}
                    className="h-8.5 px-3 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer touch-manipulation shadow-xs"
                    title="Tambah kartu tugas baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tugas</span>
                  </button>
                </div>
              </div>

              {/* Table Controls: Search & Segmented Status Filters */}
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0d14] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    id="task-search-input"
                    name="task_search_query"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari kode tugas (#TASK), judul, atau assignee..."
                    autoComplete="off"
                    aria-label="Cari kode tugas, judul, atau assignee"
                    className="w-full h-9 pl-9 pr-8 rounded-md bg-zinc-50 dark:bg-[#121624] border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs (Filament style pills with counts) */}
                <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-zinc-100 dark:bg-[#121623] p-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs shrink-0">
                  {(['ALL', 'In Progress', 'Done', 'To Do'] as const).map((tab) => {
                    const count = tab === 'ALL'
                      ? tasks.length
                      : tasks.filter((t) => t.status === tab).length;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={(e) => {
                          engine.animateButtonPress(e.currentTarget);
                          setStatusFilter(tab);
                          setCurrentPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition active:scale-95 cursor-pointer text-center truncate flex items-center justify-center gap-1 ${statusFilter === tab
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-300 dark:border-zinc-700 font-semibold'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                      >
                        <span>{tab === 'ALL' ? 'Semua' : tab}</span>
                        <span className="text-[10px] font-mono opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Developer Filter Notice */}
              {selectedAssignee && (
                <div className="px-3.5 sm:px-4 py-2 bg-blue-50/80 dark:bg-blue-950/25 border-b border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Menyaring tugas untuk kontributor:</span>
                    <span className="font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      @{selectedAssignee}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAssignee(null);
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hapus Filter</span>
                  </button>
                </div>
              )}

              {/* Table Data View */}
              <div className="overflow-x-auto touch-scroll" data-lenis-prevent>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#0a0d14] text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 w-28">KODE TUGAS</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 min-w-[200px]">JUDUL TUGAS</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 min-w-[140px]">ASSIGNEE</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center w-32">STATUS</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right w-16">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {paginatedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <CheckSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                            <p className="font-medium text-zinc-700 dark:text-zinc-300">
                              Tidak ada kartu tugas ditemukan.
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              {searchQuery || statusFilter !== 'ALL'
                                ? 'Coba ubah kata kunci pencarian atau filter status.'
                                : 'Klik tombol "Tambah Tugas" untuk membuat tugas baru.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTasks.map((task) => {
                        const isDone = task.status === 'Done';
                        const isInProgress = task.status === 'In Progress';

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/25 transition group"
                          >
                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                                #{task.task_code}
                              </span>
                            </td>
                            <td className="py-3 px-3 sm:px-4">
                              <div className="font-medium text-zinc-950 dark:text-white leading-snug">
                                {task.title}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <AvatarWithFallback username={task.assignee} name={task.assignee} />
                                <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                                  @{task.assignee}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                              <div className="inline-flex items-center relative">
                                <select
                                  id={`task-status-select-${task.id}`}
                                  name={`task_status_${task.id}`}
                                  value={task.status}
                                  disabled={updatingTaskId === task.id}
                                  onChange={(e) =>
                                    handleUpdateTaskStatus(task.id, e.target.value as 'To Do' | 'In Progress' | 'Done')
                                  }
                                  aria-label={`Ubah status tugas #${task.task_code}`}
                                  className={`appearance-none cursor-pointer text-[11px] font-semibold pl-6 pr-6 py-1 rounded-md border transition shadow-2xs focus:outline-hidden disabled:opacity-60 ${isDone
                                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                      : isInProgress
                                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                                    }`}
                                >
                                  <option value="To Do" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">To Do</option>
                                  <option value="In Progress" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">In Progress</option>
                                  <option value="Done" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Done</option>
                                </select>
                                <span
                                  className={`w-1.5 h-1.5 rounded-full absolute left-2.5 pointer-events-none ${isDone
                                      ? 'bg-emerald-500 animate-pulse'
                                      : isInProgress
                                        ? 'bg-amber-500'
                                        : 'bg-zinc-400'
                                    }`}
                                />
                                <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none text-current opacity-70" />
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    engine.animateButtonPress(e.currentTarget);
                                    setEditingTask(task);
                                  }}
                                  className="p-1.5 rounded-md text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 transition cursor-pointer"
                                  title={`Edit tugas #${task.task_code}`}
                                  aria-label={`Edit tugas ${task.task_code}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    engine.animateButtonPress(e.currentTarget);
                                    handleDeleteTask(task.id);
                                  }}
                                  className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 transition cursor-pointer"
                                  title={`Hapus tugas #${task.task_code}`}
                                  aria-label={`Hapus tugas ${task.task_code}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Filament v5 Pagination Footer */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 px-3.5 sm:px-5 py-3 bg-zinc-50/80 dark:bg-[#121623] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {/* Result count ("Show result") */}
                <div className="text-zinc-600 dark:text-zinc-400 text-[11px] sm:text-xs text-center sm:text-left">
                  {totalResults === 0 ? (
                    <span>Menampilkan 0 tugas</span>
                  ) : (
                    <span>
                      Menampilkan <span className="font-semibold text-zinc-900 dark:text-white">{startIndex + 1}</span> sampai{' '}
                      <span className="font-semibold text-zinc-900 dark:text-white">{endIndex}</span> dari{' '}
                      <span className="font-semibold text-zinc-900 dark:text-white">{totalResults}</span> tugas
                    </span>
                  )}
                </div>

                {/* Per Page & Page Navigation Controls */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                  {/* Per Page Dropdown ("Page view") */}
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <label htmlFor="tasks-per-page" className="sr-only">Tugas per halaman</label>
                    <select
                      id="tasks-per-page"
                      name="tasks_per_page"
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 px-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 transition cursor-pointer shadow-2xs"
                    >
                      <option value={5}>5 per hal</option>
                      <option value={10}>10 per hal</option>
                      <option value={25}>25 per hal</option>
                    </select>
                  </div>

                  {/* Page Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={activePage <= 1}
                      onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
                      className="h-8 px-2.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-md text-xs font-semibold flex items-center justify-center transition active:scale-95 cursor-pointer ${activePage === pageNum
                            ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border border-zinc-900 dark:border-zinc-200 shadow-xs'
                            : 'bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={activePage >= totalPages}
                      onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                      className="h-8 px-2.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                      aria-label="Halaman selanjutnya"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT 1 COLUMN: LIVE WEBHOOK AUDIT STREAM & WEB GIT TERMINAL */}
          <aside className="space-y-4 lg:sticky lg:top-[4.5rem] lg:self-start z-20">
            <div
              data-anim="content-grid"
              className="bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[580px] sm:h-[660px] lg:h-[calc(100vh-5.5rem)] lg:max-h-[860px] lg:min-h-[580px] shadow-xs"
            >
              {/* Header */}
              <div className="px-4 py-3 min-h-[46px] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-[#0e121b] shrink-0">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-xs font-semibold text-zinc-950 dark:text-white">
                    Live Webhook Stream
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {filteredLogs.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Listening</span>
                </div>
              </div>

              {/* Stream Search & Author Filter Bar */}
              <div className="p-2.5 bg-zinc-50/50 dark:bg-[#0e121b]/60 border-b border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Cari commit, #TASK, event..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-md bg-white dark:bg-[#090b10] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs font-mono focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition shadow-2xs"
                  />
                  {logSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLogSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                      title="Hapus pencarian stream"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Author filter horizontal bar */}
                <div className="flex items-center gap-1 overflow-x-auto touch-scroll py-0.5 text-[10px] font-mono scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setLogAuthorFilter('ALL')}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer shrink-0 border ${
                      logAuthorFilter === 'ALL'
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold border-zinc-950 dark:border-white shadow-2xs'
                        : 'bg-white dark:bg-[#090b10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    Semua ({logs.length})
                  </button>
                  {logAuthors.map((author) => {
                    const isSelected = logAuthorFilter.toLowerCase() === author.toLowerCase();
                    const count = logs.filter((l) => l.author.toLowerCase() === author.toLowerCase()).length;
                    return (
                      <button
                        key={author}
                        type="button"
                        onClick={() => setLogAuthorFilter(isSelected ? 'ALL' : author)}
                        className={`px-2 py-0.5 rounded-md transition cursor-pointer shrink-0 border ${
                          isSelected
                            ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold border-zinc-950 dark:border-white shadow-2xs'
                            : 'bg-white dark:bg-[#090b10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        @{author} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Streaming Output Body - Clean Activity Feed (No nested cards in cards!) */}
              <div
                ref={streamContainerRef}
                data-lenis-prevent
                className="flex-1 min-h-0 bg-white dark:bg-[#0c0f17] divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto touch-scroll"
              >
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 px-4 text-zinc-400 dark:text-zinc-600 text-xs space-y-2">
                    <p>Tidak ada aktivitas webhook yang sesuai.</p>
                    {(logSearchQuery || logAuthorFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogSearchQuery('');
                          setLogAuthorFilter('ALL');
                        }}
                        className="text-blue-600 dark:text-blue-400 underline cursor-pointer text-[11px]"
                      >
                        Reset filter stream
                      </button>
                    )}
                  </div>
                ) : (
                  filteredLogs.map((log, index) => (
                    <div
                      key={log.id}
                      ref={index === 0 ? topLogRef : undefined}
                      className="p-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors flex items-start gap-2.5"
                    >
                      <AvatarWithFallback
                        username={log.author}
                        name={log.author}
                        className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 shrink-0 mt-0.5 object-cover"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              @{log.author}
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                              log.event_type === 'TASK_COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                            }`}>
                              {log.event_type === 'TASK_COMPLETED' ? 'TASK' : 'PUSH'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0" title={log.created_at}>
                            {formatLogTime(log.created_at)}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-snug break-words">
                          {log.commit_message}
                        </p>

                        {log.task_code && (
                          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>#{log.task_code} digeser ke Done &amp; Discord ternotifikasi</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Terminal Web Git Terintegrasi (Human-Crafted Developer Tool) */}
              <div className="p-3.5 sm:p-4 bg-zinc-50/90 dark:bg-[#0e121b] border-t border-zinc-200 dark:border-zinc-800 text-xs space-y-3 shrink-0">
                {/* Header Terminal Web */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 shrink-0">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-950 dark:text-white text-xs">
                          Terminal Web Git
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                          Direct Pipeline
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(terminalCommand);
                      setActiveToast({
                        title: 'Sintaks Berhasil Disalin',
                        desc: 'Perintah commit telah disalin ke clipboard.',
                      });
                      setTimeout(() => setActiveToast(null), 3000);
                    }}
                    className="px-2 py-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[11px] font-mono flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    title="Salin sintaks perintah saat ini"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                </div>

                {/* Form Selectors: Author & Quick Task Template */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label htmlFor="terminal-author-select" className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Author Kontributor
                    </label>
                    <select
                      id="terminal-author-select"
                      value={selectedTerminalAuthor || (members[0]?.github_username ?? 'denoyey')}
                      onChange={(e) => setSelectedTerminalAuthor(e.target.value)}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-hidden focus:border-blue-500 transition cursor-pointer shadow-2xs"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.github_username}>
                          @{m.github_username} ({m.total_commits}c)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="terminal-task-select" className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Template Tugas
                    </label>
                    <select
                      id="terminal-task-select"
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        if (val === 'CUSTOM') {
                          setTerminalCommand('git commit -m "refactor(core): update konfigurasi dan penyesuaian sistem"');
                        } else {
                          const matchedTask = tasks.find((t) => t.task_code === val);
                          if (matchedTask) {
                            setTerminalCommand(`git commit -m "Selesaikan ${matchedTask.title.slice(0, 24)} [done #${matchedTask.task_code}]"`);
                            if (matchedTask.assignee) {
                              setSelectedTerminalAuthor(matchedTask.assignee);
                            }
                          }
                        }
                      }}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden focus:border-blue-500 transition cursor-pointer shadow-2xs"
                    >
                      <option value="" disabled>Pilih Tugas (#TASK)...</option>
                      {tasks.slice(0, 6).map((t) => (
                        <option key={t.id} value={t.task_code}>
                          #{t.task_code} - {t.title.slice(0, 22)}
                        </option>
                      ))}
                      <option value="CUSTOM">Commit Umum / Refactor</option>
                    </select>
                  </div>
                </div>

                {/* macOS / Modern Developer Shell Console */}
                <div className="rounded-md border border-zinc-300 dark:border-zinc-800 overflow-hidden bg-zinc-950 font-mono shadow-inner">
                  {/* Console Top Window Bar */}
                  <div className="px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500/80" />
                      <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                      <span className="ml-1 text-zinc-400">si-patir ~/workspace</span>
                    </div>
                    <span className="text-zinc-500">bash</span>
                  </div>

                  {/* Console Body */}
                  <div className="p-3 space-y-2">
                    {terminalOutput && (
                      <div className="text-[11px] text-zinc-400 border-b border-zinc-800/60 pb-1.5 leading-relaxed break-words">
                        <span className="text-emerald-400 mr-1.5">➜</span>
                        {terminalOutput}
                      </div>
                    )}

                    <form onSubmit={handleExecuteTerminal} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 text-xs font-bold select-none shrink-0">
                        @{selectedTerminalAuthor || (members[0]?.github_username ?? 'denoyey')} $
                      </span>
                      <input
                        type="text"
                        value={terminalCommand}
                        onChange={(e) => setTerminalCommand(e.target.value)}
                        placeholder='git commit -m "pesan [done #TASK-01]"'
                        className="flex-1 bg-transparent border-none text-zinc-100 placeholder-zinc-600 font-mono text-xs focus:outline-hidden p-0"
                      />
                    </form>
                  </div>
                </div>

                {/* Bottom Action Row (Spacious & Clean, Not Squeezed!) */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Tekan <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-[10px]">Enter ↵</kbd>
                  </span>

                  <button
                    type="button"
                    disabled={isTerminalSubmitting}
                    onClick={(e) => handleExecuteTerminal(e)}
                    className="h-8 px-3 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                    title="Jalankan commit langsung di web"
                  >
                    {isTerminalSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    <span>{isTerminalSubmitting ? 'Memproses...' : 'Jalankan Commit'}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#0b0e14] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <div>
            SI-PATIR v2.0.0 • Monitoring Tugas Real-Time
          </div>
          <div className="text-zinc-400 dark:text-zinc-500">
            Deni • Rafli • Fatir • Fajri
          </div>
        </div>
      </footer>

      {/* MODAL TAMBAH TUGAS NYATA */}
      {showAddTaskModal && (
        <div
          ref={modalTaskBackdropRef}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            ref={modalTaskRef}
            data-lenis-prevent
            className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto touch-scroll"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Tambah Kartu Tugas Nyata</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white active:scale-95 transition cursor-pointer touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label htmlFor="new-task-code" className="block text-zinc-600 dark:text-zinc-400 mb-1">
                  Kode Tugas (contoh: TASK-01, FEAT-AUTH)
                </label>
                <input
                  id="new-task-code"
                  name="new_task_code"
                  type="text"
                  required
                  placeholder="TASK-01"
                  value={newTaskCode}
                  onChange={(e) => setNewTaskCode(e.target.value)}
                  autoComplete="off"
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white font-mono text-base sm:text-xs focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label htmlFor="new-task-title" className="block text-zinc-600 dark:text-zinc-400 mb-1">Judul Tugas</label>
                <input
                  id="new-task-title"
                  name="new_task_title"
                  type="text"
                  required
                  placeholder="Contoh: Perancangan Arsitektur Database"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoComplete="off"
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white text-base sm:text-xs focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label htmlFor="new-task-assignee" className="block text-zinc-600 dark:text-zinc-400 mb-1">Assignee (Username GitHub Tim)</label>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {members.map((m) => (
                    <button
                      key={m.github_username}
                      type="button"
                      onClick={() => setNewTaskAssignee(m.github_username)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition cursor-pointer active:scale-95 touch-manipulation ${newTaskAssignee === m.github_username
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                        }`}
                    >
                      @{m.github_username}
                    </button>
                  ))}
                </div>
                <input
                  id="new-task-assignee"
                  name="new_task_assignee"
                  type="text"
                  placeholder="denoyey"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  autoComplete="username"
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white font-mono text-base sm:text-xs focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label htmlFor="new-task-status" className="block text-zinc-600 dark:text-zinc-400 mb-1">Status Awal</label>
                <select
                  id="new-task-status"
                  name="new_task_status"
                  value={newTaskStatus}
                  onChange={(e: any) => setNewTaskStatus(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white text-base sm:text-xs focus:outline-hidden focus:border-blue-500 transition"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="To Do">To Do</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="h-9 px-3.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white active:scale-95 transition cursor-pointer touch-manipulation text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 transition cursor-pointer touch-manipulation text-xs shadow-xs"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ANGGOTA KELOMPOK NYATA */}
      {showAddMemberModal && (
        <div
          ref={modalMemberBackdropRef}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            ref={modalMemberRef}
            data-lenis-prevent
            className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto touch-scroll"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Tambah Anggota Kelompok Nyata</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white active:scale-95 transition cursor-pointer touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label htmlFor="new-member-name" className="block text-zinc-600 dark:text-zinc-400 mb-1">Nama Lengkap</label>
                <input
                  id="new-member-name"
                  name="member_name"
                  type="text"
                  required
                  placeholder="Contoh: Dennis Pratama"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  autoComplete="name"
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white text-base sm:text-xs focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label htmlFor="new-member-username" className="block text-zinc-600 dark:text-zinc-400 mb-1">Username GitHub (tanpa @)</label>
                <input
                  id="new-member-username"
                  name="member_github_username"
                  type="text"
                  required
                  placeholder="denoyey"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white font-mono text-base sm:text-xs focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="h-9 px-3.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white active:scale-95 transition cursor-pointer touch-manipulation text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 active:bg-blue-700 active:scale-95 transition cursor-pointer touch-manipulation text-xs shadow-xs"
                >
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REUSABLE CUSTOM CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* INTERACTIVE REST API EXPLORER & WEBHOOK MODAL */}
      <ApiExplorerModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
      />

      {/* INTERACTIVE EDIT TASK MODAL (Point 2.7) */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        members={members}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditTask}
      />
    </div>
  );
}

