import { NextRequest, NextResponse } from "next/server";
import { YtDlpService } from "@/lib/services";
import { ErrorHandler } from "@/lib/errors";
import { isValidUrl, isVideoUrl, sanitizeFilename } from "@/lib/utils";
import { PATHS, DOWNLOAD_FORMATS } from "@/lib/constants";
import { DownloadRequest, DownloadResponse } from "@/types";
import { activeDownloads } from "@/lib/services/download-tracker";
import path from "path";
import { promises as fs } from "fs";

export async function POST(request: NextRequest) {
  try {
    const body: DownloadRequest = await request.json();
    const {
      url,
      format,
      customFormat,
      includeSubtitles = false,
      subtitleLanguage,
      customFilename,
      embedThumbnail = false,
    } = body;

    // Validate required fields
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required and must be a string" },
        { status: 400 }
      );
    }

    const validFormats = [...Object.values(DOWNLOAD_FORMATS), "custom"];
    if (!format || !validFormats.includes(format as any)) {
      return NextResponse.json(
        {
          error:
            "Valid format is required (best, 1080p, 720p, 480p, audio, or custom)",
        },
        { status: 400 }
      );
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    if (!isVideoUrl(url)) {
      return NextResponse.json(
        { error: "URL is not from a supported video platform" },
        { status: 400 }
      );
    }

    // Validate custom format if provided
    if (format === DOWNLOAD_FORMATS.CUSTOM && !customFormat) {
      return NextResponse.json(
        { error: 'Custom format is required when format is "custom"' },
        { status: 400 }
      );
    }

    // Ensure download directory exists
    const downloadPath = path.resolve(PATHS.DOWNLOADS);
    await fs.mkdir(downloadPath, { recursive: true });

    // Generate download ID first
    const downloadId = `download_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Initialize download tracking
    activeDownloads.set(downloadId, {
      progress: 0,
      status: "downloading",
      timestamp: Date.now(),
      terminalOutput: [],
    });

    // Prepare download options
    const downloadFormat =
      format === DOWNLOAD_FORMATS.CUSTOM ? customFormat! : format;

    const downloadOptions = {
      url,
      format: downloadFormat,
      outputPath: downloadPath,
      includeSubtitles,
      subtitleLanguage,
      customFilename: customFilename
        ? sanitizeFilename(customFilename)
        : undefined,
      embedThumbnail:
        format === DOWNLOAD_FORMATS.AUDIO ? embedThumbnail : false,
      onProgress: (progress: number) => {
        console.log(
          `[DOWNLOAD API] Progress callback: ${downloadId} - ${progress}%`
        );
        const downloadData = activeDownloads.get(downloadId);
        if (downloadData) {
          downloadData.progress = progress;
          downloadData.status = "downloading";
          downloadData.timestamp = Date.now();
          // Add progress info to terminal output occasionally
          if (progress % 10 === 0 || progress === 100) {
            downloadData.terminalOutput.push(
              `[PROGRESS] ${progress}% completed`
            );
          }
          activeDownloads.set(downloadId, downloadData);
          console.log(`[DOWNLOAD API] Updated download data:`, downloadData);
        } else {
          console.log(
            `[DOWNLOAD API] No download data found for ${downloadId}`
          );
        }
      },
      onTerminalOutput: (output: string) => {
        console.log(
          `[DOWNLOAD API] Terminal callback: ${downloadId} -`,
          output.trim()
        );
        const downloadData = activeDownloads.get(downloadId);
        if (downloadData) {
          downloadData.terminalOutput.push(output);
          // Keep only last 100 lines to prevent memory issues
          if (downloadData.terminalOutput.length > 100) {
            downloadData.terminalOutput =
              downloadData.terminalOutput.slice(-100);
          }
          activeDownloads.set(downloadId, downloadData);
        } else {
          console.log(
            `[DOWNLOAD API] No download data found for terminal output: ${downloadId}`
          );
        }
      },
    };

    // Start download
    const ytdlpService = YtDlpService.getInstance();

    console.log(
      `[DOWNLOAD API] Starting download ${downloadId} for URL: ${url}`
    );
    console.log(`[DOWNLOAD API] Download path: ${downloadPath}`);
    console.log(`[DOWNLOAD API] Format: ${downloadFormat}`);

    try {
      // Start the download asynchronously
      const downloadPromise = ytdlpService
        .downloadVideo(downloadOptions, downloadId)
        .then((result) => {
          console.log(
            `[DOWNLOAD API] Download ${downloadId} completed: ${result.filename}`
          );
          // Update with completion info
          const downloadData = activeDownloads.get(downloadId);
          activeDownloads.set(downloadId, {
            progress: 100,
            status: "complete",
            filename: result.filename,
            timestamp: Date.now(),
            terminalOutput: downloadData?.terminalOutput || [],
          });
        })
        .catch((error) => {
          console.error(`[DOWNLOAD API] Download ${downloadId} failed:`, error);
          // Update download status with error
          const downloadData = activeDownloads.get(downloadId);
          activeDownloads.set(downloadId, {
            progress: 0,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
            terminalOutput: downloadData?.terminalOutput || [],
          });
        });

      // Wait a brief moment to ensure download process has started
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Return with download ID for progress tracking
      const response: DownloadResponse = {
        success: true,
        downloadId,
        filename: "downloading...", // Placeholder until download completes
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error("Download initialization error:", error);

      // Update download status with error
      activeDownloads.set(downloadId, {
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
        terminalOutput: [],
      });

      const userFriendlyError = ErrorHandler.handleError(error as Error);

      const response: DownloadResponse = {
        success: false,
        downloadId,
        error: userFriendlyError.message,
      };

      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    console.error("Download API error:", error);

    const userFriendlyError = ErrorHandler.handleError(error as Error);

    return NextResponse.json(
      {
        error: userFriendlyError.message,
        type: userFriendlyError.type,
        recoverable: userFriendlyError.recoverable,
        suggestions: userFriendlyError.suggestions,
      },
      { status: 500 }
    );
  }
}
