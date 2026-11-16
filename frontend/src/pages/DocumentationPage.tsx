import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
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
  Send,
  Radio,
  FileCode,
  Workflow,
  ListChecks,
  BookOpen,
} from 'lucide-react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { UmlViewer } from '../components/UmlViewer';
import { UML_DIAGRAMS } from '../data/umlDiagrams';

type TabKey = 'architecture' | 'uml' | 'catalog' | 'security' | 'simulator' | 'qa';

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
    summary: 'Menerima Notifikasi Commit dari GitHub (Webhook Inbound)',
    description:
      'Endpoint otomatis yang dipanggil oleh GitHub setiap kali anggota tim melakukan push commit. Memeriksa tanda tangan HMAC SHA-256 dan mendeteksi tag tugas.',
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
    summary: 'Simulasi Commit Langsung dari Web',
    description:
      'Menguji alur integrasi commit secara langsung dari peramban tanpa perlu membuka terminal laptop. Memperbarui status tugas, database, dan Discord.',
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
    summary: 'Melihat Seluruh Daftar Kartu Tugas',
    description:
      'Mengambil seluruh daftar tugas tim yang tersimpan di basis data MySQL, termasuk status pengerjaan (To Do, In Progress, Done) dan anggota penanggung jawab.',
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
    summary: 'Melihat Detail Satu Tugas Tertentu',
    description:
      'Mengambil rincian data satu tugas berdasarkan kode pengenal (contoh: TASK-02) atau nomor ID database.',
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
    summary: 'Mengubah Status Pengerjaan Tugas',
    description:
      'Memperbarui status tugas secara manual melalui REST API ke salah satu dari tiga status: To Do, In Progress, atau Done.',
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
    summary: 'Menambahkan Kartu Tugas Baru',
    description:
      'Membuat catatan tugas baru ke dalam database proyek lengkap dengan kode unik, judul, penanggung jawab, dan status awal.',
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
    summary: 'Daftar Anggota Tim & Rekap Kontribusi',
    description:
      'Mengambil daftar seluruh anggota pengembang beserta statistik riil jumlah commit dan jumlah tugas yang telah berhasil diselesaikan.',
    exampleResponse: [
      { id: 1, name: 'Deni', github_username: 'denoyey', total_commits: 74, tasks_done: 1 },
      { id: 2, name: 'Fatir', github_username: 'Patirparkerr', total_commits: 4, tasks_done: 1 },
      { id: 3, name: 'Rafli', github_username: 'muhamadrafli16', total_commits: 4, tasks_done: 1 },
      { id: 4, name: 'Fajri', github_username: 'AATTTRAWRRR', total_commits: 4, tasks_done: 1 },
    ],
  },

  // Projects
  {
    id: 'get-projects',
    method: 'GET',
    path: '/api/v1/projects',
    category: 'Projects',
    summary: 'Daftar Profil Proyek & Repositori yang Dipantau',
    description:
      'Melihat daftar proyek multi-repo beserta konfigurasi webhook Discord masing-masing agar notifikasi terisolasi rapi.',
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
    summary: 'Cek Status Kesehatan Server & Database',
    description:
      'Memeriksa status operasional server, apakah database MySQL terhubung normal atau sedang dalam mode in-memory fallback, dan kesiapan WebSocket.',
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
    summary: 'Laporan Konfigurasi Keamanan Aktif',
    description:
      'Menampilkan status lapisan keamanan yang aktif: algoritma verifikasi HMAC, batasan laju request (Rate Limiter), dan perlindungan SQL Injection.',
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
    summary: 'Uji Validasi Kriptografi HMAC SHA-256',
    description:
      'Menghitung kode hash HMAC SHA-256 dari data payload lalu membandingkannya menggunakan buffer konstan waktu (anti-timing attack).',
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

interface QaTestCase {
  id: string;
  name: string;
  category: string;
  step: string;
  expected: string;
  link?: string;
  linkText?: string;
}

const QA_TEST_CASES: QaTestCase[] = [
  {
    id: 'TC-WEB-01',
    name: 'Bar Navigasi & Indikator 4 Sistem',
    category: 'Header',
    step: 'Periksa lampu indikator di header dashboard (GitHub, MySQL, Discord, WebSocket).',
    expected: 'Semua lampu berstatus hijau/aktif dan WebSocket Live terhubung ke port 5000.',
    link: '/dashboard',
    linkText: 'Ke Dashboard',
  },
  {
    id: 'TC-WEB-02',
    name: 'Terminal Web Git & Mutasi Tugas',
    category: 'Integrasi',
    step: 'Pilih tugas #TASK-02 di Terminal Web Git dashboard lalu klik "Eksekusi Commit & Push".',
    expected: 'Status tugas seketika berubah ke Done via WebSocket tanpa reload halaman.',
    link: '/dashboard',
    linkText: 'Uji di Web Git',
  },
  {
    id: 'TC-WEB-03',
    name: 'Tabel Tugas Filament v5 (Filter & Search)',
    category: 'Data Table',
    step: 'Ketik pencarian kode tugas, ubah filter status, dan klik badge status tugas langsung.',
    expected: 'Data tersaring seketika dan mutasi status tersimpan aman ke database.',
    link: '/dashboard',
    linkText: 'Lihat Tabel',
  },
  {
    id: 'TC-WEB-04',
    name: 'Modal Manajemen Tugas (CRUD)',
    category: 'Task Manager',
    step: 'Klik Tambah Tugas baru, edit via modal pensil, dan hapus via dialog konfirmasi.',
    expected: 'Tugas baru berhasil dibuat, diedit, dan dihapus dengan validasi input yang aman.',
    link: '/dashboard',
    linkText: 'Buka Dashboard',
  },
  {
    id: 'TC-WEB-05',
    name: 'Klasemen & Skor 4 Anggota Resmi',
    category: 'Leaderboard',
    step: 'Periksa panel klasemen tim (Deni, Fatir, Rafli, Fajri) setelah mengeksekusi commit.',
    expected: 'Poin commit bertambah +1 dan peringkat terhitung otomatis sesuai keaktifan.',
    link: '/dashboard',
    linkText: 'Cek Klasemen',
  },
  {
    id: 'TC-WEB-06',
    name: 'Grafik Analitik SVG (Bar & Donut)',
    category: 'Analitik',
    step: 'Arahkan kursor ke batang grafik commit dan irisan diagram donat distribusi tugas.',
    expected: 'Tooltip angka presisi muncul dan irisan donat selalu berjumlah tepat 100%.',
    link: '/dashboard',
    linkText: 'Lihat Grafik',
  },
  {
    id: 'TC-WEB-07',
    name: 'Live Activity Stream & Modal Riwayat',
    category: 'Real-Time',
    step: 'Kirim commit baru lalu periksa log di panel live stream dan buka "Lihat Semua Log".',
    expected: 'Log baru tersisip paling atas seketika dengan format waktu bahasa Indonesia.',
    link: '/dashboard',
    linkText: 'Cek Stream',
  },
  {
    id: 'TC-WEB-08',
    name: '6 Diagram Arsitektur UML (Pan & Zoom)',
    category: 'UML Docs',
    step: 'Buka tab Diagram UML, geser kanvas (drag), zoom dengan scroll/tombol, dan coba fullscreen.',
    expected: 'Vektor SVG tajam, tidak ada teks terpotong, dan kontrol interaktif responsif.',
    link: '/docs?tab=uml',
    linkText: 'Uji Diagram UML',
  },
  {
    id: 'TC-WEB-09',
    name: 'Lab Uji Keamanan (HMAC, Rate Limit, SQLi)',
    category: 'Keamanan',
    step: 'Jalankan 3 tombol simulasi di bawah: Uji HMAC palsu, kirim 35 request, dan uji SQLi.',
    expected: 'HMAC palsu ditolak 401, banjir request dicegat 429, dan SQLi tertahan aman.',
  },
  {
    id: 'TC-WEB-10',
    name: 'Responsivitas Semua Device & iPhone',
    category: 'UI/UX Mobile',
    step: 'Buka DevTools mode mobile (320px, 375px, 390px iPhone) dan uji scroll horizontal tab.',
    expected: 'Tidak ada layout overflow, tab scroll lancar, dan aman dari notch/dynamic island.',
  },
];



export function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'architecture';
  const [activeTab, setActiveTab] = useState<TabKey>(
    ['architecture', 'uml', 'catalog', 'security', 'simulator', 'qa'].includes(initialTab)
      ? initialTab
      : 'architecture'
  );
  const initialDiagram = searchParams.get('diagram') || UML_DIAGRAMS[0].id;
  const [selectedUmlId, setSelectedUmlId] = useState<string>(
    UML_DIAGRAMS.some((d) => d.id === initialDiagram) ? initialDiagram : UML_DIAGRAMS[0].id
  );

  const activeUml = useMemo(
    () => UML_DIAGRAMS.find((d) => d.id === selectedUmlId) || UML_DIAGRAMS[0],
    [selectedUmlId]
  );

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

  // QA Interactive Checklist State
  const [checkedQaTests, setCheckedQaTests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sipatir_qa_checklist');
      return saved ? JSON.parse(saved) : QA_TEST_CASES.map((t) => t.id);
    } catch {
      return QA_TEST_CASES.map((t) => t.id);
    }
  });

  const toggleQaTest = (id: string) => {
    setCheckedQaTests((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sipatir_qa_checklist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const markAllQaTests = (passed: boolean) => {
    const next = passed ? QA_TEST_CASES.map((t) => t.id) : [];
    setCheckedQaTests(next);
    try {
      localStorage.setItem('sipatir_qa_checklist', JSON.stringify(next));
    } catch {}
  };

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
          notifyDiscord: false,
        });
        const log = {
          reqId: i,
          status: res.status,
          text: `Request #${i}: 200 OK (Berhasil)`,
        };
        newLogs.push(log);
        setRateLimitLogs([...newLogs]);
      } catch (err: any) {
        const status = err.response?.status || 500;
        const log = {
          reqId: i,
          status,
          text: status === 429 ? `Request #${i}: 429 Terlalu Banyak Request (Diblokir)` : `Request #${i}: Error ${status}`,
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
        message: 'Kueri aman: Input dicari sebagai teks nama tugas murni, bukan perintah SQL.',
      });
    } catch (err: any) {
      setSqliResult({
        status: err.response?.status || 404,
        data: err.response?.data || { message: 'Tugas tidak ditemukan' },
        message: 'Aman: Input diproses sebagai nilai parameter biasa, database tidak tertembus.',
      });
    } finally {
      setSqliLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0f17] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors overflow-x-hidden">
      {/* Header Bar with Safe Area support */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111420]/95 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md pt-[env(safe-area-inset-top,0px)] px-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
              <div className="w-8 h-8 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                SP
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white truncate">SI-PATIR</span>
              <span className="hidden xs:inline-flex text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                Docs &amp; Lab
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition cursor-pointer shadow-xs shrink-0 touch-manipulation"
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Buka Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>

            <a
              href="/api/v1/system/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
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

      {/* Main Container with iPhone Safe Areas */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1 w-full space-y-5 sm:space-y-6 pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
        {/* Simple & Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Dokumentasi SI-PATIR
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-900/50">
                v2.2.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Integrasi GitHub Webhook, MySQL, Discord Bot, WebSocket, dan Pengujian QA.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium transition shadow-xs"
            >
              <span>Buka Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs with Momentum Scroll */}
        <div className="flex items-center gap-1 sm:gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar touch-scroll px-0.5">
          {[
            { key: 'architecture', label: '1. Alur Kerja', icon: Layers },
            { key: 'uml', label: '2. Diagram UML (6)', icon: Workflow },
            { key: 'catalog', label: '3. Katalog API', icon: Code2 },
            { key: 'security', label: '4. Keamanan', icon: Shield },
            { key: 'simulator', label: '5. Lab Pengujian & QA', icon: Play },
            { key: 'qa', label: '6. Tanya Jawab', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as TabKey);
                  setSearchParams({ tab: tab.key });
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 touch-manipulation ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ALUR KERJA SISTEM */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 sm:space-y-5">
            {/* 4 Langkah Kerja Otomatis */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Alur Integrasi Otomatis (Event-Driven)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Dari commit di laptop mahasiswa hingga update real-time di web dan Discord.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Step 1 */}
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40">
                      1. Git Push
                    </span>
                    <span className="text-[10px] text-zinc-400">Developer</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    Push Kode &amp; Tag Tugas
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Sertakan kode tugas pada pesan commit:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate">
                    git commit -m &quot;feat [done #TASK-02]&quot;
                  </code>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40">
                      2. Webhook
                    </span>
                    <span className="text-[10px] text-zinc-400">GitHub</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    GitHub Kirim Payload
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Terkirim aman dengan stempel digital:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate">
                    X-Hub-Signature-256 (HMAC)
                  </code>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40">
                      3. Backend
                    </span>
                    <span className="text-[10px] text-zinc-400">MySQL</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    Validasi &amp; Mutasi Tugas
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    HMAC diverifikasi, status tugas diupdate:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate">
                    UPDATE tasks SET status = &apos;Done&apos;
                  </code>
                </div>

                {/* Step 4 */}
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/40">
                      4. Real-Time
                    </span>
                    <span className="text-[10px] text-zinc-400">WebSocket</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    Update Web &amp; Discord
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Layar dashboard terupdate tanpa reload:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate">
                    io.emit(&apos;activity_update&apos;)
                  </code>
                </div>
              </div>
            </div>

            {/* Protocol Comparison Table */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Perbandingan Protokol Integrasi
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Alasan teknis pemilihan protokol pada SI-PATIR.
                </p>
              </div>

              <div className="overflow-x-auto no-scrollbar touch-scroll -mx-1 px-1 sm:mx-0 sm:px-0">
                <table className="w-full min-w-140 text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <th className="pb-2 font-semibold">Protokol</th>
                      <th className="pb-2 font-semibold">Cara Kerja</th>
                      <th className="pb-2 font-semibold">Beban &amp; Kuota</th>
                      <th className="pb-2 font-semibold">Fungsi di SI-PATIR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <td className="py-2 font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Webhook</span>
                        </div>
                      </td>
                      <td className="py-2">Push data otomatis saat ada commit</td>
                      <td className="py-2 text-emerald-600 dark:text-emerald-400 font-medium">Sangat hemat (event-driven)</td>
                      <td className="py-2">Menerima push commit dari GitHub &amp; kirim ke Discord</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-purple-500" />
                          <span>WebSocket</span>
                        </div>
                      </td>
                      <td className="py-2">Koneksi dua arah selalu terbuka</td>
                      <td className="py-2">Efisien (hanya kirim pesan mutasi)</td>
                      <td className="py-2">Update tabel tugas &amp; grafik secara instan</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-blue-500" />
                          <span>REST API</span>
                        </div>
                      </td>
                      <td className="py-2">Request - Response standar</td>
                      <td className="py-2">Sesuai kebutuhan pengguna</td>
                      <td className="py-2">Ambil data awal, CRUD tugas, &amp; data anggota</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/10">
                      <td className="py-2 font-semibold text-zinc-900 dark:text-white line-through opacity-70">
                        Polling
                      </td>
                      <td className="py-2 text-zinc-500">Tanya berulang setiap detik</td>
                      <td className="py-2 text-rose-600 dark:text-rose-400 font-medium">Boros CPU &amp; kuota</td>
                      <td className="py-2 text-zinc-500 italic">Ditinggalkan, diganti Webhook &amp; WebSocket</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tim Pengembang (Simple 4 Cards) */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    Tim Pengembang &amp; Peran
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Proyek Kelompok Pemrograman Integratif — Status: 100% Selesai.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Siap Presentasi</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Deni (@denoyey)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Lead</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Arsitektur backend, Webhook gateway, dan hardening HMAC SHA-256.
                  </p>
                </div>

                <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Fatir (@Patirparkerr)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Database</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Skema MySQL, Anti-SQLi Prepared Statements, dan bot outbound Discord.
                  </p>
                </div>

                <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-600 dark:text-purple-400">Rafli (@muhamadrafli16)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Frontend</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Dashboard React 19, Filament v5 data table, grafik SVG, dan Web Git.
                  </p>
                </div>

                <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Fajri (@AATTTRAWRRR)</span>
                    <span className="text-[10px] font-mono text-zinc-400">QA &amp; Sec</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Automated testing (37 test suite), simulasi keamanan, dan 6 diagram UML.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIAGRAM ARSITEKTUR UML (INTERACTIVE PAN & ZOOM) */}
        {activeTab === 'uml' && (
          <div className="space-y-6">
            {/* Header Description Card */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0 mt-0.5 sm:mt-0">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                      6 Diagram Arsitektur UML Resmi (SI-PATIR)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Standar pemodelan rekayasa perangkat lunak formal untuk evaluasi akademik tugas mata kuliah Pemrograman Integratif.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-mono text-[11px] font-semibold">
                    SVG Vektor HD
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 font-mono text-[11px] font-semibold">
                    Pan &amp; Zoom Aktif
                  </span>
                </div>
              </div>

              {/* Diagram Navigation Selector Pills */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1.5 no-scrollbar touch-scroll">
                  {UML_DIAGRAMS.map((diag) => {
                    const isSelected = selectedUmlId === diag.id;
                    return (
                      <button
                        key={diag.id}
                        type="button"
                        onClick={() => {
                          setSelectedUmlId(diag.id);
                          setSearchParams({ tab: 'uml', diagram: diag.id });
                        }}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 touch-manipulation ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-700/80'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {diag.number}
                        </span>
                        <span>{diag.title.split('(')[0].trim()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Diagram Details & Pan-Zoom Viewer */}
            {activeUml && (
              <div className="space-y-4">
                {/* Diagram Metadata Card */}
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 font-semibold">
                        {activeUml.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {activeUml.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                      {activeUml.number}. {activeUml.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {activeUml.summary}
                    </p>
                  </div>
                </div>

                {/* The Interactive Pan & Zoom Canvas */}
                <UmlViewer
                  id={activeUml.id}
                  code={activeUml.code}
                  title={`${activeUml.number}. ${activeUml.title}`}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KATALOG API & LIVE RUNNER */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420]">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar touch-scroll pb-1 sm:pb-0">
                <span className="text-xs text-zinc-400 font-medium px-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3" />
                  Kategori:
                </span>
                {['All', 'Tasks', 'Webhooks', 'Members', 'Projects', 'System'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 touch-manipulation ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'Semua' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-auto sm:min-w-56">
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

            {/* Split View */}
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
                        <span className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold border ${methodColor}`}>
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

                  {/* Headers */}
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
                            <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-65">{h.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {['POST', 'PATCH'].includes(selectedEndpoint.method) && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Data Body (Format JSON):
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
                          <span>Mengirim Request...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Kirim Request Langsung</span>
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
                      Balasan dari Server (Response):
                    </span>
                    <pre className="p-3 text-[11px] font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 overflow-x-auto max-h-72">
                      {runnerResult
                        ? JSON.stringify(runnerResult.data, null, 2)
                        : JSON.stringify(
                            selectedEndpoint.exampleResponse || { note: 'Klik tombol "Kirim Request Langsung" untuk mencoba.' },
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROTEKSI KEAMANAN SIBER */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-3.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  6 Lapisan Keamanan Siber (OWASP Compliant)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Proteksi aktif pada server backend untuk mengamankan data dan mencegah eksploitasi API.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-500" />
                      1. HMAC SHA-256
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">Inbound</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Validasi stempel webhook secara konstan via <code className="text-[11px] font-mono">timingSafeEqual</code> untuk mencegah timing attack.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-500" />
                      2. Anti-SQL Injection
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">Database</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Parameterized queries menggunakan driver MySQL2 dengan placeholder <code className="text-[11px] font-mono">?</code>, kebal injeksi SQL.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      3. Rate Limiting
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">DDoS</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Membatasi 30 req/menit (webhook) &amp; 120 req/menit (API) untuk mencegah flooding DoS (HTTP 429).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-rose-500" />
                      4. Batas Payload 100KB
                    </span>
                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">Memory</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Menolak muatan request raksasa untuk melindungi memori server dari serangan JSON Bomb (HTTP 413).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-teal-500" />
                      5. Sanitasi Input (Anti-XSS)
                    </span>
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-900/40">XSS</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Pesan commit otomatis dibersihkan dari tag HTML dan injeksi script berbahaya.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-500" />
                      6. Helmet Security Headers
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900/40">Headers</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Header keamanan CSP &amp; <code className="text-[11px] font-mono">X-Frame-Options: DENY</code> pencegah clickjacking.
                  </p>
                </div>
              </div>

              {/* Status Runtime Ringkas */}
              {securityStatus && (
                <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Status Server:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                      HMAC: {securityStatus.hmacVerification?.algorithm || 'HMAC-SHA256'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                      Rate Limit: {securityStatus.rateLimiting?.webhookLimit || '30 req/min'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                      SQL: MySQL2 Prepared
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PANDUAN PENGUJIAN SISTEM & QA (2 PILAR LENGKAP) */}
        {activeTab === 'simulator' && (
          <div className="space-y-5">
            {/* Header Pengujian QA */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                      Panduan Pengujian Sistem &amp; QA
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-semibold">
                      QA Lead: Fajri
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Dua pilar pengujian menyeluruh: verifikasi fitur utama dan pembuktian ketahanan keamanan siber.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
                >
                  <span>Buka Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://github.com/denoyey/si-patir/blob/main/docs/academic/PANDUAN-TESTING-WEB-QA.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition"
                >
                  <span>Manual QA</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* DUA PILAR PENGUJIAN LENGKAP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* PILAR 1: PENGUJIAN FITUR UTAMA & INTEGRASI */}
              <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Pilar 1: Fitur Utama
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">5 Alur Otomasi</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Pengujian Fitur Utama &amp; Otomasi
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Verifikasi pipeline otomatisasi dari commit Git hingga notifikasi Discord.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Skenario 1 */}
                    <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          1. Terminal Git &amp; Mutasi Status
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">Otomatis</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Ketik pesan commit dengan tag tugas di Terminal Dashboard:
                      </p>
                      <div className="relative group">
                        <pre className="p-2 rounded bg-zinc-900 text-zinc-100 text-[11px] font-mono overflow-x-auto truncate border border-zinc-800 pr-14">
                          git commit -m &quot;feat: api [done #TASK-02]&quot;
                        </pre>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('git commit -m "feat: api [done #TASK-02]"', 'cmd-commit-task')}
                          className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono inline-flex items-center gap-1 transition cursor-pointer border border-zinc-700"
                        >
                          {copiedKey === 'cmd-commit-task' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>{copiedKey === 'cmd-commit-task' ? 'OK' : 'Salin'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        ↳ Status tugas <strong>#TASK-02</strong> otomatis berubah dari <em>In Progress</em> ke <strong>Done</strong>.
                      </p>
                    </div>

                    {/* Skenario 2 */}
                    <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          2. Sinkronisasi Real-Time (WebSocket)
                        </span>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">Socket.io</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Buka Dashboard di 2 tab browser. Saat commit dieksekusi di tab 1, tab 2 langsung terupdate instan tanpa reload.
                      </p>
                    </div>

                    {/* Skenario 3 */}
                    <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          3. Notifikasi Outbound Discord Bot
                        </span>
                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900/40">Discord</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Setiap commit (selesai tugas maupun push biasa / spam test) langsung mengirim pesan embed ke Discord channel.
                      </p>
                    </div>

                    {/* Skenario 4 */}
                    <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          4. Manajemen Tugas Filament v5
                        </span>
                        <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-900/40">CRUD</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Tambah tugas baru, edit status/prioritas di tabel, hapus tugas, serta filter pencarian instan.
                      </p>
                    </div>

                    {/* Skenario 5 */}
                    <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          5. Klasemen Anggota &amp; Analitik SVG
                        </span>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">Skor Tim</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Poin dihitung otomatis (+10 tugas done, +2 push commit), grafik commit interaktif &amp; donat tugas 100%.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perintah CLI Verifikasi Otomatis */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Perintah Pengujian Otomatis (Terminal Local):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative group">
                      <pre className="p-2 rounded bg-zinc-900 text-zinc-100 text-[10px] font-mono overflow-x-auto truncate border border-zinc-800 pr-12">
                        npm test --prefix backend
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('npm test --prefix backend', 'cmd-vitest')}
                        className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-mono inline-flex items-center gap-0.5 transition cursor-pointer border border-zinc-700"
                      >
                        {copiedKey === 'cmd-vitest' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedKey === 'cmd-vitest' ? 'OK' : 'Salin'}</span>
                      </button>
                    </div>
                    <div className="relative group">
                      <pre className="p-2 rounded bg-zinc-900 text-zinc-100 text-[10px] font-mono overflow-x-auto truncate border border-zinc-800 pr-12">
                        npm run build --prefix frontend
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('npm run build --prefix frontend', 'cmd-build')}
                        className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-mono inline-flex items-center gap-0.5 transition cursor-pointer border border-zinc-700"
                      >
                        {copiedKey === 'cmd-build' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedKey === 'cmd-build' ? 'OK' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PILAR 2: PENGUJIAN KEAMANAN SIBER & OWASP (LAB INTERAKTIF) */}
              <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Pilar 2: Keamanan Siber
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">3 Lab Interaktif + OWASP</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Pengujian Keamanan Siber (Security &amp; OWASP)
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Uji ketahanan live backend terhadap pemalsuan data, DoS flooding, dan SQL injection.
                    </p>
                  </div>

                  {/* LAB 1: HMAC SHA-256 */}
                  <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-500" />
                        1. Verifikasi HMAC SHA-256 (Anti-Spoofing)
                      </span>
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">timingSafeEqual</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Server menolak signature palsu (401) dan menerima signature valid (200 OK) dalam waktu konstan.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        disabled={hmacLoading}
                        onClick={() => handleTestHmac('valid')}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        Uji Signature Sah (200 OK)
                      </button>
                      <button
                        type="button"
                        disabled={hmacLoading}
                        onClick={() => handleTestHmac('spoofed')}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        Uji Signature Palsu (401)
                      </button>
                    </div>
                    {hmacSignature && (
                      <div className="text-[10px] font-mono p-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 break-all text-zinc-600 dark:text-zinc-400">
                        <span className="text-zinc-400 block text-[9px]">Header X-Hub-Signature-256 yang Diuji:</span>
                        {hmacSignature}
                      </div>
                    )}
                    {hmacSimResult && (
                      <div
                        className={`p-2 rounded text-[11px] font-mono space-y-0.5 ${
                          hmacSimResult.response.valid
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{hmacSimResult.response.valid ? '✅ ASLI & DITERIMA' : '❌ DITOLAK (SIGNATURE PALSU)'}</span>
                          <span>HTTP {hmacSimResult.status}</span>
                        </div>
                        <p className="text-[10px] font-sans">{hmacSimResult.response.message}</p>
                      </div>
                    )}
                  </div>

                  {/* LAB 2: RATE LIMITER */}
                  <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        2. Rate Limiting Flooding (30 req/min)
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">HTTP 429</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Kirim 35 request cepat: request 1–30 lolos (200 OK), mulai request ke-31 diblokir (429).
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        disabled={isRateTesting}
                        onClick={handleTestRateLimiter}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {isRateTesting ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Mengirim 35 Req...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Mulai Kirim 35 Request Cepat</span>
                          </>
                        )}
                      </button>
                    </div>
                    {rateLimitLogs.length > 0 && (
                      <div className="p-2 rounded bg-zinc-950 text-zinc-300 text-[10px] font-mono max-h-32 overflow-y-auto space-y-0.5">
                        <div className="flex justify-between font-bold pb-1 border-b border-zinc-800 text-zinc-400">
                          <span>Total: {rateLimitLogs.length}/35</span>
                          <span className="text-rose-400">Diblokir 429: {rateLimitLogs.filter((l) => l.status === 429).length}</span>
                        </div>
                        {rateLimitLogs.map((l) => (
                          <div key={l.reqId} className={l.status === 429 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                            {l.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LAB 3: ANTI-SQL INJECTION */}
                  <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-purple-500" />
                        3. Anti-SQL Injection (Prepared Statements)
                      </span>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900/40">Parameterized</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Query database menggunakan placeholder binding <code className="text-purple-600 dark:text-purple-400">?</code>, input injeksi diperlakukan sebagai string murni.
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="text"
                        value={sqliInput}
                        onChange={(e) => setSqliInput(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-purple-500"
                      />
                      <button
                        type="button"
                        disabled={sqliLoading}
                        onClick={handleTestSqli}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-xs"
                      >
                        {sqliLoading ? 'Menguji...' : 'Kirim Uji SQLi'}
                      </button>
                    </div>
                    {sqliResult && (
                      <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                          <span>Hasil Database:</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                            HTTP {sqliResult.status}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 text-[10px] leading-relaxed">{sqliResult.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proteksi Pasif Tambahan */}
                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500">
                  <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60">
                    🛡️ <strong>Batas 100KB:</strong> Menolak muatan raksasa (HTTP 413).
                  </div>
                  <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60">
                    🔒 <strong>Helmet Headers:</strong> CSP &amp; X-Frame-Options DENY anti-clickjacking.
                  </div>
                </div>
              </div>
            </div>

            {/* QA Web Testing Cross-Check Suite */}
            <div id="qa-checklist-matrix" className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shrink-0 mt-0.5 sm:mt-0">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                        Matriks Ceklis Pengujian QA Web (Cross-Check 10 Modul)
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">
                        QA Lead: Fajri
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Verifikasi antarmuka web, fungsionalitas tombol, mutasi real-time, dan responsivitas oleh tim penguji QA internal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => markAllQaTests(true)}
                    className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium transition cursor-pointer touch-manipulation"
                  >
                    Tandai Semua Lolos ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllQaTests(false)}
                    className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-medium transition cursor-pointer touch-manipulation"
                  >
                    Reset Ceklis
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Progres Kesiapan Pengujian QA:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {checkedQaTests.length} / {QA_TEST_CASES.length} Modul Terverifikasi ({Math.round((checkedQaTests.length / QA_TEST_CASES.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(checkedQaTests.length / QA_TEST_CASES.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Test Cases Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {QA_TEST_CASES.map((tc) => {
                  const isChecked = checkedQaTests.includes(tc.id);
                  return (
                    <div
                      key={tc.id}
                      onClick={() => toggleQaTest(tc.id)}
                      className={`p-3 rounded-lg border transition cursor-pointer select-none space-y-2 ${
                        isChecked
                          ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-blue-600 border-zinc-300 dark:border-zinc-700 focus:ring-0 cursor-pointer pointer-events-none shrink-0"
                          />
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {tc.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-medium">
                            {tc.category}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                            isChecked
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isChecked ? 'Lolos ✅' : 'Belum ⏳'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                        {tc.name}
                      </h3>

                      <div className="text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
                        <p className="leading-relaxed">
                          <strong>Langkah:</strong> {tc.step}
                        </p>
                        <p className="leading-relaxed text-zinc-500 dark:text-zinc-400">
                          <strong>Ekspektasi:</strong> {tc.expected}
                        </p>
                      </div>

                      {tc.link && (
                        <div className="pt-1 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={tc.link}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>{tc.linkText || 'Buka Fitur'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-500">
                <span>Dokumen pengujian lengkap telah terstandarisasi untuk presentasi kelompok.</span>
                <a
                  href="https://github.com/denoyey/si-patir/blob/main/docs/academic/PANDUAN-TESTING-WEB-QA.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Baca Manual Lengkap QA (Markdown)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TANYA JAWAB EVALUASI TUGAS */}
        {activeTab === 'qa' && (
          <div className="space-y-2.5">
            {[
              {
                q: 'Apa perbedaan mendasar antara Webhook dan REST API biasa?',
                a: 'REST API bersifat "Pull" (klien harus meminta secara berkala). Webhook bersifat "Push" atau Event-Driven (GitHub otomatis menembakkan payload saat kejadian commit terjadi secara instan tanpa polling).',
              },
              {
                q: 'Bagaimana server tahu kiriman Webhook asli dari GitHub?',
                a: 'Melalui verifikasi tanda tangan digital HMAC SHA-256 pada header X-Hub-Signature-256. Server dan GitHub berbagi secret key yang sama untuk mencocokkan hash payload.',
              },
              {
                q: 'Mengapa verifikasi HMAC menggunakan crypto.timingSafeEqual?',
                a: 'Operator perbandingan biasa (===) rentan terhadap Timing Attack karena berhenti pada huruf pertama yang salah. timingSafeEqual memastikan durasi pencocokan buffer selalu konstan.',
              },
              {
                q: 'Bagaimana sistem melindungi database dari SQL Injection?',
                a: 'Menggunakan Prepared Statements (driver mysql2). Input pengguna dipisahkan dari struktur SQL dengan placeholder (?), sehingga karakter kutip satu tidak dapat memanipulasi kueri.',
              },
              {
                q: 'Bagaimana tampilan web dashboard berubah otomatis tanpa refresh?',
                a: 'Menggunakan WebSocket (Socket.io). Server memancarkan event "activity_update" seketika database selesai diperbarui, sehingga antarmuka React langsung merender data terbaru.',
              },
              {
                q: 'Apa yang terjadi jika database MySQL offline saat commit masuk?',
                a: 'Sistem memiliki In-Memory Fallback. Data commit dan tugas sementara dialihkan ke memori RAM agar server tidak crash dan notifikasi Discord tetap terkirim lancar.',
              },
              {
                q: 'Mengapa ukuran request dibatasi maksimal 100 Kilobyte?',
                a: 'Untuk mencegah serangan DoS jenis JSON Bomb, di mana penyerang sengaja mengirimkan berkas payload raksasa yang dapat menghabiskan memori RAM server.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-1.5"
              >
                <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-0 sm:pl-7 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Clean & Simple Footer with iPhone Safe Area */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] py-4 px-3 sm:px-4 text-center text-xs text-zinc-500 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
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
              href="https://github.com/denoyey/si-patir/blob/main/docs/PANDUAN-PENGUJIAN-DAN-OPERASIONAL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400 font-medium"
            >
              Panduan Pengujian
            </a>
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
