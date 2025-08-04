// Core data types for the video downloader application

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  uploadDate: string;
  viewCount?: number;
  description?: string;
}

export interface Format {
  formatId: string;
  ext: string;
  resolution?: string;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  quality: string;
}

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  url: string;
  selected: boolean;
}

export interface DownloadJob {
  id: string;
  url: string;
  status: "pending" | "downloading" | "complete" | "error";
  progress: number;
  filename?: string;
  error?: string;
  metadata: VideoMetadata;
  options: DownloadOptions;
  createdAt: Date;
}

export interface DownloadHistory {
  id: string;
  url: string;
  filename: string;
  downloadedAt: Date;
  format: string;
  metadata: VideoMetadata;
}

export interface DownloadOptions {
  url: string;
  format: string;
  outputPath: string;
  includeSubtitles: boolean;
  subtitleLanguage?: string;
  customFilename?: string;
  embedThumbnail?: boolean;
  onProgress?: (progress: number) => void;
  onTerminalOutput?: (output: string) => void;
}

// API Request/Response types
export interface DownloadRequest {
  url: string;
  format: "best" | "audio" | "custom";
  customFormat?: string;
  includeSubtitles?: boolean;
  subtitleLanguage?: string;
  customFilename?: string;
  embedThumbnail?: boolean;
}

export interface DownloadResponse {
  success: boolean;
  filename?: string;
  error?: string;
  downloadId: string;
}

export interface MetadataRequest {
  url: string;
}

export interface MetadataResponse {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats?: Format[];
  isPlaylist: boolean;
  playlistVideos?: PlaylistVideo[];
}

export interface ProgressEvent {
  type: "progress" | "complete" | "error" | "terminal";
  downloadId: string;
  progress?: number;
  filename?: string;
  error?: string;
  terminalOutput?: string[];
}

// Application state types
export interface AppState {
  downloads: DownloadJob[];
  history: DownloadHistory[];
  theme: "light" | "dark";
  batchMode: boolean;
}

export interface DownloadState {
  currentUrl: string;
  metadata: VideoMetadata | null;
  selectedFormat: string;
  includeSubtitles: boolean;
  customFilename: string;
  isLoading: boolean;
  error: string | null;
}

// Error handling types
export interface UserFriendlyError {
  message: string;
  type: "warning" | "error" | "info";
  recoverable: boolean;
  suggestions?: string[];
}

export type ErrorType = "validation" | "ytdlp" | "system" | "application";
