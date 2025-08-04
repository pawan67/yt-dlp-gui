"use client";

import { useState, useCallback, useRef } from "react";
import { DownloadJob, DownloadRequest, VideoMetadata } from "@/types";
import { generateId } from "@/lib/utils";
import { DOWNLOAD_FORMATS } from "@/lib/constants";

interface UseDownloadManagerState {
  downloads: DownloadJob[];
  activeDownloadCount: number;
  maxConcurrentDownloads: number;

  // Actions
  addDownload: (
    metadata: VideoMetadata,
    options: Partial<DownloadRequest>
  ) => string;
  cancelDownload: (downloadId: string) => void;
  retryDownload: (downloadId: string) => void;
  clearCompleted: () => void;
  setMaxConcurrentDownloads: (max: number) => void;
}

export function useDownloadManager(
  maxConcurrent: number = 3
): UseDownloadManagerState {
  const [downloads, setDownloads] = useState<DownloadJob[]>([]);
  const [maxConcurrentDownloads, setMaxConcurrentDownloads] =
    useState(maxConcurrent);
  const activeDownloadRefs = useRef<Map<string, AbortController>>(new Map());

  const activeDownloadCount = downloads.filter(
    (d) => d.status === "downloading" || d.status === "pending"
  ).length;

  const addDownload = useCallback(
    (metadata: VideoMetadata, options: Partial<DownloadRequest>): string => {
      const downloadId = generateId();

      const downloadJob: DownloadJob = {
        id: downloadId,
        url: options.url || metadata.id,
        status: "pending",
        progress: 0,
        metadata,
        options: {
          url: options.url || metadata.id,
          format: options.format || DOWNLOAD_FORMATS.BEST,
          outputPath: process.env.DOWNLOADS_PATH || "./downloads",
          includeSubtitles: options.includeSubtitles || false,
          subtitleLanguage: options.subtitleLanguage,
          customFilename: options.customFilename,
          embedThumbnail: options.embedThumbnail || false,
        },
        createdAt: new Date(),
      };

      setDownloads((prev) => [...prev, downloadJob]);

      // Start download if we haven't reached the concurrent limit
      const currentActive = downloads.filter(
        (d) => d.status === "downloading"
      ).length;
      if (currentActive < maxConcurrentDownloads) {
        startDownload(downloadId);
      }

      return downloadId;
    },
    [maxConcurrentDownloads]
  );

  const startDownload = useCallback(
    async (downloadId: string) => {
      const download = downloads.find((d) => d.id === downloadId);
      if (!download || download.status !== "pending") return;

      // Update status to downloading
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === downloadId
            ? { ...d, status: "downloading" as const, progress: 0 }
            : d
        )
      );

      try {
        const abortController = new AbortController();
        activeDownloadRefs.current.set(downloadId, abortController);

        const downloadRequest: DownloadRequest = {
          url: download.options.url,
          format: download.options.format as any,
          customFormat:
            download.options.format !== DOWNLOAD_FORMATS.BEST &&
            download.options.format !== DOWNLOAD_FORMATS.AUDIO
              ? download.options.format
              : undefined,
          includeSubtitles: download.options.includeSubtitles,
          subtitleLanguage: download.options.subtitleLanguage,
          customFilename: download.options.customFilename,
          embedThumbnail: download.options.embedThumbnail,
        };

        const response = await fetch("/api/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(downloadRequest),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Download failed");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Download failed");
        }

        // Set up progress tracking via Server-Sent Events
        if (data.downloadId) {
          const eventSource = new EventSource(
            `/api/progress/${data.downloadId}`
          );

          eventSource.onmessage = (event) => {
            try {
              const progressData = JSON.parse(event.data);

              switch (progressData.type) {
                case "progress":
                  setDownloads((prev) =>
                    prev.map((d) =>
                      d.id === downloadId
                        ? { ...d, progress: progressData.progress || 0 }
                        : d
                    )
                  );
                  break;

                case "complete":
                  setDownloads((prev) =>
                    prev.map((d) =>
                      d.id === downloadId
                        ? {
                            ...d,
                            status: "complete" as const,
                            progress: 100,
                            filename: progressData.filename || data.filename,
                          }
                        : d
                    )
                  );
                  eventSource.close();
                  activeDownloadRefs.current.delete(downloadId);
                  processQueue();
                  break;

                case "error":
                  setDownloads((prev) =>
                    prev.map((d) =>
                      d.id === downloadId
                        ? {
                            ...d,
                            status: "error" as const,
                            error: progressData.error || "Download failed",
                          }
                        : d
                    )
                  );
                  eventSource.close();
                  activeDownloadRefs.current.delete(downloadId);
                  processQueue();
                  break;
              }
            } catch (error) {
              console.error("Error parsing progress data:", error);
            }
          };

          eventSource.onerror = () => {
            eventSource.close();
            // If we don't have progress data, assume download completed
            setDownloads((prev) =>
              prev.map((d) =>
                d.id === downloadId && d.status === "downloading"
                  ? {
                      ...d,
                      status: "complete" as const,
                      progress: 100,
                      filename: data.filename,
                    }
                  : d
              )
            );
            activeDownloadRefs.current.delete(downloadId);
            processQueue();
          };
        } else {
          // No progress tracking, assume immediate completion
          setDownloads((prev) =>
            prev.map((d) =>
              d.id === downloadId
                ? {
                    ...d,
                    status: "complete" as const,
                    progress: 100,
                    filename: data.filename,
                  }
                : d
            )
          );
          activeDownloadRefs.current.delete(downloadId);
          processQueue();
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Download was cancelled
          setDownloads((prev) => prev.filter((d) => d.id !== downloadId));
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          setDownloads((prev) =>
            prev.map((d) =>
              d.id === downloadId
                ? { ...d, status: "error" as const, error: errorMessage }
                : d
            )
          );
        }
        activeDownloadRefs.current.delete(downloadId);
        processQueue();
      }
    },
    [downloads, maxConcurrentDownloads]
  );

  const processQueue = useCallback(() => {
    setDownloads((prev) => {
      const pendingDownloads = prev.filter((d) => d.status === "pending");
      const activeDownloads = prev.filter((d) => d.status === "downloading");

      // Start pending downloads if we have capacity
      const availableSlots = maxConcurrentDownloads - activeDownloads.length;
      const toStart = pendingDownloads.slice(0, availableSlots);

      toStart.forEach((download) => {
        setTimeout(() => startDownload(download.id), 0);
      });

      return prev;
    });
  }, [maxConcurrentDownloads, startDownload]);

  const cancelDownload = useCallback(
    (downloadId: string) => {
      const abortController = activeDownloadRefs.current.get(downloadId);
      if (abortController) {
        abortController.abort();
        activeDownloadRefs.current.delete(downloadId);
      }

      setDownloads((prev) => prev.filter((d) => d.id !== downloadId));
      processQueue();
    },
    [processQueue]
  );

  const retryDownload = useCallback(
    (downloadId: string) => {
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === downloadId
            ? {
                ...d,
                status: "pending" as const,
                progress: 0,
                error: undefined,
              }
            : d
        )
      );
      processQueue();
    },
    [processQueue]
  );

  const clearCompleted = useCallback(() => {
    setDownloads((prev) => prev.filter((d) => d.status !== "complete"));
  }, []);

  return {
    downloads,
    activeDownloadCount,
    maxConcurrentDownloads,
    addDownload,
    cancelDownload,
    retryDownload,
    clearCompleted,
    setMaxConcurrentDownloads,
  };
}
