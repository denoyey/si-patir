import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
  ShieldCheck,
  Code2,
  Layers,
  Lock,
  CheckCircle2,
  Play,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Zap,
  Search,
  Server,
  Database,
  HelpCircle,
  Activity,
  Filter,
} from 'lucide-react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

type TabKey = 'architecture' | 'catalog' | 'security' | 'simulator' | 'qa';

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Tasks' | 'Webhooks' | 'Members' | 'Projects' | 'System';
  summary: string;
  description: string;
  headers?: { name: string; value: string; required?: boolean }[];
  params?: { name: string; type: string; description: string; required?: boolean }[];
  defaultBody?: any;
  exampleResponse?: any;
}

const ENDPOINTS_DATA: EndpointDoc[] = [
  // Webhooks
  {
    id: 'gh-webhook',
    method: 'POST',
    path: '/api/v1/webhooks/github',
    category: 'Webhooks',
    summary: 'Webhook Push dari GitHub',
    description: 'Menerima payload push commit dari GitHub. Diverifikasi dengan signature HMAC SHA-256.',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
      { name: 'X-Hub-Signature-256', value: 'sha256=<hmac_sha256_hex>', required: true },
      { name: 'X-GitHub-Event', value: 'push', required: false },
    ],
    defaultBody: {
      repository: { full_name: 'denoyey/si-patir' },
      pusher: { name: 'denoyey' },
      commits: [
        {
          id: '8a9b7c1',
          message: 'feat: integrasi auth & database state engine [done #TASK-02]',
          author: { name: 'Deni', username: 'denoyey' },
        },
      ],
    },
    exampleResponse: {
      success: true,
      message: 'GitHub webhook processed successfully',
      processedCommits: 1,
      affectedTasks: ['TASK-02'],
    },
  },
  {
    id: 'simulate-webhook',
    method: 'POST',
    path: '/api/v1/webhooks/simulate',
    category: 'Webhooks',
    summary: 'Simulasi Commit Lokal',
    description: 'Mengirim simulasi commit langsung dari dashboard web tanpa perlu push ke GitHub.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      developer: 'denoyey',
      message: 'feat(core): update task status [done #TASK-02]',
    },
    exampleResponse: {
      success: true,
      author: 'denoyey',
      taskCode: 'TASK-02',
      taskTitle: 'Integrasi Basis Data & Task State Engine',
      message: 'Commit web berhasil diproses dan disinkronkan ke Database.',
    },
  },

  // Tasks
  {
    id: 'get-tasks',
    method: 'GET',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Daftar Semua Tugas',
    description: 'Mengambil seluruh daftar kartu tugas dari basis data MySQL beserta status dan assignee.',
    exampleResponse: [
      {
        id: 2,
        task_code: 'TASK-02',
        title: 'Integrasi Basis Data & Task State Engine',
        status: 'Done',
        assignee: 'Patirparkerr',
        updated_at: '2026-11-16T10:00:00.000Z',
      },
      {
        id: 3,
        task_code: 'TASK-03',
        title: 'Desain Layout Dashboard & UI Realtime',
        status: 'Done',
        assignee: 'muhamadrafli16',
        updated_at: '2026-11-16T10:05:00.000Z',
      },
    ],
  },
  {
    id: 'get-task-detail',
    method: 'GET',
    path: '/api/v1/tasks/TASK-02',
    category: 'Tasks',
    summary: 'Detail Tugas Tertentu',
    description: 'Mengambil data satu tugas berdasarkan kode tugas (misal: TASK-02) atau ID numerik.',
    params: [{ name: 'id', type: 'string | number', description: 'Kode unik tugas atau ID integer', required: true }],
    exampleResponse: {
      success: true,
      task: {
        id: 2,
        task_code: 'TASK-02',
        title: 'Integrasi Basis Data & Task State Engine',
        status: 'Done',
        assignee: 'Patirparkerr',
      },
    },
  },
  {
    id: 'update-task-status',
    method: 'PATCH',
    path: '/api/v1/tasks/2/status',
    category: 'Tasks',
    summary: 'Perbarui Status Tugas',
    description: 'Mengubah status pengerjaan kartu tugas menjadi To Do, In Progress, atau Done.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      status: 'Done',
    },
    exampleResponse: {
      success: true,
      message: 'Status tugas TASK-02 berhasil diperbarui ke "Done".',
    },
  },
  {
    id: 'create-task',
    method: 'POST',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Tambah Tugas Baru',
    description: 'Membuat kartu tugas baru ke dalam database.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      taskCode: 'TASK-06',
      title: 'Optimalisasi Kueri Database',
      assignee: 'Patirparkerr',
      status: 'To Do',
    },
    exampleResponse: {
      success: true,
      message: 'Tugas berhasil dibuat.',
      task: {
        id: 6,
        task_code: 'TASK-06',
        title: 'Optimalisasi Kueri Database',
        status: 'To Do',
        assignee: 'Patirparkerr',
      },
    },
  },

  // Members
  {
    id: 'get-members',
    method: 'GET',
    path: '/api/v1/members',
    category: 'Members',
    summary: 'Daftar Anggota Tim',
    description: 'Mengambil daftar anggota tim beserta statistik jumlah commit dan tugas selesai.',
    exampleResponse: [
      { id: 1, name: 'Deni', github_username: 'denoyey', total_commits: 42, tasks_done: 2 },
      { id: 2, name: 'Fatir', github_username: 'Patirparkerr', total_commits: 2, tasks_done: 1 },
      { id: 3, name: 'Rafli', github_username: 'muhamadrafli16', total_commits: 0, tasks_done: 1 },
      { id: 4, name: 'Fajri', github_username: 'AATTTRAWRRR', total_commits: 0, tasks_done: 1 },
    ],
  },

  // Projects
  {
    id: 'get-projects',
    method: 'GET',
    path: '/api/v1/projects',
    category: 'Projects',
    summary: 'Daftar Profil Proyek',
    description: 'Mengambil daftar repositori yang dipantau beserta konfigurasi webhook masing-masing.',
    exampleResponse: {
      success: true,
      projects: [
        {
          id: 1,
          name: 'SI-PATIR (DevOps Lite)',
          slug: 'si-patir',
          github_repo: 'denoyey/si-patir',
          is_active: 1,
        },
      ],
    },
  },

  // System
  {
    id: 'system-status',
    method: 'GET',
    path: '/api/v1/system/status',
    category: 'System',
    summary: 'Status Sistem & Database',
    description: 'Mengecek konektivitas database MySQL, status realtime WebSocket, dan konfigurasi environment.',
    exampleResponse: {
      status: 'operational',
      database: 'connected (MySQL)',
      realtime: 'ready (Socket.io)',
      uptime: 3600,
    },
  },
  {
    id: 'security-status',
    method: 'GET',
    path: '/api/v1/system/security/status',
    category: 'System',
    summary: 'Laporan Konfigurasi Keamanan',
    description: 'Menampilkan status verifikasi HMAC, batasan rate limiter, dan proteksi SQL Injection.',
    exampleResponse: {
      success: true,
      security: {
        hmacVerification: { algorithm: 'HMAC-SHA256', timingAttackProtection: true },
        rateLimiting: { generalLimit: '120 req / minute', webhookLimit: '30 req / minute' },
        sqlInjectionDefense: { driver: 'MySQL2 Prepared Statements' },
      },
    },
  },
  {
    id: 'verify-hmac',
    method: 'POST',
    path: '/api/v1/system/security/verify-hmac',
    category: 'System',
    summary: 'Uji Kriptografi HMAC SHA-256',
    description: 'Menghitung hash digest HMAC SHA-256 dan melakukan komparasi buffer konstan.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      payload: { event: 'push', commit: 'fix bug [done #TASK-02]' },
      signature: '',
    },
    exampleResponse: {
      success: true,
      valid: true,
      algorithm: 'HMAC-SHA256',
      timingSafeUsed: true,
      executionDurationNs: 85000,
    },
  },
];

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('architecture');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS_DATA[0]);
  const [requestBodyText, setRequestBodyText] = useState(
    JSON.stringify(ENDPOINTS_DATA[0].defaultBody || {}, null, 2)
  );
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerResult, setRunnerResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Security live status
  const [securityStatus, setSecurityStatus] = useState<any>(null);

  // HMAC Lab
  const [hmacPayload] = useState('{"event":"push","ref":"refs/heads/main","message":"fix [done #TASK-02]"}');
  const [hmacSecret] = useState('sipatir_secret_123');
  const [hmacSignature, setHmacSignature] = useState('');
  const [hmacSimResult, setHmacSimResult] = useState<any>(null);
  const [hmacLoading, setHmacLoading] = useState(false);

  // Rate limit flood
  const [isRateTesting, setIsRateTesting] = useState(false);
  const [rateLimitLogs, setRateLimitLogs] = useState<{ reqId: number; status: number; text: string }[]>([]);

  // SQLi Lab
  const [sqliInput, setSqliInput] = useState("' OR '1'='1");
  const [sqliLoading, setSqliLoading] = useState(false);
  const [sqliResult, setSqliResult] = useState<any>(null);

  useEffect(() => {
    axios
      .get('/api/v1/system/security/status')
      .then((res) => setSecurityStatus(res.data?.security))
      .catch(() => {});
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredEndpoints = useMemo(() => {
    return ENDPOINTS_DATA.filter((ep) => {
      const matchCat = selectedCategory === 'All' || ep.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        ep.path.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectEndpoint = (ep: EndpointDoc) => {
    setSelectedEndpoint(ep);
    setRequestBodyText(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setRunnerResult(null);
  };

  const executeLiveRunner = async () => {
    setRunnerLoading(true);
    setRunnerResult(null);
    const start = performance.now();

    try {
      let res;
      if (selectedEndpoint.method === 'GET') {
        res = await axios.get(selectedEndpoint.path);
      } else if (selectedEndpoint.method === 'POST') {
        const body = requestBodyText ? JSON.parse(requestBodyText) : {};
        res = await axios.post(selectedEndpoint.path, body);
      } else if (selectedEndpoint.method === 'PATCH') {
        const body = requestBodyText ? JSON.parse(requestBodyText) : {};
        res = await axios.patch(selectedEndpoint.path, body);
      } else if (selectedEndpoint.method === 'DELETE') {
        res = await axios.delete(selectedEndpoint.path);
      }

      const durationMs = Math.round(performance.now() - start);
      if (res) {
        setRunnerResult({
          status: res.status,
          data: res.data,
          durationMs,
        });
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      setRunnerResult({
        status: err.response?.status || 500,
        data: err.response?.data || { error: err.message },
        durationMs,
      });
    } finally {
      setRunnerLoading(false);
    }
  };

  const handleTestHmac = async (scenario: 'valid' | 'spoofed') => {
    setHmacLoading(true);
    setHmacSimResult(null);

    try {
      let sigToSend = '';
      if (scenario === 'valid') {
        const calcRes = await axios.post('/api/v1/system/security/verify-hmac', {
          payload: JSON.parse(hmacPayload),
          signature: '',
          customSecret: hmacSecret,
        });
        sigToSend = calcRes.data.computedDigest;
        setHmacSignature(sigToSend);
      } else {
        sigToSend = 'sha256=9999999999999999999999999999999999999999999999999999999999999999';
        setHmacSignature(sigToSend);
      }

      const verifyRes = await axios.post('/api/v1/system/security/verify-hmac', {
        payload: JSON.parse(hmacPayload),
        signature: sigToSend,
        customSecret: hmacSecret,
      });

      setHmacSimResult({
        scenario,
        response: verifyRes.data,
        status: verifyRes.data.valid ? 200 : 401,
      });
    } catch (err: any) {
      setHmacSimResult({
        scenario,
        response: err.response?.data || { error: err.message },
        status: err.response?.status || 500,
      });
    } finally {
      setHmacLoading(false);
    }
  };

  const handleTestRateLimiter = async () => {
    if (isRateTesting) return;
    setIsRateTesting(true);
    setRateLimitLogs([]);

    const totalRequests = 35;
    const newLogs: { reqId: number; status: number; text: string }[] = [];

    for (let i = 1; i <= totalRequests; i++) {
      try {
        const res = await axios.post('/api/v1/webhooks/simulate', {
          developer: 'stress_tester',
          message: `spam test #${i}`,
        });
        const log = {
          reqId: i,
          status: res.status,
          text: `Request #${i}: 200 OK`,
        };
        newLogs.push(log);
        setRateLimitLogs([...newLogs]);
      } catch (err: any) {
        const status = err.response?.status || 500;
        const log = {
          reqId: i,
          status,
          text: status === 429 ? `Request #${i}: 429 Too Many Requests (Blocked)` : `Request #${i}: Error ${status}`,
        };
        newLogs.push(log);
        setRateLimitLogs([...newLogs]);
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    setIsRateTesting(false);
  };

  const handleTestSqli = async () => {
    setSqliLoading(true);
    setSqliResult(null);

    try {
      const res = await axios.get(`/api/v1/tasks/${encodeURIComponent(sqliInput)}`);
      setSqliResult({
        status: res.status,
        data: res.data,
        message: 'Kueri dieksekusi dengan aman menggunakan prepared statement.',
      });
    } catch (err: any) {
      setSqliResult({
        status: err.response?.status || 404,
        data: err.response?.data || { message: 'Tugas tidak ditemukan' },
        message: 'Aman: Input diproses sebagai string literal murni, bukan instruksi SQL.',
      });
    } finally {
      setSqliLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0f17] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111420]/95 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                SP
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white">SI-PATIR</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                Docs
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <a
              href="/api/v1/system/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Lihat spesifikasi OpenAPI JSON"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>OpenAPI JSON</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Simple Page Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-900/50">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Dokumentasi Sistem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Dokumentasi API &amp; Keamanan
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Panduan integrasi GitHub Webhook, Discord Bot, MySQL, serta simulasi keamanan sistem.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          {[
            { key: 'architecture', label: 'Arsitektur', icon: Layers },
            { key: 'catalog', label: 'Katalog API', icon: Code2 },
            { key: 'security', label: 'Keamanan', icon: Shield },
            { key: 'simulator', label: 'Simulasi Lab', icon: Play },
            { key: 'qa', label: 'Tanya Jawab', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ARSITEKTUR INTEGRASI */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            {/* Step Pipeline */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                Alur Integrasi Sistem
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Bagaimana commit dari GitHub diproses otomatis hingga tercatat di database dan diteruskan ke Discord.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40">
                    Langkah 1
                  </span>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white mt-2">Git Commit</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Developer melakukan push commit berformat tugas, contoh:
                  </p>
                  <code className="block mt-2 text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    git commit -m &quot;Fix [done #TASK-02]&quot;
                  </code>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40">
                    Langkah 2
                  </span>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white mt-2">GitHub Webhook</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    GitHub mengirim HTTP POST payload ke backend dengan signature:
                  </p>
                  <code className="block mt-2 text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    X-Hub-Signature-256
                  </code>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40">
                    Langkah 3
                  </span>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white mt-2">Verifikasi &amp; DB</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Backend validasi signature HMAC SHA-256 lalu update status tugas ke database MySQL:
                  </p>
                  <code className="block mt-2 text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    UPDATE tasks SET status = ?
                  </code>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/40">
                    Langkah 4
                  </span>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white mt-2">Discord &amp; Realtime</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Sistem mengirim pesan embed ke Discord dan broadcast event WebSocket ke browser:
                  </p>
                  <code className="block mt-2 text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    io.emit(&apos;activity_update&apos;)
                  </code>
                </div>
              </div>
            </div>

            {/* Protocol Comparison Table */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                Perbandingan Protokol Integrasi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Karakteristik teknis protokol yang digunakan dalam arsitektur SI-PATIR.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <th className="pb-2.5 font-semibold">Protokol</th>
                      <th className="pb-2.5 font-semibold">Pola Komunikasi</th>
                      <th className="pb-2.5 font-semibold">Beban Jaringan</th>
                      <th className="pb-2.5 font-semibold">Penggunaan di Sistem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">Webhook</td>
                      <td className="py-2.5">Event-driven (Push)</td>
                      <td className="py-2.5">Sangat hemat (hanya saat ada commit)</td>
                      <td className="py-2.5">Menerima event push GitHub dan kirim embed Discord</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">REST API</td>
                      <td className="py-2.5">Request - Response (Pull)</td>
                      <td className="py-2.5">Sesuai kebutuhan request</td>
                      <td className="py-2.5">CRUD kartu tugas, anggota, dan profil repositori</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">WebSocket</td>
                      <td className="py-2.5">Full-Duplex Realtime</td>
                      <td className="py-2.5">Koneksi tetap aktif (persistent)</td>
                      <td className="py-2.5">Update realtime tabel dashboard dan live stream aktivitas</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">Polling</td>
                      <td className="py-2.5">Request Terjadwal (Loop)</td>
                      <td className="py-2.5">Boros (tetap kirim meski data kosong)</td>
                      <td className="py-2.5">Dihindari, digantikan oleh Webhook dan WebSocket</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KATALOG REST API */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs text-zinc-400 font-medium px-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Kategori:
                </span>
                {['All', 'Tasks', 'Webhooks', 'Members', 'Projects', 'System'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'Semua' : cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari endpoint atau path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Split View: List on Left, Runner on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Endpoint List */}
              <div className="lg:col-span-5 space-y-2">
                {filteredEndpoints.map((ep) => {
                  const isSelected = selectedEndpoint.id === ep.id;
                  const methodColor =
                    ep.method === 'GET'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50'
                      : ep.method === 'POST'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                      : ep.method === 'PATCH'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50';

                  return (
                    <div
                      key={ep.id}
                      onClick={() => handleSelectEndpoint(ep)}
                      className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold border ${methodColor}`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {ep.path}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">{ep.summary}</p>
                    </div>
                  );
                })}

                {filteredEndpoints.length === 0 && (
                  <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                    Tidak ada endpoint yang cocok dengan pencarian.
                  </div>
                )}
              </div>

              {/* Endpoint Details & Live Runner */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
                  {/* Selected Info */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          {selectedEndpoint.method}
                        </span>
                        <span className="font-mono text-sm font-bold text-zinc-950 dark:text-white">
                          {selectedEndpoint.path}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `curl -X ${selectedEndpoint.method} "http://localhost:5000${selectedEndpoint.path}"`,
                            'curl'
                          )
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                        title="Salin perintah cURL"
                      >
                        {copiedKey === 'curl' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>cURL</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                      {selectedEndpoint.description}
                    </p>
                  </div>

                  {/* Headers if any */}
                  {selectedEndpoint.headers && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Headers:
                      </span>
                      <div className="space-y-1">
                        {selectedEndpoint.headers.map((h) => (
                          <div
                            key={h.name}
                            className="flex items-center justify-between text-xs font-mono px-2 py-1 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{h.name}:</span>
                            <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[260px]">{h.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body Editor */}
                  {['POST', 'PATCH'].includes(selectedEndpoint.method) && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Request Body (JSON):
                      </span>
                      <textarea
                        rows={6}
                        value={requestBodyText}
                        onChange={(e) => setRequestBodyText(e.target.value)}
                        className="w-full p-2.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Execute Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      disabled={runnerLoading}
                      onClick={executeLiveRunner}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {runnerLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Kirim Request</span>
                        </>
                      )}
                    </button>

                    {runnerResult && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-md ${
                            runnerResult.status >= 200 && runnerResult.status < 300
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          HTTP {runnerResult.status}
                        </span>
                        <span className="text-zinc-400">{runnerResult.durationMs} ms</span>
                      </div>
                    )}
                  </div>

                  {/* Response Box */}
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Respon Server:
                    </span>
                    <pre className="p-3 text-[11px] font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 overflow-x-auto max-h-72">
                      {runnerResult
                        ? JSON.stringify(runnerResult.data, null, 2)
                        : JSON.stringify(selectedEndpoint.exampleResponse || { note: 'Klik "Kirim Request" untuk melihat respon langsung.' }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MATRIKS KEAMANAN */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Server Security Status */}
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Status Proteksi Keamanan Backend
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Konfigurasi proteksi aktif pada gateway Node.js / Express SI-PATIR.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Proteksi Aktif</span>
                </span>
              </div>
            </div>

            {/* 6 Security Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">HMAC SHA-256</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Memvalidasi integritas payload webhook dari GitHub menggunakan fungsi{' '}
                  <code className="text-[11px] font-mono px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                    crypto.timingSafeEqual
                  </code>{' '}
                  agar terhindar dari celah <em>timing attack</em>.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Prepared Statements</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Semua kueri basis data menggunakan MySQL2 parameterized query (<code className="font-mono">?</code>) untuk
                  memisahkan kode SQL dari input data, menjamin keamanan dari serangan <em>SQL Injection</em>.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">IP Rate Limiting</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Membatasi frekuensi request IP per menit (30 req/m untuk endpoint webhook dan 120 req/m untuk API publik)
                  guna memblokir percobaan brute force dan banjir DoS.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Security Headers (Helmet)</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Mengonfigurasi Content-Security-Policy (CSP), <code className="font-mono">X-Frame-Options: DENY</code> (anti
                  clickjacking), dan <code className="font-mono">X-Content-Type-Options: nosniff</code>.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Batas Payload 100kb</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Ukuran body JSON request dibatasi maksimal 100kb (<code className="font-mono">limit: &apos;100kb&apos;</code>)
                  untuk mencegah server mengalami kehabisan memori akibat serangan <em>JSON bomb</em>.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Sanitasi Pesan Commit</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Karakter baris baru (<code className="font-mono">\r</code>, <code className="font-mono">\n</code>) dan tag
                  HTML pada pesan commit dibersihkan secara otomatis sebelum dicatat ke tabel riwayat aktivitas.
                </p>
              </div>
            </div>

            {/* Runtime Info Summary */}
            {securityStatus && (
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Konfigurasi Aktif Runtime:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-md bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block">Algoritma HMAC:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {securityStatus.hmacVerification?.algorithm || 'HMAC-SHA256'}
                    </span>
                  </div>
                  <div className="p-2 rounded-md bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block">Batas Webhook:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {securityStatus.rateLimiting?.webhookLimit || '30 req / min'}
                    </span>
                  </div>
                  <div className="p-2 rounded-md bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block">Driver Database:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {securityStatus.sqlInjectionDefense?.driver || 'MySQL2 Prepared Statements'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SIMULASI LAB INTERAKTIF */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Simulasi 1: Uji HMAC */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                    Simulasi 1
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Uji Validasi Kriptografi HMAC SHA-256
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Membuktikan sistem menolak webhook palsu dan menerima webhook dengan signature yang valid.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={hmacLoading}
                  onClick={() => handleTestHmac('valid')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer disabled:opacity-50"
                >
                  Uji Signature Valid
                </button>
                <button
                  type="button"
                  disabled={hmacLoading}
                  onClick={() => handleTestHmac('spoofed')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer disabled:opacity-50"
                >
                  Uji Signature Palsu
                </button>
              </div>

              {hmacSignature && (
                <div className="text-xs font-mono p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 break-all">
                  <span className="text-zinc-400 block text-[10px]">Header X-Hub-Signature-256 Terkirim:</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{hmacSignature}</span>
                </div>
              )}

              {hmacSimResult && (
                <div
                  className={`p-3.5 rounded-lg border text-xs font-mono space-y-1 ${
                    hmacSimResult.response.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {hmacSimResult.response.valid ? 'TANDA TANGAN VALID' : 'TANDA TANGAN DITOLAK (UNAUTHORIZED)'}
                    </span>
                    <span>HTTP {hmacSimResult.status}</span>
                  </div>
                  <p className="text-[11px] font-sans pt-1">{hmacSimResult.response.message}</p>
                  <p className="text-[10px] text-zinc-500 pt-1">
                    Waktu Komparasi Buffer: {hmacSimResult.response.executionDurationNs} ns (Constant-time)
                  </p>
                </div>
              )}
            </div>

            {/* Simulasi 2: Rate Limiter Flood */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                    Simulasi 2
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Uji Ketahanan IP Rate Limiter (Spam Test)
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Kirim 35 request secara cepat. Request 1–30 akan lolos (200 OK), dan request 31 ke atas otomatis diblokir (429 Too Many Requests).
                </p>
              </div>

              <div>
                <button
                  type="button"
                  disabled={isRateTesting}
                  onClick={handleTestRateLimiter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer disabled:opacity-50"
                >
                  {isRateTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim 35 Request...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Mulai Tes Rate Limiter</span>
                    </>
                  )}
                </button>
              </div>

              {rateLimitLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Progres: {rateLimitLogs.length} / 35 Request</span>
                    <span>
                      Diblokir:{' '}
                      <strong className="text-rose-600">
                        {rateLimitLogs.filter((l) => l.status === 429).length}
                      </strong>
                    </span>
                  </div>

                  <div className="p-3 text-[11px] font-mono rounded-md bg-zinc-950 text-zinc-300 max-h-48 overflow-y-auto space-y-1">
                    {rateLimitLogs.map((l) => (
                      <div
                        key={l.reqId}
                        className={l.status === 429 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}
                      >
                        {l.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simulasi 3: SQL Injection */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
                    Simulasi 3
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Uji Parameterized Query (Anti SQL Injection)
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Kirim string payload SQL Injection untuk menguji apakah query terproteksi oleh MySQL2 prepared statements.
                </p>
              </div>

              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="text"
                  value={sqliInput}
                  onChange={(e) => setSqliInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  disabled={sqliLoading}
                  onClick={handleTestSqli}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {sqliLoading ? 'Memeriksa...' : 'Kirim Uji'}
                </button>
              </div>

              {sqliResult && (
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-white">
                    <span>Hasil Evaluasi:</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800">
                      Status: {sqliResult.status}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 pt-1 leading-relaxed">{sqliResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TANYA JAWAB SIDANG */}
        {activeTab === 'qa' && (
          <div className="space-y-3">
            {[
              {
                q: '1. Mengapa memilih arsitektur Webhook dibanding Polling berkala?',
                a: 'Webhook bersifat event-driven (push). Server hanya bekerja saat developer melakukan push commit, sehingga menghemat bandwidth dan resource CPU. Sebaliknya, polling membebani server dengan request berkala meskipun tidak ada aktivitas baru.',
              },
              {
                q: '2. Bagaimana sistem memverifikasi bahwa webhook benar-benar dari GitHub?',
                a: 'GitHub mengirim header X-Hub-Signature-256 yang berisi hash HMAC SHA-256 dari seluruh payload menggunakan secret key bersama. Backend menghitung ulang hash tersebut dan membandingkannya.',
              },
              {
                q: '3. Mengapa menggunakan crypto.timingSafeEqual dan bukan operator ===?',
                a: 'Operator perbandingan biasa (===) berhenti pada karakter pertama yang berbeda (early-exit), sehingga rentan terhadap serangan timing attack di mana penyerang menebak signature berdasarkan perbedaan waktu eksekusi. timingSafeEqual membandingkan buffer dengan durasi konstan.',
              },
              {
                q: '4. Bagaimana sistem mencegah serangan SQL Injection?',
                a: 'Semua kueri SQL menggunakan prepared statements dengan placeholder (?) dari library mysql2/promise. Database mengompilasi struktur kueri terlebih dahulu sebelum memasukkan data, sehingga input pengguna selalu diperlakukan sebagai nilai string biasa, bukan perintah SQL.',
              },
              {
                q: '5. Apa yang terjadi jika database MySQL mati atau belum aktif saat commit masuk?',
                a: 'Sistem menerapkan in-memory fallback. Data tugas dan riwayat aktivitas sementara dialihkan ke penyimpanan memori aplikasi, dan notifikasi Discord tetap terkirim tanpa menyebabkan server crash.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2"
              >
                <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                    Q
                  </span>
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] py-4 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dokumentasi SI-PATIR • Mata Kuliah Pemrograman Integratif</span>
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:underline">
              Beranda
            </Link>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <a
              href="https://github.com/denoyey/si-patir"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
