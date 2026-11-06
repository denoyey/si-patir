import { useState, useEffect, useMemo, useRef, type FormEvent } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useGsapScope } from './animations/hooks/useGsapScope';
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  Clock,
  RefreshCw,
  Terminal,
  Trophy,
  CheckSquare,
  Zap,
  Database,
  Search,
  Activity,
  Layers,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

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

export function App() {
  const { containerRef, engine } = useGsapScope();

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
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string } | null>(null);

  // Modals state for real team management
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Form states
  const [newTaskCode, setNewTaskCode] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<'To Do' | 'In Progress' | 'Done'>('In Progress');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');

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

    // Auto-sync real GitHub contributors on mount
    axios.post('/api/members/sync-github').then(() => refreshData()).catch(() => {});

    // WebSocket real-time subscription
    const socket = io();

    socket.on('activity_update', (event) => {
      if (event.type === 'TASK_COMPLETED') {
        setActiveToast({
          title: `Task #${event.taskCode} Completed`,
          desc: `@${event.author} closed task via commit. Trello & Discord updated.`,
        });
      } else {
        setActiveToast({
          title: `Commit Received`,
          desc: `@${event.author}: "${event.commitMsg}"`,
        });
      }
      setTimeout(() => setActiveToast(null), 5000);
      refreshData();

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

  // Filter tasks based on search & status
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.task_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || task.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

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

  // Sync tasks from Trello
  const handleSyncTrello = async () => {
    setIsSyncingTrello(true);
    try {
      await axios.post('/api/tasks/sync');
      await refreshData();
    } finally {
      setIsSyncingTrello(false);
    }
  };

  // Clear dummy data and keep real data only
  const handleClearDummy = async () => {
    if (!confirm('Hapus seluruh data dummy bawaan (Andi, Budi, Citra, Doni) agar hanya tersisa anggota nyata?')) return;
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
      alert(err.response?.data?.error || 'Gagal menambahkan tugas');
    }
  };

  // Delete task
  const handleDeleteTask = async (id: number) => {
    if (!confirm('Hapus kartu tugas ini?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Delete task error:', err);
    }
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
      alert(err.response?.data?.error || 'Gagal menambahkan anggota');
    }
  };

  // Instant demo commit with real developer
  const handleSimulateCommit = async () => {
    setIsSimulating(true);
    const activeDev = members[0]?.github_username || 'denoyey';
    const targetTask = tasks.find((t) => t.status !== 'Done') || tasks[0];
    const targetCode = targetTask ? targetTask.task_code : 'TASK-01';

    try {
      await axios.post('/api/simulate-commit', {
        developer: activeDev,
        message: `Selesaikan implementasi fitur [done #${targetCode}]`,
      });
      await refreshData();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#090b10] text-zinc-200 font-sans selection:bg-zinc-800 selection:text-white flex flex-col antialiased">
      {/* Top Floating Notification Toast */}
      {activeToast && (
        <aside
          ref={toastRef}
          aria-live="polite"
          className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-6 z-50 bg-[#12151f] border border-emerald-500/40 text-zinc-200 px-4 py-3 rounded-lg shadow-xl flex items-start gap-3 backdrop-blur-md sm:max-w-md"
        >
          <div className="p-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white tracking-tight truncate">{activeToast.title}</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">{activeToast.desc}</p>
          </div>
        </aside>
      )}

      {/* TOP NAVBAR (Clean, Human Engineering Design, Max-W 7XL) */}
      <header data-anim="header" className="border-b border-zinc-800 bg-[#0d1017] sticky top-0 z-40 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-mono font-bold text-xs shrink-0">
              SP
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">SI-PATIR</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                  DevOps Control
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sync Real GitHub Contributors */}
            <button
              onClick={(e) => {
                engine.animateButtonPress(e.currentTarget);
                handleSyncGitHub();
              }}
              disabled={isSyncingGitHub}
              aria-label="Sinkronisasi GitHub"
              className="h-8 px-3 rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer touch-manipulation"
              title="Tarik data kontributor & commit nyata dari repositori GitHub"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Sync GitHub</span>
            </button>

            {/* Sync Trello */}
            <button
              onClick={(e) => {
                engine.animateButtonPress(e.currentTarget);
                handleSyncTrello();
              }}
              disabled={isSyncingTrello}
              aria-label="Sinkronisasi Trello"
              className="h-8 px-3 rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer touch-manipulation"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Sync Trello</span>
            </button>

            {/* Test Real Commit */}
            <button
              onClick={(e) => {
                engine.animateButtonPress(e.currentTarget);
                handleSimulateCommit();
              }}
              disabled={isSimulating}
              aria-label="Simulasi Push Commit"
              className="h-8 px-3.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 border border-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs touch-manipulation"
              title="Kirim payload commit webhook untuk pengujian instan"
            >
              <Zap className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
              <span>Test Commit</span>
              <span className="hidden sm:inline font-mono text-[11px] text-zinc-700">[@{members[0]?.github_username || 'denoyey'}]</span>
            </button>
          </div>
        </div>
      </header>

      {/* REPOSITORY & SYSTEM CONNECTIVITY BAR (Max-W 7XL) */}
      <section data-anim="header" className="border-b border-zinc-800/80 bg-[#0b0e14] py-2 px-4 sm:px-6 lg:px-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Real Target Repo Info */}
          <div className="flex items-center gap-2 text-zinc-400 truncate">
            <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="hidden sm:inline text-zinc-500">Repository:</span>
            <span className="text-zinc-200 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/60 truncate text-[11px] font-semibold">
              {status.repository || 'denoyey/si-patir'}:main
            </span>
          </div>

          {/* Connection Status Badges */}
          <div className="flex items-center gap-2 overflow-x-auto touch-scroll py-0.5 no-scrollbar">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 shrink-0 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400">GitHub:</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 shrink-0 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400">Trello:</span>
              <span className="text-emerald-400 font-medium">Synced</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 shrink-0 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400">Discord:</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 shrink-0 text-[11px]">
              <Database className="w-3 h-3 text-blue-400" />
              <span className="text-zinc-400">MySQL:</span>
              <span className={status.mysql ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {status.mysql ? 'Connected' : 'Memory Sync'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CONTENT (Max-W 7XL Across Desktop) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 safe-bottom">
        {/* SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div data-anim="stat-card" className="bg-[#11141d] border border-zinc-800 hover:border-zinc-700 transition duration-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Total Commits</span>
              <GitCommit className="w-4 h-4 text-zinc-500 shrink-0" />
            </div>
            <div ref={totalCommitsRef} className="text-2xl font-bold font-mono text-white mt-1.5">{metrics.totalCommits}</div>
            <div className="text-[11px] text-zinc-500 mt-1 truncate">Tercatat di Git repositori</div>
          </div>

          <div data-anim="stat-card" className="bg-[#11141d] border border-zinc-800 hover:border-zinc-700 transition duration-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Tugas Selesai</span>
              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 flex items-baseline gap-1">
              <span ref={totalDoneRef}>{metrics.totalDone}</span>
              <span className="text-zinc-500 text-sm font-normal">/ {tasks.length}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 truncate">Status sinkron real-time</div>
          </div>

          <div data-anim="stat-card" className="bg-[#11141d] border border-zinc-800 hover:border-zinc-700 transition duration-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Penyelesaian</span>
              <Activity className="w-4 h-4 text-blue-500 shrink-0" />
            </div>
            <div ref={completionRateRef} className="text-2xl font-bold font-mono text-white mt-1.5">{metrics.completionRate}%</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-md mt-2 overflow-hidden">
              <div
                ref={progressBarRef}
                className="bg-blue-500 h-full rounded-md"
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
          </div>

          <div data-anim="stat-card" className="bg-[#11141d] border border-zinc-800 hover:border-zinc-700 transition duration-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Proteksi Keamanan</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-sm font-semibold font-mono text-emerald-300 mt-2 truncate">
              HMAC SHA-256
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 truncate">ReDoS & DoS Hardened</div>
          </div>
        </div>

        {/* WORKSPACE LAYOUT (2 Columns on Desktop, Stacked on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Leaderboard & Task Management */}
          <div data-anim="content-grid" className="lg:col-span-2 space-y-6">
            {/* 1. KLASEMEN KONTRIBUSI ANGGOTA NYATA */}
            <section className="bg-[#11141d] border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Klasemen Kontribusi Anggota (Real Developers)
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="h-7 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-medium text-zinc-200 flex items-center gap-1 transition cursor-pointer"
                    title="Tambah anggota kelompok nyata"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>Tambah Anggota</span>
                  </button>

                  <button
                    onClick={handleClearDummy}
                    className="h-7 px-2 rounded-md bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/50 text-[11px] text-zinc-400 hover:text-red-300 transition cursor-pointer"
                    title="Hapus data dummy bawaan"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Table with Safe Horizontal Scroll */}
              <div className="overflow-x-auto touch-scroll">
                <table className="w-full text-left text-xs min-w-[480px] sm:min-w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0d1017] text-zinc-400 font-mono text-[11px]">
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Developer</th>
                      <th className="py-2.5 px-4 text-center">Commits</th>
                      <th className="py-2.5 px-4 text-center">Tasks</th>
                      <th className="py-2.5 px-4 text-right">Status Kerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {members.map((member, index) => {
                      const isTop = index === 0;
                      const isActive = member.total_commits >= 5;

                      return (
                        <tr key={member.id} className="hover:bg-zinc-800/30 transition">
                          <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white flex items-center gap-1.5 flex-wrap">
                              <span>{member.name}</span>
                              {isTop && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-500/20 font-mono">
                                  Lead
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400">
                              @{member.github_username}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
                              {member.total_commits}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                              {member.tasks_done}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[11px]">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Aktif 🔥
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-700">
                                Siap Berkontribusi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. DAFTAR TUGAS PROYEK REALTIME */}
            <section className="bg-[#11141d] border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Daftar Kartu Tugas Nyata
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Button Add Real Task */}
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="h-7 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-medium text-zinc-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-blue-400" />
                    <span>Tambah Tugas</span>
                  </button>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-[#090b10] p-1 rounded-md border border-zinc-800 text-xs overflow-x-auto touch-scroll no-scrollbar">
                    {(['ALL', 'In Progress', 'Done', 'To Do'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 touch-manipulation ${
                          statusFilter === tab
                            ? 'bg-zinc-800 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-zinc-800 bg-[#0d1017]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kode tugas, judul, atau assignee..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#11141d] border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-600 transition"
                  />
                </div>
              </div>

              {/* Task Items List */}
              <div className="divide-y divide-zinc-800/60">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">Belum ada tugas. Klik tombol "Tambah Tugas" untuk menambahkan.</div>
                ) : (
                  filteredTasks.map((task) => {
                    const isDone = task.status === 'Done';
                    const isInProgress = task.status === 'In Progress';

                    return (
                      <div
                        key={task.id}
                        className="px-5 py-3.5 hover:bg-zinc-800/25 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : isInProgress ? (
                              <Clock className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Layers className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-xs text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded-md border border-zinc-700 shrink-0">
                                [#{task.task_code}]
                              </span>
                              <span className="text-xs font-medium text-white break-words">{task.title}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1 truncate">
                              Assignee: <span className="font-mono text-zinc-300">@{task.assignee}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          <span
                            className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${
                              isDone
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : isInProgress
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {task.status}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                            title="Hapus tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT 1 COLUMN: LIVE WEBHOOK AUDIT STREAM */}
          <aside data-anim="content-grid" className="space-y-4">
            <div className="bg-[#11141d] border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[480px] sm:h-[560px] lg:h-[640px]">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#0d1017]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Live Webhook Stream
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
                  <span>LISTENING</span>
                </div>
              </div>

              {/* Streaming Output Body */}
              <div className="flex-1 bg-[#090b10] p-4 font-mono text-xs overflow-y-auto touch-scroll space-y-3 divide-y divide-zinc-800/40">
                <div className="text-zinc-500 text-[11px] pb-2">
                  // Menunggu sinyal push git dari pengembang nyata...
                </div>

                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    ref={index === 0 ? topLogRef : undefined}
                    className="pt-2.5 space-y-1 transition-colors duration-300 rounded-md p-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="text-blue-400 font-bold">[{log.event_type}]</span>
                      <span>{log.created_at}</span>
                    </div>
                    <div className="text-zinc-300 text-[11px]">
                      Author: <span className="text-amber-300">@{log.author}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] break-words">
                      Msg: <span className="text-zinc-200 italic">"{log.commit_message}"</span>
                    </div>
                    {log.task_code && (
                      <div className="text-emerald-400 text-[10px] flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Trello card #{log.task_code} shifted to Done & Discord notified
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Instructions Panel */}
              <div className="p-3 bg-[#0d1017] border-t border-zinc-800 text-[11px] space-y-1.5">
                <div className="font-semibold text-zinc-300 flex items-center gap-1 text-[11px]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Contoh Commit Nyata di Terminal:
                </div>
                <div className="bg-[#11141d] p-2 rounded-md border border-zinc-800 font-mono text-[10px] text-emerald-300 select-all break-all">
                  git commit -m "Selesaikan fitur [done #{tasks[0]?.task_code || 'TASK-01'}]"
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MODAL TAMBAH TUGAS NYATA */}
      {showAddTaskModal && (
        <div
          ref={modalTaskBackdropRef}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            ref={modalTaskRef}
            className="bg-[#11141d] border border-zinc-800 rounded-lg p-5 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Tambah Kartu Tugas Nyata</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Kode Tugas (contoh: TASK-01, FEAT-AUTH)</label>
                <input
                  type="text"
                  required
                  placeholder="TASK-01"
                  value={newTaskCode}
                  onChange={(e) => setNewTaskCode(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perancangan Arsitektur Database"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Assignee (Username GitHub)</label>
                <input
                  type="text"
                  placeholder="denoyey"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Status Awal</label>
                <select
                  value={newTaskStatus}
                  onChange={(e: any) => setNewTaskStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white"
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
                  className="px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
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
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            ref={modalMemberRef}
            className="bg-[#11141d] border border-zinc-800 rounded-lg p-5 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Tambah Anggota Kelompok Nyata</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dennis Pratama"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Username GitHub (tanpa @)</label>
                <input
                  type="text"
                  required
                  placeholder="denoyey"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
                >
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
