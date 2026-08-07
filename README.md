<div align="center">

  <!-- Dynamic SVG Hero Banner -->
  <img src="public/docs/hero_banner.svg" alt="DSA Vault Banner" width="100%" />

  <br /><br />

  <!-- Shield Badges Bar -->
  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15.1-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="#-zero-quota-youtube-importer"><img src="https://img.shields.io/badge/API_Quota-0_Units-10B981?style=for-the-badge&logo=youtube&logoColor=white" alt="0 API Quota" /></a>
    <a href="https://dexie.org"><img src="https://img.shields.io/badge/Database-Dexie.js_Offline-C084FC?style=for-the-badge&logo=indexeddb&logoColor=white" alt="Local First" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  </p>

  <p align="center">
    <b>DSA Vault</b> is a local-first, privacy-focused workspace designed for logging coding problems, mastering Data Structures &amp; Algorithms via <b>Spaced Repetition</b>, and extracting YouTube learning playlists with <b>Zero API Quota</b>.
  </p>

</div>

---

## 📌 Table of Contents

- [✨ Key Features](#-key-features)
- [⚡ Zero-Quota YouTube Importer](#-zero-quota-youtube-importer)
- [🧠 Spaced Repetition Engine](#-spaced-repetition-engine)
- [📐 System Architecture](#-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [💻 Command-Line Interface (CLI)](#-command-line-interface-cli)
- [🛠️ Tech Stack](#️-tech-stack)
- [❓ Frequently Asked Questions](#-frequently-asked-questions)

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%" fill="#1e293b">
      <h3>🛡️ Local-First &amp; 100% Offline</h3>
      <p>Your problem data, notes, and study progress stay strictly in your browser using <b>Dexie.js (IndexedDB)</b> and <b>LocalStorage</b>. Zero accounts, zero tracking, zero server latency.</p>
    </td>
    <td width="50%">
      <h3>⚡ Zero-Quota YouTube Playlist Extraction</h3>
      <p>Extract hundreds of playlist videos in seconds using our integrated <code>yt-dlp</code> flat-scraper. Consumes <b>0 units of YouTube API quota</b> and requires no Google Developer API keys.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🧠 Ebbinghaus Spaced Repetition</h3>
      <p>Automated revision schedule based on memory retention curves. Automatically calculates next review dates for <b>Daily (1d)</b>, <b>Weekly (7d)</b>, and <b>Monthly (30d)</b> reviews.</p>
    </td>
    <td width="50%">
      <h3>📊 52-Week Visual Heatmap &amp; Analytics</h3>
      <p>Track your daily coding streak, problem difficulty breakdown (Easy, Medium, Hard), language stats, and total task completions with interactive <b>@visx</b> charts.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🏆 Competitive Programming &amp; Contests</h3>
      <p>Integrated profile tracking for <b>LeetCode</b>, <b>Codeforces</b>, <b>CodeChef</b>, and <b>AtCoder</b> alongside live contest schedule reminders.</p>
    </td>
    <td width="50%">
      <h3>📁 Complete Data Portability</h3>
      <p>One-click <b>JSON Export &amp; Import</b> engine. Backup your entire problem vault or migrate seamlessly across devices with zero data loss.</p>
    </td>
  </tr>
</table>

---

## ⚡ Zero-Quota YouTube Importer

DSA Vault includes an optimized playlist extraction engine designed to extract full YouTube playlists without burning through your free daily Google API quota.

<p align="center">
  <img src="public/docs/architecture_flow.svg" alt="Zero Quota Architecture" width="100%" />
</p>

### ⚖️ Extraction Method Comparison

| Feature | Option 1: Zero-Quota Engine (Default) | Option 2: YouTube Data API v3 |
| :--- | :---: | :---: |
| **API Quota Cost** | **`0 Units` (100% Free)** | `1 Unit per 50 videos` |
| **API Key Required?** | ❌ **No Key Required** | ⚠️ Required (`YOUTUBE_API_KEY`) |
| **Daily Quota Limit** | **Unlimited** | 10,000 Units / Day |
| **Extraction Engine** | `yt-dlp` Flat-Playlist Scraper | Google Cloud REST API |
| **Extracted Metadata** | Title, URL, Video ID, Duration, Thumbnail | Title, URL, Video ID, Thumbnail |

<details>
<summary><b>🔍 How Option 1 (Zero-Quota) Works under the hood</b> (Click to expand)</summary>

<br />

When you paste a YouTube playlist URL into DSA Vault:
1. Next.js server route `/api/youtube/playlist` invokes `extract_playlist.py` in non-downloading `extract_flat` mode.
2. `yt-dlp` fetches playlist metadata directly from YouTube web endpoints in 1-2 HTTP requests.
3. The extracted video list is automatically split into daily learning chunks based on your configured `dailyGoal` and scheduled into your daily todo list.
4. If Python/`yt-dlp` is unavailable, the route gracefully falls back to Option 2 if an API key is present.

</details>

---

## 🧠 Spaced Repetition Engine

DSA Vault implements the **Ebbinghaus Forgetting Curve** model to ensure you never forget solved problems.

<p align="center">
  <img src="public/docs/spaced_repetition.svg" alt="Spaced Repetition Curve" width="100%" />
</p>

### 🔄 Revision Workflow
1. **Problem Logged**: You solve a problem (e.g., *Two Sum*) and assign a review frequency (**Daily**, **Weekly**, or **Monthly**).
2. **Automated Calculation**:
   - `Daily`: Next review in **+1 day**
   - `Weekly`: Next review in **+7 days**
   - `Monthly`: Next review in **+30 days**
3. **Due Notification**: When a problem reaches its review date, it automatically appears in **Today's Revision Todos**.
4. **Mastery Progression**: Solved reviews increase retention strength until the problem reaches **Mastered** status.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python 3**: (Required for Option 1 zero-quota playlist extraction)
- **yt-dlp**: `pip install yt-dlp`

### 1. Clone &amp; Install Dependencies
```bash
git clone https://github.com/your-username/dsa-vault.git
cd dsa-vault
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app initializes with sample DSA problems so you can start testing immediately!

---

## 💻 Command-Line Interface (CLI)

You can also use the standalone zero-quota Python extractor from the command line:

<details open>
<summary><b>🛠️ CLI Usage Examples</b></summary>

<br />

```bash
# 1. Extract video URLs to a text file (0 API Quota)
python extract_playlist.py "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj" -o links.txt

# 2. Export full playlist metadata as JSON (Title, URL, Video ID, Duration, Thumbnails)
python extract_playlist.py "PLAYLIST_URL" -o playlist.json -f json

# 3. Export as CSV for Excel / Spreadsheets
python extract_playlist.py "PLAYLIST_URL" -o playlist.csv -f csv

# 4. Stream JSON directly to stdout
python extract_playlist.py "PLAYLIST_URL" --stdout
```

</details>

---

## 🛠️ Tech Stack

<details open>
<summary><b>📦 Core Frameworks &amp; Libraries</b></summary>

<br />

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Frontend Logic**: [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Local Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Data Visualization**: [@visx](https://airbnb.io/visx/) heatmap &amp; chart tools
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Playlist Extraction**: [yt-dlp](https://github.com/yt-dlp/yt-dlp) Zero-Quota Python Engine

</details>

---

## ❓ Frequently Asked Questions

<details>
<summary><b>🔒 Is my data safe &amp; private?</b></summary>
<br />
Yes! DSA Vault operates 100% locally inside your web browser. All problem entries, notes, playlist progress, and settings are stored locally in IndexedDB via Dexie.js. No telemetry or tracking scripts are included.
</details>

<details>
<summary><b>🔑 Do I need a YouTube Data API key to import playlists?</b></summary>
<br />
No! Thanks to Option 1 (zero-quota <code>yt-dlp</code> integration), you do not need any API keys or Google Cloud accounts. It extracts full playlists for free without consuming API quota.
</details>

<details>
<summary><b>💾 How do I backup my problem vault?</b></summary>
<br />
Navigate to the <b>Settings</b> tab in the app and click <b>Export Data</b>. This downloads a complete <code>dsa_vault_backup.json</code> file containing all your problems, playlists, groups, and interval settings.
</details>

<details>
<summary><b>⚙️ Can I customize review intervals?</b></summary>
<br />
Yes! In <b>Settings</b>, you can adjust custom interval lengths for Daily, Weekly, and Monthly reviews (e.g., set Daily to 2 days, Weekly to 10 days, or Monthly to 45 days).
</details>

---

<div align="center">
  <p>Crafted for competitive programmers &amp; software engineers aiming for mastery. 🚀</p>
  <p><b>DSA Vault</b> • <i>Build streaks, master patterns, remember forever.</i></p>
</div>