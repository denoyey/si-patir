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

const TEAM_MEMBERS = [
  {
    name: 'Deni',
    role: 'Lead Architect & DevOps Integrator',
    username: 'denoyey',
    badge: 'Project Lead',
    avatar: 'https://github.com/denoyey.png?size=120',
    description:
      'Memimpin arsitektur sistem terpadu, webhook ingestion pipeline, verifikasi keamanan HMAC SHA-256, serta otomasi CI/CD deployment.',
    skills: ['Node.js', 'Express', 'WebSocket', 'DevOps', 'Security'],
  },
  {
    name: 'Rafli',
    role: 'Frontend UI & Data Visualization Engineer',
    username: 'rafli_dev',
    badge: 'UI/UX Specialist',
    avatar: '',
    description:
      'Merancang antarmuka dashboard modern, visualisasi analitik kontribusi, dan interaksi tugas yang intuitif serta responsif di semua perangkat.',
    skills: ['React 19', 'Tailwind CSS', 'GSAP', 'Data Visualization'],
  },
  {
    name: 'Fatir',
    role: 'Kanban Trello & Database Engineer',
    username: 'fatir_eng',
    badge: 'Integrations Lead',
    avatar: '',
    description:
      'Mengintegrasikan Trello REST API untuk pemindahan kartu otomatis, perancangan basis data MySQL, dan sinkronisasi status tugas.',
    skills: ['Trello API', 'MySQL', 'RESTful API', 'Database Design'],
  },
  {
    name: 'Fajri',
    role: 'QA, Security Testing & Academic Documentation',
    username: 'fajri_qa',
    badge: 'Quality & Docs',
    avatar: '',
    description:
      'Menyusun pengujian unit test otomatis, audit ketahanan rate limiting & DoS, serta perancangan laporan akademik dan diagram UML.',
    skills: ['Automated QA', 'Security Audit', 'UML Modeling', 'Technical Writing'],
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b10] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white transition-colors duration-150">
      {/* TOP NAVIGATION BAR */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0d1017]/80 backdrop-blur-md sticky top-0 z-40 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-750 dark:to-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white">SI-PATIR</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                  v2.0
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#alur" className="hover:text-zinc-950 dark:hover:text-white transition">
              Alur Kerja
            </a>
            <a href="#fitur" className="hover:text-zinc-950 dark:hover:text-white transition">
              Fitur Integrasi
            </a>
            <a href="#tim" className="hover:text-zinc-950 dark:hover:text-white transition">
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeSwitcher />

            <Link
              to="/dashboard"
              className="h-8.5 px-3.5 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer touch-manipulation"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500 shrink-0" />
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-[#121624] border border-zinc-300 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-medium">Platform Automasi Multi-Sistem Terpadu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Satu Commit Git. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Tugas Trello Selesai. Tim Discord Terberitahu.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            <strong>SI-PATIR</strong> mengotomatisasi siklus hidup tugas rekayasa perangkat lunak tim secara real-time.
            Cukup sematkan kode tugas pada pesan commit di terminal Anda, sistem yang bekerja tanpa ribet manual.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto h-10 px-6 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95 cursor-pointer touch-manipulation"
            >
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500" />
              <span>Masuk ke Dashboard Monitoring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://github.com/denoyey/si-patir"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto h-10 px-5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <GitBranch className="w-4 h-4 text-zinc-500" />
              <span>Lihat Source Code GitHub</span>
            </a>
          </div>

          {/* Live System Connectivity Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-500 dark:text-zinc-400">GitHub:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Webhook Ready</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Trello:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">REST API Synced</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-zinc-500 dark:text-zinc-400">Discord:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Active Webhook</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-zinc-500 dark:text-zinc-400">WebSocket:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Socket.io Live</span>
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
                className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition duration-200"
              >
                <div className="space-y-4">
                  {/* Avatar & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-14 h-14 rounded-md border border-zinc-300 dark:border-zinc-700 object-cover shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-mono font-bold text-lg flex items-center justify-center border border-zinc-700 shadow-xs">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                      {member.badge}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h4 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                      <span>{member.name}</span>
                    </h4>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                      {member.role}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      @{member.username}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {member.description}
                  </p>
                </div>

                {/* Skills tags */}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
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

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 bg-white dark:bg-[#090b10] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-white">SI-PATIR</span>
            <span>— Sistem Integrasi Pemantau Aktivitas Tugas &amp; Informasi Repositori</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Dibuat oleh Tim: Deni, Rafli, Fatir, Fajri</span>
            <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
              Dashboard
            </Link>
            <a
              href="https://github.com/denoyey/si-patir"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
