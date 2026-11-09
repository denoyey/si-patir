import { useState } from 'react';
import axios from 'axios';
import {
  X,
  Code2,
  ExternalLink,
  Play,
  Copy,
  Check,
  Shield,
  Layers,
} from 'lucide-react';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointItem {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Tasks' | 'Members' | 'Webhooks' | 'System';
  summary: string;
  description: string;
  defaultPayload?: any;
}

const ENDPOINTS: EndpointItem[] = [
  {
    id: 'get-tasks',
    method: 'GET',
    path: '/api/v1/tasks',
    category: 'Tasks',
    summary: 'Daftar Seluruh Kartu Tugas',
    description: 'Mengambil seluruh kartu tugas beserta status ("To Do", "In Progress", "Done") dan assignee.',
  },
  {
    id: 'patch-task-status',
    method: 'PATCH',
    path: '/api/v1/tasks/1/status',
    category: 'Tasks',
    summary: 'Ubah Status Tugas & Auto-Sync Trello',
    description: 'Mengubah status kartu tugas di MySQL dan memindahkan kartu secara otomatis di papan Kanban Trello.',
    defaultPayload: { status: 'Done' },
  },
  {
    id: 'sync-trello',
    method: 'POST',
    path: '/api/v1/tasks/sync-trello',
    category: 'Tasks',
    summary: 'Sinkronisasi Nyata dari Papan Trello',
    description: 'Menarik seluruh kartu nyata dari board Trello resmi dan memperbarui data database.',
  },
  {
    id: 'get-members',
    method: 'GET',
    path: '/api/v1/members',
    category: 'Members',
    summary: 'Klasemen Kontributor Anggota',
    description: 'Mengambil data klasemen developer berdasarkan jumlah commit Git autentik dan task selesai.',
  },
  {
    id: 'get-member-detail',
    method: 'GET',
    path: '/api/v1/members/denoyey',
    category: 'Members',
    summary: 'Detail Profil Anggota',
    description: 'Mengambil statistik kontribusi developer spesifik berdasarkan username GitHub.',
  },
  {
    id: 'system-status',
    method: 'GET',
    path: '/api/v1/system/status',
    category: 'System',
    summary: 'Status Kesehatan Integrasi (Healthcheck)',
    description: 'Mengecek ketersediaan koneksi MySQL, Trello, Discord, GitHub, dan uptime backend.',
  },
  {
    id: 'system-logs',
    method: 'GET',
    path: '/api/v1/system/logs',
    category: 'System',
    summary: 'Log Aktivitas Real-Time',
    description: 'Mengambil 50 aktivitas webhook dan commit terbaru dari sistem.',
  },
  {
    id: 'webhook-simulate',
    method: 'POST',
    path: '/api/v1/webhooks/simulate',
    category: 'Webhooks',
    summary: 'Simulasi Push Commit Lokal',
    description: 'Menguji parser tag commit [done #TASK-XX] tanpa push nyata ke GitHub.',
    defaultPayload: {
      author: 'denoyey',
      message: 'feat: update core engine [done #TASK-01]',
    },
  },
];

export function ApiExplorerModal({ isOpen, onClose }: ApiExplorerModalProps) {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'webhook'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem>(ENDPOINTS[0]);
  const [payloadText, setPayloadText] = useState<string>(
    ENDPOINTS[0].defaultPayload ? JSON.stringify(ENDPOINTS[0].defaultPayload, null, 2) : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    statusText: string;
    data: any;
    duration: number;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectEndpoint = (ep: EndpointItem) => {
    setSelectedEndpoint(ep);
    setPayloadText(ep.defaultPayload ? JSON.stringify(ep.defaultPayload, null, 2) : '');
    setResponseResult(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseResult(null);
    const start = performance.now();

    try {
      let res;
      if (selectedEndpoint.method === 'GET') {
        res = await axios.get(selectedEndpoint.path);
      } else if (selectedEndpoint.method === 'POST') {
        const parsedBody = payloadText ? JSON.parse(payloadText) : {};
        res = await axios.post(selectedEndpoint.path, parsedBody);
      } else if (selectedEndpoint.method === 'PATCH') {
        const parsedBody = payloadText ? JSON.parse(payloadText) : {};
        res = await axios.patch(selectedEndpoint.path, parsedBody);
      } else if (selectedEndpoint.method === 'DELETE') {
        res = await axios.delete(selectedEndpoint.path);
      }
      const duration = Math.round(performance.now() - start);
      if (res) {
        setResponseResult({
          status: res.status,
          statusText: res.statusText || 'OK',
          data: res.data,
          duration,
        });
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setResponseResult({
        status: err.response?.status || 500,
        statusText: err.response?.statusText || 'Error',
        data: err.response?.data || { error: err.message },
        duration,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyCurl = () => {
    const origin = window.location.origin.replace(':3000', ':5000');
    let curl = `curl -X ${selectedEndpoint.method} "${origin}${selectedEndpoint.path}"`;
    if (payloadText && (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PATCH')) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${payloadText.replace(/\n/g, '')}'`;
    }
    navigator.clipboard.writeText(curl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-none flex items-center justify-center p-3 sm:p-5">
      <div
        data-lenis-prevent
        className="bg-white dark:bg-[#0f131d] border border-zinc-200 dark:border-zinc-800 rounded-lg w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-[#121624] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">SI-PATIR REST API &amp; Webhooks</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  v1.2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Katalog endpoint terstandarisasi untuk monitoring tugas, integrasi Trello, Discord, &amp; GitHub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
              title="Buka Swagger / Full API Explorer di tab baru"
            >
              <span>Full Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f131d] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'endpoints'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Katalog Endpoint &amp; Playground</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`pb-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Panduan Webhook GitHub</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 touch-scroll" data-lenis-prevent>
          {activeTab === 'endpoints' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Endpoint List */}
              <div className="md:col-span-5 space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1 mb-1">
                  Pilih Endpoint ({ENDPOINTS.length})
                </div>
                {ENDPOINTS.map((ep) => {
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
                      className={`w-full text-left p-2.5 rounded-md border transition cursor-pointer flex items-start gap-2 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500/40 shadow-xs'
                          : 'bg-white dark:bg-[#121624] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${methodColor}`}>
                        {ep.method}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-200 truncate">
                          {ep.path}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {ep.summary}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Playground / Tester */}
              <div className="md:col-span-7 bg-zinc-50 dark:bg-[#131726] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {selectedEndpoint.method}
                      </span>
                      <span className="text-xs font-mono text-zinc-900 dark:text-zinc-100 font-semibold break-all">
                        {selectedEndpoint.path}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyCurl}
                      className="px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                      title="Salin perintah cURL"
                    >
                      {hasCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{hasCopied ? 'Tersalin' : 'Copy cURL'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2.5 leading-relaxed">
                    {selectedEndpoint.description}
                  </p>

                  {/* Body Editor for POST / PATCH */}
                  {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PATCH') && (
                    <div className="mt-3">
                      <label htmlFor="api-payload-editor" className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                        Request Body (JSON):
                      </label>
                      <textarea
                        id="api-payload-editor"
                        rows={3}
                        value={payloadText}
                        onChange={(e) => setPayloadText(e.target.value)}
                        className="w-full font-mono text-xs p-2.5 rounded-md bg-white dark:bg-[#0a0d14] border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-hidden focus:border-blue-500 transition"
                      />
                    </div>
                  )}

                  {/* Execution Action Button */}
                  <div className="mt-3.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleExecute}
                      className="w-full h-8.5 px-3 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white active:scale-95 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Memanggil API...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Kirim Request API Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Response Result Display */}
                  {responseResult && (
                    <div className="mt-4 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-white dark:bg-[#0a0d14]">
                      <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                        <span
                          className={`font-bold ${
                            responseResult.status >= 200 && responseResult.status < 300
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-500'
                          }`}
                        >
                          HTTP {responseResult.status} {responseResult.statusText}
                        </span>
                        <span className="text-zinc-400">{responseResult.duration}ms</span>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(responseResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto py-2 text-xs">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-300">
                <h4 className="font-bold flex items-center gap-1.5 mb-1">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Alur Webhook Real-Time GitHub
                </h4>
                <p className="text-[11.5px] leading-relaxed">
                  Setiap kali developer melakukan <code>git push</code> dengan tag tugas di pesan commit, GitHub langsung memicu webhook ke endpoint backend SI-PATIR. Kartu Trello otomatis dipindahkan ke Done dan notifikasi dikirim ke Discord.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-950 dark:text-white mb-1">1. Pengaturan di GitHub Repository</div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
                    Buka <strong>Settings → Webhooks → Add webhook</strong> pada repositori Anda:
                  </p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Payload URL:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">http://&lt;ip-server&gt;:5000/api/v1/webhooks/github</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Content type:</span>
                      <span className="text-zinc-900 dark:text-zinc-200 font-bold">application/json</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Secret:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">sipatir_secret_123</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500">Events:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Just the push event</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-950 dark:text-white mb-1">2. Format Pesan Commit Git</div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
                    Cukup sertakan tag <code>[done #TASK-XX]</code> pada pesan commit Anda:
                  </p>
                  <div className="p-2.5 rounded-md bg-black text-emerald-400 font-mono text-xs">
                    $ git commit -m "feat(auth): selesaikan login Google [done #TASK-01]"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121624] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Base URL: <code className="font-mono text-zinc-700 dark:text-zinc-300">http://localhost:5000/api/v1</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
