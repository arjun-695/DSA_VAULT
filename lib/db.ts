import Dexie, { type Table } from "dexie";
import type { Problem, ProblemGroup, UserSettings } from "./types";

export class VaultDatabase extends Dexie {
  problems!: Table<Problem, number>;
  settings!: Table<UserSettings, number>;
  problem_groups!: Table<ProblemGroup, number>;

  constructor() {
    super("dsa-vault");
    this.version(1).stores({
      problems: "++id, name, url, difficulty, progress, topic, language, date_solved, review_frequency, next_review_date, time_spent",
      settings: "++id",
      problem_groups: "++id, name, category, created_at"
    });
  }
}

export const db = new VaultDatabase();
