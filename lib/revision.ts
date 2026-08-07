import type { Problem, ReviewFrequency } from "./types";

export const REVIEW_DAYS: Record<Exclude<ReviewFrequency, "Null">, number> = {
  Daily: 1,
  Weekly: 7,
  Monthly: 30
};

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function calculateNextReviewDate(
  dateSolved: string,
  frequency: ReviewFrequency,
  customIntervals?: { Daily?: number; Weekly?: number; Monthly?: number }
) {
  if (frequency === "Null" || !dateSolved) return null;
  const days = customIntervals?.[frequency] ?? REVIEW_DAYS[frequency];
  return addDays(dateSolved, days);
}

export function prepareProblem(
  problem: Omit<Problem, "next_review_date"> | Problem,
  customIntervals?: { Daily?: number; Weekly?: number; Monthly?: number }
): Problem {
  return {
    ...problem,
    next_review_date: calculateNextReviewDate(problem.date_solved, problem.review_frequency, customIntervals)
  };
}

export function isDue(problem: Problem, today = dateKey()) {
  return Boolean(problem.next_review_date && problem.next_review_date <= today);
}
