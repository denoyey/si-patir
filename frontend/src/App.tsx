import { useState, useEffect } from 'react';
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
  Layers,
  Sparkles,
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
  status: string;
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

interface Status {
  mysql: boolean;
  trello: boolean;
  discord: boolean;
  github: boolean;
}

export function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [status, setStatus] = useState<Status>({
    mysql: false,
    trello: true,
    discord: true,
    github: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDemoTriggering, setIsDemoTriggering] = useState(false);
  const [lastEventToast, setLastEventToast] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
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
      console.error('Failed to fetch initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Socket.io real-time connection
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to real-time socket server');
    });

    socket.on('activity_update', (event) => {
      console.log('Received live activity update:', event);
      if (event.type === 'TASK_COMPLETED') {
        setLastEventToast(`🎉 ${event.author} menyelesaikan [${event.taskCode}]! Trello & Discord terupdate.`);
      } else {
        setLastEventToast(`📦 Commit baru dari ${event.author}: "${event.commitMsg}"`);
      }
      setTimeout(() => setLastEventToast(null), 6000);
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Trigger sync from Trello
  const handleSyncTrello = async () => {
    setIsSyncing(true);
    try {
      await axios.post('/api/tasks/sync');
      await fetchData();
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger Instant Demo Commit
  const handleSimulateDemo = async () => {
    setIsDemoTriggering(true);
    try {
      await axios.post('/api/simulate-commit', {
        developer: 'budi99',
        message: 'Fix bug tombol login [done #TASK-02]',
      });
      await fetchData();
    } finally {
      setIsDemoTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {lastEventToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{lastEventToast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
                <GitBranch className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  SI-PATIR
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono">
                    DevOps Lite v1.0
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="text-slate-500">Repo:</span>
              <span className="text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/40">
                kelompok-devops/si-patir-core (main)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncTrello}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              {isSyncing ? 'Syncing Trello...' : 'Sync Tugas dari Trello'}
            </button>

            <button
              onClick={handleSimulateDemo}
              disabled={isDemoTriggering}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
              title="Memicu otomatisasi commit seperti mengetik git push di terminal"
            >
              <Zap className="w-4 h-4" />
              {isDemoTriggering ? 'Memproses Demo...' : '⚡ Test Commit [done #TASK-02]'}
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-slate-500 text-[11px] uppercase tracking-wider">Status Koneksi API:</span>

          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">GitHub:</span>
            <span className="text-emerald-400 font-semibold">Connected 🟢</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Trello:</span>
            <span className="text-emerald-400 font-semibold">Connected 🟢</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Discord:</span>
            <span className="text-emerald-400 font-semibold">Connected 🟢</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">MySQL:</span>
            <span className={status.mysql ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {status.mysql ? 'Active 🟢' : 'Memory Sync 🟡'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: Leaderboard & Task Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: KLASEMEN KONTRIBUSI ANGGOTA */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Klasemen Kontribusi Anggota</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Total Anggota: {members.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-mono tracking-wider">
                    <th className="pb-3 pl-3">Rank</th>
                    <th className="pb-3">Developer</th>
                    <th className="pb-3 text-center">Commits</th>
                    <th className="pb-3 text-center">Tugas Selesai</th>
                    <th className="pb-3 text-right pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((member, idx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const isTop = idx === 0;
                    const isActive = member.total_commits >= 8;

                    return (
                      <tr key={member.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pl-3 font-mono font-bold text-base">
                          {idx < 3 ? medals[idx] : <span className="text-slate-500 pl-1">{idx + 1}</span>}
                        </td>
                        <td className="py-3.5">
                          <div className="font-semibold text-white flex items-center gap-2">
                            {member.name}
                            {isTop && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                Top Contributor
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-400">@{member.github_username}</div>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="px-2.5 py-1 bg-indigo-950/60 border border-indigo-800/50 rounded-lg text-indigo-300 font-mono font-bold text-xs">
                            {member.total_commits} commits
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-300 font-mono font-bold text-xs">
                            {member.tasks_done} tasks
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-3 font-mono text-xs">
                          {isActive ? (
                            <span className="text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/50">
                              Aktif 🔥
                            </span>
                          ) : (
                            <span className="text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-900/50">
                              Kurang Aktif 💤
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

          {/* SECTION 2: TABEL DAFTAR TUGAS TRELLO */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Daftar Tugas & Status Trello</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Sinkron Otomatis via Webhook
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => {
                const isDone = task.status === 'Done';
                const isInProgress = task.status === 'In Progress';

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isInProgress ? (
                          <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                        ) : (
                          <Layers className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300">
                            [#{task.task_code}]
                          </span>
                          <span className="font-semibold text-white text-sm">{task.title}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Assignee: <span className="font-mono text-slate-300">@{task.assignee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                          isDone
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : isInProgress
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT 1 COLUMN: LIVE WEBHOOK LOG TERMINAL */}
        <div className="space-y-6">
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col h-[680px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm tracking-wide">Live Webhook Log</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LISTENING
              </div>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 bg-black/70 border border-slate-800/90 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3.5 scrollbar-thin">
              <div className="text-slate-500 text-[11px]">
                // Menunggu sinyal push git dari terminal...
              </div>

              {logs.map((log) => (
                <div key={log.id} className="border-l-2 border-indigo-500/70 pl-3 py-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-indigo-400 font-bold">[{log.event_type}]</span>
                    <span>{log.created_at}</span>
                  </div>
                  <div className="text-slate-200">
                    Author: <span className="text-amber-300">@{log.author}</span>
                  </div>
                  <div className="text-slate-400 truncate">
                    Msg: <span className="text-slate-200 italic">"{log.commit_message}"</span>
                  </div>
                  {log.task_code && (
                    <div className="text-emerald-400 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Trello & Discord synced: #{log.task_code}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Demo Helper Box */}
            <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-indigo-400" /> Cara Demo di Terminal:
              </div>
              <code className="block bg-slate-900 px-2 py-1.5 rounded text-[11px] text-indigo-300 select-all border border-slate-800">
                git commit -m "Selesai [done #TASK-02]"
              </code>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
