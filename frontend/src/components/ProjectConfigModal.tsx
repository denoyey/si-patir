import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import {
  X,
  Folder,
  Sliders,
  Plus,
  GitBranch,
  Check,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useBodyScrollLock } from '../services/scroll/hooks/useBodyScrollLock';

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
  const [errorMessage, setErrorMessage] = useState('');

  // Lock body scroll and pause Lenis while modal is open
  useBodyScrollLock(isOpen);

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
      setErrorMessage('');
      await axios.post(`/api/v1/projects/${id}/activate`);
      await onRefresh();
      onShowToast(`Proyek "${name}" aktif`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setErrorMessage(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (proj: Project) => {
    setSelectedProject(proj);
    setActiveTab('edit');
    setErrorMessage('');
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!editName.trim() || !editRepo.trim()) {
      setErrorMessage('Nama proyek dan repository wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await axios.put(`/api/v1/projects/${selectedProject.id}`, {
        name: editName.trim(),
        github_repo: editRepo.trim(),
        github_webhook_secret: editSecret.trim() || undefined,
        trello_board_id: editTrelloBoard.trim() || undefined,
        trello_done_list_id: editTrelloDoneList.trim() || undefined,
        discord_webhook_url: editDiscordWebhook.trim() || undefined,
      });

      await onRefresh();
      onShowToast('Konfigurasi disimpan', 'success');
      setActiveTab('list');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setErrorMessage(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRepo.trim()) {
      setErrorMessage('Nama proyek dan repository wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
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
      onShowToast(`Proyek "${newName}" ditambahkan`, 'success');
      setNewName('');
      setNewRepo('');
      setNewTrelloBoard('');
      setNewTrelloDoneList('');
      setNewDiscordWebhook('');
      setActiveTab('list');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setErrorMessage(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (proj: Project) => {
    if (proj.id === 1) return;
    if (!window.confirm(`Hapus proyek "${proj.name}"?`)) return;

    try {
      setIsSubmitting(true);
      await axios.delete(`/api/v1/projects/${proj.id}`);
      await onRefresh();
      onShowToast('Proyek dihapus', 'info');
      setActiveTab('list');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      onShowToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Solid black overlay, strictly no blur, scroll locked and overscroll contained
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-none overscroll-contain"
      data-lenis-prevent
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#0c0f17] rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] overscroll-contain"
        data-lenis-prevent
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
            <h2 className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white">
              Proyek & Repositori
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimalist Tabs with Lucide Icons */}
        <div className="flex items-center gap-1 px-4 pt-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setErrorMessage('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-zinc-900 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Folder className="w-3 h-3" />
            Daftar ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('edit');
              setErrorMessage('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-zinc-900 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-zinc-900 dark:border-white text-zinc-950 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Plus className="w-3 h-3" />
            Tambah
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-400">
            {errorMessage}
          </div>
        )}

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3 overscroll-contain touch-scroll" data-lenis-prevent>
          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div className="space-y-2">
              {projects.map((proj) => {
                const isActive = proj.is_active;
                return (
                  <div
                    key={proj.id}
                    className={`p-2.5 rounded border transition-colors flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-zinc-50 dark:bg-zinc-900/70 border-zinc-300 dark:border-zinc-700'
                        : 'bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-950 dark:text-white truncate">
                          {proj.name}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-2.5 h-2.5" />
                            Aktif
                          </span>
                        )}
                        {proj.id === 1 && (
                          <span className="px-1 py-0.2 rounded text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                        <GitBranch className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{proj.github_repo}</span>
                        <span>•</span>
                        <span>Trello: {proj.trello_board_id ? 'OK' : '-'}</span>
                        <span>•</span>
                        <span>Discord: {proj.discord_webhook_url ? 'OK' : '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleActivateProject(proj.id, proj.name)}
                          disabled={isSubmitting}
                          className="px-2 py-1 rounded text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                        >
                          Pilih
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(proj)}
                        disabled={isSubmitting}
                        title="Edit"
                        className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {proj.id !== 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj)}
                          disabled={isSubmitting}
                          title="Hapus"
                          className="p-1 rounded text-rose-500 hover:text-rose-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('create');
                  setErrorMessage('');
                }}
                className="w-full mt-1.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Proyek
              </button>
            </div>
          )}

          {/* TAB 2: EDIT */}
          {activeTab === 'edit' && selectedProject && (
            <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs">
              <div>
                <label htmlFor="edit-project-name" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Proyek
                </label>
                <input
                  id="edit-project-name"
                  name="project_name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  autoComplete="organization"
                  className="w-full h-8 px-2.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="edit-github-repo" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Repository (`owner/repo`)
                  </label>
                  <input
                    id="edit-github-repo"
                    name="github_repo"
                    type="text"
                    value={editRepo}
                    onChange={(e) => setEditRepo(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-webhook-secret" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Webhook Secret
                  </label>
                  <input
                    id="edit-webhook-secret"
                    name="webhook_secret"
                    type="text"
                    value={editSecret}
                    onChange={(e) => setEditSecret(e.target.value)}
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="edit-trello-board" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Trello Board ID
                  </label>
                  <input
                    id="edit-trello-board"
                    name="trello_board_id"
                    type="text"
                    value={editTrelloBoard}
                    onChange={(e) => setEditTrelloBoard(e.target.value)}
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-trello-donelist" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Trello Done List ID
                  </label>
                  <input
                    id="edit-trello-donelist"
                    name="trello_done_list_id"
                    type="text"
                    value={editTrelloDoneList}
                    onChange={(e) => setEditTrelloDoneList(e.target.value)}
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-discord-webhook" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Discord Webhook URL
                </label>
                <input
                  id="edit-discord-webhook"
                  name="discord_webhook_url"
                  type="url"
                  value={editDiscordWebhook}
                  onChange={(e) => setEditDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  autoComplete="off"
                  className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-2.5 py-1 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 rounded font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateProject} className="space-y-2.5 text-xs">
              <div>
                <label htmlFor="create-project-name" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Proyek
                </label>
                <input
                  id="create-project-name"
                  name="create_project_name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Contoh: Storefront App"
                  autoComplete="organization"
                  className="w-full h-8 px-2.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="create-github-repo" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Repository (`owner/repo`)
                  </label>
                  <input
                    id="create-github-repo"
                    name="create_github_repo"
                    type="text"
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    required
                    placeholder="denoyey/storefront"
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="create-webhook-secret" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Webhook Secret
                  </label>
                  <input
                    id="create-webhook-secret"
                    name="create_webhook_secret"
                    type="text"
                    value={newSecret}
                    onChange={(e) => setNewSecret(e.target.value)}
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="create-trello-board" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Trello Board ID (Opsional)
                  </label>
                  <input
                    id="create-trello-board"
                    name="create_trello_board_id"
                    type="text"
                    value={newTrelloBoard}
                    onChange={(e) => setNewTrelloBoard(e.target.value)}
                    placeholder="Board ID"
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="create-trello-donelist" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Trello Done List ID (Opsional)
                  </label>
                  <input
                    id="create-trello-donelist"
                    name="create_trello_done_list_id"
                    type="text"
                    value={newTrelloDoneList}
                    onChange={(e) => setNewTrelloDoneList(e.target.value)}
                    placeholder="List ID Done"
                    autoComplete="off"
                    className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="create-discord-webhook" className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Discord Webhook URL (Opsional)
                </label>
                <input
                  id="create-discord-webhook"
                  name="create_discord_webhook_url"
                  type="url"
                  value={newDiscordWebhook}
                  onChange={(e) => setNewDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  autoComplete="off"
                  className="w-full h-8 px-2.5 font-mono rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active-checkbox"
                  name="create_is_active"
                  checked={newSetAsActive}
                  onChange={(e) => setNewSetAsActive(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-zinc-900 dark:text-white"
                />
                <label htmlFor="active-checkbox" className="text-zinc-700 dark:text-zinc-300 select-none">
                  Jadikan proyek aktif
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-2.5 py-1 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 rounded font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Tambah
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
