// Application constants

// Download formats
export const DOWNLOAD_FORMATS = {
  BEST: "best",
  HD1080: "1080p",
  HD720: "720p",
  SD480: "480p",
  AUDIO: "audio",
  CUSTOM: "custom",
} as const;

// Format options for the UI
export const FORMAT_OPTIONS = [
  { value: "best", label: "Best Quality (4K/1080p + Audio)" },
  { value: "1080p", label: "1080p (High Quality)" },
  { value: "720p", label: "720p (Standard Quality)" },
  { value: "480p", label: "480p (Lower Quality)" },
  { value: "audio", label: "Audio Only (MP3 320k)" },
  { value: "custom", label: "Custom Format..." },
] as const;

// Supported video platforms
export const SUPPORTED_PLATFORMS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "twitch.tv",
  "tiktok.com",
  "instagram.com",
  "twitter.com",
  "x.com",
] as const;

// File paths and directories
export const PATHS = {
  DOWNLOADS: process.env.DOWNLOADS_PATH || "./downloads",
  TEMP: "./temp",
  LOGS: "./logs",
} as const;

// Download status
export const DOWNLOAD_STATUS = {
  PENDING: "pending",
  DOWNLOADING: "downloading",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

// Progress event types
export const PROGRESS_EVENTS = {
  PROGRESS: "progress",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  METADATA: "/api/metadata",
  DOWNLOAD: "/api/download",
  PROGRESS: "/api/progress",
  FILE: "/api/download",
} as const;

// UI constants
export const UI_CONSTANTS = {
  MAX_URL_LENGTH: 2048,
  MAX_FILENAME_LENGTH: 255,
  DEBOUNCE_DELAY: 300,
  PROGRESS_UPDATE_INTERVAL: 1000,
  MAX_CONCURRENT_DOWNLOADS: 3,
} as const;

// Theme constants
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "video-downloader-theme",
  HISTORY: "video-downloader-history",
  SETTINGS: "video-downloader-settings",
} as const;

// Default values
export const DEFAULTS = {
  FORMAT: DOWNLOAD_FORMATS.BEST,
  INCLUDE_SUBTITLES: false,
  EMBED_THUMBNAIL: true,
  BATCH_MODE: false,
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  URL: /^https?:\/\/.+/,
  FILENAME: /^[^<>:"/\\|?*]+$/,
  VIDEO_ID: /^[a-zA-Z0-9_-]+$/,
} as const;

// Error codes
export const ERROR_CODES = {
  INVALID_URL: "INVALID_URL",
  UNSUPPORTED_PLATFORM: "UNSUPPORTED_PLATFORM",
  VIDEO_UNAVAILABLE: "VIDEO_UNAVAILABLE",
  NETWORK_ERROR: "NETWORK_ERROR",
  SYSTEM_ERROR: "SYSTEM_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DOWNLOAD_FAILED: "DOWNLOAD_FAILED",
} as const;
