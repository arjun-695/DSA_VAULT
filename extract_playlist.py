#!/usr/bin/env python3
"""
YouTube Playlist Link Extractor
--------------------------------
Optimized for zero or minimal API quota consumption.

Method 1: Zero-Quota Mode (Default - Recommended)
  Uses yt-dlp with `extract_flat` to fetch playlist metadata via YouTube web endpoints.
  - Quota Used: 0 units
  - API Key required: No

Method 2: Minimal YouTube Data API v3 Mode
  Uses official Google API with `maxResults=50` pagination.
  - Quota Used: 1 unit per 50 videos (e.g., 200 videos = 4 quota units out of 10,000 daily limit)
  - API Key required: Yes (YOUTUBE_API_KEY)
"""

import sys
import os
import argparse
import json
import csv
from typing import List, Dict, Any

# Method 1: Zero Quota (yt-dlp)
def extract_zero_quota(playlist_url: str) -> Dict[str, Any]:
    """Extract playlist links using yt-dlp without consuming any YouTube API quota."""
    try:
        import yt_dlp
    except ImportError:
        print("[!] Error: yt-dlp is required for zero-quota mode. Install via: pip install yt-dlp", file=sys.stderr)
        sys.exit(1)

    ydl_opts = {
        'extract_flat': 'in_playlist',
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
    }

    results = []
    playlist_title = "YouTube Playlist"

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)
        if not info:
            return {'title': playlist_title, 'videos': []}

        entries = info.get('entries', [])
        playlist_title = info.get('title', 'YouTube Playlist')

        for index, entry in enumerate(entries, 1):
            if not entry:
                continue
            video_id = entry.get('id')
            title = entry.get('title', 'Untitled Video')
            url = entry.get('url') or f"https://www.youtube.com/watch?v={video_id}"
            
            # Standardize YouTube URL format
            if video_id and not url.startswith("http"):
                url = f"https://www.youtube.com/watch?v={video_id}"

            thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg" if video_id else None

            results.append({
                'index': index,
                'title': title,
                'url': url,
                'video_url': url,
                'video_id': video_id,
                'thumbnail_url': thumbnail_url,
                'duration': entry.get('duration'),
                'uploader': entry.get('uploader') or entry.get('channel')
            })

    return {'title': playlist_title, 'videos': results}

# Method 2: Minimum API Quota (YouTube Data API v3)
def extract_minimal_api_quota(playlist_id: str, api_key: str) -> Dict[str, Any]:
    """
    Extract playlist links using official YouTube Data API v3.
    Uses maxResults=50 to fetch 50 items per request, costing only 1 quota unit per request.
    """
    try:
        from googleapiclient.discovery import build
    except ImportError:
        print("[!] Error: google-api-python-client is required for API mode. Install via: pip install google-api-python-client", file=sys.stderr)
        sys.exit(1)

    youtube = build('youtube', 'v3', developerKey=api_key)

    results = []
    next_page_token = None
    quota_units_used = 0
    index = 1
    playlist_title = "YouTube Playlist"

    # Get playlist title first
    try:
        pl_req = youtube.playlists().list(part='snippet', id=playlist_id)
        pl_res = pl_req.execute()
        quota_units_used += 1
        if pl_res.get('items'):
            playlist_title = pl_res['items'][0]['snippet'].get('title', playlist_title)
    except Exception:
        pass

    while True:
        # Request maximum 50 items per call (1 quota unit per call)
        request = youtube.playlistItems().list(
            part='snippet',
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token,
            fields='nextPageToken,items(snippet(title,resourceId/videoId,thumbnails))'
        )
        response = request.execute()
        quota_units_used += 1

        items = response.get('items', [])
        for item in items:
            snippet = item.get('snippet', {})
            video_id = snippet.get('resourceId', {}).get('videoId')
            title = snippet.get('title')
            thumb = snippet.get('thumbnails', {}).get('medium', {}).get('url')

            if video_id:
                url = f"https://www.youtube.com/watch?v={video_id}"
                results.append({
                    'index': index,
                    'title': title,
                    'url': url,
                    'video_url': url,
                    'video_id': video_id,
                    'thumbnail_url': thumb
                })
                index += 1

        next_page_token = response.get('nextPageToken')
        if not next_page_token:
            break

    return {'title': playlist_title, 'videos': results, 'quota_used': quota_units_used}

def save_output(data: Dict[str, Any], output_file: str, fmt: str):
    """Save results in plain text, CSV, or JSON format."""
    results = data.get('videos', [])
    if not results:
        print("[!] No results to save.", file=sys.stderr)
        return

    if fmt == 'txt':
        with open(output_file, 'w', encoding='utf-8') as f:
            for item in results:
                f.write(f"{item['url']}\n")
    elif fmt == 'csv':
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['index', 'title', 'url', 'video_id', 'duration', 'uploader'])
            writer.writeheader()
            for item in results:
                writer.writerow({
                    'index': item.get('index'),
                    'title': item.get('title'),
                    'url': item.get('url'),
                    'video_id': item.get('video_id'),
                    'duration': item.get('duration', ''),
                    'uploader': item.get('uploader', '')
                })
    elif fmt == 'json':
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[+] Output saved to '{output_file}' ({len(results)} links)", file=sys.stderr)

def parse_playlist_id(url_or_id: str) -> str:
    """Helper to extract playlist ID if full URL is passed."""
    if 'list=' in url_or_id:
        return url_or_id.split('list=')[1].split('&')[0]
    return url_or_id

def main():
    parser = argparse.ArgumentParser(description="Optimized YouTube Playlist Link Extractor (Zero or Minimal Quota)")
    parser.add_argument("playlist", help="YouTube Playlist URL or Playlist ID")
    parser.add_argument("-o", "--output", help="Output file path (default: links.txt)", default="links.txt")
    parser.add_argument("-f", "--format", choices=['txt', 'csv', 'json'], default='txt', help="Output format: txt (urls only), csv, or json")
    parser.add_argument("--api-key", help="YouTube Data API Key (if using official API mode)")
    parser.add_argument("--use-api", action="store_true", help="Force using YouTube Data API v3 instead of zero-quota yt-dlp")
    parser.add_argument("--stdout", action="store_true", help="Output JSON directly to stdout")

    args = parser.parse_args()

    if args.use_api:
        api_key = args.api_key or os.environ.get("YOUTUBE_API_KEY")
        if not api_key:
            print("[!] Error: YouTube Data API Key is required for API mode.", file=sys.stderr)
            sys.exit(1)
        playlist_id = parse_playlist_id(args.playlist)
        data = extract_minimal_api_quota(playlist_id, api_key)
    else:
        data = extract_zero_quota(args.playlist)

    if args.stdout:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps(data, ensure_ascii=False))
    else:
        save_output(data, args.output, args.format)

if __name__ == "__main__":
    main()
