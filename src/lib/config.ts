// Modern yt-dlp config, TypeScript-style

export const YTDLP_CONFIG = {
  // Base yt-dlp options for quiet, parseable output
  baseOptions: [
    "--no-warnings",
    "--ignore-errors", // Continue on individual download errors
    "--flat-playlist",
    "--dump-single-json",
  ],

  // Video download options (prioritize highest quality)
  downloadOptions: {
    best: [
      "-f",
      "bestvideo[height<=2160]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/bestvideo+bestaudio/best[height<=2160]/best",
      "--merge-output-format",
      "mp4",
      "--embed-metadata",
      "--embed-thumbnail",
      "--remux-video",
      "mp4",
    ],
    "1080p": [
      "-f",
      "bestvideo[height<=1080]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]",
      "--merge-output-format",
      "mp4",
      "--embed-metadata",
      "--embed-thumbnail",
      "--remux-video",
      "mp4",
    ],
    "720p": [
      "-f",
      "bestvideo[height<=720]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]",
      "--merge-output-format",
      "mp4",
      "--embed-metadata",
      "--embed-thumbnail",
      "--remux-video",
      "mp4",
    ],
    "480p": [
      "-f",
      "bestvideo[height<=480]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]",
      "--merge-output-format",
      "mp4",
      "--embed-metadata",
      "--embed-thumbnail",
      "--remux-video",
      "mp4",
    ],
    audio: [
      "-f",
      "bestaudio[ext=m4a]/bestaudio/best",
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "320K",
      "--embed-metadata",
      "--embed-thumbnail",
    ],
  },

  // Metadata extraction and playlist info
  metadataOptions: [
    "--dump-single-json", // Preferred for detailed, single JSON blob
    "--no-download",
    "--flat-playlist",
  ],

  // Format/progression options (for listing and UX)
  formatOptions: ["--list-formats", "--no-download"],
  progressOptions: [
    "--newline",
    "--progress-template",
    "[download] %(progress._percent_str)s of %(progress._total_bytes_str)s at %(progress._speed_str)s ETA %(progress._eta_str)s",
  ] as const,

  // Subtitle download options
  subtitleOptions: [
    "--write-subs",
    "--write-auto-subs",
    "--sub-format",
    "srt/best",
  ],

  // Thumbnail/cover image options
  thumbnailOptions: ["--write-thumbnail", "--embed-thumbnail"],
} as const;

export const APP_CONFIG = {
  server: {
    port: process.env.PORT ?? 3000,
    host: process.env.HOST ?? "localhost",
  },

  downloads: {
    maxConcurrent: 3,
    timeoutMs: 300_000, // 5 minutes
    retryAttempts: 3,
    cleanupDelayMs: 60_000, // 1 minute
  },

  files: {
    maxSizeBytes: 2 * 1024 ** 3, // 2GB
    allowedExtensions: [".mp4", ".webm", ".mkv", ".mp3", ".wav", ".flac"],
    downloadPath: process.env.DOWNLOADS_PATH || "./downloads",
    tempPath: "./temp",
  },

  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
    },
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : true,
      credentials: true,
    },
  },

  ui: {
    theme: {
      default: "light",
      storageKey: "video-downloader-theme",
    },
    pagination: {
      itemsPerPage: 20,
    },
  },
} as const;

// Generate environment-specific config
export const getConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  return {
    ...APP_CONFIG,
    isDevelopment,
    isProduction,
    logging: {
      level: isDevelopment ? "debug" : "info",
      enableConsole: isDevelopment,
      enableFile: isProduction,
    },
  };
};
