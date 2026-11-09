import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Radio,
  Sparkles,
  ArrowRight,
  Kanban,
  MessageSquare,
  ExternalLink,
  Activity,
  Layers,
  Users,
} from 'lucide-react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { ExpandableDescription } from '../components/ExpandableDescription';
import { useNavbarVisibility } from '../services/scroll/hooks/useNavbarVisibility';
import { useLenisScroll } from '../services/scroll/hooks/useLenisScroll';

const TEAM_MEMBERS = [
  {
    name: 'Deni',
    role: 'Lead Architect & DevOps Integrator',
    username: 'denoyey',
    badge: 'Project Lead',
    avatar: 'https://github.com/denoyey.png?size=400',
    description:
      'Memimpin arsitektur sistem terpadu, webhook ingestion pipeline, verifikasi keamanan HMAC SHA-256, serta otomasi CI/CD deployment.',
    skills: ['Node.js', 'Express', 'WebSocket', 'DevOps', 'Security'],
  },
  {
    name: 'Rafli',
    role: 'Frontend UI & Data Visualization Engineer',
    username: 'muhamadrafli16',
    badge: 'UI/UX Specialist',
    avatar: 'https://github.com/muhamadrafli16.png?size=400',
    description:
      'Merancang antarmuka dashboard modern, visualisasi analitik kontribusi, dan interaksi tugas yang intuitif serta responsif di semua perangkat.',
    skills: ['React 19', 'Tailwind CSS', 'GSAP', 'Lenis Scroll'],
  },
  {
    name: 'Fatir',
    role: 'Kanban Trello & Database Engineer',
    username: 'Patirparkerr',
    badge: 'Integrations Lead',
    avatar: 'https://github.com/Patirparkerr.png?size=400',
    description:
      'Mengintegrasikan Trello REST API untuk pemindahan kartu otomatis, perancangan basis data MySQL, dan sinkronisasi status tugas.',
    skills: ['Trello API', 'MySQL', 'RESTful API', 'Database Design'],
  },
  {
    name: 'Fajri',
    role: 'QA, Security Testing & Academic Documentation',
    username: 'AATTTRAWRRR',
    badge: 'Quality & Docs',
    avatar: 'https://github.com/AATTTRAWRRR.png?size=400',
    description:
      'Menyusun pengujian unit test otomatis, audit ketahanan rate limiting & DoS, serta perancangan laporan akademik dan diagram UML.',
    skills: ['Automated QA', 'Security Audit', 'UML Modeling', 'Technical Writing'],
  },
];

const CURRENT_YEAR = new Date().getFullYear();

export function LandingPage() {
  const isNavbarVisible = useNavbarVisibility({ threshold: 60 });
  const { scrollTo, scrollToTop, engine } = useLenisScroll();

  // Reset scroll to top upon mounting unless a hash anchor is provided
  useLayoutEffect(() => {
    if (!window.location.hash) {
      engine.resetToTop();
    }
  }, [engine]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    scrollTo(targetId, { offset: -75, duration: 1.2 });
    window.history.pushState(null, '', targetId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b10] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white transition-colors duration-150">
      {/* TOP NAVIGATION BAR - FIXED & SMART AUTO-HIDE ON SCROLL */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0d1017]/90 backdrop-blur-md pt-[env(safe-area-inset-top,0px)] transition-transform duration-300 ease-in-out will-change-transform ${
          isNavbarVisible
            ? 'translate-y-0 shadow-xs pointer-events-auto'
            : '-translate-y-full shadow-none pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[3.75rem] py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => {
              if (window.location.pathname === '/' && !window.location.hash) {
                scrollToTop(1.0);
              }
            }}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-950 dark:text-white">SI-PATIR</span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                v2.0
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <a
              href="#alur"
              onClick={(e) => handleNavClick(e, '#alur')}
              className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
            >
              Alur Kerja
            </a>
            <a
              href="#fitur"
              onClick={(e) => handleNavClick(e, '#fitur')}
              className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
            >
              Fitur Integrasi
            </a>
            <a
              href="#tim"
              onClick={(e) => handleNavClick(e, '#tim')}
              className="hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
            >
              Tim Pengembang
            </a>
            <a
              href="https://github.com/denoyey/si-patir"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-zinc-950 dark:hover:text-white transition"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </nav>

          {/* Right Controls: Theme Switcher & Dashboard CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeSwitcher />

            <Link
              to="/dashboard"
              className="h-8.5 px-2.5 sm:px-3.5 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer touch-manipulation shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Buka Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 hidden md:inline shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer to reserve layout height under fixed navbar */}
      <div className="h-[3.75rem] pt-[env(safe-area-inset-top,0px)] shrink-0" aria-hidden="true" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-12 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-[#121624] border border-zinc-300 dark:border-zinc-700/80 text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300 shadow-xs max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-medium truncate">Platform Automasi Multi-Sistem Terpadu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight px-1">
            Satu Commit Git. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Tugas Trello Selesai. Tim Discord Terberitahu.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed px-1">
            <strong>SI-PATIR</strong> mengotomatisasi siklus hidup tugas rekayasa perangkat lunak tim secara real-time.
            Cukup sematkan kode tugas pada pesan commit di terminal Anda, sistem yang bekerja tanpa ribet manual.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-sm sm:max-w-none mx-auto w-full px-1">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto h-11 px-6 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95 cursor-pointer touch-manipulation"
            >
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500 shrink-0" />
              <span>Masuk ke Dashboard Monitoring</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            <a
              href="https://github.com/denoyey/si-patir"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto h-11 px-5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <GitBranch className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>Lihat Source Code GitHub</span>
            </a>
          </div>

          {/* Live System Connectivity Badges - 2x2 on Mobile, Flex on Desktop */}
          <div className="pt-6 sm:pt-8 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono max-w-md sm:max-w-none mx-auto">
            <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">GitHub:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Trello:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Synced</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Discord:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Active</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Socket:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP PIPELINE SECTION */}
      <section id="alur" className="py-16 sm:py-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-[#0c0f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
              ALUR KERJA OTOMATISASI
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              Bagaimana SI-PATIR Bekerja?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Menghubungkan 3 platform terpisah menjadi satu siklus otomatisasi yang seamless dan instan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 mb-1">
                  TAHAP 01
                </div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
                  Pengembang Melakukan Push Git
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Cukup mengetik pesan commit di terminal dengan menyertakan tag tugas:
                </p>
                <div className="p-2.5 rounded-md bg-zinc-100 dark:bg-[#090b10] border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-purple-600 dark:text-purple-300 break-all select-all">
                  git commit -m "Fix login [done #TASK-02]"
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>HMAC SHA-256 diverifikasi aman</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm mb-4">
                  <Kanban className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">
                  TAHAP 02
                </div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
                  Kartu Trello Bergeser ke Done
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Backend otomatis mencari kartu yang sesuai di papan Trello dan menggesernya dari kolom <em>In Progress</em> ke <em>Done</em>.
                </p>
                <div className="p-2.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-700 dark:text-blue-300">
                  Komentar bukti commit dan URL hash otomatis tertempel di kartu Trello.
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Status tugas 100% sinkron</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  TAHAP 03
                </div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
                  Broadcast Discord & Live Update
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Notifikasi pesan kaya (*Rich Embed*) otomatis terkirim ke kanal Discord tim, dan Dashboard SI-PATIR memperbarui klasemen.
                </p>
                <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-700 dark:text-emerald-300">
                  WebSocket Socket.io memperbarui DOM dashboard tanpa perlu me-refresh browser.
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Seluruh tim terkoordinasi instan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="fitur" className="py-16 sm:py-20 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              STANDAR REKAYASA SISTEM
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              Fitur Keamanan & Arsitektur Kelas Industri
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Dirancang dengan prinsip OOP, zero port collision, dan pertahanan siber berlapis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#11141e] shadow-xs space-y-3">
              <div className="p-2 w-fit rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">HMAC SHA-256 Security</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Setiap payload webhook diverifikasi menggunakan waktu konstan <code>crypto.timingSafeEqual</code> untuk mencegah serangan timing attack.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#11141e] shadow-xs space-y-3">
              <div className="p-2 w-fit rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Real-Time WebSocket</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sinkronisasi data instan dengan Socket.io sehingga perubahan kartu dan commit terdistribusi dalam latensi &lt; 2.5 detik.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#11141e] shadow-xs space-y-3">
              <div className="p-2 w-fit rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">In-Memory Fallback</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sistem tetap berjalan mulus tanpa crash meskipun basis data MySQL lokal sedang offline atau mengalami kendala koneksi.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#11141e] shadow-xs space-y-3">
              <div className="p-2 w-fit rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Full Responsive & iPhone</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Mendukung seluruh spektrum perangkat: Ultrawide 4K, Laptop, iPad, hingga varian iPhone terkecil (SE 320px) dengan safe-area notch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION (EXACT NAMES: Deni, Rafli, Fatir, Fajri) */}
      <section id="tim" className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-[#0c0f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
              <span>KOLABORASI TIM PENGEMBANG</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              Anggota Tim Pengembang SI-PATIR
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Empat pengembang yang berkolaborasi dalam arsitektur, frontend, integrasi Trello, serta penjaminan mutu sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="group bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Prominent Photo Frame - 1:1 Aspect Ratio to prevent cropping */}
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shadow-inner">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-white font-mono font-bold text-3xl">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Role Badge in Top Right of Image */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-950/85 dark:bg-zinc-900/90 text-white border border-zinc-700/80 backdrop-blur-xs shadow-xs">
                        {member.badge}
                      </span>
                    </div>

                    {/* Verified GitHub Collaborator Indicator */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-600/90 dark:bg-emerald-500/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Collaborator
                      </span>
                    </div>
                  </div>

                  {/* Name, Role & GitHub Link */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                        {member.name}
                      </h4>
                      <a
                        href={`https://github.com/${member.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition touch-manipulation active:scale-95"
                        title={`Buka profil GitHub @${member.username}`}
                      >
                        <span>@{member.username}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                      </a>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {member.role}
                    </div>
                  </div>

                  {/* Description with Expand/Collapse ("Lebih banyak" / "Lebih sedikit") */}
                  <ExpandableDescription
                    text={member.description}
                    previewLength={68}
                  />
                </div>

                {/* Technical Skills Pills */}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM */}
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white">
            Siap Mencoba Sistem Monitoring Real-Time?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Buka dashboard sekarang untuk melihat metrik tugas, klasemen kontribusi anggota, dan audit live webhook stream.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 h-11 px-7 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer touch-manipulation"
            >
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500" />
              <span>Buka Dashboard SI-PATIR</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER - MOBILE SAFE & NO OVERLAP */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-8 pb-24 sm:pb-8 bg-white dark:bg-[#090b10] text-xs text-zinc-500 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-zinc-900 dark:text-white">SI-PATIR</span>
              <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">•</span>
              <span className="text-[11px] text-zinc-500 leading-snug">
                Sistem Integrasi Pemantau Aktivitas Tugas &amp; Informasi Repositori
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <Link
                to="/dashboard"
                className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition"
              >
                Dashboard
              </Link>
              <a
                href="https://github.com/denoyey/si-patir"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition flex items-center gap-1"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Dibuat oleh Tim: Deni, Rafli, Fatir, Fajri</span>
            <span>&copy; {CURRENT_YEAR} SI-PATIR. Open Source Engineering.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
