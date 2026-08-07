import { NextRequest, NextResponse } from "next/server";
import { extractPlaylistId } from "@/lib/playlist";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

type ExtractedVideo = {
  title: string;
  video_url: string;
  thumbnail_url?: string;
};

type ExtractedData = {
  title?: string;
  videos?: ExtractedVideo[];
};

type YouTubeItem = {
  snippet?: { title?: string; resourceId?: { videoId?: string }; thumbnails?: { medium?: { url?: string } } };
};

/**
 * Option 1: Zero-Quota Extraction using yt-dlp via Python script.
 * Uses 0 YouTube API quota units and requires NO API Key.
 */
async function extractZeroQuota(playlistUrl: string): Promise<ExtractedData | null> {
  try {
    const scriptPath = path.join(process.cwd(), "extract_playlist.py");
    const { stdout } = await execFileAsync("python", [scriptPath, playlistUrl, "--stdout"], {
      timeout: 20000,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });

    if (!stdout || !stdout.trim()) return null;

    const parsed = JSON.parse(stdout.trim()) as ExtractedData;
    if (parsed && Array.isArray(parsed.videos) && parsed.videos.length > 0) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Option 1 (yt-dlp zero-quota) failed or timed out:", error);
    return null;
  }
}

/**
 * Option 2: Fallback using official YouTube Data API v3 (if YOUTUBE_API_KEY is provided).
 * Uses maxResults=50 (1 quota unit per 50 videos).
 */
async function extractMinimalApiQuota(playlistId: string, apiKey: string): Promise<ExtractedData | null> {
  const videos: ExtractedVideo[] = [];
  let pageToken = "";
  let playlistTitle = "YouTube playlist";

  try {
    do {
      const params = new URLSearchParams({
        part: "snippet",
        maxResults: "50",
        playlistId,
        key: apiKey,
        fields: "nextPageToken,items(snippet(title,resourceId/videoId,thumbnails))"
      });
      if (pageToken) params.set("pageToken", pageToken);

      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`, { next: { revalidate: 3600 } });
      if (!response.ok) break;

      const data = (await response.json()) as { nextPageToken?: string; items?: YouTubeItem[] };
      for (const item of data.items ?? []) {
        const videoId = item.snippet?.resourceId?.videoId;
        if (!videoId) continue;
        videos.push({
          title: item.snippet?.title || "Untitled video",
          video_url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
          thumbnail_url: item.snippet?.thumbnails?.medium?.url
        });
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    if (videos.length > 0) {
      const playlistParams = new URLSearchParams({ part: "snippet", id: playlistId, key: apiKey });
      const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?${playlistParams}`, { next: { revalidate: 3600 } });
      if (playlistResponse.ok) {
        const data = (await playlistResponse.json()) as { items?: { snippet?: { title?: string } }[] };
        playlistTitle = data.items?.[0]?.snippet?.title || playlistTitle;
      }
      return { title: playlistTitle, videos };
    }
  } catch (err) {
    console.error("API quota extraction fallback failed:", err);
  }

  return null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const playlistId = url ? extractPlaylistId(url) : null;

  if (!url || !playlistId) {
    return NextResponse.json({ error: "Enter a valid YouTube playlist URL." }, { status: 400 });
  }

  // 1. Try Option 1: Zero-Quota Mode (yt-dlp)
  const zeroQuotaResult = await extractZeroQuota(url);
  if (zeroQuotaResult && zeroQuotaResult.videos && zeroQuotaResult.videos.length > 0) {
    return NextResponse.json({
      playlistId,
      title: zeroQuotaResult.title || "YouTube Playlist",
      videos: zeroQuotaResult.videos
    });
  }

  // 2. Fallback to Option 2 (YouTube API v3) if API Key is configured
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    const apiResult = await extractMinimalApiQuota(playlistId, apiKey);
    if (apiResult && apiResult.videos && apiResult.videos.length > 0) {
      return NextResponse.json({
        playlistId,
        title: apiResult.title || "YouTube Playlist",
        videos: apiResult.videos
      });
    }
  }

  return NextResponse.json(
    { error: "Could not extract videos from that playlist. Make sure the playlist is public and valid." },
    { status: 502 }
  );
}
