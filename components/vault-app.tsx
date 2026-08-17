"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowUpRight, BookOpen, Bookmark, Calendar, Check, ChevronDown, CircleHelp, Clock3, Code2, Copy, Download,
  ExternalLink, FileText, Filter, Flame, FolderKanban, FolderPlus, Globe, Grid2X2, HardDrive, LayoutList, Link2, ListFilter, Loader2, Menu,
  Moon, PanelLeftClose, PanelLeftOpen, Pause, PauseCircle, Pencil, Play, PlayCircle, Plus, RefreshCw, Save, Search, Settings,
  SlidersHorizontal, Sparkles, StickyNote, Sun, Target, Trash2, Trophy, Upload, User, X
} from "lucide-react";
import { useVaultStore } from "@/store/use-vault-store";
import { dateKey } from "@/lib/revision";
import type { Difficulty, PlatformStats, Problem, ProblemGroup, ProblemProgress, ReviewFrequency, UpcomingContest, UserProfiles, UserSettings } from "@/lib/types";
import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapSeparator,
  type HeatmapColumn,
} from "@/components/charts/heatmap";

type View = "dashboard" | "problems" | "groups" | "cp" | "settings";

const navItems: { id: View; label: string; icon: typeof Grid2X2 }[] = [
  { id: "dashboard", label: "Dashboard", icon: Grid2X2 },
  { id: "problems", label: "Problem Tracker", icon: LayoutList },
  { id: "groups", label: "Problem Groups", icon: FolderKanban },
  { id: "cp", label: "CP Hub", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings }
];

export function VaultApp() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [viewingProblem, setViewingProblem] = useState<Problem | null>(null);
  const [deletingProblem, setDeletingProblem] = useState<Problem | null>(null);
  const [query, setQuery] = useState("");
  const { load, hydrated, problems, settings, updateSettings } = useVaultStore();

  useEffect(() => { void load(); }, [load]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDark = settings.themeMode === "dark" || (settings.themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.themeMode]);

  const toggleTheme = () => {
    const nextTheme = settings.themeMode === "dark" ? "light" : "dark";
    void updateSettings({ themeMode: nextTheme });
  };

  if (!hydrated) {
    return <div className="grid min-h-screen place-items-center bg-paper dark:bg-[#09090b] text-muted"><Loader2 className="animate-spin text-ink dark:text-white" size={24} /></div>;
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-[#09090b] text-ink dark:text-[#f4f4f5] transition-colors duration-200">
      <Sidebar
        view={view}
        setView={setView}
        mobileNav={mobileNav}
        collapsed={sidebarCollapsed}
        onClose={() => setMobileNav(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[260px]"}`}>
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-line dark:border-[#27272a] bg-paper/95 dark:bg-[#09090b]/95 px-4 md:px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 text-muted hover:text-ink dark:hover:text-white" onClick={() => setMobileNav(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <button
              className="hidden lg:flex p-1.5 text-muted hover:text-ink dark:hover:text-white rounded hover:bg-stone dark:hover:bg-[#18181b] transition"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <h1 className="font-display text-[24px] md:text-[28px] leading-none text-ink dark:text-white">
              {view === "dashboard" ? "Dashboard" : view === "problems" ? "Problem Tracker" : view === "groups" ? "Problem Groups" : view === "cp" ? "CP Hub & Contests" : "Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <label className="flex h-9 w-44 md:w-64 items-center gap-2 border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] px-3 text-muted">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search problems..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted text-ink dark:text-white"
              />
            </label>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-ink dark:hover:text-white border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] transition"
              title={settings.themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {settings.themeMode === "dark" ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} />}
            </button>

            <button
              className="hidden md:flex p-2 text-muted hover:text-ink dark:hover:text-white border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] transition"
              aria-label="Sync"
              onClick={() => void load()}
              title="Sync Database"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">
          {view === "dashboard" && <Dashboard onNavigate={setView} onAddProblem={() => setShowProblemForm(true)} onViewNotes={(p) => setViewingProblem(p)} query={query} />}
          {view === "problems" && (
            <ProblemTracker
              query={query}
              onAddProblem={() => setShowProblemForm(true)}
              onEditProblem={(p) => setEditingProblem(p)}
              onDeleteProblem={(p) => setDeletingProblem(p)}
              onViewProblem={(p) => setViewingProblem(p)}
            />
          )}
          {view === "groups" && <ProblemGroupsManager onViewProblem={(p) => setViewingProblem(p)} />}
          {view === "cp" && <CPHub />}
          {view === "settings" && <SettingsPage />}
        </main>
      </div>

      {showProblemForm && <ProblemForm onClose={() => setShowProblemForm(false)} defaultLanguage={settings.defaultLanguage} defaultReviewFrequency={settings.defaultReviewFrequency} />}
      {editingProblem && (
        <ProblemForm
          initialProblem={editingProblem}
          onClose={() => setEditingProblem(null)}
          defaultLanguage={settings.defaultLanguage}
          defaultReviewFrequency={settings.defaultReviewFrequency}
        />
      )}
      {viewingProblem && (
        <ProblemDetailsModal
          problem={viewingProblem}
          onClose={() => setViewingProblem(null)}
          onEdit={() => {
            const p = viewingProblem;
            setViewingProblem(null);
            setEditingProblem(p);
          }}
          onDelete={() => {
            const p = viewingProblem;
            setViewingProblem(null);
            setDeletingProblem(p);
          }}
        />
      )}
      {deletingProblem && (
        <DeleteConfirmationModal
          problem={deletingProblem}
          onClose={() => setDeletingProblem(null)}
        />
      )}
    </div>
  );
}

function Sidebar({
  view,
  setView,
  mobileNav,
  collapsed,
  onClose,
  onToggleCollapse
}: {
  view: View;
  setView: (view: View) => void;
  mobileNav: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  return <>
    {mobileNav && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-label="Close navigation" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line dark:border-[#27272a] bg-[#f3f3f3] dark:bg-[#121214] transition-all duration-300 ${mobileNav ? "translate-x-0 w-[260px]" : collapsed ? "-translate-x-full lg:translate-x-0 lg:w-[70px]" : "-translate-x-full lg:translate-x-0 lg:w-[260px]"}`}>
      
      {/* Sidebar Header */}
      <div className={`flex items-center border-b border-line dark:border-[#27272a] py-5 ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
        {!collapsed ? (
          <div>
            <div className="font-display text-[26px] leading-none text-ink dark:text-white">DSA Vault</div>
            <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Sync: Online</div>
          </div>
        ) : (
          <div className="font-display text-xl text-ink dark:text-white font-bold" title="DSA Vault">DV</div>
        )}

        <button className="lg:hidden text-muted hover:text-ink dark:hover:text-white" onClick={onClose} aria-label="Close navigation">
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1">
        {!collapsed && <div className="px-6 pb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">Workspace</div>}
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setView(id); onClose(); }}
            title={collapsed ? label : undefined}
            className={`flex w-full items-center gap-3.5 border-l-2 py-3 text-left transition ${collapsed ? "justify-center px-0 text-center" : "px-6"} ${view === id ? "border-accent bg-[#e2e2e2] dark:bg-[#18181b] text-ink dark:text-white font-medium" : "border-transparent text-muted hover:bg-[#e8e8e8] dark:hover:bg-[#18181b] hover:text-ink dark:hover:text-white"}`}
          >
            <Icon size={18} strokeWidth={1.7} className="shrink-0" />
            {!collapsed && <span className="text-[14px]">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-line dark:border-[#27272a] py-4 text-xs text-muted ${collapsed ? "px-2 text-center" : "px-6"}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green" />Local storage active</div>
            <div className="mt-1 font-mono text-[9px]">LocalStorage · Client Side ($0 DB)</div>
          </>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-green inline-block" title="LocalStorage Active" />
        )}
      </div>
    </aside>
  </>;
}

export function detectPlatform(url: string, explicitPlatform?: string): "LeetCode" | "CodeChef" | "CodeForces" | "AtCoder" | "GeeksforGeeks" | "HackerRank" | "Other" {
  if (explicitPlatform && explicitPlatform.trim()) {
    const lower = explicitPlatform.toLowerCase();
    if (lower.includes("leetcode")) return "LeetCode";
    if (lower.includes("codechef")) return "CodeChef";
    if (lower.includes("codeforce")) return "CodeForces";
    if (lower.includes("atcoder")) return "AtCoder";
    if (lower.includes("geeks") || lower.includes("gfg")) return "GeeksforGeeks";
    if (lower.includes("hackerrank")) return "HackerRank";
  }

  const u = (url || "").toLowerCase();
  if (u.includes("leetcode.com") || u.includes("leetcode.cn")) return "LeetCode";
  if (u.includes("codechef.com")) return "CodeChef";
  if (u.includes("codeforces.com") || u.includes("codeforces.ru")) return "CodeForces";
  if (u.includes("atcoder.jp")) return "AtCoder";
  if (u.includes("geeksforgeeks.org")) return "GeeksforGeeks";
  if (u.includes("hackerrank.com")) return "HackerRank";

  return "Other";
}

function PlatformIcon({ platform, url }: { platform?: string; url: string }) {
  const p = detectPlatform(url, platform);
  
  if (p === "LeetCode") {
    return (
      <span className="inline-flex items-center justify-center p-1 rounded bg-[#ffa116]/10 text-[#ffa116]" title="LeetCode">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863 0-.713.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.178 1.823.645l2.697 2.607c.307.307.807.307 1.114 0s.307-.807 0-1.114l-2.697-2.607c-.777-.777-1.849-1.114-2.937-1.114s-2.16.337-2.937 1.114l-4.319 4.38c-.777.777-1.171 1.85-1.171 2.938 0 1.088.394 2.16 1.171 2.938l4.332 4.363c.777.777 1.849 1.17 2.937 1.17s2.16-.393 2.937-1.17l2.697-2.607c.307-.307.307-.807 0-1.114s-.807-.307-1.114 0z" />
          <path d="M10.744 14.887l7.65-7.65c.307-.307.307-.807 0-1.114s-.807-.307-1.114 0l-7.65 7.65c-.307.307-.307.807 0 1.114.154.153.355.23.557.23s.403-.077.557-.23z" />
        </svg>
      </span>
    );
  }

  if (p === "CodeChef") {
    return (
      <span className="inline-flex items-center justify-center p-1 rounded bg-[#5b4638]/10 text-[#5b4638] dark:text-[#e3c8b0]" title="CodeChef">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
        </svg>
      </span>
    );
  }

  if (p === "CodeForces") {
    return (
      <span className="inline-flex items-center justify-center p-1 rounded bg-blue-500/10" title="CodeForces">
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <rect x="3" y="11" width="4" height="9" rx="1" fill="#FFCC00" />
          <rect x="9" y="5" width="4" height="15" rx="1" fill="#0066FF" />
          <rect x="15" y="8" width="4" height="12" rx="1" fill="#FF0000" />
        </svg>
      </span>
    );
  }

  if (p === "AtCoder") {
    return (
      <span className="inline-flex items-center justify-center p-1 rounded bg-neutral-500/10 text-ink dark:text-white" title="AtCoder">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5z" />
        </svg>
      </span>
    );
  }

  if (p === "GeeksforGeeks") {
    return (
      <span className="inline-flex items-center justify-center p-1 rounded bg-[#2f8d46]/10 text-[#2f8d46]" title="GeeksforGeeks">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14.5c-2.48 0-4.5-2.02-4.5-4.5S7.52 7.5 10 7.5c1.24 0 2.36.5 3.17 1.33l-1.42 1.42A2.48 2.48 0 0010 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c1.1 0 2.03-.71 2.37-1.7h-2.37v-2h4.5v4.5A4.48 4.48 0 0110 16.5zm8-2c-2.48 0-4.5-2.02-4.5-4.5S15.52 7.5 18 7.5c1.24 0 2.36.5 3.17 1.33l-1.42 1.42A2.48 2.48 0 0018 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c1.1 0 2.03-.71 2.37-1.7h-2.37v-2h4.5v4.5A4.48 4.48 0 0118 14.5z" />
        </svg>
      </span>
    );
  }

  if (p === "HackerRank") {
    return (
      <span className="inline-flex items-center justify-center p-1 rounded bg-[#2ec866]/10 text-[#2ec866]" title="HackerRank">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#2EC866" />
          <path fill="#FFFFFF" d="M7 6h2v5h6V6h2v12h-2v-5H9v5H7V6z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center p-1 rounded bg-stone dark:bg-[#27272a] text-muted" title="Other Platform">
      <Globe size={15} />
    </span>
  );
}

const heatmapLevelStylesLight = [
  { color: "#f4f4f6", fillMode: "solid", pattern: "none" },
  { color: "#e4e4e7", fillMode: "solid", pattern: "none" },
  { color: "#a1a1aa", fillMode: "solid", pattern: "none" },
  { color: "#52525b", fillMode: "solid", pattern: "none" },
  { color: "#27272a", fillMode: "solid", pattern: "none" },
] as const;

const heatmapLevelStylesDark = [
  { color: "#18181b", fillMode: "solid", pattern: "none" },
  { color: "#27272a", fillMode: "solid", pattern: "none" },
  { color: "#52525b", fillMode: "solid", pattern: "none" },
  { color: "#a1a1aa", fillMode: "solid", pattern: "none" },
  { color: "#f4f4f5", fillMode: "solid", pattern: "none" },
] as const;

function Dashboard({ onNavigate, onAddProblem, onViewNotes, query }: { onNavigate: (view: View) => void; onAddProblem: () => void; onViewNotes: (p: Problem) => void; query: string }) {
  const { problems, todos, settings, toggleProblem } = useVaultStore();
  const masteredCount = problems.filter((p) => p.progress === "Mastered").length;
  const filteredTodos = todos.filter((todo) => `${todo.title} ${todo.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  const isDark = settings.themeMode === "dark";
  const heatmapStyles = isDark ? heatmapLevelStylesDark : heatmapLevelStylesLight;

  // Generate heatmap contribution data for the past 52 weeks (1 full year)
  const { contributionData, currentStreak, activeDaysCount, totalTaskCompletions } = useMemo(() => {
    const todayObj = new Date();
    todayObj.setHours(12, 0, 0, 0);

    const countsByDate: Record<string, number> = {};

    problems.forEach((p) => {
      if (p.date_solved) {
        countsByDate[p.date_solved] = (countsByDate[p.date_solved] || 0) + 1;
      }
    });

    let activeDays = 0;
    let totalTasks = 0;
    Object.values(countsByDate).forEach((val) => {
      if (val > 0) activeDays++;
      totalTasks += val;
    });

    let streak = 0;
    let checkDate = new Date(todayObj);
    const todayStr = dateKey(todayObj);
    while (true) {
      const key = dateKey(checkDate);
      const val = countsByDate[key] || 0;
      if (val > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (key === todayStr && streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayKey = dateKey(checkDate);
          if ((countsByDate[yesterdayKey] || 0) > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    const weeksCount = 52;
    const currentSunday = new Date(todayObj);
    currentSunday.setDate(currentSunday.getDate() - currentSunday.getDay());

    const startSunday = new Date(currentSunday);
    startSunday.setDate(startSunday.getDate() - (weeksCount - 1) * 7);

    const cols: HeatmapColumn[] = [];

    for (let week = 0; week < weeksCount; week++) {
      const bins = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(startSunday);
        d.setDate(d.getDate() + week * 7 + day);
        const key = dateKey(d);
        bins.push({
          bin: day,
          count: countsByDate[key] || 0,
          date: d
        });
      }
      cols.push({
        bin: week,
        bins
      });
    }

    return {
      contributionData: cols,
      currentStreak: streak,
      activeDaysCount: activeDays,
      totalTaskCompletions: totalTasks
    };
  }, [problems]);

  return <div className="mx-auto max-w-[1440px] space-y-8">
    <section className="flex flex-col justify-between gap-5 border-b border-line dark:border-[#27272a] pb-6 md:flex-row md:items-end">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Today, {new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date())}</p>
        <p className="max-w-xl text-sm leading-relaxed text-muted">Keep your recall sharp. Your revision queue is organized for your next focused session.</p>
      </div>
      <button onClick={onAddProblem} className="flex h-10 items-center justify-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-4 text-xs font-medium transition hover:bg-accent dark:hover:bg-neutral-200 shrink-0"><Plus size={16} />Log a problem</button>
    </section>

    <div className="grid grid-cols-2 border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] md:grid-cols-4">
      <Stat label="Problems logged" value={String(problems.length)} detail="Your working set" icon={Code2} />
      <Stat label="Due today" value={String(todos.length)} detail={todos.length ? "Ready for review" : "Queue is clear"} icon={Target} accent />
      <Stat label="Current streak" value={`${currentStreak} days`} detail={`Active days: ${activeDaysCount}`} icon={Flame} />
      <Stat label="Mastered" value={String(masteredCount)} detail={`${problems.length ? Math.round((masteredCount / problems.length) * 100) : 0}% of vault`} icon={Trophy} />
    </div>

    {/* Activity Heatmap Chart Section */}
    <section className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-5 md:p-6">
      <div className="flex flex-col justify-between gap-3 border-b border-line dark:border-[#27272a] pb-4 md:flex-row md:items-center">
        <div>
          <h3 className="flex items-center gap-2 font-display text-xl md:text-2xl text-ink dark:text-white">
            <Flame size={20} className="text-accent" />
            Activity Streak & Consistency
          </h3>
          <p className="mt-1 text-xs text-muted">The more problems solved and reviewed per day, the darker the cell.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>Active Days: <strong className="text-ink dark:text-white font-semibold">{activeDaysCount}</strong></span>
          <span>Total Tasks Done: <strong className="text-ink dark:text-white font-semibold">{totalTaskCompletions}</strong></span>
          <span>Current Streak: <strong className="text-green font-semibold">{currentStreak} days 🔥</strong></span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2 scrollbar-thin">
        <HeatmapInteractionProvider>
          <HeatmapInteractionBoundary>
            <div className="flex min-w-[850px] w-full flex-col items-stretch gap-3">
              <HeatmapChart
                data={contributionData}
                gap={2}
                levelStyles={heatmapStyles}
                animationDuration={800}
                enterTransition={{ duration: 0.8 }}
                enterStaggerScale={1.00}
              >
                <HeatmapCells cornerRadius={2} />
                <HeatmapXAxis />
                <HeatmapTooltip />
                <HeatmapSeparator groupBy="quarter" showLabels labelClassName="text-neutral-500 dark:text-neutral-400 font-medium" stroke="var(--border)" spacing={12} startOffset={14} />
              </HeatmapChart>
              <div className="flex items-center justify-end border-t border-line/60 dark:border-[#27272a] pt-3">
                <HeatmapLegend align="end" cellSize={11} cornerRadius={2} gap={2} levelStyles={heatmapStyles} />
              </div>
            </div>
          </HeatmapInteractionBoundary>
        </HeatmapInteractionProvider>
      </div>
    </section>

    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214]">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] bg-[#f3f3f3] dark:bg-[#18181b] px-5 py-4">
          <div><h3 className="font-display text-xl text-ink dark:text-white">Today&apos;s Todos</h3><p className="mt-0.5 text-xs text-muted">Spaced repetition revision queue.</p></div>
          <button onClick={() => onNavigate("problems")} className="flex items-center gap-1 text-xs text-muted hover:text-ink dark:hover:text-white">View tracker <ArrowUpRight size={14} /></button>
        </div>
        <div className="divide-y divide-line dark:divide-[#27272a]">
          {filteredTodos.length ? filteredTodos.map((todo) => (
            <TodoRow
              key={`${todo.kind}-${todo.id}`}
              todo={todo}
              onToggle={() => toggleProblem(todo.id)}
              onViewDetails={() => {
                const target = problems.find((p) => p.id === todo.id);
                if (target) onViewNotes(target);
              }}
            />
          )) : <EmptyState icon={Check} title="Nothing due today" detail="Your review queue is clear. Log a problem to start tracking." action={onAddProblem} actionLabel="Log first problem" />}
        </div>
      </section>

      <section className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214]">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] px-5 py-4">
          <div><h3 className="font-display text-xl text-ink dark:text-white">Review rhythm</h3><p className="mt-0.5 text-xs text-muted">How your vault is distributed.</p></div>
          <Sparkles size={18} className="text-muted" />
        </div>
        <div className="space-y-5 p-5">
          <ProgressBar label="Mastered" value={problems.filter((p) => p.progress === "Mastered").length} total={problems.length} color="bg-green" />
          <ProgressBar label="In review" value={problems.filter((p) => p.progress === "Review").length} total={problems.length} color="bg-accent" />
          <ProgressBar label="Attempted" value={problems.filter((p) => p.progress === "Attempted").length} total={problems.length} color="bg-[#ba1a1a]" />
          <ProgressBar label="Not started" value={problems.filter((p) => p.progress === "Not started").length} total={problems.length} color="bg-muted" />
          
          <div className="mt-8 border-t border-line dark:border-[#27272a] pt-5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Active topics</span>
              <button className="hover:text-ink dark:hover:text-white" onClick={() => onNavigate("problems")}>Explore <ArrowUpRight className="inline" size={13} /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from(new Set(problems.flatMap((p) => p.topic.split(", ")))).filter(Boolean).slice(0, 8).map((topic) => (
                <span key={topic} className="border border-line dark:border-[#27272a] bg-[#f3f3f3] dark:bg-[#18181b] px-2 py-1 font-mono text-[10px] text-muted">{topic}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>;
}

function Stat({ label, value, detail, icon: Icon, accent }: { label: string; value: string; detail: string; icon: typeof Code2; accent?: boolean }) {
  return <div className="border-r border-line dark:border-[#27272a] px-4 py-5 last:border-r-0 md:px-6"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span><Icon size={16} className="text-muted" /></div><div className={`mt-3 font-display text-3xl ${accent ? "text-accent" : "text-ink dark:text-white"}`}>{value}</div><div className="mt-1 text-xs text-muted">{detail}</div></div>;
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total ? Math.round(value / total * 100) : 0;
  return <div><div className="mb-2 flex justify-between text-xs text-ink dark:text-white"><span>{label}</span><span className="font-mono text-muted">{percent}%</span></div><div className="h-2 bg-[#e8e8e8] dark:bg-[#27272a]"><div className={`h-2 ${color}`} style={{ width: `${percent}%` }} /></div></div>;
}

function TodoRow({ todo, onToggle, onViewDetails }: { todo: { kind: "problem"; title: string; subtitle: string; meta: string; href?: string }; onToggle: () => void; onViewDetails?: () => void }) {
  return (
    <div className="group flex items-center gap-3 px-5 py-4 hover:bg-[#fcfcfc] dark:hover:bg-[#18181b]">
      <button onClick={onToggle} className="grid h-5 w-5 shrink-0 place-items-center border border-line dark:border-[#3f3f46] text-transparent transition hover:border-accent hover:text-accent" aria-label={`Complete ${todo.title}`}><Check size={13} /></button>
      <div className="min-w-0 flex-1 cursor-pointer" onClick={onViewDetails}>
        <div className="truncate text-sm font-medium text-ink dark:text-white group-hover:text-accent">{todo.title}</div>
        <div className="mt-1 truncate text-xs text-muted">{todo.subtitle}</div>
      </div>
      <span className="hidden border border-line dark:border-[#27272a] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted sm:block">{todo.meta}</span>
      {onViewDetails && (
        <button onClick={onViewDetails} className="flex items-center gap-1 text-xs text-muted opacity-0 transition group-hover:opacity-100 hover:text-ink dark:hover:text-white" title="View details and notes">
          <StickyNote size={15} /> Notes
        </button>
      )}
      {todo.href && <a className="text-muted opacity-0 transition group-hover:opacity-100 hover:text-ink dark:hover:text-white" href={todo.href} target="_blank" rel="noreferrer" aria-label={`Open ${todo.title}`}><ArrowUpRight size={16} /></a>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, detail, action, actionLabel }: { icon: typeof Check; title: string; detail: string; action?: () => void; actionLabel?: string }) {
  return <div className="flex flex-col items-center px-6 py-14 text-center"><Icon size={28} className="mb-4 text-green" /><div className="font-display text-xl text-ink dark:text-white">{title}</div><p className="mt-2 max-w-sm text-xs leading-5 text-muted">{detail}</p>{action && actionLabel && <button onClick={action} className="mt-5 border border-line dark:border-[#27272a] px-3 py-2 text-xs hover:border-accent text-ink dark:text-white">{actionLabel}</button>}</div>;
}

function CPHub() {
  const { settings, updateSettings } = useVaultStore();
  const [showManageModal, setShowManageModal] = useState(false);
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [contests, setContests] = useState<UpcomingContest[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingContests, setLoadingContests] = useState(false);
  const [contestFilter, setContestFilter] = useState<string>("All");

  const profiles = settings.profiles || {
    leetcode: "sample_user",
    codeforces: "tourist",
    codechef: "gennady",
    atcoder: "chokudai"
  };

  // Fetch profiles stats
  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const params = new URLSearchParams();
        if (profiles.leetcode) params.set("leetcode", profiles.leetcode);
        if (profiles.codeforces) params.set("codeforces", profiles.codeforces);
        if (profiles.codechef) params.set("codechef", profiles.codechef);
        if (profiles.atcoder) params.set("atcoder", profiles.atcoder);

        const res = await fetch(`/api/profiles?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || []);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    void fetchStats();
  }, [settings.profiles]);

  // Fetch upcoming contests
  useEffect(() => {
    async function fetchContests() {
      setLoadingContests(true);
      try {
        const res = await fetch("/api/contests");
        if (res.ok) {
          const data = await res.json();
          setContests(data.contests || []);
        }
      } catch (err) {
        console.error("Failed to fetch contests:", err);
      } finally {
        setLoadingContests(false);
      }
    }
    void fetchContests();
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter((c) => contestFilter === "All" || c.platform === contestFilter);
  }, [contests, contestFilter]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-line dark:border-[#27272a] pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Competitive Programming Hub</p>
          <p className="mt-1 text-sm text-muted">Track your live ratings across LeetCode, Codeforces, CodeChef & AtCoder, and stay ahead with upcoming contest schedules.</p>
        </div>
        <button
          onClick={() => setShowManageModal(true)}
          className="flex h-10 items-center justify-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-4 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200 shrink-0"
        >
          <User size={15} /> Edit User Handles
        </button>
      </div>

      {/* Profiles Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink dark:text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Your Competitive Profiles
          </h2>
          {loadingStats && <span className="flex items-center gap-1.5 text-xs text-muted"><Loader2 className="animate-spin" size={13} /> Updating live stats...</span>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileStatCard
            platform="LeetCode"
            handle={profiles.leetcode}
            data={stats.find((s) => s.platform === "LeetCode")}
            onEdit={() => setShowManageModal(true)}
          />
          <ProfileStatCard
            platform="CodeForces"
            handle={profiles.codeforces}
            data={stats.find((s) => s.platform === "CodeForces")}
            onEdit={() => setShowManageModal(true)}
          />
          <ProfileStatCard
            platform="CodeChef"
            handle={profiles.codechef}
            data={stats.find((s) => s.platform === "CodeChef")}
            onEdit={() => setShowManageModal(true)}
          />
          <ProfileStatCard
            platform="AtCoder"
            handle={profiles.atcoder}
            data={stats.find((s) => s.platform === "AtCoder")}
            onEdit={() => setShowManageModal(true)}
          />
        </div>
      </section>

      {/* Upcoming Contests Feed */}
      <section className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-6 space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-line dark:border-[#27272a] pb-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl text-ink dark:text-white flex items-center gap-2">
              <Clock3 size={20} className="text-accent" />
              Upcoming Contests Schedule
            </h2>
            <p className="mt-0.5 text-xs text-muted">Never miss a contest round. Direct registration links & live schedule feed.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["All", "LeetCode", "CodeForces", "CodeChef", "AtCoder"].map((plat) => (
              <button
                key={plat}
                onClick={() => setContestFilter(plat)}
                className={`px-3 py-1.5 font-mono text-xs transition ${contestFilter === plat ? "bg-ink dark:bg-white text-white dark:text-ink font-medium" : "border border-line dark:border-[#27272a] text-muted hover:border-accent hover:text-ink dark:hover:text-white"}`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {loadingContests ? (
          <div className="p-12 text-center text-muted"><Loader2 className="animate-spin mx-auto mb-2" size={20} /> Loading upcoming contests...</div>
        ) : filteredContests.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No upcoming contests found for {contestFilter}.</div>
        ) : (
          <div className="divide-y divide-line dark:divide-[#27272a] border border-line dark:border-[#27272a]">
            {filteredContests.map((contest) => (
              <ContestRow key={contest.id} contest={contest} />
            ))}
          </div>
        )}
      </section>

      {/* Modal: Edit Handles */}
      {showManageModal && (
        <ManageProfilesModal
          initialProfiles={profiles}
          onClose={() => setShowManageModal(false)}
          onSave={async (newProfiles) => {
            await updateSettings({ profiles: newProfiles });
            setShowManageModal(false);
          }}
        />
      )}
    </div>
  );
}

function LeetCodeRingChart({
  easy = 0,
  medium = 0,
  hard = 0,
  total = 0
}: {
  easy?: number;
  medium?: number;
  hard?: number;
  total?: number;
}) {
  const maxEasy = Math.max(easy, 800);
  const maxMed = Math.max(medium, 1400);
  const maxHard = Math.max(hard, 600);
  const totalSolved = total || (easy + medium + hard);

  const rEasy = 72;
  const rMed = 57;
  const rHard = 42;
  const strokeWidth = 8;
  const center = 90;

  const getArcValues = (radius: number, val: number, maxVal: number) => {
    const circ = 2 * Math.PI * radius;
    const arc270 = circ * 0.75;
    const gap = circ * 0.25;
    const pct = Math.min(1, Math.max(0, val / maxVal));
    const filled = arc270 * (val > 0 ? Math.max(pct, 0.04) : 0);
    return {
      trackDash: `${arc270} ${gap}`,
      progressDash: `${filled} ${circ - filled}`
    };
  };

  const easyArc = getArcValues(rEasy, easy, maxEasy);
  const medArc = getArcValues(rMed, medium, maxMed);
  const hardArc = getArcValues(rHard, hard, maxHard);

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <svg viewBox="0 0 180 180" className="w-44 h-44 transform rotate-[135deg]">
        <circle
          cx={center}
          cy={center}
          r={rEasy}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={easyArc.trackDash}
          strokeLinecap="round"
          className="text-neutral-200 dark:text-[#27272a]"
        />
        <circle
          cx={center}
          cy={center}
          r={rMed}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={medArc.trackDash}
          strokeLinecap="round"
          className="text-neutral-200 dark:text-[#27272a]"
        />
        <circle
          cx={center}
          cy={center}
          r={rHard}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={hardArc.trackDash}
          strokeLinecap="round"
          className="text-neutral-200 dark:text-[#27272a]"
        />

        <circle
          cx={center}
          cy={center}
          r={rEasy}
          fill="none"
          stroke="#2ec866"
          strokeWidth={strokeWidth}
          strokeDasharray={easyArc.progressDash}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <circle
          cx={center}
          cy={center}
          r={rMed}
          fill="none"
          stroke="#a855f7"
          strokeWidth={strokeWidth}
          strokeDasharray={medArc.progressDash}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <circle
          cx={center}
          cy={center}
          r={rHard}
          fill="none"
          stroke="#06b6d4"
          strokeWidth={strokeWidth}
          strokeDasharray={hardArc.progressDash}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white">
          {totalSolved.toLocaleString()}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted mt-0.5">
          Solved
        </span>
      </div>
    </div>
  );
}

function ProfileStatCard({
  platform,
  handle,
  data,
  onEdit
}: {
  platform: "LeetCode" | "CodeForces" | "CodeChef" | "AtCoder";
  handle?: string;
  data?: PlatformStats;
  onEdit: () => void;
}) {
  if (!handle) {
    return (
      <div className="flex flex-col justify-between border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg text-ink dark:text-white">
            <PlatformIcon platform={platform} url="" /> {platform}
          </div>
          <span className="text-[10px] font-mono uppercase text-muted">Not Set</span>
        </div>
        <div className="my-6 text-center text-xs text-muted">No handle configured.</div>
        <button onClick={onEdit} className="w-full border border-line dark:border-[#27272a] py-2 text-xs text-ink dark:text-white hover:border-accent">
          + Add Handle
        </button>
      </div>
    );
  }

  if (platform === "LeetCode") {
    return (
      <div className="flex flex-col justify-between border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={platform} url="" />
            <div>
              <div className="font-display text-lg leading-none text-ink dark:text-white">{platform}</div>
              <div className="mt-1 font-mono text-[11px] text-muted">@{handle}</div>
            </div>
          </div>
          {data?.rank && (
            <span className="border border-line dark:border-[#27272a] bg-stone dark:bg-[#18181b] px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
              {data.rank}
            </span>
          )}
        </div>

        <LeetCodeRingChart
          easy={data?.easySolved}
          medium={data?.mediumSolved}
          hard={data?.hardSolved}
          total={data?.solvedCount}
        />

        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-line dark:border-[#27272a] text-center text-xs">
          <div className="p-1.5 border border-line dark:border-[#27272a] bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[9px] uppercase text-[#2ec866]">Easy</div>
            <div className="mt-0.5 font-display text-base text-ink dark:text-white font-semibold">{data?.easySolved || 0}</div>
          </div>
          <div className="p-1.5 border border-line dark:border-[#27272a] bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[9px] uppercase text-[#a855f7]">Med</div>
            <div className="mt-0.5 font-display text-base text-ink dark:text-white font-semibold">{data?.mediumSolved || 0}</div>
          </div>
          <div className="p-1.5 border border-line dark:border-[#27272a] bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[9px] uppercase text-[#06b6d4]">Hard</div>
            <div className="mt-0.5 font-display text-base text-ink dark:text-white font-semibold">{data?.hardSolved || 0}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={platform} url="" />
          <div>
            <div className="font-display text-lg leading-none text-ink dark:text-white">{platform}</div>
            <div className="mt-1 font-mono text-[11px] text-muted">@{handle}</div>
          </div>
        </div>
        {data?.rank && (
          <span className="border border-line dark:border-[#27272a] bg-stone dark:bg-[#18181b] px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
            {data.rank}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {data?.rating !== undefined && (
          <div className="border border-line dark:border-[#27272a] p-2.5 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[9px] uppercase text-muted">Rating</div>
            <div className="mt-1 font-display text-2xl text-ink dark:text-white">{data.rating || "—"}</div>
          </div>
        )}
        {data?.maxRating !== undefined && (
          <div className="border border-line dark:border-[#27272a] p-2.5 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[9px] uppercase text-muted">Max Rating</div>
            <div className="mt-1 font-display text-2xl text-ink dark:text-white">{data.maxRating || "—"}</div>
          </div>
        )}
        {data?.solvedCount !== undefined && (
          <div className="col-span-2 border border-line dark:border-[#27272a] p-2.5 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[9px] uppercase text-muted">Total Solved</div>
            <div className="mt-1 font-display text-2xl text-ink dark:text-white">{data.solvedCount} problems</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContestRow({ contest }: { contest: UpcomingContest }) {
  const startDate = new Date(contest.start_time);
  const formattedDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(startDate);

  // Time remaining calculation
  const now = new Date();
  const diffMs = startDate.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffDays = Math.floor(diffHours / 24);
  const remainingStr = diffDays > 0 ? `In ${diffDays}d ${diffHours % 24}h` : diffHours > 0 ? `In ${diffHours}h` : "Starting soon";

  const durationHours = Math.round((contest.duration / 3600) * 10) / 10;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-[#fcfcfc] dark:hover:bg-[#18181b]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <PlatformIcon platform={contest.platform} url={contest.url} />
        </div>
        <div>
          <div className="font-medium text-sm text-ink dark:text-white flex items-center gap-2">
            {contest.name}
            <span className="border border-line dark:border-[#27272a] px-1.5 py-0.5 font-mono text-[9px] text-muted uppercase">{contest.platform}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
            <span>📅 {formattedDate}</span>
            <span>·</span>
            <span>⏱️ {durationHours} hours</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs text-green font-medium bg-green/10 px-2.5 py-1 rounded">{remainingStr}</span>
        <a
          href={contest.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 bg-ink dark:bg-white text-white dark:text-ink px-3 py-1.5 text-xs font-medium hover:bg-accent shrink-0"
        >
          Register <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}

function ManageProfilesModal({
  initialProfiles,
  onClose,
  onSave
}: {
  initialProfiles: UserProfiles;
  onClose: () => void;
  onSave: (profiles: UserProfiles) => Promise<void>;
}) {
  const [form, setForm] = useState<UserProfiles>(initialProfiles);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg border border-line dark:border-[#27272a] bg-paper dark:bg-[#121214] shadow-2xl">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] px-6 py-5 bg-[#f3f3f3] dark:bg-[#18181b]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Competitive Hub</div>
            <h2 className="mt-1 font-display text-2xl text-ink dark:text-white">Edit Profile Handles</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink dark:hover:text-white"><X size={19} /></button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="LeetCode Username">
            <input value={form.leetcode || ""} onChange={(e) => setForm({ ...form, leetcode: e.target.value })} placeholder="e.g. neetcode" />
          </Field>

          <Field label="CodeForces Handle">
            <input value={form.codeforces || ""} onChange={(e) => setForm({ ...form, codeforces: e.target.value })} placeholder="e.g. tourist" />
          </Field>

          <Field label="CodeChef Username">
            <input value={form.codechef || ""} onChange={(e) => setForm({ ...form, codechef: e.target.value })} placeholder="e.g. gennady" />
          </Field>

          <Field label="AtCoder Username">
            <input value={form.atcoder || ""} onChange={(e) => setForm({ ...form, atcoder: e.target.value })} placeholder="e.g. chokudai" />
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-line dark:border-[#27272a] px-6 py-4 bg-[#f3f3f3] dark:bg-[#18181b]">
          <button type="button" onClick={onClose} className="border border-line dark:border-[#27272a] px-4 py-2 text-xs text-ink dark:text-white hover:border-accent bg-white dark:bg-[#121214]">Cancel</button>
          <button disabled={saving} className="flex items-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-5 py-2 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200 disabled:opacity-50">
            {saving && <Loader2 className="animate-spin" size={13} />} Save Handles
          </button>
        </div>
      </form>
    </div>
  );
}

function ProblemGroupsManager({ onViewProblem }: { onViewProblem: (p: Problem) => void }) {
  const { groups, problems, addGroup, deleteGroup, removeProblemFromGroup } = useVaultStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [showAddProblemsModal, setShowAddProblemsModal] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const groupProblems = useMemo(() => {
    if (!activeGroup) return [];
    return problems.filter((p) => p.id && activeGroup.problemIds.includes(p.id));
  }, [activeGroup, problems]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-line dark:border-[#27272a] pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Knowledge Base · {groups.length} collections</p>
          <p className="mt-1 text-sm text-muted">Organize your logged problems into custom study groups (e.g. DP Essentials, OA Company Prep, Top 150).</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex h-10 items-center justify-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-4 text-xs font-medium hover:bg-accent shrink-0">
          <Plus size={16} /> Create New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-12 text-center">
          <FolderKanban size={36} className="mx-auto mb-3 text-muted" />
          <h3 className="font-display text-2xl text-ink dark:text-white">No Problem Groups Yet</h3>
          <p className="mt-2 text-xs text-muted max-w-sm mx-auto">Create custom collections to categorize problems by company, pattern, or study goal.</p>
          <button onClick={() => setShowCreateModal(true)} className="mt-5 border border-line dark:border-[#27272a] px-4 py-2 text-xs hover:border-accent text-ink dark:text-white">
            Create First Group
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Groups Sidebar */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted px-1">Your Groups ({groups.length})</div>
            <div className="space-y-2">
              {groups.map((group) => {
                const isActive = activeGroup?.id === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setActiveGroupId(group.id!)}
                    className={`flex items-center justify-between p-4 border transition cursor-pointer ${isActive ? "border-accent bg-white dark:bg-[#18181b] shadow-sm" : "border-line dark:border-[#27272a] bg-[#f9f9f9] dark:bg-[#121214] hover:bg-white dark:hover:bg-[#18181b]"}`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-display text-lg leading-tight truncate text-ink dark:text-white">{group.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                        <span className="font-mono">{group.problemIds.length} problems</span>
                        <span>·</span>
                        <span className="truncate">{group.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete group "${group.name}"?`)) {
                          void deleteGroup(group.id!);
                        }
                      }}
                      className="text-muted hover:text-[#ba1a1a] p-1"
                      title="Delete Group"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Group Content View */}
          {activeGroup && (
            <div className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-6 space-y-6">
              <div className="flex flex-col justify-between gap-4 border-b border-line dark:border-[#27272a] pb-5 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="border border-line dark:border-[#27272a] bg-stone dark:bg-[#18181b] px-2 py-0.5 font-mono text-[10px] uppercase text-muted">{activeGroup.category}</span>
                    <span className="font-mono text-[11px] text-muted">{groupProblems.length} items</span>
                  </div>
                  <h3 className="mt-2 font-display text-3xl text-ink dark:text-white">{activeGroup.name}</h3>
                  {activeGroup.description && <p className="mt-1 text-xs text-muted max-w-2xl">{activeGroup.description}</p>}
                </div>
                <button
                  onClick={() => setShowAddProblemsModal(true)}
                  className="flex items-center gap-2 border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] px-3.5 py-2 text-xs font-medium text-ink dark:text-white hover:border-accent shrink-0"
                >
                  <Plus size={15} /> Add Problems to Group
                </button>
              </div>

              {groupProblems.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No problems in this group yet. Click <strong>Add Problems to Group</strong> above to populate this collection.
                </div>
              ) : (
                <div className="divide-y divide-line dark:divide-[#27272a] border border-line dark:border-[#27272a]">
                  {groupProblems.map((problem) => (
                    <div key={problem.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#fcfcfc] dark:hover:bg-[#18181b]">
                      <div className="min-w-0 flex-1 pr-4 cursor-pointer" onClick={() => onViewProblem(problem)}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-ink dark:text-white hover:underline">{problem.name}</span>
                          <span className={`border px-1.5 py-0.5 text-[9px] ${problem.difficulty === "Hard" ? "border-[#ba1a1a]/40 bg-[#ffdad6] text-[#93000a]" : problem.difficulty === "Medium" ? "border-line dark:border-[#27272a] bg-stone dark:bg-[#18181b] text-muted" : "border-green/30 bg-green/10 text-green"}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted font-mono">
                          <span>{problem.topic}</span>
                          <span>·</span>
                          <span>{problem.language}</span>
                          <span>·</span>
                          <span>{problem.progress}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {problem.notes && (
                          <button onClick={() => onViewProblem(problem)} className="flex items-center gap-1 text-xs text-muted hover:text-ink dark:hover:text-white">
                            <StickyNote size={14} /> Notes
                          </button>
                        )}
                        <button
                          onClick={() => void removeProblemFromGroup(activeGroup.id!, problem.id!)}
                          className="text-muted hover:text-[#ba1a1a] text-xs p-1"
                          title="Remove from group"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create New Group */}
      {showCreateModal && (
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Modal: Add Problems to Group */}
      {showAddProblemsModal && activeGroup && (
        <AddProblemsToGroupModal
          group={activeGroup}
          allProblems={problems}
          onClose={() => setShowAddProblemsModal(false)}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { addGroup } = useVaultStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Dynamic Programming");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await addGroup({
      name: name.trim(),
      category: category.trim() || "General",
      description: description.trim(),
      problemIds: []
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg border border-line dark:border-[#27272a] bg-paper dark:bg-[#121214] shadow-2xl">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] px-6 py-5 bg-[#f3f3f3] dark:bg-[#18181b]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Problem Archive</div>
            <h2 className="mt-1 font-display text-2xl text-ink dark:text-white">Create Problem Group</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink dark:hover:text-white"><X size={19} /></button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Group Name" required>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dynamic Programming Core, OA Prep" />
          </Field>

          <Field label="Category / Tag">
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Dynamic Programming, Graphs, OA Prep" />
          </Field>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Goal or scope of this problem group..." />
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-line dark:border-[#27272a] px-6 py-4 bg-[#f3f3f3] dark:bg-[#18181b]">
          <button type="button" onClick={onClose} className="border border-line dark:border-[#27272a] px-4 py-2 text-xs text-ink dark:text-white hover:border-accent bg-white dark:bg-[#121214]">Cancel</button>
          <button disabled={saving} className="flex items-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-5 py-2 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200 disabled:opacity-50">
            {saving && <Loader2 className="animate-spin" size={13} />} Save Group
          </button>
        </div>
      </form>
    </div>
  );
}

function AddProblemsToGroupModal({ group, allProblems, onClose }: { group: ProblemGroup; allProblems: Problem[]; onClose: () => void }) {
  const { addProblemToGroup, removeProblemFromGroup } = useVaultStore();
  const [search, setSearch] = useState("");

  const available = useMemo(() => {
    return allProblems.filter((p) => `${p.name} ${p.topic} ${p.companies}`.toLowerCase().includes(search.toLowerCase()));
  }, [allProblems, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div className="max-h-[85vh] w-full max-w-xl flex flex-col border border-line dark:border-[#27272a] bg-paper dark:bg-[#121214] shadow-2xl">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] px-6 py-5 bg-[#f3f3f3] dark:bg-[#18181b]">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted">Add to {group.name}</div>
            <h2 className="mt-1 font-display text-2xl text-ink dark:text-white">Select Problems</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink dark:hover:text-white"><X size={19} /></button>
        </div>

        <div className="p-4 border-b border-line dark:border-[#27272a] bg-white dark:bg-[#121214]">
          <div className="flex items-center gap-2 border border-line dark:border-[#27272a] px-3 h-10 bg-white dark:bg-[#18181b]">
            <Search size={16} className="text-muted shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter logged problems..." className="w-full bg-transparent text-xs outline-none text-ink dark:text-white" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-line dark:divide-[#27272a] p-2 max-h-[400px]">
          {available.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">No problems match your search.</div>
          ) : (
            available.map((p) => {
              const inGroup = p.id && group.problemIds.includes(p.id);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 hover:bg-[#fcfcfc] dark:hover:bg-[#18181b]">
                  <div>
                    <div className="text-xs font-medium text-ink dark:text-white">{p.name}</div>
                    <div className="text-[10px] font-mono text-muted">{p.topic} · {p.difficulty}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (!p.id) return;
                      if (inGroup) {
                        void removeProblemFromGroup(group.id!, p.id);
                      } else {
                        void addProblemToGroup(group.id!, p.id);
                      }
                    }}
                    className={`border px-3 py-1 text-xs transition ${inGroup ? "border-green/40 bg-green/10 text-green" : "border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] text-ink dark:text-white hover:border-accent"}`}
                  >
                    {inGroup ? "Added ✓" : "+ Add"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end border-t border-line dark:border-[#27272a] p-4 bg-[#f3f3f3] dark:bg-[#18181b]">
          <button onClick={onClose} className="bg-ink dark:bg-white text-white dark:text-ink px-5 py-2 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200">Done</button>
        </div>
      </div>
    </div>
  );
}

function ProblemTracker({
  query,
  onAddProblem,
  onEditProblem,
  onDeleteProblem,
  onViewProblem
}: {
  query: string;
  onAddProblem: () => void;
  onEditProblem: (p: Problem) => void;
  onDeleteProblem: (p: Problem) => void;
  onViewProblem: (p: Problem) => void;
}) {
  const { problems, settings } = useVaultStore();
  const [filter, setFilter] = useState<"All" | Difficulty>("All");
  const [sort, setSort] = useState<"date" | "name" | "difficulty">("date");
  const [groupingProblem, setGroupingProblem] = useState<Problem | null>(null);

  const filtered = useMemo(() => problems.filter((problem) => (filter === "All" || problem.difficulty === filter) && `${problem.name} ${problem.topic} ${problem.language} ${problem.companies} ${problem.notes}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "difficulty" ? a.difficulty.localeCompare(b.difficulty) : b.date_solved.localeCompare(a.date_solved)), [problems, query, filter, sort]);

  return <div className="mx-auto max-w-[1600px] space-y-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-line dark:border-[#27272a] pb-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Knowledge base · {problems.length} entries</p>
        <p className="mt-1 text-sm text-muted">A searchable, local-first log of the problems that compound your skill. Click any row or notes icon to view details & notes.</p>
      </div>
      <button onClick={onAddProblem} className="flex h-10 items-center justify-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-4 text-xs font-medium hover:bg-accent shrink-0"><Plus size={16} />New entry</button>
    </div>

    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as "All" | Difficulty)} className="h-9 appearance-none border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] text-ink dark:text-white pl-9 pr-9 text-xs outline-none focus:border-accent">
          <option>All</option><option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
      </div>
      <div className="relative">
        <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 appearance-none border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] text-ink dark:text-white pl-9 pr-9 text-xs outline-none focus:border-accent">
          <option value="date">Sort by date</option><option value="name">Sort by name</option><option value="difficulty">Sort by difficulty</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
      </div>
      <span className="flex items-center px-2 text-xs text-muted">{filtered.length} visible</span>
    </div>

    <VirtualizedProblemTable
      problems={filtered}
      compact={settings.compactTableView}
      onEditProblem={onEditProblem}
      onDeleteProblem={onDeleteProblem}
      onViewProblem={onViewProblem}
      onAddToGroup={(p) => setGroupingProblem(p)}
    />

    {groupingProblem && (
      <AddToGroupsQuickModal problem={groupingProblem} onClose={() => setGroupingProblem(null)} />
    )}
  </div>;
}

function VirtualizedProblemTable({
  problems,
  compact,
  onEditProblem,
  onDeleteProblem,
  onViewProblem,
  onAddToGroup
}: {
  problems: Problem[];
  compact?: boolean;
  onEditProblem: (p: Problem) => void;
  onDeleteProblem: (p: Problem) => void;
  onViewProblem: (p: Problem) => void;
  onAddToGroup: (p: Problem) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = compact ? 48 : 62;
  const viewport = 600;
  const overscan = 5;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(problems.length, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  const visible = problems.slice(start, end);

  if (!problems.length) return <div className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214]"><EmptyState icon={Search} title="No matching problems" detail="Try a different search, difficulty filter, or log a new entry." /></div>;

  return (
    <div className="overflow-hidden border border-line dark:border-[#27272a] bg-white dark:bg-[#121214]">
      <div className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[minmax(170px,1.3fr)_50px_85px_95px_minmax(130px,1fr)_130px_75px_95px_85px_85px_100px_90px] border-b border-line dark:border-[#27272a] bg-[#f3f3f3] dark:bg-[#18181b] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            <span>Name</span>
            <span className="text-center" title="Coding Platform">Platform</span>
            <span>Difficulty</span>
            <span>Progress</span>
            <span>Topic</span>
            <span>Complexity</span>
            <span>Spent</span>
            <span>Language</span>
            <span>Review</span>
            <span>Notes</span>
            <span>Date</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="scrollbar-thin h-[600px] overflow-y-auto" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
            <div style={{ height: problems.length * rowHeight, position: "relative" }}>
              {visible.map((problem, index) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  compact={compact}
                  onEdit={() => onEditProblem(problem)}
                  onDelete={() => onDeleteProblem(problem)}
                  onView={() => onViewProblem(problem)}
                  onAddToGroup={() => onAddToGroup(problem)}
                  style={{ position: "absolute", top: (start + index) * rowHeight, left: 0, right: 0, height: rowHeight }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemRow({
  problem,
  compact,
  style,
  onEdit,
  onDelete,
  onView,
  onAddToGroup
}: {
  problem: Problem;
  compact?: boolean;
  style: React.CSSProperties;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onAddToGroup: () => void;
}) {
  const { toggleProblem } = useVaultStore();
  const hasNotes = Boolean(problem.notes && problem.notes.trim().length > 0);

  return (
    <div
      style={style}
      className={`grid grid-cols-[minmax(170px,1.3fr)_50px_85px_95px_minmax(130px,1fr)_130px_75px_95px_85px_85px_100px_90px] items-center border-b border-line dark:border-[#27272a] px-4 text-xs last:border-0 hover:bg-[#f8f8f8] dark:hover:bg-[#18181b] ${compact ? "py-1" : ""}`}
    >
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <button onClick={onView} className="truncate font-medium text-ink dark:text-white hover:underline text-left" title="Click to view details & notes">
            {problem.name}
          </button>
          <a href={problem.url} target="_blank" rel="noreferrer" className="text-muted hover:text-ink dark:hover:text-white shrink-0" aria-label={`Open ${problem.name}`}>
            <ArrowUpRight size={13} />
          </a>
        </div>
        {!compact && <div className="mt-0.5 truncate text-[11px] text-muted">{problem.companies || "No company tags"}</div>}
      </div>

      <div className="flex items-center justify-center">
        <PlatformIcon platform={problem.platform} url={problem.url} />
      </div>

      <span className={`w-fit border px-2 py-0.5 text-[10px] ${problem.difficulty === "Hard" ? "border-[#ba1a1a]/40 bg-[#ffdad6] text-[#93000a] dark:bg-[#450a0a] dark:text-[#fca5a5]" : problem.difficulty === "Medium" ? "border-line dark:border-[#3f3f46] bg-stone dark:bg-[#27272a] text-muted dark:text-neutral-300" : "border-green/30 bg-green/10 text-green"}`}>
        {problem.difficulty}
      </span>

      <button onClick={() => toggleProblem(problem.id!)} className={`w-fit border px-2 py-0.5 text-[10px] transition ${problem.progress === "Mastered" ? "border-green/30 bg-green/10 text-green" : "border-line dark:border-[#3f3f46] bg-stone dark:bg-[#27272a] text-muted dark:text-neutral-300 hover:border-accent"}`}>
        {problem.progress}
      </button>

      <span className="truncate pr-2 text-muted">{problem.topic}</span>
      <span className="font-mono text-[10px] text-muted truncate">{problem.time_complexity || "—"} / {problem.space_complexity || "—"}</span>
      <span className="font-mono text-[10px] text-muted">{problem.time_spent || "—"}</span>
      <span className="text-muted truncate">{problem.language}</span>
      <span className="text-[11px] text-muted">{problem.review_frequency === "Null" ? "—" : problem.review_frequency}</span>

      <div>
        {hasNotes ? (
          <button onClick={onView} className="flex items-center gap-1 border border-line dark:border-[#3f3f46] bg-stone dark:bg-[#27272a] px-2 py-0.5 font-mono text-[10px] text-ink dark:text-white hover:border-accent hover:bg-white dark:hover:bg-[#18181b]" title="View Problem Notes">
            <StickyNote size={11} className="text-accent" /> Notes
          </button>
        ) : (
          <span className="text-muted text-[11px]">—</span>
        )}
      </div>

      <span className="font-mono text-[10px] text-muted">{problem.date_solved}</span>

      <div className="flex items-center justify-end gap-1">
        <button onClick={onAddToGroup} className="p-1 text-muted hover:text-accent dark:hover:text-white" title="Log/Add problem to Problem Groups">
          <FolderPlus size={14} />
        </button>
        <button onClick={onEdit} className="p-1 text-muted hover:text-accent" title="Edit problem details & review settings">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="p-1 text-muted hover:text-[#ba1a1a]" title="Delete problem">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function AddToGroupsQuickModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const { groups, addProblemToGroup, removeProblemFromGroup } = useVaultStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div className="w-full max-w-md border border-line dark:border-[#27272a] bg-paper dark:bg-[#121214] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted">Problem Groups</div>
            <h3 className="font-display text-2xl text-ink dark:text-white mt-0.5">{problem.name}</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink dark:hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>

        <p className="mt-3 text-xs text-muted">Select which problem groups to add or remove this problem from:</p>

        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {groups.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted border border-dashed border-line dark:border-[#27272a]">
              No Problem Groups created yet. Go to Problem Groups tab to create your first collection.
            </div>
          ) : (
            groups.map((group) => {
              const inGroup = problem.id && group.problemIds.includes(problem.id);
              return (
                <div key={group.id} className="flex items-center justify-between p-3 border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:bg-[#fcfcfc] dark:hover:bg-[#27272a]">
                  <div>
                    <div className="text-xs font-medium text-ink dark:text-white">{group.name}</div>
                    <div className="text-[10px] font-mono text-muted">{group.category} · {group.problemIds.length} problems</div>
                  </div>
                  <button
                    onClick={() => {
                      if (!problem.id) return;
                      if (inGroup) void removeProblemFromGroup(group.id!, problem.id);
                      else void addProblemToGroup(group.id!, problem.id);
                    }}
                    className={`border px-3 py-1 text-xs transition ${inGroup ? "border-green/40 bg-green/10 text-green font-medium" : "border-line dark:border-[#3f3f46] bg-stone dark:bg-[#121214] text-ink dark:text-white hover:border-accent"}`}
                  >
                    {inGroup ? "Added ✓" : "+ Add"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-line dark:border-[#27272a] pt-4">
          <button onClick={onClose} className="bg-ink dark:bg-white text-white dark:text-ink px-5 py-2 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ProblemDetailsModal({ problem, onClose, onEdit, onDelete }: { problem: Problem; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const { toggleProblem, groups, addProblemToGroup, removeProblemFromGroup } = useVaultStore();
  const [copied, setCopied] = useState(false);

  const copyNotes = () => {
    if (problem.notes) {
      void navigator.clipboard.writeText(problem.notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-line dark:border-[#27272a] bg-paper dark:bg-[#121214] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line dark:border-[#27272a] px-6 py-5 bg-[#f3f3f3] dark:bg-[#18181b]">
          <div>
            <div className="flex items-center gap-2">
              <PlatformIcon platform={problem.platform} url={problem.url} />
              <span className={`border px-2 py-0.5 text-[10px] font-medium ${problem.difficulty === "Hard" ? "border-[#ba1a1a]/40 bg-[#ffdad6] text-[#93000a]" : problem.difficulty === "Medium" ? "border-line dark:border-[#3f3f46] bg-stone dark:bg-[#27272a] text-muted" : "border-green/30 bg-green/10 text-green"}`}>
                {problem.difficulty}
              </span>
              <span className="font-mono text-[11px] text-muted">{problem.topic}</span>
            </div>
            <h2 className="mt-2 font-display text-3xl text-ink dark:text-white">{problem.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink dark:hover:text-white" aria-label="Close"><X size={20} /></button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-b border-line dark:border-[#27272a] p-6 bg-white dark:bg-[#121214] md:grid-cols-4 text-xs">
          <div><div className="font-mono text-[10px] uppercase text-muted">Progress</div><div className="mt-1 font-medium text-ink dark:text-white">{problem.progress}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Language</div><div className="mt-1 font-medium text-ink dark:text-white">{problem.language || "Not specified"}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Time Complexity</div><div className="mt-1 font-mono text-ink dark:text-white">{problem.time_complexity || "N/A"}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Space Complexity</div><div className="mt-1 font-mono text-ink dark:text-white">{problem.space_complexity || "N/A"}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Review Rhythm</div><div className="mt-1 font-medium text-ink dark:text-white">{problem.review_frequency}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Next Review Date</div><div className="mt-1 font-mono text-ink dark:text-white">{problem.next_review_date || "None scheduled"}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Time Spent</div><div className="mt-1 font-mono text-ink dark:text-white">{problem.time_spent || "N/A"}</div></div>
          <div><div className="font-mono text-[10px] uppercase text-muted">Date Solved</div><div className="mt-1 font-mono text-ink dark:text-white">{problem.date_solved}</div></div>
          {problem.companies && (
            <div className="col-span-2 md:col-span-4 border-t border-line/60 dark:border-[#27272a] pt-2 mt-1">
              <div className="font-mono text-[10px] uppercase text-muted">Companies</div>
              <div className="mt-1 text-xs text-ink dark:text-white">{problem.companies}</div>
            </div>
          )}
        </div>

        {/* Groups Selection Row */}
        {groups.length > 0 && (
          <div className="border-b border-line dark:border-[#27272a] bg-[#f9f9f9] dark:bg-[#18181b] px-6 py-3 text-xs">
            <div className="font-mono text-[10px] uppercase text-muted mb-2">Problem Groups</div>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const inGroup = problem.id && group.problemIds.includes(problem.id);
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      if (!problem.id) return;
                      if (inGroup) void removeProblemFromGroup(group.id!, problem.id);
                      else void addProblemToGroup(group.id!, problem.id);
                    }}
                    className={`border px-2.5 py-1 font-mono text-[11px] transition ${inGroup ? "border-accent bg-ink dark:bg-white text-white dark:text-ink font-medium" : "border-line dark:border-[#27272a] bg-white dark:bg-[#121214] text-muted hover:border-accent hover:text-ink dark:hover:text-white"}`}
                  >
                    {inGroup ? `✓ ${group.name}` : `+ ${group.name}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-display text-xl text-ink dark:text-white">
              <StickyNote size={18} className="text-accent" />
              Notes & Key Insights
            </h3>
            {problem.notes && (
              <button onClick={copyNotes} className="flex items-center gap-1 border border-line dark:border-[#27272a] px-2.5 py-1 text-xs text-ink dark:text-white hover:border-accent bg-white dark:bg-[#18181b]">
                {copied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy Notes"}
              </button>
            )}
          </div>

          {problem.notes ? (
            <div className="rounded border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] p-4 font-mono text-xs leading-relaxed text-ink dark:text-white whitespace-pre-wrap selection:bg-[#e8e8e8]">
              {problem.notes}
            </div>
          ) : (
            <div className="border border-dashed border-line dark:border-[#27272a] bg-[#f9f9f9] dark:bg-[#18181b] p-6 text-center text-xs text-muted">
              No notes recorded for this problem yet. Click Edit below to add notes and edge cases.
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line dark:border-[#27272a] bg-[#f3f3f3] dark:bg-[#18181b] px-6 py-4">
          <a href={problem.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] px-3 py-2 text-xs font-medium text-ink dark:text-white hover:border-accent">
            <ArrowUpRight size={14} /> Open Problem Link
          </a>
          <div className="flex items-center gap-2">
            <button onClick={() => void toggleProblem(problem.id!)} className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] px-3 py-2 text-xs text-ink dark:text-white hover:border-accent">
              {problem.progress === "Mastered" ? "Mark in Review" : "Mark Mastered"}
            </button>
            <button onClick={onEdit} className="flex items-center gap-1.5 bg-ink dark:bg-white text-white dark:text-ink px-3.5 py-2 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200">
              <Pencil size={14} /> Edit Problem
            </button>
            <button onClick={onDelete} className="flex items-center gap-1.5 border border-[#ba1a1a]/40 bg-[#ffdad6]/40 px-3 py-2 text-xs text-[#93000a] dark:text-[#fca5a5] hover:bg-[#ffdad6]">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const { deleteProblem } = useVaultStore();
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!problem.id) return;
    setDeleting(true);
    await deleteProblem(problem.id);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div className="w-full max-w-md border border-[#ba1a1a]/50 bg-paper dark:bg-[#121214] p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-[#93000a] dark:text-[#fca5a5]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffdad6] dark:bg-[#450a0a]">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="font-display text-2xl text-ink dark:text-white">Delete Problem</h3>
            <p className="text-xs text-muted">This action cannot be undone.</p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink dark:text-white">
          Are you sure you want to permanently remove <strong className="font-semibold">{problem.name}</strong> from your DSA Vault?
        </p>

        <div className="mt-6 flex justify-end gap-3 border-t border-line dark:border-[#27272a] pt-4">
          <button type="button" onClick={onClose} className="border border-line dark:border-[#27272a] px-4 py-2 text-xs text-ink dark:text-white hover:border-accent">
            Cancel
          </button>
          <button disabled={deleting} onClick={confirmDelete} className="flex items-center gap-2 bg-[#ba1a1a] px-4 py-2 text-xs font-medium text-white hover:bg-[#93000a] disabled:opacity-50">
            {deleting && <Loader2 className="animate-spin" size={13} />} Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings, exportData, importData, resetDatabase, problems, groups } = useVaultStore();
  const [form, setForm] = useState<UserSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    await updateSettings(form);
    setSaving(false);
    setStatusMessage({ type: "success", text: "Settings saved successfully." });
  };

  const handleExport = async () => {
    const jsonStr = await exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-vault-backup-${dateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await importData(content);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Vault data imported successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to import file." });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    await resetDatabase();
    setShowResetConfirm(false);
    setStatusMessage({ type: "success", text: "Database has been reset to defaults." });
  };

  const notesCount = problems.filter((p) => p.notes && p.notes.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="border-b border-line dark:border-[#27272a] pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Preferences & System</p>
        <p className="mt-1 text-sm text-muted">Configure theme mode, spaced repetition rhythm, table layout, and database backups.</p>
      </div>

      {statusMessage && (
        <div className={`flex items-center justify-between border px-4 py-3 text-xs ${statusMessage.type === "success" ? "border-green/40 bg-green/10 text-green" : "border-[#ba1a1a]/40 bg-[#ffdad6] text-[#93000a]"}`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}><X size={15} /></button>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-6 md:p-8 space-y-8">
        <div>
          <h3 className="font-display text-2xl border-b border-line dark:border-[#27272a] pb-3 text-ink dark:text-white">Theme & Display Preferences</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Interface Theme Mode">
              <select value={form.themeMode} onChange={(e) => setForm({ ...form, themeMode: e.target.value as "light" | "dark" | "system" })}>
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="system">System Preference</option>
              </select>
            </Field>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.compactTableView}
                  onChange={(e) => setForm({ ...form, compactTableView: e.target.checked })}
                  className="h-4 w-4 accent-ink dark:accent-white"
                />
                <div>
                  <div className="text-sm font-medium text-ink dark:text-white">Compact Table Mode</div>
                  <div className="text-xs text-muted">Reduces row padding in the Problem Tracker to view more items on screen.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl border-b border-line dark:border-[#27272a] pb-3 text-ink dark:text-white">Spaced Repetition & Defaults</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Default Review Frequency">
              <select value={form.defaultReviewFrequency} onChange={(e) => setForm({ ...form, defaultReviewFrequency: e.target.value as ReviewFrequency })}>
                <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Null</option>
              </select>
            </Field>

            <Field label="Default Problem Language">
              <input value={form.defaultLanguage} onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })} placeholder="TypeScript, Python, etc." />
            </Field>

            <Field label="Daily Review Interval (Days)">
              <input type="number" min="1" max="30" value={form.dailyIntervalDays} onChange={(e) => setForm({ ...form, dailyIntervalDays: Number(e.target.value) })} />
            </Field>

            <Field label="Weekly Review Interval (Days)">
              <input type="number" min="1" max="60" value={form.weeklyIntervalDays} onChange={(e) => setForm({ ...form, weeklyIntervalDays: Number(e.target.value) })} />
            </Field>

            <Field label="Monthly Review Interval (Days)">
              <input type="number" min="1" max="180" value={form.monthlyIntervalDays} onChange={(e) => setForm({ ...form, monthlyIntervalDays: Number(e.target.value) })} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-line dark:border-[#27272a]">
          <button disabled={saving} className="flex items-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-6 py-2.5 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-6 md:p-8 space-y-6">
        <h3 className="font-display text-2xl border-b border-line dark:border-[#27272a] pb-3 text-ink dark:text-white">Data Vault Management</h3>
        <p className="text-xs text-muted">Backup your entire problem set, notes, and problem groups as a JSON file, or restore from a previous backup.</p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button onClick={handleExport} className="flex items-center gap-2 border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] text-ink dark:text-white px-4 py-2.5 text-xs font-medium hover:border-accent">
            <Download size={16} /> Export Backup (.json)
          </button>

          <label className="flex items-center gap-2 border border-line dark:border-[#27272a] bg-white dark:bg-[#18181b] text-ink dark:text-white px-4 py-2.5 text-xs font-medium cursor-pointer hover:border-accent">
            <Upload size={16} /> Import Backup (.json)
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 border border-[#ba1a1a]/40 bg-[#ffdad6]/30 px-4 py-2.5 text-xs font-medium text-[#93000a] dark:text-[#fca5a5] hover:bg-[#ffdad6]">
            <Trash2 size={16} /> Reset Vault Database
          </button>
        </div>
      </div>

      {/* Database Diagnostic Stats */}
      <div className="border border-line dark:border-[#27272a] bg-white dark:bg-[#121214] p-6 md:p-8">
        <h3 className="font-display text-2xl border-b border-line dark:border-[#27272a] pb-3 text-ink dark:text-white">System Diagnostics</h3>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 text-xs">
          <div className="border border-line dark:border-[#27272a] p-4 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[10px] uppercase text-muted">Total Problems</div>
            <div className="mt-2 font-display text-3xl text-ink dark:text-white">{problems.length}</div>
          </div>
          <div className="border border-line dark:border-[#27272a] p-4 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[10px] uppercase text-muted">Notes Recorded</div>
            <div className="mt-2 font-display text-3xl text-ink dark:text-white">{notesCount}</div>
          </div>
          <div className="border border-line dark:border-[#27272a] p-4 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[10px] uppercase text-muted">Problem Groups</div>
            <div className="mt-2 font-display text-3xl text-ink dark:text-white">{groups.length}</div>
          </div>
          <div className="border border-line dark:border-[#27272a] p-4 bg-[#f9f9f9] dark:bg-[#18181b]">
            <div className="font-mono text-[10px] uppercase text-muted">Mastered</div>
            <div className="mt-2 font-display text-3xl text-green">{problems.filter((p) => p.progress === "Mastered").length}</div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && setShowResetConfirm(false)}>
          <div className="w-full max-w-md border border-[#ba1a1a] bg-paper dark:bg-[#121214] p-6 shadow-2xl">
            <h3 className="font-display text-2xl text-[#93000a] dark:text-[#fca5a5]">Reset Vault Database?</h3>
            <p className="mt-3 text-xs leading-relaxed text-ink dark:text-white">
              This will erase all your logged problems, custom notes, and problem groups, and reload the default seed data.
            </p>
            <div className="mt-6 flex justify-end gap-3 border-t border-line dark:border-[#27272a] pt-4">
              <button type="button" onClick={() => setShowResetConfirm(false)} className="border border-line dark:border-[#27272a] px-4 py-2 text-xs text-ink dark:text-white hover:border-accent">
                Cancel
              </button>
              <button onClick={handleReset} className="bg-[#ba1a1a] px-4 py-2 text-xs font-medium text-white hover:bg-[#93000a]">
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProblemForm({
  onClose,
  initialProblem,
  defaultLanguage,
  defaultReviewFrequency
}: {
  onClose: () => void;
  initialProblem?: Problem | null;
  defaultLanguage?: string;
  defaultReviewFrequency?: ReviewFrequency;
}) {
  const { addProblem, updateProblem } = useVaultStore();
  const [form, setForm] = useState({
    name: initialProblem?.name || "",
    url: initialProblem?.url || "",
    platform: initialProblem?.platform || "",
    notes: initialProblem?.notes || "",
    difficulty: (initialProblem?.difficulty || "Medium") as Difficulty,
    progress: (initialProblem?.progress || "Not started") as ProblemProgress,
    topic: initialProblem?.topic || "",
    time_complexity: initialProblem?.time_complexity || "O(n)",
    space_complexity: initialProblem?.space_complexity || "O(1)",
    time_spent: initialProblem?.time_spent || "",
    language: initialProblem?.language || defaultLanguage || "TypeScript",
    date_solved: initialProblem?.date_solved || dateKey(),
    companies: initialProblem?.companies || "",
    review_frequency: (initialProblem?.review_frequency || defaultReviewFrequency || "Weekly") as ReviewFrequency,
    next_review_date: initialProblem?.next_review_date || ""
  });

  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initialProblem?.id);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    if (isEditing && initialProblem?.id) {
      await updateProblem(initialProblem.id, form);
    } else {
      await addProblem(form);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-line dark:border-[#27272a] bg-paper dark:bg-[#121214] shadow-2xl">
        <div className="flex items-center justify-between border-b border-line dark:border-[#27272a] px-6 py-5 bg-[#f3f3f3] dark:bg-[#18181b]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{isEditing ? "Edit entry" : "New entry"}</div>
            <h2 className="mt-1 font-display text-2xl text-ink dark:text-white">{isEditing ? "Edit Problem Details" : "Log a problem"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink dark:hover:text-white"><X size={19} /></button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Problem name" required>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Two Sum" />
          </Field>

          <Field label="Problem URL" required>
            <input required type="url" value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://leetcode.com/..." />
          </Field>

          <Field label="Platform (Optional override)">
            <select value={form.platform} onChange={(e) => update("platform", e.target.value)}>
              <option value="">Auto-detect from URL</option>
              <option value="LeetCode">LeetCode</option>
              <option value="CodeChef">CodeChef</option>
              <option value="CodeForces">CodeForces</option>
              <option value="AtCoder">AtCoder</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
              <option value="HackerRank">HackerRank</option>
              <option value="Other">Other</option>
            </select>
          </Field>

          <Field label="Topic">
            <input value={form.topic} onChange={(e) => update("topic", e.target.value)} placeholder="Array, Hash Table" />
          </Field>

          <Field label="Companies">
            <input value={form.companies} onChange={(e) => update("companies", e.target.value)} placeholder="Google, Meta, Amazon" />
          </Field>

          <Field label="Difficulty">
            <select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </Field>

          <Field label="Progress">
            <select value={form.progress} onChange={(e) => update("progress", e.target.value)}>
              <option>Not started</option><option>Attempted</option><option>Review</option><option>Mastered</option>
            </select>
          </Field>

          <Field label="Time complexity">
            <input value={form.time_complexity} onChange={(e) => update("time_complexity", e.target.value)} placeholder="e.g. O(n)" />
          </Field>

          <Field label="Space complexity">
            <input value={form.space_complexity} onChange={(e) => update("space_complexity", e.target.value)} placeholder="e.g. O(1)" />
          </Field>

          <Field label="Time spent">
            <input value={form.time_spent} onChange={(e) => update("time_spent", e.target.value)} placeholder="e.g. 35m" />
          </Field>

          <Field label="Language">
            <input value={form.language} onChange={(e) => update("language", e.target.value)} placeholder="TypeScript, Python" />
          </Field>

          <Field label="Date solved">
            <input type="date" value={form.date_solved} onChange={(e) => update("date_solved", e.target.value)} />
          </Field>

          <Field label="Review frequency">
            <select value={form.review_frequency} onChange={(e) => update("review_frequency", e.target.value)}>
              <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Null</option>
            </select>
          </Field>

          {isEditing && (
            <div className="md:col-span-2">
              <Field label="Custom Next Review Date (Optional override)">
                <input type="date" value={form.next_review_date || ""} onChange={(e) => update("next_review_date", e.target.value)} />
              </Field>
            </div>
          )}

          <div className="md:col-span-2">
            <Field label="Notes & Key Insights">
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} placeholder="Key insight, space/time trade-offs, edge cases, or what to revisit..." />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line dark:border-[#27272a] px-6 py-4 bg-[#f3f3f3] dark:bg-[#18181b]">
          <button type="button" onClick={onClose} className="border border-line dark:border-[#27272a] px-4 py-2 text-xs text-ink dark:text-white hover:border-accent bg-white dark:bg-[#121214]">Cancel</button>
          <button disabled={saving} className="flex items-center gap-2 bg-ink dark:bg-white text-white dark:text-ink px-5 py-2 text-xs font-medium hover:bg-accent dark:hover:bg-neutral-200 disabled:opacity-50">
            {saving && <Loader2 className="animate-spin" size={14} />}
            {isEditing ? "Save Changes" : "Save Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactElement<{ className?: string }> }) {
  return (
    <label className="block text-xs text-muted">
      {label}{required && <span className="text-[#ba1a1a]"> *</span>}
      <span className="mt-1.5 block [&>input]:h-10 [&>input]:w-full [&>input]:border [&>input]:border-line dark:[&>input]:border-[#27272a] [&>input]:bg-white dark:[&>input]:bg-[#18181b] [&>input]:px-3 [&>input]:text-sm [&>input]:text-ink dark:[&>input]:text-white [&>input]:outline-none [&>input]:focus:border-accent [&>select]:h-10 [&>select]:w-full [&>select]:border [&>select]:border-line dark:[&>select]:border-[#27272a] [&>select]:bg-white dark:[&>select]:bg-[#18181b] [&>select]:px-3 [&>select]:text-sm [&>select]:text-ink dark:[&>select]:text-white [&>select]:outline-none [&>select]:focus:border-accent [&>textarea]:w-full [&>textarea]:resize-none [&>textarea]:border [&>textarea]:border-line dark:[&>textarea]:border-[#27272a] [&>textarea]:bg-white dark:[&>textarea]:bg-[#18181b] [&>textarea]:p-3 [&>textarea]:text-sm [&>textarea]:text-ink dark:[&>textarea]:text-white [&>textarea]:outline-none [&>textarea]:focus:border-accent">
        {children}
      </span>
    </label>
  );
}
