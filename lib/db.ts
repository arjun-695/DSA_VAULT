import Dexie, { type Table } from "dexie";
import type { Playlist, PlaylistVideo, Problem, ProblemGroup, UserSettings } from "./types";

export class VaultDatabase extends Dexie {
  problems!: Table<Problem, number>;
  playlists!: Table<Playlist, number>;
  playlist_videos!: Table<PlaylistVideo, number>;
  settings!: Table<UserSettings, number>;
  problem_groups!: Table<ProblemGroup, number>;

  constructor() {
    super("dsa-vault");
    this.version(1).stores({
      problems: "++id, name, url, difficulty, progress, topic, language, date_solved, review_frequency, next_review_date, time_spent",
      playlists: "++id, name, status, created_at",
      playlist_videos: "++id, playlist_id, assigned_date, is_completed",
      settings: "++id",
      problem_groups: "++id, name, category, created_at"
    });
  }
}

export const db = new VaultDatabase();


