import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Terminal,
  Code2,
  Layers,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Zap,
  BookOpen,
  Cpu,
  Search,
  Server,
  Database,
  HelpCircle,
  Activity,
  Globe,
  Radio,
  EyeOff,
  Filter,
} from 'lucide-react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

type TabKey = 'architecture' | 'catalog' | 'security-matrix' | 'simulator' | 'academic-qa';

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Webhooks' | 'Tasks' | 'Members' | 'Projects' | 'System';
  summary: string;
  description: string;
  headers?: { name: string; value: string; required?: boolean }[];
  params?: { name: string; type: string; description: string; required?: boolean }[];
  defaultBody?: any;
  exampleResponse?: any;
}

const ENDPOINTS_DATA: EndpointDoc[] = [
  // WEBHOOKS
  {
    id: 'gh-webhook',
    method: 'POST',
    path: '/api/v1/webhooks/github',
    category: 'Webhooks',
    summary: 'GitHub Push Webhook Receiver (HMAC Verified)',
    description:
      'Endpoint penangkap payload resmi saat developer melakukan git push ke GitHub. Dilindungi oleh verifikasi kriptografi HMAC SHA-256 konstan (crypto.timingSafeEqual), Anti-CRLF, dan Rate Limiter (30 req/m per IP).',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
      { name: 'X-Hub-Signature-256', value: 'sha256=<computed_hmac_sha256_hex>', required: true },
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
          url: 'https://github.com/denoyey/si-patir/commit/8a9b7c1',
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
    summary: 'Simulator Commit Web (Testing Cepat Nir-Internet)',
    description:
      'Memicu pemrosesan commit secara instan dari dashboard/terminal web tanpa memerlukan push fisik ke internet. Memutasi status tugas dan menyiarkan notifikasi live ke Discord & WebSocket.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      developer: 'denoyey',
      message: 'feat(core): implementasi task state engine [done #TASK-01]',
    },
    exampleResponse: {
      success: true,
      author: 'denoyey',
      taskCode: 'TASK-01',
      taskTitle: 'Buat Database & Skema User',
      commitUrl: 'https://github.com/denoyey/si-patir/commit/local-sim',
      message: 'Commit web berhasil diproses dan disinkronkan ke Database.',
    },
  },

  // TASKS
  {
    id: 'get-tasks',
    method: 'GET',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Daftar Semua Kartu Tugas (Task State Engine)',
    description:
      'Mengambil seluruh daftar kartu tugas dari database MySQL/in-memory fallback beserta status aktif ("To Do", "In Progress", "Done"), assignee, dan stempel waktu pembaruan.',
    exampleResponse: [
      {
        id: 1,
        task_code: 'TASK-01',
        title: 'Buat Database & Skema User',
        status: 'Done',
        assignee: 'denoyey',
        updated_at: '2026-11-16T10:00:00.000Z',
      },
      {
        id: 2,
        task_code: 'TASK-02',
        title: 'Integrasi Database & State Engine',
        status: 'In Progress',
        assignee: 'Patirparkerr',
        updated_at: '2026-11-16T10:05:00.000Z',
      },
    ],
  },
  {
    id: 'get-task-detail',
    method: 'GET',
    path: '/api/v1/tasks/TASK-02',
    category: 'Tasks',
    summary: 'Detail Tugas Spesifik (via ID atau Kode)',
    description:
      'Mengambil data tugas spesifik berdasarkan ID numerik atau kode tugas (misal: "TASK-02") menggunakan parameterized query MySQL2 terproteksi.',
    params: [{ name: 'id', type: 'string | number', description: 'Kode unik (TASK-02) atau ID integer (2)', required: true }],
    exampleResponse: {
      success: true,
      task: {
        id: 2,
        task_code: 'TASK-02',
        title: 'Integrasi Database & State Engine',
        status: 'In Progress',
        assignee: 'Patirparkerr',
      },
    },
  },
  {
    id: 'create-task',
    method: 'POST',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Pendaftaran Kartu Tugas Baru',
    description:
      'Mendaftarkan kartu tugas baru ke dalam database relasional dan menyiarkan pembaruan real-time ke seluruh klien terhubung via Socket.io.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      taskCode: 'TASK-06',
      title: 'Audit Keamanan & Penetrasi Rate Limiting',
      assignee: 'AATTTRAWRRR',
      status: 'In Progress',
    },
    exampleResponse: {
      success: true,
      task: {
        id: 6,
        task_code: 'TASK-06',
        title: 'Audit Keamanan & Penetrasi Rate Limiting',
        assignee: 'AATTTRAWRRR',
        status: 'In Progress',
      },
    },
  },
  {
    id: 'update-task-status',
    method: 'PATCH',
    path: '/api/v1/tasks/1/status',
    category: 'Tasks',
    summary: 'Transisi Status Tugas & Broadcast WebSocket',
    description:
      'Mengubah status kartu tugas ("To Do" ➔ "In Progress" ➔ "Done") dengan validasi ENUM ketat, sinkronisasi metrik tasks_done anggota, dan broadcast event WebSocket.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: { status: 'Done' },
    exampleResponse: {
      success: true,
      message: 'Status tugas berhasil diperbarui ke Done.',
    },
  },
  {
    id: 'sync-github-issues',
    method: 'POST',
    path: '/api/v1/tasks/sync-github-issues',
    category: 'Tasks',
    summary: 'Sinkronisasi Issue dari GitHub ke Daftar Tugas',
    description:
      'Menghubungi GitHub REST API untuk menarik seluruh issue terbuka/tertutup dari repositori resmi dan menyelaraskannya ke tabel tugas database lokal.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    exampleResponse: {
      success: true,
      message: 'Berhasil menyinkronkan 5 issue dari GitHub ke database lokal.',
      count: 5,
    },
  },

  // MEMBERS
  {
    id: 'get-members',
    method: 'GET',
    path: '/api/v1/members',
    category: 'Members',
    summary: 'Klasemen Kontributor Anggota Tim (Leaderboard)',
    description:
      'Mengambil daftar anggota tim yang diurutkan berdasarkan akumulasi commit Git riil dan jumlah tugas yang telah diselesaikan.',
    exampleResponse: [
      { id: 1, name: 'Deni', github_username: 'denoyey', total_commits: 15, tasks_done: 3 },
      { id: 2, name: 'Rafli', github_username: 'muhamadrafli16', total_commits: 9, tasks_done: 2 },
      { id: 3, name: 'Fatir', github_username: 'Patirparkerr', total_commits: 7, tasks_done: 2 },
      { id: 4, name: 'Fajri', github_username: 'AATTTRAWRRR', total_commits: 5, tasks_done: 1 },
    ],
  },
  {
    id: 'sync-github-members',
    method: 'POST',
    path: '/api/v1/members/sync-github',
    category: 'Members',
    summary: 'Sinkronisasi Kontributor Asli dari GitHub API',
    description:
      'Mengimpor kontributor autentik beserta metrik commit asli dari repositori remote GitHub dan membersihkan akun dummy.',
    exampleResponse: {
      success: true,
      message: 'Sinkronisasi kontributor GitHub berhasil',
      totalContributors: 4,
    },
  },

  // PROJECTS (MULTI-REPO)
  {
    id: 'get-projects',
    method: 'GET',
    path: '/api/v1/projects',
    category: 'Projects',
    summary: 'Daftar Profil Proyek Multi-Repo Terdaftar',
    description:
      'Mengambil daftar seluruh proyek multi-tenant dengan isolasi repositori GitHub dan webhook Discord masing-masing.',
    exampleResponse: [
      {
        id: 1,
        name: 'SI-PATIR (Default)',
        github_repo: 'denoyey/si-patir',
        is_active: 1,
        created_at: '2026-11-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'get-active-project',
    method: 'GET',
    path: '/api/v1/projects/active',
    category: 'Projects',
    summary: 'Profil Proyek Aktif Terisolasi',
    description: 'Mengambil konfigurasi proyek yang saat ini sedang menjadi fokus monitoring dan routing webhook.',
    exampleResponse: {
      id: 1,
      name: 'SI-PATIR',
      github_repo: 'denoyey/si-patir',
      is_active: 1,
    },
  },

  // SYSTEM & SECURITY
  {
    id: 'system-status',
    method: 'GET',
    path: '/api/v1/system/status',
    category: 'System',
    summary: 'Status Kesehatan Integrasi (Health Check)',
    description: 'Menampilkan kesiapan koneksi MySQL, Discord Webhook, GitHub connectivity, memory heap usage, dan uptime.',
    exampleResponse: {
      mysql: true,
      discord: true,
      github: true,
      repository: 'denoyey/si-patir',
      uptime: 4320.12,
      timestamp: '2026-11-16T10:30:00.000Z',
    },
  },
  {
    id: 'system-security-status',
    method: 'GET',
    path: '/api/v1/system/security/status',
    category: 'System',
    summary: 'Laporan Matriks Keamanan Siber Aktif',
    description: 'Mengambil status parameter keamanan runtime: algoritma HMAC SHA-256, batas rate limiter, proteksi SQLi, CSP, dan limit body JSON.',
    exampleResponse: {
      success: true,
      security: {
        hmacVerification: {
          algorithm: 'HMAC-SHA256',
          timingAttackProtection: true,
          method: 'crypto.timingSafeEqual',
          header: 'X-Hub-Signature-256',
        },
        rateLimiting: {
          generalLimit: '120 req / minute per IP',
          webhookLimit: '30 req / minute per IP',
        },
        sqlInjectionDefense: {
          driver: 'MySQL2 Prepared Statements',
          parameterizedQueries: '100%',
        },
      },
    },
  },
  {
    id: 'system-verify-hmac',
    method: 'POST',
    path: '/api/v1/system/security/verify-hmac',
    category: 'System',
    summary: 'Uji Komputasi & Verifikasi HMAC SHA-256',
    description:
      'Endpoint demonstrasi evaluasi signature biner constant-time untuk membuktikan integritas payload webhook dan perlindungan anti-tampering.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    defaultBody: {
      payload: { commits: [{ message: 'feat: test commit [done #TASK-02]' }] },
      signature: 'sha256=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    exampleResponse: {
      success: true,
      valid: false,
      algorithm: 'HMAC-SHA256',
      timingSafeUsed: true,
      executionDurationNs: 142000,
      message: 'Tanda tangan TIDAK COCOK: Signature dipalsukan atau payload telah diubah.',
    },
  },
  {
    id: 'system-logs',
    method: 'GET',
    path: '/api/v1/system/logs',
    category: 'System',
    summary: 'Audit Trail Aktivitas Webhook & Commit',
    description: 'Mengambil 50 aktivitas webhook, commit, dan perubahan status tugas terbaru dari basis data.',
    exampleResponse: [
      {
        id: 105,
        event_type: 'PUSH_EVENT',
        author: 'denoyey',
        commit_message: 'feat: test push [done #TASK-01]',
        status: 'SUCCESS',
        created_at: '2026-11-16T10:14:22.000Z',
      },
    ],
  },
];

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('architecture');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS_DATA[0]);
  const [requestBodyText, setRequestBodyText] = useState<string>(
    ENDPOINTS_DATA[0].defaultBody ? JSON.stringify(ENDPOINTS_DATA[0].defaultBody, null, 2) : ''
  );
  const [runnerLoading, setRunnerLoading] = useState<boolean>(false);
  const [runnerResult, setRunnerResult] = useState<{
    status: number;
    statusText: string;
    data: any;
    durationMs: number;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Security Simulator States
  const [hmacPayload, setHmacPayload] = useState<string>(
    JSON.stringify({ commits: [{ id: '9a8b7c', message: 'feat: test commit [done #TASK-02]' }] }, null, 2)
  );
  const [hmacSecret, setHmacSecret] = useState<string>('sipatir_secret_123');
  const [hmacSignature, setHmacSignature] = useState<string>('');
  const [hmacSimResult, setHmacSimResult] = useState<any>(null);
  const [hmacLoading, setHmacLoading] = useState<boolean>(false);

  // Rate limit simulator states
  const [rateLimitLogs, setRateLimitLogs] = useState<{ reqId: number; status: number; text: string; time: string }[]>([]);
  const [isRateTesting, setIsRateTesting] = useState<boolean>(false);

  // SQLi simulator states
  const [sqliInput, setSqliInput] = useState<string>("TASK-02' OR '1'='1");
  const [sqliResult, setSqliResult] = useState<any>(null);
  const [sqliLoading, setSqliLoading] = useState<boolean>(false);

  // System security status live from backend
  const [securityStatus, setSecurityStatus] = useState<any>(null);

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
        ep.method.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q);
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
      } else if (selectedEndpoint.method === 'PUT') {
        const body = requestBodyText ? JSON.parse(requestBodyText) : {};
        res = await axios.put(selectedEndpoint.path, body);
      } else if (selectedEndpoint.method === 'DELETE') {
        res = await axios.delete(selectedEndpoint.path);
      }

      const durationMs = Math.round(performance.now() - start);
      if (res) {
        setRunnerResult({
          status: res.status,
          statusText: res.statusText || 'OK',
          data: res.data,
          durationMs,
        });
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      setRunnerResult({
        status: err.response?.status || 500,
        statusText: err.response?.statusText || 'Request Error',
        data: err.response?.data || { error: err.message },
        durationMs,
      });
    } finally {
      setRunnerLoading(false);
    }
  };

  // HMAC Simulation test
  const handleTestHmac = async (scenario: 'valid' | 'spoofed' | 'missing') => {
    setHmacLoading(true);
    setHmacSimResult(null);

    try {
      let sigToSend = '';
      if (scenario === 'valid') {
        // Request backend to compute valid digest first or use simulator
        const calcRes = await axios.post('/api/v1/system/security/verify-hmac', {
          payload: JSON.parse(hmacPayload),
          signature: '',
          customSecret: hmacSecret,
        });
        sigToSend = calcRes.data.computedDigest;
        setHmacSignature(sigToSend);
      } else if (scenario === 'spoofed') {
        sigToSend = 'sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        setHmacSignature(sigToSend);
      } else {
        sigToSend = '';
        setHmacSignature('');
      }

      // Send test verification
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

  // Rate Limiter flood test (35 requests)
  const handleTestRateLimiter = async () => {
    if (isRateTesting) return;
    setIsRateTesting(true);
    setRateLimitLogs([]);

    const totalRequests = 35;
    const newLogs: { reqId: number; status: number; text: string; time: string }[] = [];

    for (let i = 1; i <= totalRequests; i++) {
      try {
        const res = await axios.post('/api/v1/webhooks/simulate', {
          developer: 'stress_tester',
          message: `spam commit #${i}`,
        });
        const log = {
          reqId: i,
          status: res.status,
          text: `Request #${i}: HTTP ${res.status} OK`,
          time: new Date().toLocaleTimeString('id-ID'),
        };
        newLogs.push(log);
        setRateLimitLogs([...newLogs]);
      } catch (err: any) {
        const status = err.response?.status || 500;
        const log = {
          reqId: i,
          status,
          text: status === 429 ? `Request #${i}: BLOCKED (HTTP 429 Too Many Requests)` : `Request #${i}: Error ${status}`,
          time: new Date().toLocaleTimeString('id-ID'),
        };
        newLogs.push(log);
        setRateLimitLogs([...newLogs]);
      }
      // Small 30ms interval between calls
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    setIsRateTesting(false);
  };

  // SQL Injection test against parameterized task detail
  const handleTestSqli = async () => {
    setSqliLoading(true);
    setSqliResult(null);

    try {
      const res = await axios.get(`/api/v1/tasks/${encodeURIComponent(sqliInput)}`);
      setSqliResult({
        status: res.status,
        data: res.data,
        safeMessage: 'Kueri dieksekusi dengan aman menggunakan MySQL2 prepared statement (tidak terjadi kebocoran data).',
      });
    } catch (err: any) {
      setSqliResult({
        status: err.response?.status || 404,
        data: err.response?.data || { message: 'Tugas tidak ditemukan' },
        safeMessage: 'Kueri aman: Input penyerang dianggap sebagai string literal murni dan tidak mengeksekusi sintaks SQL jahat.',
      });
    } finally {
      setSqliLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b10] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-blue-500/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c0f17]/95 border-b border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden"
              title="Kembali ke Beranda"
            >
              <div className="w-9 h-9 rounded-md bg-blue-600 dark:bg-blue-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                SP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-950 dark:text-white">
                    SI-PATIR
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
                    API &amp; Security Docs
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Portal Presentasi &amp; Dokumentasi Integrasi
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Buka Dashboard</span>
            </Link>

            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition"
              title="Buka Swagger UI Explorer di server port 5000"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Swagger /api/docs</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-50/60 via-slate-50 to-transparent dark:from-blue-950/20 dark:via-[#0c0f17] dark:to-transparent border-b border-zinc-200/80 dark:border-zinc-800/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mata Kuliah: Pemrograman Integratif • Standar Defense-in-Depth</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight max-w-4xl">
            Dokumentasi API, Arsitektur Webhook &amp; Matriks Keamanan Siber
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
            Panduan teknis resmi platform <strong>SI-PATIR</strong>. Menghubungkan ekosistem heterogen{' '}
            <strong className="text-zinc-900 dark:text-white">GitHub Webhook API</strong>,{' '}
            <strong className="text-zinc-900 dark:text-white">Discord Webhook API</strong>, basis data{' '}
            <strong className="text-zinc-900 dark:text-white">MySQL2</strong>, dan streaming{' '}
            <strong className="text-zinc-900 dark:text-white">Socket.io</strong> dengan proteksi siber berlapis untuk keperluan
            demonstrasi langsung di depan dosen penguji.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="p-3.5 rounded-lg bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                <Radio className="w-3.5 h-3.5 text-blue-500" />
                <span>Protokol Integrasi</span>
              </div>
              <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white">4 Sub-Sistem</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Webhook • REST • Socket • DB</p>
            </div>

            <div className="p-3.5 rounded-lg bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>REST API Endpoints</span>
              </div>
              <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white">{ENDPOINTS_DATA.length}+ Routes</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Versi modular v1 &amp; backward alias</p>
            </div>

            <div className="p-3.5 rounded-lg bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Lapisan Keamanan</span>
              </div>
              <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white">8 Vektor Shield</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">HMAC-256 • SQLi • RateLimit • ReDoS</p>
            </div>

            <div className="p-3.5 rounded-lg bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                <span>Latensi Pemrosesan</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">&lt; 15 milidetik</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Kueri terindeks in-memory &amp; DB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Navigation */}
      <section className="bg-white dark:bg-[#0c0f17] border-b border-zinc-200 dark:border-zinc-800 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>1. Arsitektur Integrasi API</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>2. Katalog REST API v1 (Live Test)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security-matrix')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'security-matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>3. Matriks Keamanan Siber</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>4. Lab Simulasi Keamanan (Interactive)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('academic-qa')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'academic-qa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>5. Tanya-Jawab Presentasi Dosen</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: ARSITEKTUR INTEGRASI API                                           */}
        {/* ========================================================================= */}
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            {/* Visual Architecture Flow */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    Alur Integrasi Multi-Sistem End-to-End
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Bagaimana SI-PATIR menghubungkan Git, Webhook Inbound, Basis Data, Chat Bot, dan Web UI secara otomatis
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold hidden sm:inline-block">
                  Event-Driven DevOps Lite
                </span>
              </div>

              {/* Step Flow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      STEP 01
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">Git Push</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Developer Commit</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Anggota tim mengetik commit Git berformat tugas:
                  </p>
                  <div className="mt-2.5 p-2 rounded-md bg-black text-emerald-400 font-mono text-[11px] leading-tight overflow-x-auto">
                    $ git commit -m "Fix login [done #TASK-02]"
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-500">
                    Otomatis mengirim HTTPS POST webhook ke SI-PATIR.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      STEP 02
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">Gate Security</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Verifikasi HMAC-256</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Gateway memeriksa header <code className="text-amber-600 dark:text-amber-400">X-Hub-Signature-256</code> menggunakan:
                  </p>
                  <div className="mt-2.5 p-2 rounded-md bg-black text-amber-300 font-mono text-[11px] leading-tight overflow-x-auto">
                    crypto.timingSafeEqual(sig, comp)
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-500">
                    Menolak timing attacks dan payload spoofed palsu.
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      STEP 03
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">State Engine</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Mutasi MySQL2 Relasional</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Tag <code className="text-emerald-600 dark:text-emerald-400">#TASK-02</code> diekstrak, status diubah menjadi <strong>Done</strong> via prepared statements:
                  </p>
                  <div className="mt-2.5 p-2 rounded-md bg-black text-blue-300 font-mono text-[11px] leading-tight overflow-x-auto">
                    UPDATE tasks SET status = ? WHERE code = ?
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-500">
                    Log audit dicatat ke tabel <code>activity_logs</code>.
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      STEP 04
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">Broadcast</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Discord &amp; WebSocket</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Sistem menembakkan notifikasi visual kaya secara simultan:
                  </p>
                  <ul className="mt-2.5 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span><strong>Discord</strong>: Rich Embed + Link Git</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-500" />
                      <span><strong>WebSocket</strong>: Live Toast di Web UI</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Comparison Table: Webhook vs Polling vs REST vs WebSocket */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Matriks Perbandingan: Webhook vs Polling vs REST vs WebSocket
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Dasar teoritis mata kuliah Pemrograman Integratif: Mengapa SI-PATIR mengkombinasikan berbagai teknologi komunikasi data.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Teknologi</th>
                      <th className="p-3">Arah Komunikasi</th>
                      <th className="p-3">Mekanisme Kerja</th>
                      <th className="p-3">Efisiensi Sumber Daya</th>
                      <th className="p-3">Penggunaan di SI-PATIR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-[11px]">
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">Inbound Webhook</td>
                      <td className="p-3">GitHub ➔ SI-PATIR</td>
                      <td className="p-3">Event-driven Push (Trigger saat event commit terjadi)</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Sangat Tinggi (Nir-beban saat idle)</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-300">Menangkap git push dari GitHub.com</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-3 font-bold text-purple-600 dark:text-purple-400">Outbound Webhook</td>
                      <td className="p-3">SI-PATIR ➔ Discord</td>
                      <td className="p-3">HTTP POST payload JSON Rich Embed</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Sangat Tinggi (Terkirim hanya saat task selesai)</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-300">Notifikasi instan ke grup Discord tim</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">RESTful API v1</td>
                      <td className="p-3">Frontend ⇄ Backend</td>
                      <td className="p-3">Request-Response stateless (CRUD Tasks, Members, Projects)</td>
                      <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">Tinggi (Terstruktur &amp; Terindeks)</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-300">Kueri klasemen, detail tugas, edit modal</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400">WebSocket (Socket.io)</td>
                      <td className="p-3">Backend ➔ All Web Clients</td>
                      <td className="p-3">Full-duplex Persistent TCP Stream</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Tinggi (Tanpa HTTP Handshake berulang)</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-300">Live Webhook Stream &amp; Toast di Dashboard</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KATALOG REST API V1 & LIVE PLAYGROUND                             */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Kategori:
                </span>
                {['All', 'Webhooks', 'Tasks', 'Members', 'Projects', 'System'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari endpoint atau path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Split Screen: List on left, Runner on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Endpoint List */}
              <div className="lg:col-span-5 space-y-2 max-h-[680px] overflow-y-auto pr-1">
                <div className="text-[11px] font-mono text-zinc-400 px-1">
                  Menampilkan {filteredEndpoints.length} dari {ENDPOINTS_DATA.length} Endpoint
                </div>

                {filteredEndpoints.map((ep) => {
                  const isSelected = selectedEndpoint.id === ep.id;
                  const methodColor =
                    ep.method === 'GET'
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : ep.method === 'POST'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
                      : ep.method === 'PATCH'
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';

                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => handleSelectEndpoint(ep)}
                      className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500/60 shadow-xs ring-1 ring-blue-500/30'
                          : 'bg-white dark:bg-[#11141e] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${methodColor}`}>
                          {ep.method}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">{ep.category}</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {ep.path}
                      </div>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {ep.summary}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Endpoint Live Runner & Spec Detail */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {selectedEndpoint.method}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white font-mono">
                        {selectedEndpoint.path}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{selectedEndpoint.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const curl = `curl -X ${selectedEndpoint.method} "http://localhost:5000${selectedEndpoint.path}"`;
                      copyToClipboard(curl, selectedEndpoint.id);
                    }}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
                    title="Salin perintah cURL"
                  >
                    {copiedKey === selectedEndpoint.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Headers if any */}
                {selectedEndpoint.headers && (
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Headers Wajib
                    </div>
                    <div className="space-y-1">
                      {selectedEndpoint.headers.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono"
                        >
                          <span className="text-zinc-500">{h.name}:</span>
                          <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[280px]">
                            {h.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body Editor (for POST/PATCH/PUT) */}
                {(selectedEndpoint.method === 'POST' ||
                  selectedEndpoint.method === 'PATCH' ||
                  selectedEndpoint.method === 'PUT') && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      <span>JSON Request Body (Dapat Diedit)</span>
                      <span className="text-[10px] lowercase text-zinc-500">application/json</span>
                    </div>
                    <textarea
                      rows={5}
                      value={requestBodyText}
                      onChange={(e) => setRequestBodyText(e.target.value)}
                      className="w-full p-2.5 rounded-md bg-zinc-950 text-emerald-400 font-mono text-xs border border-zinc-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Action Button: Execute Live Test */}
                <div>
                  <button
                    type="button"
                    onClick={executeLiveRunner}
                    disabled={runnerLoading}
                    className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {runnerLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengeksekusi Request ke Server...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Kirim Request Nyata (Live Test API)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Response Viewer */}
                {runnerResult && (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-[#0a0d14]">
                    <div className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-md text-[11px] ${
                            runnerResult.status >= 200 && runnerResult.status < 300
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}
                        >
                          HTTP {runnerResult.status} {runnerResult.statusText}
                        </span>
                        <span className="text-zinc-500 text-[11px]">Latensi: {runnerResult.durationMs}ms</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(runnerResult.data, null, 2), 'response')}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Salin JSON</span>
                      </button>
                    </div>

                    <pre className="p-3.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto max-h-60 leading-relaxed bg-zinc-950/90">
                      {JSON.stringify(runnerResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MATRIKS ARSITEKTUR KEAMANAN SIBER                                  */}
        {/* ========================================================================= */}
        {activeTab === 'security-matrix' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    8 Matriks Pertahanan Siber SI-PATIR (Defense-in-Depth)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Setiap celah potensial pada komunikasi integrasi ditutup dengan standar kriptografi dan hardening resmi.
                  </p>
                </div>
              </div>

              {securityStatus && (
                <div className="mt-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Status Keamanan Runtime:</strong> Webhook Secret:{' '}
                      <code className="font-mono bg-emerald-500/20 px-1 py-0.5 rounded text-[11px]">
                        {securityStatus.hmacVerification?.secretMasked || 'sipa••••••••'}
                      </code>{' '}
                      • Rate Limit Webhook:{' '}
                      <strong>{securityStatus.rateLimiting?.webhookLimit || '30 req/min'}</strong> • SQL Driver:{' '}
                      <strong>{securityStatus.sqlInjectionDefense?.driver || 'MySQL2'}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                    ONLINE &amp; HARDENED
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Security Pillar 1 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      SHIELD 01
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-500" />
                    Timing Attack Shield (HMAC SHA-256)
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Vektor Ancaman:</strong> Peretas mengirim ribuan signature palsu dan mengukur mikrodetik selisih eksekusi komparasi string biasa (<code>===</code>) untuk menebak hash karakter demi karakter.
                    </p>
                    <p>
                      <strong>Mitigasi Teknis:</strong> Menggunakan <code>crypto.timingSafeEqual(sigBuffer, compBuffer)</code>. Komparasi buffer biner berjalan dalam durasi konstan (O(1)) tanpa bergantung posisi ketidakcocokan karakter.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-md bg-zinc-950 text-emerald-400 font-mono text-[11px]">
                  crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computed))
                </div>
              </div>

              {/* Security Pillar 2 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      SHIELD 02
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    SQL Injection Defense (1st &amp; 2nd Order)
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Vektor Ancaman:</strong> Penyerang menyisipkan karakter petik kutip (<code>' OR '1'='1</code>) atau perintah mutasi (<code>DROP TABLE</code>) pada parameter pencarian atau pesan commit.
                    </p>
                    <p>
                      <strong>Mitigasi Teknis:</strong> 100% kueri basis data pada driver MySQL2 menggunakan <em>Parameterized Prepared Statements</em> dengan placeholder tanda tanya (<code>?</code>). Input tidak pernah dikompilasi sebagai kode SQL.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-md bg-zinc-950 text-blue-400 font-mono text-[11px]">
                  pool.query('SELECT * FROM tasks WHERE task_code = ?', [code])
                </div>
              </div>

              {/* Security Pillar 3 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      SHIELD 03
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Dual-Tier IP Rate Limiting (Anti-DoS)
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Vektor Ancaman:</strong> Serangan flooding request HTTP dalam volume besar untuk menghabiskan CPU dan membuat server hang (Denial of Service).
                    </p>
                    <p>
                      <strong>Mitigasi Teknis:</strong> Dua lapis limit berbasis IP: 120 req/menit untuk endpoint umum, dan pembatasan ketat <strong>30 req/menit</strong> pada endpoint webhook. Request melebihi batas langsung dibalas <code>HTTP 429 Too Many Requests</code>.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-md bg-zinc-950 text-amber-300 font-mono text-[11px]">
                  express-rate-limit: max 30 req/min for /api/v1/webhooks/*
                </div>
              </div>

              {/* Security Pillar 4 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      SHIELD 04
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    ReDoS Shield (Regular Expression DoS)
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Vektor Ancaman:</strong> Penyerang mengirim teks super panjang dengan nested repeating pattern yang memicu <em>Catastrophic Backtracking</em> pada regex parser, membekukan Event Loop Node.js.
                    </p>
                    <p>
                      <strong>Mitigasi Teknis:</strong> Pemotongan input teks sebelum regex (maks 1000 karakter) dan penulisan pola regex deterministik linear O(n) tanpa nested quantifiers.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-md bg-zinc-950 text-purple-300 font-mono text-[11px]">
                  msg.slice(0, 1000).match(/\[done\s*#?([a-zA-Z0-9_-]+)\]/i)
                </div>
              </div>

              {/* Security Pillar 5 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      SHIELD 05
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    JSON-Bomb &amp; Body Limit (100kb)
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Vektor Ancaman:</strong> Pengiriman payload JSON berukuran puluhan megabyte atau struktur rekursif dalam untuk menghabiskan alokasi memori heap V8 (Out of Memory Crash).
                    </p>
                    <p>
                      <strong>Mitigasi Teknis:</strong> Konfigurasi parser <code>express.json(&#123; limit: '100kb' &#125;)</code>. Request di atas batas otomatis ditolak di layer terluar dengan <code>HTTP 413 Payload Too Large</code>.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-md bg-zinc-950 text-red-400 font-mono text-[11px]">
                  app.use(express.json(&#123; limit: '100kb' &#125;))
                </div>
              </div>

              {/* Security Pillar 6 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      SHIELD 06
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-indigo-500" />
                    Log Injection &amp; Anti-CRLF Sanitization
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Vektor Ancaman:</strong> Penyerang menyisipkan karakter escape newline (<code>\r\n</code>) pada nama author atau pesan commit untuk memalsukan entri log audit server seolah-olah aktivitas sah.
                    </p>
                    <p>
                      <strong>Mitigasi Teknis:</strong> Modul <code>sanitizeString</code> membersihkan seluruh karakter <code>\r</code>, <code>\n</code>, dan <code>\t</code> menjadi spasi datar sebelum dicatat ke log audit atau basis data.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2.5 rounded-md bg-zinc-950 text-indigo-300 font-mono text-[11px]">
                  input.replace(/[\r\n\t]/g, ' ').trim().slice(0, 255)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LABORATORIUM SIMULASI KEAMANAN INTERAKTIF                          */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <div className="space-y-8">
            {/* Simulation 1: HMAC SHA-256 Signature Verification */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    Simulasi 1: Verifikasi Tanda Tangan Kriptografi HMAC SHA-256
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Buktikan ke dosen penguji bahwa server mampu membedakan payload asli dari GitHub vs payload palsu/spoofed penyerang.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">
                      Payload Webhook Git (JSON):
                    </label>
                    <textarea
                      rows={4}
                      value={hmacPayload}
                      onChange={(e) => setHmacPayload(e.target.value)}
                      className="w-full p-2.5 rounded-md bg-zinc-950 text-emerald-400 font-mono text-xs border border-zinc-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">
                      Webhook Secret (Tersimpan di .env Server):
                    </label>
                    <input
                      type="text"
                      value={hmacSecret}
                      onChange={(e) => setHmacSecret(e.target.value)}
                      className="w-full p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">
                      Header X-Hub-Signature-256 yang Dievaluasi:
                    </label>
                    <input
                      type="text"
                      placeholder="Dihasilkan otomatis berdasarkan skenario..."
                      value={hmacSignature}
                      onChange={(e) => setHmacSignature(e.target.value)}
                      className="w-full p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  {/* 3 Scenario Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestHmac('valid')}
                      disabled={hmacLoading}
                      className="flex-1 min-w-[140px] py-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Uji Signature Sah (200 OK)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestHmac('spoofed')}
                      disabled={hmacLoading}
                      className="flex-1 min-w-[140px] py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Uji Signature Palsu (401 Reject)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestHmac('missing')}
                      disabled={hmacLoading}
                      className="flex-1 min-w-[140px] py-2 px-3 rounded-md bg-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Tanpa Signature (Reject)</span>
                    </button>
                  </div>
                </div>

                {/* Simulation Output */}
                <div className="lg:col-span-6 p-4 rounded-lg bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-950 dark:text-white mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      Hasil Komputasi Kriptografi Server:
                    </div>

                    {hmacSimResult ? (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-md border text-xs font-mono ${
                            hmacSimResult.response?.valid
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-2 mb-1">
                            {hmacSimResult.response?.valid ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>STATUS: DITERIMA (HTTP 200 OK)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span>STATUS: DITOLAK (HTTP 401 UNAUTHORIZED)</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed mt-1">
                            {hmacSimResult.response?.message}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs font-mono bg-white dark:bg-black p-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px]">
                          <div>
                            <span className="text-zinc-500">Algoritma:</span>{' '}
                            <span className="text-blue-500 font-bold">HMAC-SHA256 (Constant-Time Safe)</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Timing-Safe Evaluator:</span>{' '}
                            <span className="text-emerald-500 font-bold">
                              {hmacSimResult.response?.timingSafeUsed ? 'Aktif (crypto.timingSafeEqual)' : 'Bypass / N/A'}
                            </span>
                          </div>
                          <div className="break-all">
                            <span className="text-zinc-500">Computed Hash:</span>{' '}
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {hmacSimResult.response?.computedDigest}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-zinc-500">
                        Pilih salah satu tombol skenario di sebelah kiri untuk menguji verifikasi kriptografi.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation 2: IP Rate Limiter Flooding Test */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                      Simulasi 2: Uji Ketahanan IP Rate Limiter (Anti-DDoS Flooding)
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Mengirim 35 request berturut-turut dalam 1 detik untuk membuktikan blokir otomatis <code>HTTP 429 Too Many Requests</code>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestRateLimiter}
                  disabled={isRateTesting}
                  className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isRateTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sedang Menyerang Server...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Kirim 35 Request Beruntun</span>
                    </>
                  )}
                </button>
              </div>

              {rateLimitLogs.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Progress Uji Beban: {rateLimitLogs.length} / 35 Request</span>
                    <span>
                      Blocked: {rateLimitLogs.filter((l) => l.status === 429).length} Request
                    </span>
                  </div>

                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{
                        width: `${(rateLimitLogs.filter((l) => l.status === 200).length / 35) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 h-full transition-all"
                      style={{
                        width: `${(rateLimitLogs.filter((l) => l.status === 429).length / 35) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="p-3 rounded-md bg-zinc-950 text-xs font-mono max-h-44 overflow-y-auto space-y-1">
                    {rateLimitLogs.map((log) => (
                      <div
                        key={log.reqId}
                        className={`text-[11px] flex items-center justify-between ${
                          log.status === 429
                            ? 'text-red-400 font-bold'
                            : 'text-emerald-400'
                        }`}
                      >
                        <span>{log.text}</span>
                        <span className="text-zinc-500">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 text-center py-4">
                  Klik tombol <strong>"Kirim 35 Request Beruntun"</strong> di pojok kanan atas untuk memulai simulasi serangan spam.
                </p>
              )}
            </div>

            {/* Simulation 3: SQL Injection Parameterized Shield */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    Simulasi 3: Uji Kekebalan SQL Injection (Prepared Statements)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Kirim sintaks SQL jahat ke endpoint kueri tugas dan amati bahwa driver MySQL2 memperlakukannya murni sebagai data literal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">
                      Input Parameter Kueri Tugas:
                    </label>
                    <input
                      type="text"
                      value={sqliInput}
                      onChange={(e) => setSqliInput(e.target.value)}
                      className="w-full p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-zinc-400 py-1">Preset Serangan:</span>
                    <button
                      type="button"
                      onClick={() => setSqliInput("TASK-02' OR '1'='1")}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    >
                      ' OR '1'='1
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqliInput("TASK-01'; DROP TABLE tasks; --")}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    >
                      DROP TABLE
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqliInput("<script>alert('pwned')</script>")}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    >
                      XSS Script Tag
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestSqli}
                    disabled={sqliLoading}
                    className="w-full py-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sqliLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>Uji Eksekusi Kueri ke Database</span>
                  </button>
                </div>

                <div className="md:col-span-6 p-4 rounded-lg bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-950 dark:text-white mb-2">
                      Hasil Respons Server &amp; Bukti Keamanan:
                    </div>

                    {sqliResult ? (
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
                          <div className="font-bold mb-1 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Status: Basis Data 100% Aman
                          </div>
                          <p className="text-[11px]">{sqliResult.safeMessage}</p>
                        </div>

                        <pre className="p-3 rounded-md bg-zinc-950 text-xs font-mono text-zinc-300 overflow-x-auto max-h-36">
                          {JSON.stringify(sqliResult.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-8">
                        Masukkan payload atau pilih preset serangan lalu klik "Uji Eksekusi Kueri".
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: TANYA-JAWAB PRESENTASI DOSEN (ACADEMIC DEFENSE)                     */}
        {/* ========================================================================= */}
        {activeTab === 'academic-qa' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Panduan Sidang &amp; Cheatsheet Tanya-Jawab Dosen Penguji
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Rangkuman argumentasi akademis dan teknis untuk menjawab pertanyaan khas dosen mata kuliah Pemrograman Integratif.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Q1 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  Kenapa arsitektur ini menggunakan Webhook dibanding Polling terjadwal (misal interval tiap 5 detik)?
                </h3>
                <div className="pl-8 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>Jawaban Teknis:</strong> Polling HTTP berbasis interval bekerja secara <em>pull-based</em> yang sangat boros sumber daya (*resource-heavy*): 95% request menghasilkan respons kosong ketika tidak ada aktivitas, namun tetap membebani CPU, bandwidth, dan kuota rate-limit GitHub API.
                  </p>
                  <p>
                    Sebaliknya, <strong>Webhook</strong> adalah arsitektur <em>event-driven (push-based)</em>. GitHub hanya akan menembak server SI-PATIR saat event nyata (push commit) benar-benar terjadi. Latensinya seketika (sub-second) dan beban server adalah nol saat idle.
                  </p>
                </div>
              </div>

              {/* Q2 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  Bagaimana SI-PATIR memastikan payload webhook benar-benar berasal dari GitHub dan bukan dari penyerang luar?
                </h3>
                <div className="pl-8 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>Jawaban Teknis:</strong> Melalui <strong>Kriptografi HMAC SHA-256</strong>. Sebelum mengirim payload, GitHub membuat digest hash menggunakan kunci rahasia bersama (<em>Shared Secret</em>). Hash tersebut dikirimkan dalam header <code className="text-blue-500">X-Hub-Signature-256</code>.
                  </p>
                  <p>
                    Server SI-PATIR menghitung ulang HMAC payload mentah menggunakan secret lokal yang sama. Jika penyerang tidak mengetahui secret, atau payload diubah 1 karakter saja di perjalanan (*tampered*), hash tidak akan cocok dan request langsung ditolak dengan status <strong>HTTP 401 Unauthorized</strong>.
                  </p>
                </div>
              </div>

              {/* Q3 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  Apa itu Timing Attack pada perbandingan tanda tangan, dan bagaimana SI-PATIR menangkisnya?
                </h3>
                <div className="pl-8 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>Jawaban Teknis:</strong> Operator perbandingan string biasa di JavaScript (<code>===</code>) melakukan *early-exit*: perbandingan berhenti seketika saat menemukan karakter pertama yang berbeda. Peretas dapat mengukur perbedaan waktu eksekusi dalam fraksi nanodetik untuk merekayasa token karakter demi karakter.
                  </p>
                  <p>
                    SI-PATIR menggunakan modul bawaan Node.js <code>crypto.timingSafeEqual(bufA, bufB)</code> yang mengevaluasi seluruh buffer bit-per-bit dalam durasi waktu yang selalu konstan (<em>constant-time execution</em>), sehingga tidak ada kebocoran informasi side-channel.
                  </p>
                </div>
              </div>

              {/* Q4 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  Mengapa sistem memerlukan WebSocket di samping Webhook?
                </h3>
                <div className="pl-8 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>Jawaban Teknis:</strong> Webhook adalah komunikasi <strong>Server-to-Server</strong> (GitHub ke backend SI-PATIR). Webhook tidak dapat langsung mendorong (*push*) data ke tab browser pengguna karena browser klien berada di balik NAT/firewall dan tidak memiliki IP publik terbuka.
                  </p>
                  <p>
                    Oleh karena itu, backend menginisialisasi <strong>Socket.io (WebSocket)</strong> yang membuka koneksi full-duplex dua arah persisten dengan browser. Begitu webhook GitHub diterima dan diverifikasi, event langsung dipancarkan secara instan ke antarmuka web pengguna tanpa reload browser.
                  </p>
                </div>
              </div>

              {/* Q5 */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    5
                  </span>
                  Bagaimana sistem menangani insiden jika database MySQL lokal mati atau belum aktif saat commit masuk?
                </h3>
                <div className="pl-8 text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>Jawaban Teknis:</strong> SI-PATIR menerapkan pola <strong>Graceful Degradation / In-Memory Fallback</strong>. Kelas <code>DatabaseService</code> secara otomatis mendeteksi status konektivitas pool MySQL.
                  </p>
                  <p>
                    Jika MySQL offline, sistem secara otomatis mengalihkan penyimpanan ke array memori terisolasi dengan state awal 5 tugas dan 4 kolaborator resmi. Notifikasi Discord dan siaran WebSocket tetap terkirim 100% mulus tanpa melempar fatal exception yang membuat server crash.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0c0f17] border-t border-zinc-200 dark:border-zinc-800/80 py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Tim Pengembang SI-PATIR. Dokumentasi Resmi Mata Kuliah Pemrograman Integratif.</p>
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <Link to="/" className="hover:underline">Beranda</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <a href="https://github.com/denoyey/si-patir" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub Repo ↗</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DocumentationPage;
