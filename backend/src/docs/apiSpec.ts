/**
 * SI-PATIR: Official REST API Specification & Endpoint Registry
 * Standardized OpenAPI-compatible metadata for automated discovery and documentation
 */

export interface IApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Tasks' | 'Members' | 'Webhooks' | 'System' | 'Projects';
  summary: string;
  description: string;
  headers?: { name: string; value: string; required?: boolean }[];
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: any;
  exampleResponse: {
    status: number;
    body: any;
  };
}

export const API_METADATA = {
  name: 'SI-PATIR REST API',
  version: '1.2.0',
  description: 'Sistem Integrasi Pemantau Aktivitas Tugas & Informasi Repositori (Git -> Trello -> Discord -> WebSocket)',
  baseUrls: ['http://localhost:5000/api/v1', 'http://localhost:5000/api'],
  author: 'Tim Pengembang SI-PATIR',
  repository: 'https://github.com/denoyey/si-patir',
  technologies: ['Node.js (TypeScript)', 'Express 5', 'MySQL 8', 'Socket.IO', 'Trello REST API', 'Discord Webhooks'],
};

export const API_ENDPOINTS: IApiEndpointSpec[] = [
  // TASKS
  {
    method: 'GET',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Daftar Semua Kartu Tugas',
    description: 'Mengambil seluruh daftar kartu tugas dari database MySQL beserta status real-time ("To Do", "In Progress", "Done") dan assignee.',
    exampleResponse: {
      status: 200,
      body: [
        {
          id: 1,
          task_code: 'TASK-01',
          title: 'Buat Database & Skema User',
          status: 'Done',
          trello_card_id: '6aeda701866caee30e603ca4',
          assignee: 'denoyey',
          updated_at: '2026-11-06T07:29:02.000Z',
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/v1/tasks/:id',
    category: 'Tasks',
    summary: 'Detail Kartu Tugas',
    description: 'Mengambil data spesifik kartu tugas berdasarkan ID numerik database atau kode tugas (misal: "TASK-01").',
    params: [
      { name: 'id', type: 'string | number', description: 'ID numerik kartu tugas atau kode tugas (misal: TASK-01)', required: true },
    ],
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        task: {
          id: 1,
          task_code: 'TASK-01',
          title: 'Buat Database & Skema User',
          status: 'Done',
          trello_card_id: '6aeda701866caee30e603ca4',
          assignee: 'denoyey',
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Buat Kartu Tugas Baru',
    description: 'Menambahkan kartu tugas baru ke dalam database dan menyiarkan pembaruan secara instan ke seluruh klien via WebSocket.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    body: {
      taskCode: 'TASK-06',
      title: 'Integrasi Sistem Cache Redis',
      assignee: 'denoyey',
      status: 'In Progress',
    },
    exampleResponse: {
      status: 201,
      body: {
        success: true,
        task: {
          id: 6,
          task_code: 'TASK-06',
          title: 'Integrasi Sistem Cache Redis',
          status: 'In Progress',
          assignee: 'denoyey',
        },
      },
    },
  },
  {
    method: 'PATCH',
    path: '/api/v1/tasks/:id/status',
    category: 'Tasks',
    summary: 'Update Status Tugas & Sinkronisasi Trello Dua Arah',
    description: 'Mengubah status kartu tugas di database MySQL, memindahkan kartu secara otomatis ke kolom yang bersesuaian di Trello ("To Do", "in progress", "Done"), menghitung ulang statistik anggota, dan menyiarkan event WebSocket.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    params: [
      { name: 'id', type: 'string | number', description: 'ID numerik atau kode tugas (misal: TASK-02)', required: true },
    ],
    body: {
      status: 'Done',
    },
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Status tugas TASK-02 berhasil diperbarui ke "Done".',
        trello_notice: 'Kartu TASK-02 berhasil dipindahkan ke kolom "Done" di Trello.',
        task: {
          id: 2,
          task_code: 'TASK-02',
          title: 'Integrasi Papan Kanban Trello',
          status: 'Done',
          assignee: 'Patirparkerr',
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/v1/tasks/:id',
    category: 'Tasks',
    summary: 'Hapus Kartu Tugas',
    description: 'Menghapus satu kartu tugas dari sistem berdasarkan ID numerik database.',
    params: [
      { name: 'id', type: 'number', description: 'ID numerik kartu tugas yang ingin dihapus', required: true },
    ],
    exampleResponse: {
      status: 200,
      body: { success: true },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/tasks/sync-trello',
    category: 'Tasks',
    summary: 'Sinkronisasi Dua Arah dari Papan Trello',
    description: 'Menarik seluruh kartu dan daftar kolom dari papan Kanban Trello resmi, memetakan status, dan melakukan upsert ke database MySQL beserta ID kartu Trello.',
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Berhasil menyinkronkan 4 kartu nyata dari papan Kanban Trello ke sistem.',
        count: 4,
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/tasks/sync-github',
    category: 'Tasks',
    summary: 'Sinkronisasi Issue dari GitHub',
    description: 'Menarik daftar Issue dari repositori GitHub untuk dijadikan tugas otomatis di SI-PATIR.',
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Berhasil sinkronisasi issue dari GitHub',
        tasks: [],
      },
    },
  },

  // MEMBERS
  {
    method: 'GET',
    path: '/api/v1/members',
    category: 'Members',
    summary: 'Klasemen Kontributor Anggota',
    description: 'Mengambil klasemen seluruh developer terdaftar yang diurutkan berdasarkan total commit Git autentik dan jumlah tugas selesai.',
    exampleResponse: {
      status: 200,
      body: [
        {
          id: 5,
          name: 'Deni',
          github_username: 'denoyey',
          total_commits: 43,
          tasks_done: 2,
        },
        {
          id: 8,
          name: 'Fatir',
          github_username: 'Patirparkerr',
          total_commits: 2,
          tasks_done: 1,
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/v1/members/:username',
    category: 'Members',
    summary: 'Detail Kontributor Anggota',
    description: 'Mengambil profil dan data kontribusi spesifik seorang anggota berdasarkan GitHub username.',
    params: [
      { name: 'username', type: 'string', description: 'Username akun GitHub (misal: denoyey)', required: true },
    ],
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        member: {
          id: 5,
          name: 'Deni',
          github_username: 'denoyey',
          total_commits: 43,
          tasks_done: 2,
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/members',
    category: 'Members',
    summary: 'Tambah Anggota Baru',
    description: 'Mendaftarkan anggota/developer tim baru secara manual ke dalam sistem klasemen.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    body: {
      name: 'Budi Santoso',
      username: 'budisantoso',
    },
    exampleResponse: {
      status: 201,
      body: {
        success: true,
        member: {
          id: 10,
          name: 'Budi Santoso',
          github_username: 'budisantoso',
          total_commits: 0,
          tasks_done: 0,
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/members/sync-github',
    category: 'Members',
    summary: 'Sinkronisasi Kontributor Nyata dari GitHub',
    description: 'Menarik riwayat commit autentik langsung dari repositori GitHub menggunakan GitHub API dan fallback Git log lokal, lalu memperbarui klasemen.',
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Berhasil menyinkronkan 4 kontributor asli dari GitHub.',
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/members/clear-dummy',
    category: 'Members',
    summary: 'Bersihkan Data Dummy',
    description: 'Menghapus data developer dummy bawaan sehingga hanya menyisakan data asli anggota tim.',
    exampleResponse: {
      status: 200,
      body: { success: true },
    },
  },

  // WEBHOOKS
  {
    method: 'POST',
    path: '/api/v1/webhooks/github',
    category: 'Webhooks',
    summary: 'GitHub Push Webhook Receiver',
    description: 'Menerima payload Push Event resmi dari GitHub. Dilengkapi verifikasi keamanan tanda tangan HMAC SHA-256 (`x-hub-signature-256`) untuk mencegah serangan timing attack & spoofing.',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
      { name: 'X-GitHub-Event', value: 'push', required: true },
      { name: 'X-Hub-Signature-256', value: 'sha256=...', required: true },
    ],
    body: {
      ref: 'refs/heads/main',
      repository: { full_name: 'denoyey/si-patir' },
      commits: [
        {
          id: 'a1b2c3d',
          message: 'feat: selesaikan modul user [done #TASK-01]',
          author: { name: 'Deni', username: 'denoyey' },
        },
      ],
    },
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        processedCommits: 1,
        message: 'Webhook push event diproses sukses.',
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks/simulate',
    category: 'Webhooks',
    summary: 'Simulasi Push Commit (Development / Testing)',
    description: 'Endpoint aman untuk menguji parsing tag commit [done #TASK-XX] dan pembaruan UI secara lokal tanpa harus melakukan git push sungguhan ke GitHub.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    body: {
      author: 'denoyey',
      message: 'fix(core): perbaiki validasi token [done #TASK-02]',
    },
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        taskProcessed: 'TASK-02',
        message: 'Simulasi commit berhasil diproses.',
      },
    },
  },

  // SYSTEM
  {
    method: 'GET',
    path: '/api/v1/system/status',
    category: 'System',
    summary: 'Healthcheck & Status Integrasi Sistem',
    description: 'Memeriksa status ketersediaan koneksi MySQL Database, integrasi Trello, Discord Webhook, koneksi GitHub, serta memori dan uptime server.',
    exampleResponse: {
      status: 200,
      body: {
        mysql: true,
        trello: true,
        discord: true,
        github: true,
        repository: 'denoyey/si-patir',
        uptime: 142.5,
        timestamp: '2026-11-08T16:44:48.115Z',
      },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/system/logs',
    category: 'System',
    summary: 'Log Aktivitas Real-time',
    description: 'Mengambil hingga 50 catatan log riwayat aktivitas terakhir (Push Event, Task Completed, Webhook Received) dari database.',
    exampleResponse: {
      status: 200,
      body: [
        {
          id: 1,
          event_type: 'PUSH_EVENT',
          author: 'denoyey',
          commit_message: 'feat: add interactive terminal simulator',
          status: 'SUCCESS',
          created_at: '2026-11-06T11:42:02.000Z',
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/v1/system/docs',
    category: 'System',
    summary: 'Spesifikasi OpenAPI / JSON Discovery',
    description: 'Mengembalikan spesifikasi teknis lengkap seluruh endpoint API SI-PATIR dalam format JSON standar.',
    exampleResponse: {
      status: 200,
      body: {
        name: 'SI-PATIR REST API',
        version: '1.2.0',
        endpoints: '...',
      },
    },
  },

  // PROJECTS (Dynamic Multi-Repo Configuration)
  {
    method: 'GET',
    path: '/api/v1/projects',
    category: 'Projects',
    summary: 'Daftar Seluruh Proyek Terdaftar',
    description: 'Mengambil daftar semua profil proyek beserta status aktif dan kredensial integrasi masing-masing.',
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        projects: [
          {
            id: 1,
            name: 'SI-PATIR (DevOps Lite)',
            slug: 'si-patir',
            github_repo: 'denoyey/si-patir',
            trello_board_id: '672b1444d3725b816ba7b830',
            is_active: true,
          },
        ],
      },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/projects/active',
    category: 'Projects',
    summary: 'Ambil Profil Proyek yang Sedang Aktif',
    description: 'Mengambil detail konfigurasi proyek yang saat ini sedang aktif digunakan oleh dashboard dan pemrosesan commit.',
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        project: {
          id: 1,
          name: 'SI-PATIR (DevOps Lite)',
          slug: 'si-patir',
          github_repo: 'denoyey/si-patir',
          is_active: true,
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/projects',
    category: 'Projects',
    summary: 'Daftarkan Proyek / Repositori Baru',
    description: 'Menambahkan profil repositori baru lengkap dengan konfigurasi Trello Board dan Discord Webhook terisolasi.',
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    body: {
      name: 'E-Commerce Microservice',
      github_repo: 'denoyey/ecommerce-app',
      trello_board_id: '672b1444d3725b816ba7b899',
      trello_done_list_id: '672b14589d81373e3bf8e299',
      discord_webhook_url: 'https://discord.com/api/webhooks/123/xyz',
      is_active: false,
    },
    exampleResponse: {
      status: 201,
      body: {
        success: true,
        message: 'Proyek "E-Commerce Microservice" berhasil didaftarkan.',
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/v1/projects/:id',
    category: 'Projects',
    summary: 'Perbarui Konfigurasi Proyek',
    description: 'Mengubah pengaturan repositori GitHub, board Trello, atau webhook Discord untuk proyek tertentu.',
    params: [{ name: 'id', type: 'number', description: 'ID profil proyek', required: true }],
    headers: [{ name: 'Content-Type', value: 'application/json', required: true }],
    body: {
      name: 'SI-PATIR 2.0 Extended',
      github_repo: 'denoyey/si-patir-v2',
      discord_webhook_url: 'https://discord.com/api/webhooks/xxx/yyy',
    },
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Konfigurasi proyek berhasil diperbarui.',
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/projects/:id/activate',
    category: 'Projects',
    summary: 'Alihkan Proyek Aktif',
    description: 'Mengaktifkan profil proyek tertentu sehingga seluruh aktivitas dashboard dan sinkronisasi beralih ke proyek tersebut.',
    params: [{ name: 'id', type: 'number', description: 'ID profil proyek yang akan diaktifkan', required: true }],
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Proyek aktif berhasil dialihkan.',
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/v1/projects/:id',
    category: 'Projects',
    summary: 'Hapus Profil Proyek',
    description: 'Menghapus profil proyek tambahan. Proyek default ID: 1 dilindungi dan tidak dapat dihapus.',
    params: [{ name: 'id', type: 'number', description: 'ID profil proyek', required: true }],
    exampleResponse: {
      status: 200,
      body: {
        success: true,
        message: 'Proyek berhasil dihapus.',
      },
    },
  },
];

