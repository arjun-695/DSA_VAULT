export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemProgress = "Not started" | "Attempted" | "Review" | "Mastered";
export type ReviewFrequency = "Daily" | "Weekly" | "Monthly" | "Null";

export type Problem = {
  id?: number;
  name: string;
  url: string;
  platform?: string;
  notes: string;
  difficulty: Difficulty;
  progress: ProblemProgress;
  topic: string;
  time_complexity: string;
  space_complexity: string;
  time_spent: string;
  language: string;
  date_solved: string;
  companies: string;
  review_frequency: ReviewFrequency;
  next_review_date: string | null;
};

export type Todo = {
  kind: "problem";
  id: number;
  title: string;
  subtitle: string;
  meta: string;
  href?: string;
};

export type UserProfiles = {
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  atcoder?: string;
};

export type UserSettings = {
  id?: number;
  defaultReviewFrequency: ReviewFrequency;
  defaultLanguage: string;
  defaultDailyGoal: number;
  dailyIntervalDays: number;
  weeklyIntervalDays: number;
  monthlyIntervalDays: number;
  compactTableView: boolean;
  themeMode: "light" | "dark" | "system";
  profiles?: UserProfiles;
};

export type ProblemGroup = {
  id?: number;
  name: string;
  description: string;
  category: string;
  problemIds: number[];
  created_at: string;
};

export type PlatformStats = {
  platform: "LeetCode" | "CodeForces" | "CodeChef" | "AtCoder";
  username: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  solvedCount?: number;
  avatar?: string;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
};

export type UpcomingContest = {
  id: string;
  name: string;
  platform: "LeetCode" | "CodeForces" | "CodeChef" | "AtCoder" | "HackerRank" | "Other";
  start_time: string;
  end_time: string;
  duration: number;
  url: string;
};
