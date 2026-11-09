import { useMemo, useLayoutEffect, useRef } from 'react';
import { BarChart3, PieChart, Trophy } from 'lucide-react';
import { gsap } from 'gsap';

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

interface ContributionChartProps {
  members: Member[];
  tasks: Task[];
}

export function ContributionChart({ members, tasks }: ContributionChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const centerPercentRef = useRef<HTMLSpanElement | null>(null);

  // Aggregate Commit Statistics
  const totalCommits = useMemo(() => {
    return members.reduce((sum, m) => sum + m.total_commits, 0);
  }, [members]);

  const maxCommits = useMemo(() => {
    const max = Math.max(...members.map((m) => m.total_commits), 0);
    return max > 0 ? max : 1;
  }, [members]);

  // Sort members by total commits descending
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => b.total_commits - a.total_commits);
  }, [members]);

  // Aggregate Task Distribution Statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const todo = tasks.filter((t) => t.status === 'To Do').length;

    const donePercent = total > 0 ? Math.round((done / total) * 100) : 0;
    const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const todoPercent = total > 0 ? Math.max(0, 100 - donePercent - inProgressPercent) : 0;

    return {
      total,
      done,
      inProgress,
      todo,
      donePercent,
      inProgressPercent,
      todoPercent,
    };
  }, [tasks]);

  // Donut SVG circumference calculation (r = 54, circumference = 2 * PI * 54 = 339.292)
  const R = 54;
  const C = 2 * Math.PI * R;
  const doneOffset = 0;
  const doneStroke = (taskStats.donePercent / 100) * C;

  const inProgressOffset = -doneStroke;
  const inProgressStroke = (taskStats.inProgressPercent / 100) * C;

  const todoOffset = -(doneStroke + inProgressStroke);
  const todoStroke = (taskStats.todoPercent / 100) * C;

  // GSAP Animation Effect
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Entrance animation for the two cards
      gsap.fromTo(
        '.chart-card',
        { opacity: 0, y: 16, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.12, ease: 'power3.out' }
      );

      // 2. Animate developer progress bars smoothly
      const progressBars = containerRef.current?.querySelectorAll<HTMLElement>('.commit-bar-fill');
      if (progressBars && progressBars.length > 0) {
        progressBars.forEach((bar) => {
          const targetWidth = bar.getAttribute('data-target-width') || '0%';
          gsap.fromTo(
            bar,
            { width: '0%' },
            { width: targetWidth, duration: 0.9, ease: 'power2.out', delay: 0.15 }
          );
        });
      }

      // 3. Animate SVG Donut ring sweep effect
      const donutCircles = containerRef.current?.querySelectorAll<SVGCircleElement>('.donut-slice');
      if (donutCircles && donutCircles.length > 0) {
        donutCircles.forEach((circle) => {
          const targetOffset = parseFloat(circle.getAttribute('data-target-offset') || '0');
          gsap.fromTo(
            circle,
            { strokeDashoffset: C },
            { strokeDashoffset: targetOffset, duration: 1.1, ease: 'power3.out', delay: 0.1 }
          );
        });
      }

      // 4. Animate Center Percentage Counter
      if (centerPercentRef.current) {
        const targetPercent = taskStats.donePercent;
        const countObj = { val: 0 };
        gsap.to(countObj, {
          val: targetPercent,
          duration: 0.95,
          ease: 'power2.out',
          onUpdate: () => {
            if (centerPercentRef.current) {
              centerPercentRef.current.innerText = `${Math.round(countObj.val)}%`;
            }
          },
        });
      }

      // 5. Staggered Legend cards slide in
      gsap.fromTo(
        '.legend-card',
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out', delay: 0.25 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [members, tasks, taskStats.donePercent, C]);

  return (
    <section
      ref={containerRef}
      className="space-y-3 break-inside-avoid"
      aria-label="Grafik Analitik Kontribusi dan Distribusi Tugas"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">
              Visualisasi Analitik Sprint
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Perbandingan commit antar kontributor &amp; distribusi status penyelesaian tugas
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/80">
          <span>Total:</span>
          <strong className="text-zinc-900 dark:text-white font-bold">{totalCommits} Commits</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: DIAGRAM BATANG PERBANDINGAN COMMIT PER ANGGOTA */}
        <div className="chart-card p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold text-zinc-950 dark:text-white">
                Rasio Kontribusi Commit per Developer
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {members.length} Developer
            </span>
          </div>

          <div className="py-4 space-y-3.5">
            {sortedMembers.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">Belum ada data anggota.</div>
            ) : (
              sortedMembers.map((member, idx) => {
                const commitRatio = totalCommits > 0 ? ((member.total_commits / totalCommits) * 100).toFixed(0) : '0';
                const barWidth = Math.max(Math.round((member.total_commits / maxCommits) * 100), member.total_commits > 0 ? 6 : 2);
                const isLead = idx === 0 && member.total_commits > 0;

                return (
                  <div key={member.id} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[11px] font-bold w-4 text-center ${isLead ? 'text-amber-500 font-extrabold' : 'text-zinc-400'}`}>
                          #{idx + 1}
                        </span>
                        <img
                          src={`https://github.com/${member.github_username}.png?size=80`}
                          alt={member.name}
                          className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover shrink-0"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate">
                          @{member.github_username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-zinc-950 dark:text-white">
                          {member.total_commits} <span className="text-[10px] font-normal text-zinc-500">commit</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/80">
                          {commitRatio}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/80 dark:border-zinc-800">
                      <div
                        className={`commit-bar-fill h-full rounded-full transition-colors ${
                          isLead
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 shadow-2xs'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80'
                        }`}
                        style={{ width: `${barWidth}%` }}
                        data-target-width={`${barWidth}%`}
                        title={`${member.name}: ${member.total_commits} commits (${commitRatio}%)`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Standar Git Sprint Leaderboard</span>
            <span>Update Otomatis via Webhook</span>
          </div>
        </div>

        {/* CHART 2: DIAGRAM DONAT STATUS PENYELESAIAN TUGAS SPRINT */}
        <div className="chart-card p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-semibold text-zinc-950 dark:text-white">
                Distribusi Status Tugas Kanban Sprint
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {taskStats.total} Total Tugas
            </span>
          </div>

          <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Native Precision SVG Donut with GSAP sweep effect */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  className="stroke-zinc-100 dark:stroke-zinc-800/80"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Slices with animated strokeDashoffset */}
                {taskStats.total > 0 && (
                  <>
                    {/* Done Slice (Emerald) */}
                    {taskStats.done > 0 && (
                      <circle
                        cx="64"
                        cy="64"
                        r={R}
                        className="donut-slice stroke-emerald-500"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${doneStroke} ${C - doneStroke}`}
                        strokeDashoffset={doneOffset}
                        data-target-offset={doneOffset}
                        strokeLinecap="round"
                      />
                    )}

                    {/* In Progress Slice (Amber) */}
                    {taskStats.inProgress > 0 && (
                      <circle
                        cx="64"
                        cy="64"
                        r={R}
                        className="donut-slice stroke-amber-500"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${inProgressStroke} ${C - inProgressStroke}`}
                        strokeDashoffset={inProgressOffset}
                        data-target-offset={inProgressOffset}
                        strokeLinecap="round"
                      />
                    )}

                    {/* To Do Slice (Slate/Blue) */}
                    {taskStats.todo > 0 && (
                      <circle
                        cx="64"
                        cy="64"
                        r={R}
                        className="donut-slice stroke-slate-400 dark:stroke-slate-600"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${todoStroke} ${C - todoStroke}`}
                        strokeDashoffset={todoOffset}
                        data-target-offset={todoOffset}
                        strokeLinecap="round"
                      />
                    )}
                  </>
                )}
              </svg>

              {/* Center Metrics Inside Donut with Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span
                  ref={centerPercentRef}
                  className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono leading-none"
                >
                  {taskStats.donePercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Selesai
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">
                  {taskStats.done}/{taskStats.total} task
                </span>
              </div>
            </div>

            {/* Interactive Legend Cards */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {/* Done Card */}
              <div className="legend-card p-2.5 rounded-md bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">Done</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{taskStats.done} tugas</span>
                  <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">({taskStats.donePercent}%)</span>
                </div>
              </div>

              {/* In Progress Card */}
              <div className="legend-card p-2.5 rounded-md bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-amber-900 dark:text-amber-300">In Progress</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-amber-700 dark:text-amber-400">{taskStats.inProgress} tugas</span>
                  <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">({taskStats.inProgressPercent}%)</span>
                </div>
              </div>

              {/* To Do Card */}
              <div className="legend-card p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300">To Do</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{taskStats.todo} tugas</span>
                  <span className="text-[11px] text-zinc-500">({taskStats.todoPercent}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Sinkronisasi Otomatis Trello Kanban</span>
            <span>Rasio Sprint: {taskStats.donePercent}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
