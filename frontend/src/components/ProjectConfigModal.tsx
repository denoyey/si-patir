import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import {
  X,
  FolderGit2,
  Check,
  Plus,
  Settings2,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export interface Project {
  id: number;
  name: string;
  slug: string;
  github_repo: string;
  github_webhook_secret?: string;
  trello_board_id?: string;
  trello_done_list_id?: string;
  discord_webhook_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProjectConfigModalProps {
  isOpen: boolean;
  projects: Project[];
  activeProject: Project | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type TabType = 'list' | 'edit' | 'create';

export function ProjectConfigModal({
  isOpen,
  projects,
  activeProject,
  onClose,
  onRefresh,
  onShowToast,
}: ProjectConfigModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(activeProject);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form state for Create
  const [newName, setNewName] = useState('');
  const [newRepo, setNewRepo] = useState('');
  const [newSecret, setNewSecret] = useState('sipatir_secret_123');
  const [newTrelloBoard, setNewTrelloBoard] = useState('');
  const [newTrelloDoneList, setNewTrelloDoneList] = useState('');
  const [newDiscordWebhook, setNewDiscordWebhook] = useState('');
  const [newSetAsActive, setNewSetAsActive] = useState(true);

  // Form state for Edit
  const [editName, setEditName] = useState('');
  const [editRepo, setEditRepo] = useState('');
  const [editSecret, setEditSecret] = useState('');
  const [editTrelloBoard, setEditTrelloBoard] = useState('');
  const [editTrelloDoneList, setEditTrelloDoneList] = useState('');
  const [editDiscordWebhook, setEditDiscordWebhook] = useState('');

  // Sync edit form with selected project
  useEffect(() => {
    const target = selectedProject || activeProject;
    if (target) {
      setEditName(target.name || '');
      setEditRepo(target.github_repo || '');
      setEditSecret(target.github_webhook_secret || '');
      setEditTrelloBoard(target.trello_board_id || '');
      setEditTrelloDoneList(target.trello_done_list_id || '');
      setEditDiscordWebhook(target.discord_webhook_url || '');
    }
  }, [selectedProject, activeProject]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleActivateProject = async (id: number, name: string) => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      await axios.post(`/api/v1/projects/${id}/activate`);
      await onRefresh();
      onShowToast(`Proyek aktif dialihkan ke "${name}"`, 'success');
      setStatusMessage({ text: `Proyek "${name}" sekarang aktif.`, isError: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setStatusMessage({ text: `Gagal mengalihkan proyek: ${msg}`, isError: true });
      onShowToast(`Gagal mengalihkan: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (proj: Project) => {
    setSelectedProject(proj);
    setActiveTab('edit');
    setStatusMessage(null);
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!editName.trim() || !editRepo.trim()) {
      setStatusMessage({ text: 'Nama proyek dan nama repositori wajib diisi.', isError: true });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      await axios.put(`/api/v1/projects/${selectedProject.id}`, {
        name: editName.trim(),
        github_repo: editRepo.trim(),
        github_webhook_secret: editSecret.trim() || undefined,
        trello_board_id: editTrelloBoard.trim() || undefined,
        trello_done_list_id: editTrelloDoneList.trim() || undefined,
        discord_webhook_url: editDiscordWebhook.trim() || undefined,
      });

      await onRefresh();
      onShowToast(`Konfigurasi proyek "${editName}" berhasil disimpan`, 'success');
      setStatusMessage({ text: `Konfigurasi proyek "${editName}" berhasil diperbarui.`, isError: false });
      setActiveTab('list');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setStatusMessage({ text: `Gagal menyimpan: ${msg}`, isError: true });
      onShowToast(`Gagal: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRepo.trim()) {
      setStatusMessage({ text: 'Nama proyek dan repositori GitHub wajib diisi.', isError: true });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      await axios.post('/api/v1/projects', {
        name: newName.trim(),
        github_repo: newRepo.trim(),
        github_webhook_secret: newSecret.trim() || 'sipatir_secret_123',
        trello_board_id: newTrelloBoard.trim() || undefined,
        trello_done_list_id: newTrelloDoneList.trim() || undefined,
        discord_webhook_url: newDiscordWebhook.trim() || undefined,
        is_active: newSetAsActive,
      });

      await onRefresh();
      onShowToast(`Proyek baru "${newName}" berhasil didaftarkan`, 'success');

      // Reset form
      setNewName('');
      setNewRepo('');
      setNewTrelloBoard('');
      setNewTrelloDoneList('');
      setNewDiscordWebhook('');
      setActiveTab('list');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setStatusMessage({ text: `Gagal membuat proyek: ${msg}`, isError: true });
      onShowToast(`Gagal: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (proj: Project) => {
    if (proj.id === 1) {
      alert('Proyek default SI-PATIR (ID: 1) dilindungi dan tidak dapat dihapus.');
      return;
    }

    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus profil proyek "${proj.name}"?`);
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await axios.delete(`/api/v1/projects/${proj.id}`);
      await onRefresh();
      onShowToast(`Proyek "${proj.name}" berhasil dihapus`, 'info');
      setActiveTab('list');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      onShowToast(`Gagal menghapus: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0f17] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-[#0c0f17]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <FolderGit2 className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
                Manajemen Profil Proyek & Repositori
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pilih atau sesuaikan konfigurasi GitHub, Trello, dan Discord untuk setiap proyek
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0f17]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setStatusMessage(null);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-850'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Daftar Proyek ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('edit');
              setStatusMessage(null);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-850'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Edit Konfigurasi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setStatusMessage(null);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-850'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Proyek Baru
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mx-4 sm:mx-5 mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* TAB 1: LIST PROJECTS */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Pilih proyek untuk mengalihkan pemantauan dashboard:
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Aktif: {activeProject?.name || 'SI-PATIR'}
                </span>
              </div>

              <div className="space-y-2.5">
                {projects.map((proj) => {
                  const isActive = proj.is_active;
                  return (
                    <div
                      key={proj.id}
                      className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/80 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {proj.name}
                          </h4>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <Check className="w-3 h-3" />
                              Sedang Aktif
                            </span>
                          )}
                          {proj.id === 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="inline-flex items-center gap-1 font-mono text-zinc-700 dark:text-zinc-300">
                            📦 {proj.github_repo}
                          </span>
                          <span>•</span>
                          <span>
                            📋 Trello:{' '}
                            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {proj.trello_board_id ? 'Terhubung' : 'Belum diisi'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            💬 Discord:{' '}
                            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {proj.discord_webhook_url ? 'Aktif' : 'Belum diisi'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleActivateProject(proj.id, proj.name)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Radio className="w-3 h-3" />
                            Aktifkan
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(proj)}
                          disabled={isSubmitting}
                          title="Edit Konfigurasi"
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {proj.id !== 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj)}
                            disabled={isSubmitting}
                            title="Hapus Proyek"
                            className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('create');
                    setStatusMessage(null);
                  }}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Repositori / Proyek Baru
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROJECT CONFIG */}
          {activeTab === 'edit' && selectedProject && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Sedang mengedit profil:</span>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedProject.name}</p>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">ID: {selectedProject.id}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Proyek / Workspace <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder="Contoh: SI-PATIR Enterprise"
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Repositori GitHub (`owner/repo`) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editRepo}
                      onChange={(e) => setEditRepo(e.target.value)}
                      required
                      placeholder="denoyey/si-patir"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      GitHub Webhook Secret
                    </label>
                    <input
                      type="text"
                      value={editSecret}
                      onChange={(e) => setEditSecret(e.target.value)}
                      placeholder="sipatir_secret_123"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trello Board ID
                    </label>
                    <input
                      type="text"
                      value={editTrelloBoard}
                      onChange={(e) => setEditTrelloBoard(e.target.value)}
                      placeholder="6aeda5a802922f9870c61315"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trello Done List ID
                    </label>
                    <input
                      type="text"
                      value={editTrelloDoneList}
                      onChange={(e) => setEditTrelloDoneList(e.target.value)}
                      placeholder="6aeda5a902922f9870c61336"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Discord Webhook URL
                  </label>
                  <input
                    type="url"
                    value={editDiscordWebhook}
                    onChange={(e) => setEditDiscordWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Kanal Discord spesifik tempat notifikasi penyelesaian tugas proyek ini dikirim.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE NEW PROJECT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
                💡 <strong>Multi-Tenant Workspace:</strong> Proyek baru akan memiliki lingkungan pemantauan terisolasi. Commit dari repo ini hanya akan menggeser kartu pada board Trello yang Anda tentukan di bawah.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Proyek Baru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="Contoh: E-Commerce Storefront"
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      GitHub Repo (`owner/repo`) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRepo}
                      onChange={(e) => setNewRepo(e.target.value)}
                      required
                      placeholder="denoyey/ecommerce"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      GitHub Webhook Secret
                    </label>
                    <input
                      type="text"
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                      placeholder="sipatir_secret_123"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trello Board ID (Opsional)
                    </label>
                    <input
                      type="text"
                      value={newTrelloBoard}
                      onChange={(e) => setNewTrelloBoard(e.target.value)}
                      placeholder="Board ID khusus proyek ini"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trello Done List ID (Opsional)
                    </label>
                    <input
                      type="text"
                      value={newTrelloDoneList}
                      onChange={(e) => setNewTrelloDoneList(e.target.value)}
                      placeholder="List ID Done khusus"
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Discord Webhook URL (Opsional)
                  </label>
                  <input
                    type="url"
                    value={newDiscordWebhook}
                    onChange={(e) => setNewDiscordWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="set-active-checkbox"
                    checked={newSetAsActive}
                    onChange={(e) => setNewSetAsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="set-active-checkbox" className="text-xs text-zinc-700 dark:text-zinc-300 select-none">
                    Jadikan proyek aktif setelah didaftarkan
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Daftarkan Proyek
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
