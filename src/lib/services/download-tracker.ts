import { DownloadRequest, DownloadResponse } from "@/types";

// Store active downloads for progress tracking
export const activeDownloads = new Map<
  string,
  {
    progress: number;
    status: "downloading" | "complete" | "error";
    filename?: string;
    error?: string;
    timestamp: number;
    terminalOutput: string[];
  }
>();

// Clean up old downloads (older than 1 hour)
const cleanupOldDownloads = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [downloadId, data] of activeDownloads.entries()) {
    if (
      data.timestamp < oneHourAgo &&
      (data.status === "complete" || data.status === "error")
    ) {
      activeDownloads.delete(downloadId);
    }
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupOldDownloads, 10 * 60 * 1000);