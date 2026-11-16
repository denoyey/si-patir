export interface IUmlDiagram {
  id: string;
  number: number;
  title: string;
  category: 'Struktural' | 'Perilaku (Behavioral)' | 'Interaksi' | 'Arsitektur Fisik';
  badge: string;
  summary: string;
  code: string;
  keyPoints: string[];
  focusNotes: string;
}

export const UML_DIAGRAMS: IUmlDiagram[] = [
  // 1. USE CASE DIAGRAM
  {
    id: 'use-case',
    number: 1,
    title: 'Use Case Diagram',
    category: 'Perilaku (Behavioral)',
    badge: '10 Kasus Penggunaan',
    summary: 'Memetakan 5 aktor (Developer, Dosen, GitHub Cloud, Discord Webhook, SI-PATIR Gateway) serta 10 use case inti platform.',
    focusNotes: 'Fokus pada otomatisasi alur: Developer commit di Git ➔ GitHub memicu Webhook HMAC ➔ Gateway otomatis mutasi status tugas, kirim embed Discord, dan broadcast WebSocket ke Dashboard.',
    keyPoints: [
      'UC-01 s/d UC-04: Aksi developer meliputi push commit, eksekusi Web Git Terminal, manajemen kartu tugas, dan melihat analitik kontribusi tim.',
      'UC-05 s/d UC-08: Otomasi internal sistem meliputi verifikasi HMAC, mutasi state database, siaran WebSocket, dan notifikasi Discord bot.',
      'UC-09 & UC-10: Dosen pengampu dapat menguji simulasi lab keamanan, eksplorasi API, dan meninjau konfigurasi multi-repo workspace.',
    ],
    code: `%%{init: {'theme': 'default', 'themeVariables': { 'fontSize': '12px' }}}%%
flowchart LR
    %% Actors
    dev(["👨‍💻 Developer / Mahasiswa"])
    lecturer(["👨‍🏫 Dosen Pengampu / Penilai"])
    github(["🌐 GitHub Cloud"])
    discord(["💬 Discord Webhook"])

    subgraph SIPATIR ["Sistem SI-PATIR (System Boundary)"]
        UC1(["UC-01: Push Commit<br/>Berformat Tugas"])
        UC2(["UC-02: Eksekusi Web<br/>Git Terminal"])
        UC3(["UC-03: Kelola Kartu<br/>Tugas (CRUD)"])
        UC4(["UC-04: Lihat Klasemen &<br/>Analitik Kontribusi"])
        UC5(["UC-05: Ingest & Verifikasi<br/>Webhook HMAC"])
        UC6(["UC-06: Mutasi Status<br/>Tugas Otomatis"])
        UC7(["UC-07: Siarkan Log Realtime<br/>via WebSocket"])
        UC8(["UC-08: Kirim Notifikasi<br/>Discord Embed"])
        UC9(["UC-09: Uji Lab Keamanan &<br/>Eksplorasi API"])
        UC10(["UC-10: Konfigurasi<br/>Multi-Repo Workspace"])
    end

    %% Developer Relations
    dev --> UC1
    dev --> UC2
    dev --> UC3
    dev --> UC4
    dev --> UC10

    %% GitHub Relations
    UC1 -.->|Trigger HTTP POST| github
    github --> UC5

    %% Internal System Relations
    UC5 -->|Include| UC6
    UC6 -->|Include| UC7
    UC6 -->|Include| UC8
    UC8 -->|Kirim Embed| discord

    %% Lecturer / Reviewer Relations
    lecturer --> UC4
    lecturer --> UC9
    lecturer --> UC10`,
  },

  // 2. ACTIVITY DIAGRAM
  {
    id: 'activity',
    number: 2,
    title: 'Activity Diagram (Alur Webhook & Mutasi Status)',
    category: 'Perilaku (Behavioral)',
    badge: 'Decision Logic & Security Gates',
    summary: 'Menggambarkan alur eksekusi logika backend saat menerima push commit: Rate Limiter ➔ Payload Check ➔ Verifikasi HMAC constant-time ➔ Parsing Tag ➔ Mutasi Database ➔ Dual Broadcast.',
    focusNotes: 'Perhatikan 3 gerbang keputusan keamanan (Security Gates) yang menolak request tidak sah dengan kode status HTTP 429, 413, dan 401 sebelum masuk ke proses bisnis.',
    keyPoints: [
      'Pemeriksaan IP Rate Limiter: Maksimal 30 request/menit untuk mencegah serangan banjir DoS.',
      'Proteksi Anti-JSON Bomb: Menolak payload berukuran > 100kb untuk menjaga kapasitas memori server.',
      'Verifikasi Kriptografi HMAC-SHA256: Membandingkan buffer tanda tangan dengan crypto.timingSafeEqual agar kebal dari Timing Attack.',
      'Pencabangan Logika: Commit biasa hanya menambah total commit author; commit dengan tag [done #TASK-XX] mengubah status tugas menjadi Done, mencatat audit log, mengirim notifikasi Discord, dan memancarkan event WebSocket.',
    ],
    code: `%%{init: {'theme': 'default', 'themeVariables': { 'fontSize': '12px' }}}%%
flowchart TD
    Start(["● Mulai"]) --> A1["Developer Push Commit Git<br/>Format: [done #TASK-XX]"]
    A1 --> A2["GitHub Remote Repository<br/>Mendeteksi Event 'push'"]
    A2 --> A3["GitHub Kirim HTTP POST JSON<br/>ke /api/v1/webhooks/github"]
    
    A3 --> A4{"IP Melebihi Rate Limiter?<br/>(Batas: 30 req / menit)"}
    A4 -- "Ya" --> E1["Tolak Request:<br/>HTTP 429 Too Many Requests"] --> EndFail(["● Selesai (Ditolak)"])
    
    A4 -- "Tidak" --> A5{"Ukuran Payload > 100kb?<br/>(Proteksi Anti-JSON Bomb)"}
    A5 -- "Ya" --> E2["Tolak Request:<br/>HTTP 413 Payload Too Large"] --> EndFail
    
    A5 -- "Tidak" --> A6["Security Middleware Ekstrak<br/>Header X-Hub-Signature-256"]
    A6 --> A7["Hitung Hash HMAC-SHA256 Payload<br/>dengan Secret Key Proyek"]
    A7 --> A8{"Signature Cocok & Sah?<br/>(crypto.timingSafeEqual)"}
    A8 -- "Tidak Cocok (Palsu)" --> E3["Tolak Request:<br/>HTTP 401 Unauthorized"] --> EndFail
    
    A8 -- "Cocok (Valid)" --> A9["CommitParserService Sanitasi Pesan<br/>(Proteksi Anti-XSS & ReDoS)"]
    A9 --> A10{"Pesan Mengandung Tag Tugas?<br/>Format: [done #TASK-XX]"}
    
    A10 -- "Tidak (Commit Biasa)" --> B1["Perbarui Total Commit Author<br/>di Tabel members (+1)"]
    B1 --> B2["Catat Aktivitas ke MySQL<br/>activity_logs (PUSH_EVENT)"]
    B2 --> B3["WebSocket Siarkan Event<br/>COMMIT_PUSHED ke Browser"]
    
    A10 -- "Ya (Ada Tag Tugas)" --> C1["TaskRepository Update Status Tugas<br/>di MySQL Menjadi 'Done'"]
    C1 --> C2["MemberRepository Update Total<br/>Commit & tasks_done (+1)"]
    C2 --> C3["ActivityLogRepository Catat Event<br/>TASK_COMPLETED ke MySQL"]
    C3 --> C4["DiscordWebhookService Susun<br/>Pesan Rich Embed Hijau"]
    C4 --> C5["Kirim Payload Embed Async<br/>ke API Discord Webhook"]
    C5 --> C6["WebSocket (Socket.io) Siarkan Event<br/>TASK_COMPLETED ke React"]
    
    B3 --> D1["Frontend React Tangkap Event<br/>Update UI Instan Tanpa Reload"]
    C6 --> D1
    D1 --> Success(["● Selesai (Berhasil & Realtime)"])`,
  },

  // 3. SEQUENCE DIAGRAM
  {
    id: 'sequence',
    number: 3,
    title: 'Sequence Diagram (Kronologi Interaksi Multi-Sistem)',
    category: 'Interaksi',
    badge: 'End-to-End Chronological Flow',
    summary: 'Rincian pertukaran pesan sinkron dan asinkron antarobjek secara kronologis mulai dari push commit Git hingga mutasi UI di browser.',
    focusNotes: 'Menunjukkan koordinasi asinkron (par) antara pengiriman notifikasi ke Discord API dan siaran event WebSocket ke React Dashboard secara simultan.',
    keyPoints: [
      'Langkah 1–4: Developer push kode, GitHub menembakkan HTTP POST ke Security Gate lengkap dengan signature.',
      'Langkah 5–9: Security Gate mengevaluasi batas rate limiter, ukuran data, dan keabsahan tanda tangan HMAC.',
      'Langkah 10–14: WebhookController memanggil CommitParser dan TaskRepository untuk eksekusi query update di MySQL.',
      'Langkah 15–18: Blok paralel (par) mengeksekusi pengiriman notifikasi Rich Embed ke Discord dan siaran Socket.io ke browser tanpa saling memblokir.',
    ],
    code: `sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as Web / Git CLI
    participant GH as GitHub Cloud
    participant Sec as Security Gate
    participant Ctrl as WebhookCtrl
    participant Parser as CommitParser
    participant TaskRepo as TaskRepo
    participant DB as MySQL DB
    participant Disc as DiscordService
    participant DiscordAPI as Discord API
    participant WSS as Socket.io
    participant UI as React Dashboard

    Dev->>Git: git commit -m "Fix core engine [done #TASK-02]" && git push
    Git->>GH: Push commit ke branch 'main'
    GH->>Sec: POST /api/v1/webhooks/github (Payload + X-Hub-Signature-256)
    
    activate Sec
    Sec->>Sec: Cek Rate Limit & Body Limit (100kb)
    Sec->>Sec: Hitung HMAC-SHA256 digest
    Sec->>Sec: crypto.timingSafeEqual(headerSignature, computedSignature)
    
    alt Signature Tidak Valid
        Sec-->>GH: 401 Unauthorized (Signature Mismatch)
    else Signature Valid
        Sec->>Ctrl: handleGitHubWebhook(req, res)
        deactivate Sec
        activate Ctrl
        
        Ctrl->>Parser: extractTaskCode(commitMessage)
        activate Parser
        Parser-->>Ctrl: Return 'TASK-02'
        deactivate Parser
        
        Ctrl->>TaskRepo: updateStatus('TASK-02', 'Done')
        activate TaskRepo
        TaskRepo->>DB: UPDATE tasks SET status='Done' WHERE task_code='TASK-02'
        DB-->>TaskRepo: OK (1 baris diupdate)
        deactivate TaskRepo
        
        Ctrl->>DB: INSERT INTO activity_logs (TASK_COMPLETED, ...)
        DB-->>Ctrl: Log Tersimpan
        
        par Notifikasi Eksternal Discord
            Ctrl->>Disc: sendTaskCompletion(taskDetails, webhookUrl)
            activate Disc
            Disc->>DiscordAPI: POST Webhook Payload (Rich Embed)
            DiscordAPI-->>Disc: 204 No Content (Sukses)
            deactivate Disc
        and Broadcast Realtime WebSocket
            Ctrl->>WSS: emit('activity_update', { type: 'TASK_COMPLETED', ... })
            activate WSS
            WSS->>UI: Broadcast event WebSocket ke browser aktif
            deactivate WSS
            activate UI
            UI->>UI: Update state tabel tugas & analitik tanpa reload
            deactivate UI
        end
        
        Ctrl-->>GH: 200 OK { success: true, affectedTasks: ['TASK-02'] }
        deactivate Ctrl
    end`,
  },

  // 4. CLASS DIAGRAM
  {
    id: 'class',
    number: 4,
    title: 'Class Diagram (Arsitektur OOP Backend)',
    category: 'Struktural',
    badge: 'Controller-Service-Repository Pattern',
    summary: 'Struktur kelas Object-Oriented Programming (OOP) TypeScript pada backend: pemisahan tanggung jawab Controller, Service, Repository, dan Database Connection.',
    focusNotes: 'Menerapkan prinsip Separation of Concerns (SoC) dan Dependency Injection secara modular tanpa kode monolitik yang berantakan.',
    keyPoints: [
      'Application: Kelas orkestrator yang menginisialisasi Express server, Socket.io, middleware keamanan, dan koneksi database.',
      'Controllers: Menangani routing HTTP, validasi request, dan formatting response (WebhookController, TaskController, MemberController).',
      'Repositories: Mengabstraksi akses data ke MySQL via prepared statements (TaskRepository, MemberRepository, ActivityLogRepository).',
      'Services: Menyediakan logika spesifik seperti verifikasi HMAC constant-time (WebhookSecurityService), sanitasi pesan commit (CommitParserService), dan integrasi Discord Webhook.',
    ],
    code: `classDiagram
    %% Core Application
    class Application {
        -app: Express
        -server: HttpServer
        -io: SocketIOServer
        -db: DatabaseService
        +initialize(): Promise~void~
        +start(port: number): void
        -setupMiddlewares(): void
        -setupRoutes(): void
        -setupWebSocket(): void
    }

    %% Database Service
    class DatabaseService {
        -pool: Pool
        -connected: boolean
        -memoryTasks: ITask[]
        -memoryMembers: IMember[]
        +connect(): Promise~void~
        +isConnected(): boolean
        +getPool(): Pool
        +runMigrations(): Promise~void~
        +getMemoryTasks(): ITask[]
        +getMemoryMembers(): IMember[]
    }

    %% Controllers
    class WebhookController {
        -taskRepo: TaskRepository
        -memberRepo: MemberRepository
        -logRepo: ActivityLogRepository
        -projectRepo: ProjectRepository
        -securityService: WebhookSecurityService
        -parserService: CommitParserService
        -discordService: DiscordWebhookService
        -io: SocketIOServer
        +handleGitHubWebhook(req: Request, res: Response): Promise~void~
        +handleSimulate(req: Request, res: Response): Promise~void~
    }

    class TaskController {
        -taskRepo: TaskRepository
        -memberRepo: MemberRepository
        -logRepo: ActivityLogRepository
        +getAllTasks(req: Request, res: Response): Promise~void~
        +getTaskById(req: Request, res: Response): Promise~void~
        +createTask(req: Request, res: Response): Promise~void~
        +updateTaskStatus(req: Request, res: Response): Promise~void~
        +deleteTask(req: Request, res: Response): Promise~void~
    }

    class MemberController {
        -memberRepo: MemberRepository
        -githubService: GitHubIntegrationService
        +getAllMembers(req: Request, res: Response): Promise~void~
        +syncFromGitHub(req: Request, res: Response): Promise~void~
        +clearDummy(req: Request, res: Response): Promise~void~
    }

    %% Domain Repositories
    class TaskRepository {
        -db: DatabaseService
        +findAll(): Promise~ITask[]~
        +findById(id: number): Promise~ITask~
        +findByCode(code: string): Promise~ITask~
        +updateStatus(code: string, status: string): Promise~boolean~
        +upsertTask(task: ITask): Promise~ITask~
        +deleteTask(id: number): Promise~boolean~
    }

    class MemberRepository {
        -db: DatabaseService
        +findAll(): Promise~IMember[]~
        +findByUsername(username: string): Promise~IMember~
        +incrementStats(username: string, isTaskDone: boolean): Promise~void~
        +clearDummyMembers(): Promise~void~
        +recalculateTasksDone(): Promise~void~
    }

    class ActivityLogRepository {
        -db: DatabaseService
        +findRecent(limit: number): Promise~IActivityLog[]~
        +record(event: string, author: string, msg: string, task: string, status: string): Promise~void~
        +clearLogs(): Promise~void~
    }

    %% Services
    class WebhookSecurityService {
        -secretKey: string
        +verifyGitHubSignature(payload: string, headerSig: string, secret?: string): boolean
        +calculateDigest(payload: string, secret: string): string
        +timingSafeBufferCompare(a: Buffer, b: Buffer): boolean
    }

    class CommitParserService {
        +extractTaskCode(message: string): string | null
        +sanitizeCommitMessage(message: string): string
        +isDoneCommit(message: string): boolean
    }

    class DiscordWebhookService {
        -defaultWebhookUrl: string
        +sendTaskCompletion(details: TaskEventDetails, customUrl?: string): Promise~boolean~
        -buildEmbed(details: TaskEventDetails): DiscordEmbedPayload
    }

    %% Relationships
    Application --> DatabaseService : Mengelola Koneksi
    Application --> WebhookController : Mendaftarkan Rute
    Application --> TaskController : Mendaftarkan Rute
    Application --> MemberController : Mendaftarkan Rute

    WebhookController --> TaskRepository : Memanggil Mutasi
    WebhookController --> MemberRepository : Memperbarui Statistik
    WebhookController --> ActivityLogRepository : Mencatat Audit Log
    WebhookController --> WebhookSecurityService : Verifikasi HMAC
    WebhookController --> CommitParserService : Parsing Tag Tugas
    WebhookController --> DiscordWebhookService : Kirim Rich Embed

    TaskController --> TaskRepository : Query & Mutasi Tugas
    MemberController --> MemberRepository : Query & Seeder Anggota
    TaskRepository --> DatabaseService : Eksekusi Query MySQL
    MemberRepository --> DatabaseService : Eksekusi Query MySQL
    ActivityLogRepository --> DatabaseService : Eksekusi Query MySQL`,
  },

  // 5. STATE MACHINE DIAGRAM
  {
    id: 'state-machine',
    number: 5,
    title: 'State Machine Diagram (Siklus Hidup Status Tugas)',
    category: 'Perilaku (Behavioral)',
    badge: 'Task Lifecycle Engine',
    summary: 'Siklus transisi status kartu tugas pada tabel tasks dari awal pembuatan hingga selesai diverifikasi.',
    focusNotes: 'Mesin status bekerja secara otomatis merespons pesan commit Git, serta mendukung intervensi manual dari modal UI dashboard.',
    keyPoints: [
      'Initial State: Kartu tugas baru dibuat dengan status awal "To Do".',
      'Transisi In Progress: Terjadi saat developer mulai mengerjakan atau ditugaskan via dashboard.',
      'Transisi Done (Automated): Terpicu secara instan saat commit berformat [done #TASK-XX] terverifikasi sah di backend.',
      'Re-Open Transition: Jika ditemukan bug atau revisi, status dapat dikembalikan ke In Progress oleh penilai tugas.',
    ],
    code: `stateDiagram-v2
    [*] --> ToDo: Kartu Tugas Dibuat (Initial State)

    ToDo --> InProgress: Developer Ditugaskan / Mulai Dikerjakan
    InProgress --> ToDo: Pengerjaan Dibatalkan / Reset

    InProgress --> Done: Commit Memuat Tag [done #TASK-XX]
    ToDo --> Done: Penyelesaian Langsung via Commit / UI

    Done --> InProgress: Bug Ditemukan / Re-Open Tugas
    Done --> [*]: Tugas Selesai Final & Terverifikasi Dosen`,
  },

  // 6. DEPLOYMENT & COMPONENT DIAGRAM
  {
    id: 'deployment',
    number: 6,
    title: 'Deployment & Component Diagram (Arsitektur Fisik 3-Tier)',
    category: 'Arsitektur Fisik',
    badge: '3-Tier Physical Topology',
    summary: 'Topologi fisik penyebaran perangkat keras, gateway publik, server aplikasi Node.js, database MySQL relasional, dan cloud pihak ketiga.',
    focusNotes: 'Memperlihatkan alur paket jaringan: Public HTTPS Tunnel (Cloudflare/LocalTunnel) ➔ Express API Gateway (:5000) ➔ TCP 3306 MySQL dengan in-memory fallback ➔ Outbound Discord & WebSocket broadcast.',
    keyPoints: [
      'Client Tier: Web browser mahasiswa & dosen menjalankan React 19 Single Page App dan WebSocket client Socket.io.',
      'Edge Gateway Tier: Public HTTPS Tunnel (Cloudflare / LocalTunnel) menyediakan SSL/TLS termination untuk menangkap webhook GitHub.com di internet.',
      'Application Server Tier: Node.js 22 + Express 5 menjalankan security middleware, crypto engine HMAC, parser service, dan Socket.io server.',
      'Storage Tier: MySQL 8.0 server persisten dengan skema InnoDB terindeks, dilengkapi subsistem In-Memory Fallback otomatis jika MySQL lokal offline.',
      'External Cloud: GitHub.com sebagai webhook dispatcher dan Discord API Cloud sebagai penerima outbound notifikasi Rich Embed.',
    ],
    code: `%%{init: {'theme': 'default', 'themeVariables': { 'fontSize': '11px' }}}%%
flowchart TD
    subgraph ClientTier ["🖥️ Client Tier<br/>(Browser Mahasiswa & Dosen)"]
        Browser["🌐 Web Browser<br/>(Chrome / Safari / Firefox)"]
        ReactApp["⚛️ React 19 Single Page App<br/>(Dashboard & Docs)"]
        Tailwind["🎨 Tailwind CSS v4 Engine"]
        SocketClient["⚡ Socket.io WebSocket Client"]
        Browser --> ReactApp
        ReactApp --> Tailwind
        ReactApp --> SocketClient
    end

    subgraph EdgeTier ["🛡️ Edge & Public Gateway Tier"]
        CloudflareTunnel["☁️ Public HTTPS Tunnel<br/>(Cloudflare / LocalTunnel)"]
        ReverseProxy["🔒 SSL/TLS Termination<br/>(HTTPS Reverse Proxy)"]
        CloudflareTunnel --> ReverseProxy
    end

    subgraph AppServerTier ["⚙️ Application Server Tier<br/>(Node.js 22 + Express 5)"]
        ExpressApp["🚀 Express REST API<br/>Gateway (Port :5000)"]
        SecMiddleware["🛡️ Security Shields:<br/>Helmet, RateLimiter, BodyLimiter"]
        CryptoEngine["🔐 Node.js Crypto Engine<br/>HMAC-SHA256, timingSafeEqual"]
        SocketServer["⚡ Socket.io WebSocket Server"]
        StateEngine["🔄 Task State Engine &<br/>Commit Parser Service"]

        ExpressApp --> SecMiddleware
        SecMiddleware --> CryptoEngine
        ExpressApp --> StateEngine
        ExpressApp --> SocketServer
    end

    subgraph DataTier ["💾 Database & Storage Tier"]
        MySQLServer[("🐬 MySQL 8.0 Server (:3306)<br/>Database: sipatir_db<br/>Tabel: members, tasks, activity_logs")]
        MemoryFallback[("🧠 In-Memory Storage Fallback<br/>(Aktif otomatis saat MySQL Offline)")]
    end

    subgraph ExternalCloudTier ["☁️ Third-Party Cloud Services Tier"]
        GitHubCloud["🐙 GitHub.com Cloud<br/>(Webhook Dispatcher)"]
        DiscordCloud["💬 Discord API Cloud<br/>(Webhook Notification Receiver)"]
    end

    %% Network Connections
    GitHubCloud -- "HTTPS POST<br/>(Public Webhook Event)" --> CloudflareTunnel
    CloudflareTunnel -- "Reverse Proxy<br/>Forwarding" --> ExpressApp
    
    Browser -- "HTTP REST API<br/>(GET / POST / PATCH)" --> ExpressApp
    SocketServer <-- "WSS Bi-Directional Stream<br/>(Event: activity_update)" --> SocketClient

    StateEngine -- "TCP Port 3306<br/>(Prepared Statements)" --> MySQLServer
    StateEngine -.->|In-Memory Fallback<br/>Jika MySQL Offline| MemoryFallback

    ExpressApp -- "Outbound HTTPS POST<br/>(Rich Embed JSON)" --> DiscordCloud`,
  },
];
