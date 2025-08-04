import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL validation utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isVideoUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;

  const videoPatterns = [
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /vimeo\.com\//,
    /dailymotion\.com\//,
    /twitch\.tv\//,
    /tiktok\.com\//,
    /instagram\.com\//,
    /twitter\.com\//,
    /x\.com\//,
  ];

  return videoPatterns.some((pattern) => pattern.test(url));
}

export function isPlaylistUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;

  const playlistPatterns = [
    /youtube\.com\/playlist/,
    /youtube\.com\/watch.*list=/,
    /youtu\.be\/.*list=/,
  ];

  return playlistPatterns.some((pattern) => pattern.test(url));
}

// File utilities
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .trim();
}

export function getFileExtension(format: string): string {
  const extensionMap: Record<string, string> = {
    best: "mp4",
    audio: "mp3",
    mp4: "mp4",
    webm: "webm",
    mkv: "mkv",
    mp3: "mp3",
    wav: "wav",
    flac: "flac",
  };

  return extensionMap[format] || "mp4";
}

// Time formatting utilities
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Progress utilities
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.max((current / total) * 100, 0), 100);
}

// Array utilities
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
