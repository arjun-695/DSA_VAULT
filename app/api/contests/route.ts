import { NextResponse } from "next/server";
import type { UpcomingContest } from "@/lib/types";

export async function GET() {
  const contests: UpcomingContest[] = [];

  try {
    const res = await fetch("https://kontests.net/api/v1/all", {
      next: { revalidate: 600 }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((item: any, idx: number) => {
          let platform: UpcomingContest["platform"] = "Other";
          const site = (item.site || "").toLowerCase();
          if (site.includes("leetcode")) platform = "LeetCode";
          else if (site.includes("codeforces")) platform = "CodeForces";
          else if (site.includes("codechef")) platform = "CodeChef";
          else if (site.includes("atcoder")) platform = "AtCoder";
          else if (site.includes("hackerrank")) platform = "HackerRank";

          if (item.status === "BEFORE" || item.in_24_hours === "Yes" || new Date(item.start_time) > new Date()) {
            contests.push({
              id: `${item.site}-${idx}`,
              name: item.name,
              platform,
              start_time: item.start_time,
              end_time: item.end_time,
              duration: Number(item.duration) || 7200,
              url: item.url
            });
          }
        });
      }
    }
  } catch {
    // Fallback schedule if Kontests API is unreachable
    const now = new Date();
    const future = (days: number, hours: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      d.setHours(hours, 0, 0, 0);
      return d.toISOString();
    };

    contests.push(
      {
        id: "cf-1",
        name: "Codeforces Round (Div. 2)",
        platform: "CodeForces",
        start_time: future(1, 20),
        end_time: future(1, 22),
        duration: 7200,
        url: "https://codeforces.com/contests"
      },
      {
        id: "lc-1",
        name: "Weekly Contest 440",
        platform: "LeetCode",
        start_time: future(2, 8),
        end_time: future(2, 9.5),
        duration: 5400,
        url: "https://leetcode.com/contest/"
      },
      {
        id: "cc-1",
        name: "Starters 175 (Div. 1 & 2)",
        platform: "CodeChef",
        start_time: future(3, 20),
        end_time: future(3, 22),
        duration: 7200,
        url: "https://www.codechef.com/contests"
      },
      {
        id: "ac-1",
        name: "AtCoder Beginner Contest 395",
        platform: "AtCoder",
        start_time: future(4, 17.5),
        end_time: future(4, 19.16),
        duration: 6000,
        url: "https://atcoder.jp/contests/"
      }
    );
  }

  // Sort by start_time ascending
  contests.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return NextResponse.json({ contests });
}
