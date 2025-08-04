"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  VideoMetadata,
  Format,
  DownloadRequest,
  DownloadResponse,
  MetadataResponse,
  PlaylistVideo,
} from "@/types";
import { DOWNLOAD_FORMATS } from "@/lib/constants";
import { ErrorHandler } from "@/lib/errors";

interface UseVideoDownloadState {
  // Metadata state
  metadata: VideoMetadata | null;
  formats: Format[];
  isLoadingMetadata: boolean;
  metadataError: string | null;

  // Playlist state
  isPlaylist: boolean;
  playlistVideos: PlaylistVideo[];
  selectedPlaylistVideos: PlaylistVideo[];

  // Download state
  selectedFormat: string;
  isDownloading: boolean;
  downloadProgress: number;
  downloadError: string | null;
  downloadComplete: boolean;
  downloadedFilename: string | null;
  terminalOutput: string[];

  // Subtitle and thumbnail options
  includeSubtitles: boolean;
  selectedSubtitleLanguage: string;
  embedThumbnail: boolean;

  // Actions
  fetchMetadata: (url: string) => Promise<void>;
  setSelectedFormat: (format: string) => void;
  setSelectedPlaylistVideos: (videos: PlaylistVideo[]) => void;
  setIncludeSubtitles: (include: boolean) => void;
  setSelectedSubtitleLanguage: (language: string) => void;
  setEmbedThumbnail: (embed: boolean) => void;
  startDownload: (
    url: string,
    options?: Partial<DownloadRequest>
  ) => Promise<void>;
  startPlaylistDownload: (selectedVideos: PlaylistVideo[]) => Promise<void>;
  resetState: () => void;
}

export function useVideoDownload(): UseVideoDownloadState {
  // Metadata state
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [formats, setFormats] = useState<Format[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Playlist state
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [selectedPlaylistVideos, setSelectedPlaylistVideos] = useState<
    PlaylistVideo[]
  >([]);

  // Download state
  const [selectedFormat, setSelectedFormat] = useState<string>(
    DOWNLOAD_FORMATS.BEST
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(
    null
  );
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  // Subtitle and thumbnail options
  const [includeSubtitles, setIncludeSubtitles] = useState(false);
  const [selectedSubtitleLanguage, setSelectedSubtitleLanguage] =
    useState("en");
  const [embedThumbnail, setEmbedThumbnail] = useState(true);

  // Ref to store cleanup functions
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  const fetchMetadata = useCallback(async (url: string) => {
    setIsLoadingMetadata(true);
    setMetadataError(null);
    setMetadata(null);
    setFormats([]);

    try {
      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch metadata");
      }

      const data: MetadataResponse = await response.json();

      setMetadata({
        id: url, // Use URL as ID for now
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration,
        uploader: data.uploader,
        uploadDate: new Date().toISOString().split("T")[0], // Default to today
      });

      // Handle playlist data
      setIsPlaylist(data.isPlaylist);
      if (data.isPlaylist && data.playlistVideos) {
        setPlaylistVideos(data.playlistVideos);
        setSelectedPlaylistVideos([]); // Reset selection
      } else {
        setPlaylistVideos([]);
        setSelectedPlaylistVideos([]);
      }

      if (data.formats) {
        setFormats(data.formats);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMetadataError(errorMessage);
    } finally {
      setIsLoadingMetadata(false);
    }
  }, []);

  const startDownload = useCallback(
    async (url: string, options: Partial<DownloadRequest> = {}) => {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress(0);
      setDownloadComplete(false);
      setDownloadedFilename(null);
      setTerminalOutput([]);

      let eventSource: EventSource | null = null;

      try {
        const downloadRequest: DownloadRequest = {
          url,
          format: selectedFormat as any,
          customFormat:
            selectedFormat !== DOWNLOAD_FORMATS.BEST &&
            selectedFormat !== DOWNLOAD_FORMATS.AUDIO &&
            selectedFormat !== DOWNLOAD_FORMATS.HD1080 &&
            selectedFormat !== DOWNLOAD_FORMATS.HD720 &&
            selectedFormat !== DOWNLOAD_FORMATS.SD480
              ? selectedFormat
              : undefined,
          includeSubtitles,
          subtitleLanguage: includeSubtitles
            ? selectedSubtitleLanguage
            : undefined,
          embedThumbnail:
            selectedFormat === DOWNLOAD_FORMATS.AUDIO ? embedThumbnail : false,
          ...options,
        };

        const response = await fetch("/api/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(downloadRequest),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Download failed");
        }

        const data: DownloadResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Download failed");
        }

        // Set up progress tracking via Server-Sent Events
        if (data.downloadId) {
          // Add a small delay before connecting to progress API to avoid race condition
          setTimeout(() => {
            eventSource = new EventSource(`/api/progress/${data.downloadId}`);

            eventSource.onmessage = (event) => {
              try {
                const progressData = JSON.parse(event.data);

                switch (progressData.type) {
                  case "progress":
                    setDownloadProgress(progressData.progress || 0);
                    if (progressData.terminalOutput) {
                      setTerminalOutput(progressData.terminalOutput);
                    }
                    break;

                  case "complete":
                    setDownloadProgress(100);
                    setDownloadComplete(true);
                    setDownloadedFilename(
                      progressData.filename || data.filename || null
                    );
                    setIsDownloading(false);
                    if (eventSource) {
                      eventSource.close();
                      eventSource = null;
                    }
                    break;

                  case "error":
                    setDownloadError(progressData.error || "Download failed");
                    setIsDownloading(false);
                    if (eventSource) {
                      eventSource.close();
                      eventSource = null;
                    }
                    break;
                }
              } catch (error) {
                console.error("Error parsing progress data:", error);
                setDownloadError("Failed to track download progress");
                setIsDownloading(false);
                if (eventSource) {
                  eventSource.close();
                  eventSource = null;
                }
              }
            };

            eventSource.onerror = (error) => {
              console.error("EventSource error:", error);
              if (eventSource) {
                eventSource.close();
                eventSource = null;
              }

              // Don't immediately show error - the download might still be working
              // The progress API will retry and find the download
              console.log(
                "EventSource connection lost, but download may still be in progress"
              );
            };
          }, 200); // Wait 200ms before connecting to progress API
        } else {
          // No download ID provided
          setDownloadError("Failed to start download - no download ID");
          setIsDownloading(false);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setDownloadError(errorMessage);
        setIsDownloading(false);

        // Clean up EventSource on error
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      }

      // Store cleanup function
      const cleanup = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };

      cleanupRef.current = cleanup;
    },
    [selectedFormat, includeSubtitles, selectedSubtitleLanguage, embedThumbnail]
  );

  const startPlaylistDownload = useCallback(
    async (selectedVideos: PlaylistVideo[]) => {
      if (selectedVideos.length === 0) {
        setDownloadError("No videos selected for download");
        return;
      }

      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress(0);
      setDownloadComplete(false);
      setDownloadedFilename(null);

      try {
        // For now, download videos sequentially
        // In a real implementation, you might want to batch them or download in parallel
        let completedCount = 0;
        const totalCount = selectedVideos.length;

        for (const video of selectedVideos) {
          try {
            await startDownload(video.url);
            completedCount++;
            setDownloadProgress((completedCount / totalCount) * 100);
          } catch (error) {
            console.error(`Failed to download video ${video.title}:`, error);
            // Continue with other videos
          }
        }

        setDownloadComplete(true);
        setDownloadedFilename(`${completedCount} videos downloaded`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Playlist download failed";
        setDownloadError(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    },
    [startDownload]
  );

  const resetState = useCallback(() => {
    // Clean up any active downloads
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setMetadata(null);
    setFormats([]);
    setMetadataError(null);
    setIsPlaylist(false);
    setPlaylistVideos([]);
    setSelectedPlaylistVideos([]);
    setSelectedFormat(DOWNLOAD_FORMATS.BEST);
    setIncludeSubtitles(false);
    setSelectedSubtitleLanguage("en");
    setEmbedThumbnail(true);
    setIsDownloading(false);
    setDownloadProgress(0);
    setDownloadError(null);
    setDownloadComplete(false);
    setDownloadedFilename(null);
    setTerminalOutput([]);
  }, []);

  return {
    // Metadata state
    metadata,
    formats,
    isLoadingMetadata,
    metadataError,

    // Playlist state
    isPlaylist,
    playlistVideos,
    selectedPlaylistVideos,

    // Download state
    selectedFormat,
    isDownloading,
    downloadProgress,
    downloadError,
    downloadComplete,
    downloadedFilename,
    terminalOutput,

    // Subtitle and thumbnail options
    includeSubtitles,
    selectedSubtitleLanguage,
    embedThumbnail,

    // Actions
    fetchMetadata,
    setSelectedFormat,
    setSelectedPlaylistVideos,
    setIncludeSubtitles,
    setSelectedSubtitleLanguage,
    setEmbedThumbnail,
    startDownload,
    startPlaylistDownload,
    resetState,
  };
}
