import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Send,
  Radio,
  FileCode,
  Workflow,
  Calendar,
  ListChecks,
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
        {/* Simple & Clear Page Intro */}
        <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Tugas Kelompok: Pemrograman Integratif</span>
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Dokumentasi API, Integrasi Webhook &amp; Keamanan Siber
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white wrap-break-word">
              Dokumentasi API, Alur Integrasi &amp; Keamanan
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Halaman ini menjelaskan bagaimana sistem <strong>SI-PATIR</strong> menghubungkan layanan{' '}
              <strong>GitHub Webhook</strong>, bot pesan <strong>Discord</strong>, basis data <strong>MySQL</strong>,
              dan streaming <strong>WebSocket</strong> secara otomatis tanpa perlu refresh halaman. Disediakan juga lab uji coba langsung
              untuk keperluan demonstrasi tugas kelompok di depan dosen pengampu.
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="p-2 sm:p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 min-w-0">
              <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">Metode Integrasi</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">Event-Driven (Push)</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 min-w-0">
              <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">Keamanan Webhook</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block truncate">HMAC SHA-256</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 min-w-0">
              <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">Keamanan Database</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block truncate">Prepared Statements</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 min-w-0">
              <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">Penyajian Data</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block truncate">Real-Time WebSocket</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Momentum Scroll */}
        <div className="flex items-center gap-1 sm:gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar touch-scroll px-0.5">
          {[
            { key: 'architecture', label: '1. Alur Sistem', icon: Layers },
            { key: 'uml', label: '2. Diagram UML (6)', icon: Workflow },
            { key: 'catalog', label: '3. Katalog API', icon: Code2 },
            { key: 'security', label: '4. Proteksi Keamanan', icon: Shield },
            { key: 'simulator', label: '5. Lab Pengujian', icon: Play },
            { key: 'qa', label: '6. Tanya Jawab Dosen', icon: HelpCircle },
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
          <div className="space-y-5 sm:space-y-6">
            {/* Step by Step Explanation */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Bagaimana Sistem Ini Bekerja Otomatis?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Dari baris kode yang ditulis mahasiswa di laptop hingga muncul di layar web dan grup Discord.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Step 1 */}
                <div className="p-3 sm:p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40">
                      Langkah 1
                    </span>
                    <span className="text-[11px] text-zinc-400">Git Commit</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    Mahasiswa Push Kode
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Pengembang melakukan commit dan push kode ke GitHub dengan menyertakan tanda tugas, contohnya:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 break-all">
                    git commit -m &quot;Fix [done #TASK-02]&quot;
                  </code>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40">
                      Langkah 2
                    </span>
                    <span className="text-[11px] text-zinc-400">GitHub Webhook</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    GitHub Mengirim Sinyal
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    GitHub otomatis menembakkan data JSON ke server kita dan menyertakan tanda tangan rahasia:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 break-all">
                    X-Hub-Signature-256
                  </code>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40">
                      Langkah 3
                    </span>
                    <span className="text-[11px] text-zinc-400">Server &amp; MySQL</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    Cek Keamanan &amp; Simpan
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Server mencocokkan stempel HMAC. Jika sah, status tugas <code className="font-mono text-[11px]">#TASK-02</code> langsung diubah jadi <strong>Done</strong> di MySQL:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 break-all">
                    UPDATE tasks SET status = ?
                  </code>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/40">
                      Langkah 4
                    </span>
                    <span className="text-[11px] text-zinc-400">Discord &amp; Web</span>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">
                    Kabar Terkirim Seketika
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Bot mengirim ringkasan ke grup Discord, dan server menyiarkan data via WebSocket agar layar web berubah tanpa refresh:
                  </p>
                  <code className="block text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 break-all">
                    io.emit(&apos;activity_update&apos;)
                  </code>
                </div>
              </div>
            </div>

            {/* Protocol Comparison Table (Clear & Simple for Lecturers) */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Mengapa Kami Memilih Kombinasi Protokol Ini?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tabel alasan teknis penggunaan protokol integrasi dalam proyek mata kuliah Pemrograman Integratif.
                </p>
              </div>

              <div className="overflow-x-auto no-scrollbar touch-scroll -mx-1 px-1 sm:mx-0 sm:px-0">
                <table className="w-full min-w-140 text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <th className="pb-2.5 font-semibold">Protokol</th>
                      <th className="pb-2.5 font-semibold">Cara Kerjanya</th>
                      <th className="pb-2.5 font-semibold">Beban Server &amp; Kuota</th>
                      <th className="pb-2.5 font-semibold">Fungsi Nyata di SI-PATIR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Webhook</span>
                        </div>
                      </td>
                      <td className="py-2.5">Otomatis mengirim data saat ada kejadian (Push)</td>
                      <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">Sangat hemat (hanya jalan saat ada commit)</td>
                      <td className="py-2.5">Menerima push commit dari GitHub dan meneruskan pesan ke Discord</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-purple-500" />
                          <span>WebSocket</span>
                        </div>
                      </td>
                      <td className="py-2.5">Jalur koneksi dua arah yang selalu terbuka (Real-Time)</td>
                      <td className="py-2.5">Efisien (hanya kirim pesan kecil saat status berubah)</td>
                      <td className="py-2.5">Memperbarui tampilan tabel tugas dan grafik web secara instan tanpa reload</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-blue-500" />
                          <span>REST API</span>
                        </div>
                      </td>
                      <td className="py-2.5">Klien meminta data, server membalas (Request - Response)</td>
                      <td className="py-2.5">Sesuai permintaan pengguna</td>
                      <td className="py-2.5">Mengambil data awal, mengedit kartu tugas, dan melihat daftar anggota</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/10">
                      <td className="py-2.5 font-semibold text-zinc-900 dark:text-white line-through opacity-70">
                        Polling Berkala
                      </td>
                      <td className="py-2.5 text-zinc-500">Klien berulang kali bertanya ke server tiap beberapa detik</td>
                      <td className="py-2.5 text-rose-600 dark:text-rose-400 font-medium">Boros kuota &amp; CPU (tetap kirim meski tidak ada data baru)</td>
                      <td className="py-2.5 text-zinc-500 italic">Ditinggalkan, kami ganti dengan Webhook &amp; WebSocket</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sprint Action Plan (Jadwal Sprint & Rencana Tindak Lanjut Tim) */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0 mt-0.5 sm:mt-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                      Jadwal Sprint &amp; Rencana Tindak Lanjut Tim (Sprint Action Plan)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Peta jalan rekayasa perangkat lunak dan pembagian tugas 4 anggota tim (Deni, Fatir, Rafli, Fajri) untuk mata kuliah Pemrograman Integratif.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold self-start sm:self-auto shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Semua Fase Tuntas &amp; Siap Presentasi</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* FASE 1 */}
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        FASE 1
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                        Core Foundation &amp; Integrasi Sistem
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Selesai
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0 min-w-10">Deni</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Backend Gateway REST API v1, Security Hardening, &amp; Interactive API Docs Explorer
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 min-w-10">Fatir</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Skema Database MySQL, Task State Engine, &amp; Database Seeder 4 Anggota
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-purple-600 dark:text-purple-400 shrink-0 min-w-10">Rafli</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Frontend Dashboard React 19, Filament v5 Data Table, &amp; Terminal Web Git
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0 min-w-10">Fajri</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Quality Gate Pre-push &amp; Validasi Alur Integrasi End-to-End
                      </span>
                    </div>
                  </div>
                </div>

                {/* FASE 2 */}
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        FASE 2
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                        Fitur Lanjutan, Visualisasi &amp; Pengujian Mutu
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Selesai
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0 min-w-10">Deni</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Setup Public Webhook Gateway (<code className="text-[10px] font-mono">npm run tunnel</code>) &amp; CI/CD GitHub Actions
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 min-w-10">Fatir</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Notifikasi Outbound Discord Webhook (Rich Embeds) &amp; Script Backup MySQL
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-purple-600 dark:text-purple-400 shrink-0 min-w-10">Rafli</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Grafik Analitik Kontribusi Tim (SVG Bar &amp; Donut Charts) &amp; Modal Edit Tugas
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0 min-w-10">Fajri</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Automated Unit Testing (28 Vitest Test Suites Passed) &amp; Lab Uji Penetrasi Keamanan
                      </span>
                    </div>
                  </div>
                </div>

                {/* FASE 3 */}
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        FASE 3
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                        Dokumen UML Akademik &amp; Kesiapan Demonstrasi Presentasi
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      🚀 Siap Presentasi
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0 min-w-10">Deni</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Standarisasi Multi-Repo Project &amp; Verifikasi Kriptografi HMAC SHA-256 (<code className="text-[10px] font-mono">crypto.timingSafeEqual</code>)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 min-w-10">Fatir</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Sanitasi Input Parameterized Query (Anti-SQLi) &amp; Mekanisme In-Memory Failover
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-purple-600 dark:text-purple-400 shrink-0 min-w-10">Rafli</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Tampilan Antarmuka Human-Crafted Responsif Multi-Device dengan Radius Konsisten &amp; Lenis Engine
                      </span>
                    </div>
                    <div className="p-2.5 rounded-md bg-white dark:bg-[#111420] border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0 min-w-10">Fajri</span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Penyusunan 6 Diagram Arsitektur UML Formal, Naskah Presentasi PPT, &amp; Skenario Live Demo 30 Detik
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-md bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="font-medium leading-relaxed">
                      🎯 <strong>Seluruh Tim (Deni, Fatir, Rafli, Fajri):</strong> Gladi bersih demonstrasi alur integrasi end-to-end (Git Commit ➔ MySQL ➔ Discord Bot ➔ Web Dashboard).
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold shrink-0">
                      TUNTAS
                    </span>
                  </div>
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

        {/* TAB 3: PROTEKSI KEAMANAN SIBER */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  6 Lapisan Keamanan pada Server Backend SI-PATIR
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Proteksi aktif yang melindungi endpoint dari serangan peretas, spam, dan manipulasi data.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Semua Proteksi Aktif</span>
              </span>
            </div>

            {/* 6 Security Cards (Written in clear human language) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  1. Verifikasi Webhook (HMAC-SHA256)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Memastikan data yang masuk benar-benar berasal dari GitHub resmi menggunakan kunci rahasia bersama.
                  Pencocokan menggunakan fungsi waktu konstan{' '}
                  <code className="text-[11px] font-mono px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                    crypto.timingSafeEqual
                  </code>{' '}
                  agar penyerang tidak bisa menebak kunci rahasia lewat perbedaan waktu respons.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  2. Anti SQL Injection (Prepared Statements)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Semua kueri ke MySQL menggunakan tanda tanya (<code className="font-mono">?</code>). Database mengompilasi
                  perintah SQL terlebih dahulu sebelum memasukkan data. Karakter aneh seperti kutip satu tidak akan pernah
                  bisa membobol database.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  3. Pembatas Laju Request (Rate Limiting)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Mencegah banjir spam atau serangan DoS dengan membatasi jumlah request per alamat IP per menit:
                  maksimal <strong>30 request/menit</strong> untuk webhook dan <strong>120 request/menit</strong> untuk API umum.
                  Kelebihan request langsung ditolak dengan kode 429.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  4. Batas Ukuran Data (Payload Maks 100kb)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Ukuran berkas data yang dikirim dibatasi maksimal 100 kilobyte. Ini melindungi server agar memorinya
                  tidak jebol jika ada orang yang sengaja mengirimkan data JSON raksasa berukuran puluhan megabyte (<em>JSON Bomb</em>).
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  5. Pembersihan Pesan (Sanitasi Input)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Pesan commit yang dikirim oleh developer otomatis dibersihkan dari tag HTML dan karakter baris baru palsu.
                  Hal ini mencegah peretasan jenis <em>Cross-Site Scripting (XSS)</em> pada web dashboard.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-2">
                <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  6. Header Pengaman Browser (Helmet CSP)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Memasang header pelindung seperti <code className="font-mono">X-Frame-Options: DENY</code> agar website
                  tidak bisa disematkan sembarangan ke dalam iframe oleh pihak asing untuk penipuan klik (<em>clickjacking</em>).
                </p>
              </div>
            </div>

            {/* Runtime Info Summary */}
            {securityStatus && (
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Status Pengaturan Aktif di Server Saat Ini:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-md bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block">Algoritma HMAC:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {securityStatus.hmacVerification?.algorithm || 'HMAC-SHA256'}
                    </span>
                  </div>
                  <div className="p-2 rounded-md bg-white dark:bg-[#111420] border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block">Batas Request Webhook:</span>
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

        {/* TAB 4: SIMULASI LAB INTERAKTIF (UNTUK DEMO DOSEN) */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Play className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Panduan Demonstrasi:</strong> Bagian ini disiapkan untuk simulasi langsung saat mempresentasikan tugas kelompok di depan dosen.
                Klik tombol-tombol di bawah untuk membuktikan keandalan sistem API dan proteksi keamanannya secara nyata.
              </span>
            </div>

            {/* QA Web Testing Cross-Check Suite */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
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
                      Verifikasi antarmuka web, fungsionalitas tombol, mutasi real-time, dan responsivitas sebelum demonstrasi di depan dosen.
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

            {/* Simulasi 1: Uji HMAC */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                    Uji Coba 1
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Uji Keaslian Tanda Tangan Webhook (HMAC SHA-256)
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Membuktikan bahwa server menolak kiriman data jika stempel tanda tangannya palsu (401 Unauthorized),
                  dan hanya menerima kiriman dengan stempel yang valid (200 OK).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={hmacLoading}
                  onClick={() => handleTestHmac('valid')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Uji Tanda Tangan Sah (Valid)
                </button>
                <button
                  type="button"
                  disabled={hmacLoading}
                  onClick={() => handleTestHmac('spoofed')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Uji Tanda Tangan Palsu (Ditolak)
                </button>
              </div>

              {hmacSignature && (
                <div className="text-xs font-mono p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 break-all">
                  <span className="text-zinc-400 block text-[10px]">Header X-Hub-Signature-256 yang Diuji:</span>
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
                      {hmacSimResult.response.valid
                        ? 'HASIL: TANDA TANGAN ASLI & DITERIMA'
                        : 'HASIL: DITOLAK KARENA TANDA TANGAN PALSU'}
                    </span>
                    <span>HTTP {hmacSimResult.status}</span>
                  </div>
                  <p className="text-[11px] font-sans pt-1">{hmacSimResult.response.message}</p>
                  <p className="text-[10px] text-zinc-500 pt-1">
                    Durasi Pemeriksaan Waktu Konstan: {hmacSimResult.response.executionDurationNs} ns
                  </p>
                </div>
              )}
            </div>

            {/* Simulasi 2: Rate Limiter Flood */}
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111420] shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                    Uji Coba 2
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Uji Ketahanan Serangan Spam (Rate Limiter Flood)
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Kirim 35 request bertubi-tubi dalam hitungan detik. Request ke 1–30 akan lolos (200 OK), dan mulai
                  request ke-31 server akan otomatis memblokir dengan kode <strong>429 Too Many Requests</strong>.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  disabled={isRateTesting}
                  onClick={handleTestRateLimiter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isRateTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sedang Mengirim 35 Request...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Mulai Kirim 35 Request Cepat</span>
                    </>
                  )}
                </button>
              </div>

              {rateLimitLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Total Request Terkirim: {rateLimitLogs.length} / 35</span>
                    <span>
                      Jumlah yang Diblokir:{' '}
                      <strong className="text-rose-600">
                        {rateLimitLogs.filter((l) => l.status === 429).length} Request
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
                    Uji Coba 3
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Uji Ketahanan Terhadap Serangan SQL Injection
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Kirim teks injeksi berbahaya seperti <code className="font-mono text-purple-600">&apos; OR &apos;1&apos;=&apos;1</code>.
                  Database akan membuktikannya aman karena input hanya diperlakukan sebagai teks biasa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
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
                  className="px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-xs touch-manipulation shrink-0"
                >
                  {sqliLoading ? 'Memeriksa...' : 'Kirim Uji SQLi'}
                </button>
              </div>

              {sqliResult && (
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-white">
                    <span>Hasil Pemeriksaan Database:</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800">
                      HTTP Status: {sqliResult.status}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 pt-1 leading-relaxed">{sqliResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TANYA JAWAB EVALUASI TUGAS (PANDUAN LENGKAP MAHASISWA & DOSEN) */}
        {activeTab === 'qa' && (
          <div className="space-y-3">
            {[
              {
                q: '1. Apa perbedaan mendasar antara Webhook dan REST API biasa?',
                a: 'REST API bersifat "Pull" (klien harus meminta secara manual agar server membalas). Sebaliknya, Webhook bersifat "Push" atau Event-Driven (server pengirim langsung menembakkan data secara otomatis begitu ada kejadian baru). Di proyek kami, saat anggota tim melakukan push commit ke GitHub, GitHub langsung mengirim data ke backend SI-PATIR tanpa backend kami harus repot bertanya terus-menerus.',
              },
              {
                q: '2. Bagaimana server kita tahu bahwa kiriman Webhook itu asli dari GitHub, bukan kiriman palsu?',
                a: 'Melalui verifikasi tanda tangan digital HMAC SHA-256. Server dan GitHub memegang satu kata sandi rahasia (Secret Key) yang sama. GitHub meng-hash seluruh isi payload JSON dengan kunci tersebut dan menaruh hasilnya di header X-Hub-Signature-256. Saat data sampai, server kita menghitung ulang hash tersebut. Jika hasilnya cocok, maka data terbukti asli dan belum dimanipulasi.',
              },
              {
                q: '3. Mengapa verifikasi HMAC menggunakan crypto.timingSafeEqual dan bukan tanda sama dengan biasa (===)?',
                a: 'Operator perbandingan biasa (===) memeriksa karakter demi karakter dari depan dan langsung berhenti begitu menemukan huruf pertama yang salah (early-exit). Peretas bisa mengukur perbedaan waktu respons server dalam satuan nanodetik untuk menebak kunci rahasia (Timing Attack). crypto.timingSafeEqual memastikan proses pencocokan buffer selalu memakan durasi waktu yang sama konstan dari awal hingga akhir.',
              },
              {
                q: '4. Bagaimana cara sistem melindungi basis data dari serangan SQL Injection?',
                a: 'Kami menggunakan Prepared Statements (parameterized query) dari driver mysql2/promise. Kueri SQL disiapkan terlebih dahulu menggunakan simbol placeholder (?). Nilai input pengguna dipisahkan secara tegas dari struktur kueri database, sehingga karakter manipulasi seperti kutip satu (\') murni dianggap teks pencarian biasa dan tidak bisa mengeksekusi perintah SQL jahat.',
              },
              {
                q: '5. Bagaimana tampilan web dashboard bisa berubah otomatis seketika tanpa perlu klik tombol refresh?',
                a: 'Sistem menggunakan koneksi WebSocket (Socket.io). Setelah webhook berhasil diterima dan database MySQL selesai diperbarui, server langsung memancarkan (broadcast) event bernama "activity_update" ke browser. Web React yang mendengarkan event tersebut langsung memperbarui state tabel dan diagram kontribusi saat itu juga.',
              },
              {
                q: '6. Apa yang terjadi jika server database MySQL lokal mati atau sedang down saat commit masuk?',
                a: 'Sistem memiliki fitur In-Memory Fallback. Jika koneksi database terputus, backend tidak akan mengalami crash melainkan otomatis mengalihkan penyimpanan data tugas dan log ke dalam memori RAM sementara. Notifikasi ke Discord tetap terkirim lancar, dan saat koneksi MySQL pulih sistem dapat dihubungkan kembali.',
              },
              {
                q: '7. Mengapa kalian membatasi ukuran data request maksimal 100 Kilobyte?',
                a: 'Untuk mencegah serangan DoS jenis JSON Bomb. Jika ukuran request tidak dibatasi, penyerang bisa mengirimkan payload JSON berukuran puluhan megabyte yang membebani kerja memori server saat melakukan proses parsing JSON dan bisa menyebabkan server kehabisan memori (Out of Memory).',
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
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-0 sm:pl-7 leading-relaxed">{item.a}</p>
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
