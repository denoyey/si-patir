import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  Clock,
  RefreshCw,
  Terminal,
  Trophy,
  Users,
  CheckSquare,
  Zap,
  Database,
  Search,
  Activity,
  Layers,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
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
  uptime?: number;
  timestamp?: string;
}

export function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [status, setStatus] = useState<SystemStatus>({
    mysql: false,
    trello: true,
    discord: true,
    github: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'In Progress' | 'Done' | 'To Do'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string } | null>(null);

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
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const handleSyncTrello = async () => {
    setIsSyncing(true);
    try {
      await axios.post('/api/tasks/sync');
      await refreshData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateCommit = async () => {
    setIsSimulating(true);
    try {
      await axios.post('/api/simulate-commit', {
        developer: 'budi99',
        message: 'Fix bug tombol login [done #TASK-02]',
      });
      await refreshData();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Notification Toast */}
      {activeToast && (
        <aside
          aria-live="polite"
          className="fixed top-4 right-4 z-50 bg-[#161a24] border border-emerald-500/30 text-zinc-200 px-4 py-3 rounded-lg shadow-2xl flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-white tracking-tight">{activeToast.title}</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{activeToast.desc}</p>
          </div>
        </aside>
      )}

      {/* NAVIGATION BAR */}
      <header className="border-b border-zinc-800/80 bg-[#0e111a]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-mono font-bold text-sm">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">SI-PATIR</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                  DevOps Control
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:inline-block">
                Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori
              </span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncTrello}
              disabled={isSyncing}
              className="h-8 px-3 rounded-md bg-zinc-800/80 hover:bg-zinc-750 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Trello</span>
            </button>

            <button
              onClick={handleSimulateCommit}
              disabled={isSimulating}
              className="h-8 px-3 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 border border-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
              title="Kirim payload commit webhook untuk simulasi pengujian demo"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
              <span>Test Commit [done #TASK-02]</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER: REPO & CONNECTIVITY STATUS */}
      <section className="border-b border-zinc-800/60 bg-[#090b10] py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
            <span>Target Repo:</span>
            <span className="text-zinc-200 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
              kelompok-devops/si-patir-core:main
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400">GitHub:</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400">Trello:</span>
              <span className="text-emerald-400 font-medium">Synced</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400">Discord:</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
              <Database className="w-3 h-3 text-blue-400" />
              <span className="text-zinc-400">MySQL:</span>
              <span className={status.mysql ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {status.mysql ? 'Connected' : 'Memory Fallback'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* SUMMARY METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#12151e] border border-zinc-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Total Commits</span>
              <GitCommit className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{metrics.totalCommits}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Terekam di repositori</div>
          </div>

          <div className="bg-[#12151e] border border-zinc-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Tugas Selesai</span>
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {metrics.totalDone} <span className="text-zinc-500 text-sm font-normal">/ {tasks.length}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Sinkronisasi status Trello</div>
          </div>

          <div className="bg-[#12151e] border border-zinc-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Tingkat Penyelesaian</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{metrics.completionRate}%</div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[#12151e] border border-zinc-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Protokol Keamanan</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold font-mono text-emerald-300 mt-1 flex items-center gap-1.5">
              <span>HMAC SHA-256</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Replay & DoS Hardened</div>
          </div>
        </div>

        {/* WORKSPACE DUAL COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Leaderboard & Task Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. KLASEMEN KONTRIBUSI */}
            <section className="bg-[#12151e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Klasemen Kontribusi Anggota
                  </h2>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{members.length} Developer</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0d0f17] text-zinc-400 font-mono text-[11px]">
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Nama & Akun GitHub</th>
                      <th className="py-2.5 px-4 text-center">Commits</th>
                      <th className="py-2.5 px-4 text-center">Tasks Done</th>
                      <th className="py-2.5 px-4 text-right">Status Kerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {members.map((member, index) => {
                      const isTop = index === 0;
                      const isActive = member.total_commits >= 8;

                      return (
                        <tr key={member.id} className="hover:bg-zinc-800/25 transition">
                          <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white flex items-center gap-1.5">
                              {member.name}
                              {isTop && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                                  Lead
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400">@{member.github_username}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/50">
                              {member.total_commits}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                              {member.tasks_done}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[11px]">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                                Kontributif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-700/40">
                                Perlu Dorongan
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

            {/* 2. DAFTAR TUGAS TRELLO & FILTER */}
            <section className="bg-[#12151e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Daftar Kartu Tugas (Trello Sync)
                  </h2>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#090b10] p-0.5 rounded-lg border border-zinc-800 text-xs">
                  {(['ALL', 'In Progress', 'Done', 'To Do'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${statusFilter === tab
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-zinc-800/60 bg-[#0d0f17]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kode tugas, judul, atau assignee..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#12151e] border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-600 transition"
                  />
                </div>
              </div>

              {/* Task Items List */}
              <div className="divide-y divide-zinc-800/50">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">Tidak ada tugas yang sesuai filter.</div>
                ) : (
                  filteredTasks.map((task) => {
                    const isDone = task.status === 'Done';
                    const isInProgress = task.status === 'In Progress';

                    return (
                      <div
                        key={task.id}
                        className="px-5 py-3.5 hover:bg-zinc-800/20 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : isInProgress ? (
                              <Clock className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Layers className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-zinc-200 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
                                [#{task.task_code}]
                              </span>
                              <span className="text-xs font-medium text-white">{task.title}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              Penanggung jawab: <span className="font-mono text-zinc-300">@{task.assignee}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${isDone
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isInProgress
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT 1 COLUMN: LIVE WEBHOOK AUDIT STREAM */}
          <aside className="space-y-4">
            <div className="bg-[#12151e] border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col h-160 shadow-sm">
              <div className="px-4 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-[#0e111a]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                    Live Webhook Stream
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>LISTENING</span>
                </div>
              </div>

              {/* Streaming Output Body */}
              <div className="flex-1 bg-[#090b10] p-4 font-mono text-xs overflow-y-auto space-y-3 divide-y divide-zinc-800/40">
                <div className="text-zinc-600 text-[11px] pb-2">
                  // Siap menerima sinyal push git dari webhook / hook lokal...
                </div>

                {logs.map((log) => (
                  <div key={log.id} className="pt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="text-blue-400 font-bold">[{log.event_type}]</span>
                      <span>{log.created_at}</span>
                    </div>
                    <div className="text-zinc-300 text-[11px]">
                      Author: <span className="text-amber-300">@{log.author}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] truncate">
                      Msg: <span className="text-zinc-200 italic">"{log.commit_message}"</span>
                    </div>
                    {log.task_code && (
                      <div className="text-emerald-400 text-[10px] flex items-center gap-1 pt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Trello card #{log.task_code} shifted to Done & Discord notified
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Instructions Panel */}
              <div className="p-3 bg-[#0d0f17] border-t border-zinc-800/80 text-[11px] space-y-1.5">
                <div className="font-semibold text-zinc-300 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" /> Perintah Demo di Terminal:
                </div>
                <div className="bg-[#12151e] p-2 rounded border border-zinc-800 font-mono text-[10px] text-emerald-300 select-all">
                  git commit -m "Fix bug [done #TASK-02]"
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
