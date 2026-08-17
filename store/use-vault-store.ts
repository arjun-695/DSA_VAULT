"use client";

import { create } from "zustand";
import { db } from "@/lib/db";
import { calculateNextReviewDate, dateKey, isDue, prepareProblem } from "@/lib/revision";
import { schedulePlaylistVideos } from "@/lib/playlist";
import type { Playlist, PlaylistVideo, Problem, ProblemGroup, ReviewFrequency, Todo, UserSettings } from "@/lib/types";

const defaultSettings: UserSettings = {
  defaultReviewFrequency: "Weekly",
  defaultLanguage: "TypeScript",
  defaultDailyGoal: 2,
  dailyIntervalDays: 1,
  weeklyIntervalDays: 7,
  monthlyIntervalDays: 30,
  compactTableView: false,
  themeMode: "light",
  profiles: {
    leetcode: "",
    codeforces: "",
    codechef: "",
    atcoder: ""
  }
};

const STORAGE_KEY = "dsa_vault_data_v1";

type SavedState = {
  version: number;
  initialized: boolean;
  problems: Problem[];
  playlists: Playlist[];
  playlistVideos: PlaylistVideo[];
  groups: ProblemGroup[];
  settings: UserSettings;
};

const saveToLocalStorage = (data: {
  problems: Problem[];
  playlists: Playlist[];
  playlistVideos: PlaylistVideo[];
  groups: ProblemGroup[];
  settings: UserSettings;
}) => {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedState = {
      version: 1,
      initialized: true,
      ...data
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
};

const getFromLocalStorage = (): SavedState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch (err) {
    console.error("Failed to read from localStorage:", err);
    return null;
  }
};

type VaultStore = {
  problems: Problem[];
  playlists: Playlist[];
  playlistVideos: PlaylistVideo[];
  groups: ProblemGroup[];
  todos: Todo[];
  settings: UserSettings;
  hydrated: boolean;
  load: () => Promise<void>;
  addProblem: (problem: Omit<Problem, "id" | "next_review_date">) => Promise<void>;
  updateProblem: (id: number, updates: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: number) => Promise<void>;
  toggleProblem: (id: number) => Promise<void>;
  toggleVideo: (id: number) => Promise<void>;
  createPlaylist: (input: { name: string; url?: string; dailyGoal: number; items: { title: string; video_url?: string }[] }) => Promise<{ error?: string }>;
  importPlaylist: (input: { name: string; url?: string; dailyGoal: number; items?: { title: string; video_url?: string }[] }) => Promise<{ error?: string }>;
  deletePlaylist: (id: number) => Promise<void>;
  togglePausePlaylist: (id: number) => Promise<void>;
  addGroup: (group: Omit<ProblemGroup, "id" | "created_at">) => Promise<void>;
  updateGroup: (id: number, updates: Partial<ProblemGroup>) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  addProblemToGroup: (groupId: number, problemId: number) => Promise<void>;
  removeProblemFromGroup: (groupId: number, problemId: number) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<{ success: boolean; error?: string }>;
  resetDatabase: () => Promise<void>;
};

const makeTodos = (problems: Problem[], videos: PlaylistVideo[], playlists: Playlist[]): Todo[] => {
  const today = dateKey();
  const activePlaylistIds = new Set(playlists.filter((p) => p.status !== "paused").map((p) => p.id));
  const problemTodos = problems.filter((problem) => isDue(problem, today)).map((problem) => ({
    kind: "problem" as const,
    id: problem.id!,
    title: problem.name,
    subtitle: `${problem.topic} · ${problem.difficulty}`,
    meta: "Revision",
    href: problem.url
  }));
  const videoTodos = videos
    .filter((video) => video.assigned_date === today && !video.is_completed && activePlaylistIds.has(video.playlist_id))
    .map((video) => ({
      kind: "video" as const,
      id: video.id!,
      title: video.title,
      subtitle: playlists.find((playlist) => playlist.id === video.playlist_id)?.name || "Playlist video",
      meta: "Watch",
      href: video.video_url
    }));
  return [...problemTodos, ...videoTodos];
};

// Background Dexie sync helper (best effort, doesn't block localStorage)
const syncDexie = async (state: {
  problems: Problem[];
  playlists: Playlist[];
  playlistVideos: PlaylistVideo[];
  groups: ProblemGroup[];
  settings: UserSettings;
}) => {
  try {
    await db.transaction("rw", [db.problems, db.playlists, db.playlist_videos, db.settings, db.problem_groups], async () => {
      await db.problems.clear();
      await db.playlists.clear();
      await db.playlist_videos.clear();
      await db.settings.clear();
      await db.problem_groups.clear();

      if (state.problems.length) await db.problems.bulkAdd(state.problems);
      if (state.playlists.length) await db.playlists.bulkAdd(state.playlists);
      if (state.playlistVideos.length) await db.playlist_videos.bulkAdd(state.playlistVideos);
      if (state.groups.length) await db.problem_groups.bulkAdd(state.groups);
      await db.settings.add(state.settings);
    });
  } catch (err) {
    console.warn("Dexie background sync warning:", err);
  }
};

export const useVaultStore = create<VaultStore>((set, get) => ({
  problems: [],
  playlists: [],
  playlistVideos: [],
  groups: [],
  todos: [],
  settings: defaultSettings,
  hydrated: false,
  load: async () => {
    const saved = getFromLocalStorage();

    if (saved && saved.initialized) {
      const dueProblems = saved.problems.filter((p) => isDue(p, dateKey()));
      const loadedSettings = { ...defaultSettings, ...saved.settings };
      set({
        problems: saved.problems,
        playlists: saved.playlists,
        playlistVideos: saved.playlistVideos,
        groups: saved.groups,
        settings: loadedSettings,
        todos: makeTodos(dueProblems, saved.playlistVideos, saved.playlists),
        hydrated: true
      });
      // Background sync to Dexie
      void syncDexie({
        problems: saved.problems,
        playlists: saved.playlists,
        playlistVideos: saved.playlistVideos,
        groups: saved.groups,
        settings: loadedSettings
      });
      return;
    }

    // Otherwise, first time setup: check Dexie or create initial seed data
    let problems: Problem[] = [];
    let playlists: Playlist[] = [];
    let playlistVideos: PlaylistVideo[] = [];
    let groups: ProblemGroup[] = [];
    let loadedSettings = defaultSettings;

    try {
      [problems, playlists, playlistVideos, groups] = await Promise.all([
        db.problems.toArray(),
        db.playlists.toArray(),
        db.playlist_videos.toArray(),
        db.problem_groups.toArray()
      ]);
      const storedSettings = await db.settings.toArray();
      if (storedSettings.length > 0) {
        loadedSettings = { ...defaultSettings, ...storedSettings[0] };
      }
    } catch {
      // Dexie not initialized or error, fallback to seed
    }

    if (!problems.length && !playlists.length) {
      const seeded = [
        { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/", notes: "Hash map lookup; watch for duplicate values.", difficulty: "Easy" as const, progress: "Mastered" as const, topic: "Array, Hash Table", time_complexity: "O(n)", space_complexity: "O(n)", time_spent: "15m", language: "TypeScript", date_solved: dateKey(), companies: "Amazon, Google", review_frequency: "Weekly" as const },
        { name: "LRU Cache", url: "https://leetcode.com/problems/lru-cache/", notes: "Combine Map with a doubly linked list.", difficulty: "Medium" as const, progress: "Review" as const, topic: "Hash Table, Linked List", time_complexity: "O(1)", space_complexity: "O(capacity)", time_spent: "45m", language: "Go", date_solved: dateKey(), companies: "Microsoft, Meta", review_frequency: "Daily" as const },
        { name: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", notes: "Binary search the smaller partition.", difficulty: "Hard" as const, progress: "Attempted" as const, topic: "Array, Binary Search", time_complexity: "O(log(min(m,n)))", space_complexity: "O(1)", time_spent: "90m", language: "Java", date_solved: dateKey(), companies: "Google, Apple", review_frequency: "Monthly" as const },
        { name: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", notes: "Sort by start time before merging overlaps.", difficulty: "Medium" as const, progress: "Mastered" as const, topic: "Array, Sorting", time_complexity: "O(n log n)", space_complexity: "O(n)", time_spent: "25m", language: "TypeScript", date_solved: dateKey(), companies: "Amazon", review_frequency: "Null" as const }
      ].map((p, idx) => ({
        ...prepareProblem(p, {
          Daily: loadedSettings.dailyIntervalDays,
          Weekly: loadedSettings.weeklyIntervalDays,
          Monthly: loadedSettings.monthlyIntervalDays
        }),
        id: idx + 1
      }));
      problems = seeded;

      const seededGroups: ProblemGroup[] = [
        {
          id: 1,
          name: "DP & Spaced Repetition Core",
          description: "High-yield dynamic programming patterns and state transitions to review frequently.",
          category: "Dynamic Programming",
          problemIds: [1, 2],
          created_at: dateKey()
        },
        {
          id: 2,
          name: "OA & Company Assessment Favorites",
          description: "Frequently asked problems from Online Assessments (Google, Meta, Amazon).",
          category: "OA Prep",
          problemIds: [1, 2, 3, 4],
          created_at: dateKey()
        }
      ];
      groups = seededGroups;
    }

    const stateToSave = { problems, playlists, playlistVideos, groups, settings: loadedSettings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);

    const dueProblems = problems.filter((p) => isDue(p, dateKey()));
    set({
      problems,
      playlists,
      playlistVideos,
      groups,
      settings: loadedSettings,
      todos: makeTodos(dueProblems, playlistVideos, playlists),
      hydrated: true
    });
  },
  addProblem: async (input) => {
    const { settings, problems } = get();
    const problemData = prepareProblem(input, {
      Daily: settings.dailyIntervalDays,
      Weekly: settings.weeklyIntervalDays,
      Monthly: settings.monthlyIntervalDays
    });
    const maxId = problems.reduce((max, p) => Math.max(max, p.id || 0), 0);
    const newProblem: Problem = { ...problemData, id: maxId + 1 };
    const updatedProblems = [...problems, newProblem];
    const newTodos = makeTodos(updatedProblems, get().playlistVideos, get().playlists);

    set({ problems: updatedProblems, todos: newTodos });

    const stateToSave = { problems: updatedProblems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: get().groups, settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  updateProblem: async (id, updates) => {
    const current = get().problems.find((p) => p.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    const { settings } = get();
    let nextReview = merged.next_review_date;
    if (("review_frequency" in updates || "date_solved" in updates) && !("next_review_date" in updates)) {
      nextReview = calculateNextReviewDate(merged.date_solved, merged.review_frequency, {
        Daily: settings.dailyIntervalDays,
        Weekly: settings.weeklyIntervalDays,
        Monthly: settings.monthlyIntervalDays
      });
    }
    const updatedProblem: Problem = { ...merged, next_review_date: nextReview };
    const updatedProblems = get().problems.map((p) => (p.id === id ? updatedProblem : p));
    const newTodos = makeTodos(updatedProblems, get().playlistVideos, get().playlists);

    set({ problems: updatedProblems, todos: newTodos });

    const stateToSave = { problems: updatedProblems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: get().groups, settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  deleteProblem: async (id) => {
    const updatedProblems = get().problems.filter((p) => p.id !== id);
    const updatedGroups = get().groups.map((g) => ({
      ...g,
      problemIds: g.problemIds.filter((pid) => pid !== id)
    }));
    const newTodos = makeTodos(updatedProblems, get().playlistVideos, get().playlists);

    set({ problems: updatedProblems, groups: updatedGroups, todos: newTodos });

    const stateToSave = { problems: updatedProblems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: updatedGroups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  toggleProblem: async (id) => {
    const current = get().problems.find((problem) => problem.id === id);
    if (!current) return;
    const { settings } = get();
    const nextReview = calculateNextReviewDate(dateKey(), current.review_frequency, {
      Daily: settings.dailyIntervalDays,
      Weekly: settings.weeklyIntervalDays,
      Monthly: settings.monthlyIntervalDays
    });
    const nextProgress: Problem["progress"] = current.progress === "Mastered" ? "Review" : "Mastered";
    const updatedProblems = get().problems.map((problem) => problem.id === id ? { ...problem, next_review_date: nextReview, progress: nextProgress } : problem);
    const newTodos = makeTodos(updatedProblems, get().playlistVideos, get().playlists);

    set({ problems: updatedProblems, todos: newTodos });

    const stateToSave = { problems: updatedProblems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: get().groups, settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  toggleVideo: async (id) => {
    const video = get().playlistVideos.find((item) => item.id === id);
    if (!video) return;
    const isCompleted = !video.is_completed;

    const playlist = get().playlists.find((item) => item.id === video.playlist_id);
    const playlistVideos = get().playlistVideos.map((item) => item.id === id ? { ...item, is_completed: isCompleted } : item);
    const playlists = get().playlists.map((item) => {
      if (item.id !== playlist?.id) return item;
      const completedCount = playlistVideos.filter((v) => v.playlist_id === item.id && v.is_completed).length;
      const status: Playlist["status"] = completedCount >= item.total_videos ? "completed" : "ongoing";
      return {
        ...item,
        completed_videos: completedCount,
        status,
        ...(status === "completed" ? { completed_at: dateKey() } : {})
      };
    });

    const newTodos = makeTodos(get().problems, playlistVideos, playlists);

    set({ playlistVideos, playlists, todos: newTodos });

    const stateToSave = { problems: get().problems, playlists, playlistVideos, groups: get().groups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  createPlaylist: async ({ name, url, dailyGoal, items }) => {
    if (!name.trim()) return { error: "Please provide a playlist name." };
    if (!items || items.length === 0) return { error: "Please provide at least one item or video." };

    const maxPlaylistId = get().playlists.reduce((max, p) => Math.max(max, p.id || 0), 0);
    const playlistId = maxPlaylistId + 1;

    const newPlaylist: Playlist = {
      id: playlistId,
      name: name.trim(),
      url: url?.trim() || "",
      daily_goal: Math.max(1, dailyGoal),
      total_videos: items.length,
      completed_videos: 0,
      status: "ongoing",
      created_at: dateKey()
    };

    let nextVideoId = get().playlistVideos.reduce((max, v) => Math.max(max, v.id || 0), 0) + 1;
    const scheduled = schedulePlaylistVideos(
      items.map((item) => ({
        title: item.title.trim() || "Untitled item",
        video_url: item.video_url?.trim() || "",
        playlist_id: playlistId
      })),
      dailyGoal
    );
    const newVideos: PlaylistVideo[] = scheduled.map((v) => ({ ...v, id: nextVideoId++ }));

    const updatedPlaylists = [...get().playlists, newPlaylist];
    const updatedVideos = [...get().playlistVideos, ...newVideos];
    const newTodos = makeTodos(get().problems, updatedVideos, updatedPlaylists);

    set({ playlists: updatedPlaylists, playlistVideos: updatedVideos, todos: newTodos });

    const stateToSave = { problems: get().problems, playlists: updatedPlaylists, playlistVideos: updatedVideos, groups: get().groups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);

    return {};
  },
  importPlaylist: async ({ name, url, dailyGoal, items }) => {
    const videoItems = items && items.length > 0 ? items : [{ title: name.trim() || "Playlist Item 1", video_url: url || "" }];
    return get().createPlaylist({ name, url, dailyGoal, items: videoItems });
  },
  deletePlaylist: async (id) => {
    const updatedPlaylists = get().playlists.filter((p) => p.id !== id);
    const updatedVideos = get().playlistVideos.filter((v) => v.playlist_id !== id);
    const newTodos = makeTodos(get().problems, updatedVideos, updatedPlaylists);

    set({ playlists: updatedPlaylists, playlistVideos: updatedVideos, todos: newTodos });

    const stateToSave = {
      problems: get().problems,
      playlists: updatedPlaylists,
      playlistVideos: updatedVideos,
      groups: get().groups,
      settings: get().settings
    };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  togglePausePlaylist: async (id) => {
    const playlists = get().playlists.map((item) => {
      if (item.id !== id) return item;
      if (item.status === "completed") return item;
      const newStatus = item.status === "paused" ? "ongoing" : "paused";
      return { ...item, status: newStatus as Playlist["status"] };
    });

    const newTodos = makeTodos(get().problems, get().playlistVideos, playlists);

    set({ playlists, todos: newTodos });

    const stateToSave = {
      problems: get().problems,
      playlists,
      playlistVideos: get().playlistVideos,
      groups: get().groups,
      settings: get().settings
    };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  addGroup: async (input) => {
    const maxGroupId = get().groups.reduce((max, g) => Math.max(max, g.id || 0), 0);
    const newGroup: ProblemGroup = { ...input, id: maxGroupId + 1, created_at: dateKey() };
    const updatedGroups = [...get().groups, newGroup];

    set({ groups: updatedGroups });

    const stateToSave = { problems: get().problems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: updatedGroups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  updateGroup: async (id, updates) => {
    const current = get().groups.find((g) => g.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    const updatedGroups = get().groups.map((g) => (g.id === id ? updated : g));

    set({ groups: updatedGroups });

    const stateToSave = { problems: get().problems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: updatedGroups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  deleteGroup: async (id) => {
    const updatedGroups = get().groups.filter((g) => g.id !== id);

    set({ groups: updatedGroups });

    const stateToSave = { problems: get().problems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: updatedGroups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  addProblemToGroup: async (groupId, problemId) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group || group.problemIds.includes(problemId)) return;
    const updated = { ...group, problemIds: [...group.problemIds, problemId] };
    const updatedGroups = get().groups.map((g) => (g.id === groupId ? updated : g));

    set({ groups: updatedGroups });

    const stateToSave = { problems: get().problems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: updatedGroups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  removeProblemFromGroup: async (groupId, problemId) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;
    const updated = { ...group, problemIds: group.problemIds.filter((pid) => pid !== problemId) };
    const updatedGroups = get().groups.map((g) => (g.id === groupId ? updated : g));

    set({ groups: updatedGroups });

    const stateToSave = { problems: get().problems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: updatedGroups, settings: get().settings };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  updateSettings: async (newSettings) => {
    const current = get().settings;
    const updated = { ...current, ...newSettings };

    set({ settings: updated });

    const stateToSave = { problems: get().problems, playlists: get().playlists, playlistVideos: get().playlistVideos, groups: get().groups, settings: updated };
    saveToLocalStorage(stateToSave);
    void syncDexie(stateToSave);
  },
  exportData: async () => {
    const exportObject = {
      version: 1,
      exportedAt: new Date().toISOString(),
      problems: get().problems,
      playlists: get().playlists,
      playlistVideos: get().playlistVideos,
      groups: get().groups,
      settings: get().settings
    };
    return JSON.stringify(exportObject, null, 2);
  },
  importData: async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!Array.isArray(parsed.problems) && !Array.isArray(parsed.playlists))) {
        return { success: false, error: "Invalid backup format. Expected problems or playlists array." };
      }
      const problems: Problem[] = Array.isArray(parsed.problems) ? parsed.problems : [];
      const playlists: Playlist[] = Array.isArray(parsed.playlists) ? parsed.playlists : [];
      const playlistVideos: PlaylistVideo[] = Array.isArray(parsed.playlistVideos) ? parsed.playlistVideos : [];
      const groups: ProblemGroup[] = Array.isArray(parsed.groups) ? parsed.groups : [];
      const settings: UserSettings = { ...defaultSettings, ...(parsed.settings || {}) };

      const stateToSave = { problems, playlists, playlistVideos, groups, settings };
      saveToLocalStorage(stateToSave);
      void syncDexie(stateToSave);

      await get().load();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to parse JSON file." };
    }
  },
  resetDatabase: async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    try {
      await db.transaction("rw", [db.problems, db.playlists, db.playlist_videos, db.settings, db.problem_groups], async () => {
        await db.problems.clear();
        await db.playlists.clear();
        await db.playlist_videos.clear();
        await db.settings.clear();
        await db.problem_groups.clear();
      });
    } catch {
      // Ignore Dexie clear error
    }
    await get().load();
  }
}));

