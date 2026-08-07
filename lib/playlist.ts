import type { PlaylistVideo } from "./types";

export function extractPlaylistId(value: string) {
  try {
    const url = new URL(value);
    return url.searchParams.get("list") || (url.pathname.startsWith("/playlist/") ? url.pathname.split("/")[2] : null);
  } catch {
    return null;
  }
}

export function schedulePlaylistVideos(
  videos: Omit<PlaylistVideo, "id" | "assigned_date" | "is_completed">[],
  dailyGoal: number,
  startDate = new Date()
): PlaylistVideo[] {
  const safeGoal = Math.max(1, Math.floor(dailyGoal));
  return videos.map((video, index) => {
    const assigned = new Date(startDate);
    assigned.setHours(12, 0, 0, 0);
    assigned.setDate(assigned.getDate() + Math.floor(index / safeGoal));
    return { ...video, assigned_date: dateKeyFromDate(assigned), is_completed: false };
  });
}

function dateKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
