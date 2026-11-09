import { useState, useEffect, type FormEvent } from 'react';
import { X, CheckSquare, Save, Loader2, User, Tag } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  github_username: string;
  total_commits: number;
  tasks_done: number;
}

interface Task {
  id: number;
  task_code: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  members: Member[];
  onClose: () => void;
  onSave: (taskId: number, data: { title: string; assignee: string; status: 'To Do' | 'In Progress' | 'Done' }) => Promise<void>;
}

export function EditTaskModal({ isOpen, task, members, onClose, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState<'To Do' | 'In Progress' | 'Done'>('In Progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync internal form state whenever task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setAssignee(task.assignee || (members[0]?.github_username ?? 'denoyey'));
      setStatus(task.status || 'In Progress');
      setErrorMessage('');
    }
  }, [task, members]);

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

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage('Judul tugas tidak boleh kosong.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onSave(task.id, {
        title: cleanTitle,
        assignee: assignee || (members[0]?.github_username ?? 'denoyey'),
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || err?.message || 'Gagal menyimpan perubahan tugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-none flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-modal-title"
    >
      <div
        data-lenis-prevent
        className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto touch-scroll space-y-4 text-zinc-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 id="edit-task-modal-title" className="text-sm font-bold text-zinc-950 dark:text-white">
                Edit Tugas
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Perbarui detail judul, penanggung jawab, atau status tugas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer disabled:opacity-50"
            aria-label="Tutup modal edit tugas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Kode Tugas (Read-Only) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Kode Tugas (Read-only)
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-100 dark:bg-[#0a0d14] border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200">
              <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="font-bold">#{task.task_code}</span>
              <span className="text-[10px] text-zinc-400 ml-auto">ID: {task.id}</span>
            </div>
          </div>

          {/* Judul Tugas */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-title" className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Implementasi modul autentikasi JWT"
              required
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-[#0a0d14] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-blue-500 transition shadow-2xs text-xs"
            />
          </div>

          {/* Assignee / Penanggung Jawab */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-assignee" className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Penanggung Jawab (Assignee)
            </label>
            <div className="relative">
              <select
                id="edit-task-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-md bg-zinc-50 dark:bg-[#0a0d14] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500 transition cursor-pointer shadow-2xs text-xs font-mono"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.github_username}>
                    @{m.github_username} ({m.name})
                  </option>
                ))}
              </select>
              <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Tugas */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Status Tugas
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['To Do', 'In Progress', 'Done'] as const).map((s) => {
                const isSelected = status === s;
                const activeColor =
                  s === 'Done'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : s === 'In Progress'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 px-2.5 rounded-md border text-center font-medium text-[11px] transition cursor-pointer shadow-2xs ${
                      isSelected
                        ? `${activeColor} font-bold ring-1 ring-offset-0 ring-current`
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0a0d14] text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
              💡 Perubahan status otomatis disinkronkan ke papan Trello jika API aktif.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-medium transition cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

