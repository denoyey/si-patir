# 📐 Dokumentasi Diagram Arsitektur UML — SI-PATIR
**Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (DevOps Lite)**
*Mata Kuliah: Pemrograman Integratif*

Dokumen ini memuat kumpulan diagram Unified Modeling Language (UML) formal yang merepresentasikan rancangan arsitektur, interaksi antarkomponen, alur aktivitas proses bisnis, struktur kelas berorientasi objek (OOP), serta arsitektur deployment fisik sistem **SI-PATIR**.

---

## 📑 Daftar Isi Diagram
1. [Use Case Diagram (Diagram Kasus Penggunaan)](#1-use-case-diagram)
2. [Activity Diagram (Diagram Alur Aktivitas Webhook Integrasi)](#2-activity-diagram)
3. [Sequence Diagram (Diagram Sekuensial Event-Driven Webhook)](#3-sequence-diagram)
4. [Class Diagram (Diagram Kelas Arsitektur Backend OOP)](#4-class-diagram)
5. [State Machine Diagram (Diagram Siklus Hidup Status Tugas)](#5-state-machine-diagram)
6. [Deployment & Component Diagram (Diagram Komponen & Penyebaran Fisik)](#6-deployment--component-diagram)

---

## 1. Use Case Diagram
Diagram ini memetakan aktor-aktor yang berinteraksi dengan sistem dan kasus penggunaan (*use case*) yang disediakan oleh platform SI-PATIR.

### Aktor Sistem:
1. **Developer / Mahasiswa**: Mengembangkan kode, melakukan commit, memantau tugas, dan mengeksekusi commit cepat melalui Terminal Web Git.
2. **Dosen Penguji / Reviewer**: Meninjau dokumentasi teknis, melihat metriks kontribusi riil, dan menjalankan simulasi lab keamanan.
3. **GitHub Cloud System (External)**: Memicu notifikasi webhook HTTPS saat terjadi event push repository.
4. **Discord Webhook Server (External)**: Menerima payload bot notifikasi kaya (*Rich Embed*) saat tugas diselesaikan.
5. **Gateway SI-PATIR (Internal Core)**: Memvalidasi keamanan tanda tangan kriptografi, memproses state machine tugas, dan menyiarkan data realtime.

```mermaid
flowchart LR
    %% Actors
    dev(["👨‍💻 Developer / Mahasiswa"])
    lecturer(["👨‍🏫 Dosen Penguji / Reviewer"])
    github(["🌐 GitHub Cloud"])
    discord(["💬 Discord Webhook"])

    subgraph SIPATIR ["Sistem SI-PATIR (Boundary)"]
        UC1(["UC-01: Push Commit Berformat Tugas"])
        UC2(["UC-02: Eksekusi Web Git Terminal"])
        UC3(["UC-03: Kelola Kartu Tugas (CRUD)"])
        UC4(["UC-04: Lihat Klasemen & Analitik Kontribusi"])
        UC5(["UC-05: Ingest & Verifikasi Webhook HMAC"])
        UC6(["UC-06: Mutasi Status Tugas Otomatis"])
        UC7(["UC-07: Siarkan Log Realtime via WebSocket"])
        UC8(["UC-08: Kirim Notifikasi Discord Embed"])
        UC9(["UC-09: Uji Lab Keamanan & Eksplorasi API"])
        UC10(["UC-10: Ekspor Laporan Sprint (PDF & CSV)"])
        UC11(["UC-11: Konfigurasi Multi-Repo Workspace"])
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
    lecturer --> UC10
    lecturer --> UC11
```

---

## 2. Activity Diagram
Diagram ini menggambarkan alur kerja (*workflow*) end-to-end saat developer melakukan push commit ke repositori Git hingga notifikasi disiarkan ke Discord dan dashboard web.

```mermaid
flowchart TD
    Start(["● Mulai"]) --> A1["Developer melakukan Git Push commit dengan format: [done #TASK-XX]"]
    A1 --> A2["GitHub Remote Repository mendeteksi event 'push'"]
    A2 --> A3["GitHub mengirimkan payload HTTP POST JSON ke endpoint /api/v1/webhooks/github"]
    
    A3 --> A4{"Apakah IP melampaui batas Rate Limiter (30 req/menit)?"}
    A4 -- "Ya" --> E1["Tolak Request: HTTP 429 Too Many Requests"] --> EndFail(["● Selesai (Ditolak)"])
    
    A4 -- "Tidak" --> A5{"Apakah ukuran Payload > 100 Kilobyte?"}
    A5 -- "Ya" --> E2["Tolak Request: HTTP 413 Payload Too Large"] --> EndFail
    
    A5 -- "Tidak" --> A6["Security Middleware mengekstrak header X-Hub-Signature-256"]
    A6 --> A7["Hitung Hash HMAC-SHA256 payload dengan Kunci Rahasia Proyek"]
    A7 --> A8{"Apakah Signature Cocok (crypto.timingSafeEqual)?"}
    A8 -- "Tidak Cocok (Palsu/Spoofed)" --> E3["Tolak Request: HTTP 401 Unauthorized"] --> EndFail
    
    A8 -- "Cocok (Sah)" --> A9["CommitParserService membersihkan pesan commit (Anti-XSS/ReDoS)"]
    A9 --> A10{"Apakah pesan memuat tag penyelesaian [done #TASK-XX]?"}
    
    A10 -- "Tidak (Commit Biasa)" --> B1["Perbarui total commit author di tabel members (+1)"]
    B1 --> B2["Catat aktivitas ke tabel activity_logs (event: PUSH_EVENT)"]
    B2 --> B3["WebSocket menyiarkan event COMMIT_PUSHED ke browser"]
    
    A10 -- "Ya (Ada Tag Tugas)" --> C1["TaskRepository memperbarui status kartu tugas di MySQL menjadi 'Done'"]
    C1 --> C2["MemberRepository memperbarui total commit & tasks_done (+1)"]
    C2 --> C3["ActivityLogRepository mencatat event TASK_COMPLETED ke MySQL"]
    C3 --> C4["DiscordWebhookService menyusun pesan Rich Embed berwarna hijau"]
    C4 --> C5["Kirim payload Embed secara asynchronous ke API Discord Webhook"]
    C5 --> C6["WebSocket (Socket.io) menyiarkan event TASK_COMPLETED ke Dashboard React"]
    
    B3 --> D1["Web Frontend React menangkap event dan meng-update UI secara instan tanpa reload"]
    C6 --> D1
    D1 --> Success(["● Selesai (Berhasil & Realtime)"])
```

---

## 3. Sequence Diagram
Diagram sekuensial ini merinci urutan pertukaran pesan antarobjek sistem secara kronologis selama proses eksekusi webhook integrasi.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as Git Client / Web Git
    participant GH as GitHub Cloud
    participant Sec as SecurityMiddleware
    participant Ctrl as WebhookController
    participant Parser as CommitParserService
    participant TaskRepo as TaskRepository
    participant DB as MySQL Database
    participant Disc as DiscordWebhookService
    participant DiscordAPI as Discord API Server
    participant WSS as Socket.io Server
    participant UI as React Dashboard UI

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
        Sec->>Ctrl: Teruskan Request ke handleGitHubWebhook(req, res)
        deactivate Sec
        activate Ctrl
        
        Ctrl->>Parser: extractTaskCode(commitMessage)
        activate Parser
        Parser-->>Ctrl: Return 'TASK-02'
        deactivate Parser
        
        Ctrl->>TaskRepo: updateStatus('TASK-02', 'Done')
        activate TaskRepo
        TaskRepo->>DB: UPDATE tasks SET status='Done' WHERE task_code='TASK-02'
        DB-->>TaskRepo: OK (1 row affected)
        deactivate TaskRepo
        
        Ctrl->>DB: INSERT INTO activity_logs (TASK_COMPLETED, ...)
        DB-->>Ctrl: Log Tersimpan
        
        par Outbound Discord Notification
            Ctrl->>Disc: sendTaskCompletion(taskDetails, webhookUrl)
            activate Disc
            Disc->>DiscordAPI: POST Webhook Payload (Rich Embed)
            DiscordAPI-->>Disc: 204 No Content (Terkirim)
            deactivate Disc
        and Realtime WebSocket Broadcast
            Ctrl->>WSS: emit('activity_update', { type: 'TASK_COMPLETED', ... })
            activate WSS
            WSS->>UI: Broadcast event WebSocket ke semua klien aktif
            deactivate WSS
            activate UI
            UI->>UI: Update state tabel tugas & analitik tanpa reload browser
            deactivate UI
        end
        
        Ctrl-->>GH: 200 OK { success: true, affectedTasks: ['TASK-02'] }
        deactivate Ctrl
    end
```

---

## 4. Class Diagram
Diagram kelas ini memodelkan arsitektur Object-Oriented Programming (OOP) sisi backend platform SI-PATIR (TypeScript / Express).

```mermaid
classDiagram
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
    ActivityLogRepository --> DatabaseService : Eksekusi Query MySQL
```

---

## 5. State Machine Diagram
Diagram ini memodelkan siklus hidup transisi status kartu tugas (*Task State Machine*) pada tabel `tasks`.

```mermaid
stateDiagram-v2
    [*] --> ToDo: Kartu Tugas Dibuat (Initial State)

    ToDo --> InProgress: Developer Ditugaskan / Mulai Dikerjakan
    InProgress --> ToDo: Pengerjaan Dibatalkan / Reset

    InProgress --> Done: Commit Memuat Tag [done #TASK-XX]
    ToDo --> Done: Penyelesaian Langsung via Commit / UI

    Done --> InProgress: Bug Ditemukan / Re-Open Tugas
    Done --> [*]: Tugas Selesai Final & Terverifikasi Dosen
```

---

## 6. Deployment & Component Diagram
Diagram ini memvisualisasikan arsitektur penyebaran fisik perangkat keras, wadah perangkat lunak (*containers* / *nodes*), serta protokol jaringan penghubung antar-subsistem.

```mermaid
flowchart TD
    subgraph ClientTier ["🖥️ Client Tier (Browser Pengguna / Mahasiswa / Dosen)"]
        Browser["🌐 Web Browser (Chrome / Safari / Firefox)"]
        ReactApp["⚛️ React 19 Single Page Application"]
        Tailwind["🎨 Tailwind CSS v4 Engine"]
        SocketClient["⚡ Socket.io WebSocket Client"]
        Browser --> ReactApp
        ReactApp --> Tailwind
        ReactApp --> SocketClient
    end

    subgraph EdgeTier ["🛡️ Edge & Public Gateway Tier"]
        CloudflareTunnel["☁️ Public HTTPS Tunnel (Cloudflare / LocalTunnel)"]
        ReverseProxy["🔒 SSL/TLS Termination (HTTPS)"]
        CloudflareTunnel --> ReverseProxy
    end

    subgraph AppServerTier ["⚙️ Application Server Tier (Node.js 22 + Express 5)"]
        ExpressApp["🚀 Express REST API Gateway (:5000)"]
        SecMiddleware["🛡️ Security Shields: Helmet CSP, RateLimiter, BodyLimiter"]
        CryptoEngine["🔐 Node.js Crypto Engine (HMAC-SHA256, timingSafeEqual)"]
        SocketServer["⚡ Socket.io WebSocket Server"]
        StateEngine["🔄 Task State & Commit Parser Engine"]

        ExpressApp --> SecMiddleware
        SecMiddleware --> CryptoEngine
        ExpressApp --> StateEngine
        ExpressApp --> SocketServer
    end

    subgraph DataTier ["💾 Database & Storage Tier"]
        MySQLServer[("🐬 MySQL 8.0 Server (:3306)\nDatabase: sipatir_db\nTabel: members, tasks, projects, activity_logs")]
        MemoryFallback[("🧠 In-Memory RAM Storage Fallback\n(Aktif saat MySQL Offline)")]
    end

    subgraph ExternalCloudTier ["☁️ Third-Party Cloud Services Tier"]
        GitHubCloud["🐙 GitHub.com Cloud\n(Webhook Dispatcher)"]
        DiscordCloud["💬 Discord API Cloud\n(Webhook Notification Receiver)"]
    end

    %% Network Connections
    GitHubCloud -- "HTTPS POST (Public Webhook Event)" --> CloudflareTunnel
    CloudflareTunnel -- "Reverse Proxy Forwarding" --> ExpressApp
    
    Browser -- "HTTP GET / POST / PATCH (REST API)" --> ExpressApp
    SocketServer <-- "WSS Bi-Directional Stream (Event: activity_update)" --> SocketClient

    StateEngine -- "TCP Port 3306 (MySQL2 Prepared Statements)" --> MySQLServer
    StateEngine -.->|Fallback Otomatis Jika Offline| MemoryFallback

    ExpressApp -- "Outbound HTTPS POST (Rich Embed JSON)" --> DiscordCloud
```

---

## 💡 Rangkuman untuk Pertahanan Sidang Tugas:
1. **Model Arsitektur**: *Three-Tier Layered Architecture* yang dipadukan dengan *Event-Driven Webhook Integration*.
2. **Kepatuhan OOP**: Menggunakan pola *Controller-Service-Repository* sehingga logika query database, parsing logika bisnis, dan penanganan HTTP terisolasi rapi (*Separation of Concerns*).
3. **Keandalan Sistem**: Menggabungkan *In-Memory Fallback* untuk menjaga ketersediaan tinggi (*High Availability*) jika database MySQL mengalami gangguan sementara.
