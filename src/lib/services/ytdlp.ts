import { spawn, ChildProcess as NodeChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import {
  VideoMetadata,
  Format,
  PlaylistVideo,
  DownloadOptions,
  ProgressEvent,
} from "@/types";
import { YTDLP_CONFIG } from "@/lib/config";
import { YtDlpError, SystemError, ValidationError } from "@/lib/errors";
import { sanitizeFilename, generateId } from "@/lib/utils";

export class YtDlpService {
  private static instance: YtDlpService;
  private activeDownloads = new Map<string, NodeChildProcess>();

  static getInstance(): YtDlpService {
    if (!YtDlpService.instance) {
      YtDlpService.instance = new YtDlpService();
    }
    return YtDlpService.instance;
  }

  /**
   * Extract metadata from a video URL
   */
  async getMetadata(
    url: string
  ): Promise<
    VideoMetadata & { isPlaylist: boolean; playlistVideos?: PlaylistVideo[] }
  > {
    try {
      const args = [...YTDLP_CONFIG.metadataOptions, url];

      const result = await this.executeYtDlp(args);
      const jsonData = this.parseJsonOutput(result.stdout);

      if (jsonData._type === "playlist") {
        return {
          ...this.extractVideoMetadata(jsonData),
          isPlaylist: true,
          playlistVideos:
            jsonData.entries?.map((entry: any, index: number) => ({
              id: entry.id || `${index}`,
              title: entry.title || "Unknown Title",
              thumbnail: entry.thumbnail || "",
              duration: entry.duration || 0,
              url: entry.url || entry.webpage_url || "",
              selected: false,
            })) || [],
        };
      }

      return {
        ...this.extractVideoMetadata(jsonData),
        isPlaylist: false,
      };
    } catch (error) {
      throw new YtDlpError(
        `Failed to extract metadata: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get available formats for a video
   */
  async getFormats(url: string): Promise<Format[]> {
    try {
      const args = [...YTDLP_CONFIG.formatOptions, url];

      const result = await this.executeYtDlp(args);
      return this.parseFormats(result.stdout);
    } catch (error) {
      throw new YtDlpError(
        `Failed to get formats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Download a video with specified options
   */
  async downloadVideo(
    options: DownloadOptions,
    providedDownloadId?: string
  ): Promise<{ downloadId: string; filename: string }> {
    const downloadId = providedDownloadId || generateId();

    try {
      // Ensure output directory exists
      await fs.mkdir(options.outputPath, { recursive: true });

      const filename = await this.generateFilename(options);
      const outputPath = path.join(options.outputPath, filename);

      const args = this.buildDownloadArgs(options, outputPath);

      console.log(`[YT-DLP SERVICE] Starting download ${downloadId}`);
      console.log(`[YT-DLP SERVICE] Output path: ${outputPath}`);

      const process = spawn("yt-dlp", args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.activeDownloads.set(downloadId, process);

      // Handle progress updates and terminal output
      this.setupProgressTracking(
        process,
        options.onProgress,
        options.onTerminalOutput
      );

      return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";

        process.stdout?.on("data", (data: Buffer | string) => {
          stdout += data.toString();
        });

        process.stderr?.on("data", (data: Buffer | string) => {
          stderr += data.toString();
        });

        process.on("close", (code) => {
          this.activeDownloads.delete(downloadId);

          console.log(
            `[YT-DLP SERVICE] Process ${downloadId} closed with code ${code}`
          );
          if (stderr) console.log(`[YT-DLP SERVICE] Stderr: ${stderr}`);

          if (code === 0) {
            console.log(
              `[YT-DLP SERVICE] Download ${downloadId} successful: ${filename}`
            );
            resolve({ downloadId, filename });
          } else {
            console.log(
              `[YT-DLP SERVICE] Download ${downloadId} failed with code ${code}`
            );
            reject(
              new YtDlpError(`Download failed with code ${code}: ${stderr}`)
            );
          }
        });

        process.on("error", (error) => {
          this.activeDownloads.delete(downloadId);
          reject(new SystemError(`Process error: ${error.message}`));
        });
      });
    } catch (error) {
      this.activeDownloads.delete(downloadId);
      throw error;
    }
  }

  /**
   * Cancel an active download
   */
  cancelDownload(downloadId: string): boolean {
    const process = this.activeDownloads.get(downloadId);
    if (process) {
      process.kill("SIGTERM");
      this.activeDownloads.delete(downloadId);
      return true;
    }
    return false;
  }

  /**
   * Check if yt-dlp is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      await this.executeYtDlp(["--version"]);
      return true;
    } catch {
      return false;
    }
  }

  private async executeYtDlp(
    args: string[]
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn("yt-dlp", args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data: Buffer | string) => {
        stdout += data.toString();
      });

      process.stderr?.on("data", (data: Buffer | string) => {
        stderr += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new YtDlpError(`yt-dlp exited with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error) => {
        reject(new SystemError(`Failed to spawn yt-dlp: ${error.message}`));
      });
    });
  }

  private parseJsonOutput(output: string): any {
    try {
      // yt-dlp outputs one JSON object per line for playlists
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      if (lines.length === 1) {
        return JSON.parse(lines[0]);
      }

      // Multiple lines indicate playlist
      const entries = lines.map((line) => JSON.parse(line));
      return {
        _type: "playlist",
        entries: entries.slice(1), // First entry is usually playlist info
        title: entries[0]?.playlist_title || "Playlist",
        id: entries[0]?.playlist_id || generateId(),
      };
    } catch (error) {
      throw new YtDlpError(
        `Failed to parse JSON output: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private extractVideoMetadata(data: any): VideoMetadata {
    return {
      id: data.id || generateId(),
      title: data.title || "Unknown Title",
      thumbnail: data.thumbnail || "",
      duration: data.duration || 0,
      uploader: data.uploader || data.channel || "Unknown",
      uploadDate: data.upload_date || new Date().toISOString().split("T")[0],
      viewCount: data.view_count,
      description: data.description,
    };
  }

  private parseFormats(output: string): Format[] {
    const formats: Format[] = [];
    const lines = output.split("\n");

    // Skip header lines and find the format table
    let inFormatTable = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and headers
      if (
        !trimmedLine ||
        trimmedLine.startsWith("Available formats") ||
        trimmedLine.startsWith("ID") ||
        trimmedLine.startsWith("---")
      ) {
        if (trimmedLine.startsWith("ID")) {
          inFormatTable = true;
        }
        continue;
      }

      // Stop if we hit a non-format line after starting the table
      if (inFormatTable && !trimmedLine.match(/^\d+/)) {
        break;
      }

      // Parse format line
      const formatMatch = trimmedLine.match(/^(\d+)\s+(\w+)\s+(.+)$/);
      if (formatMatch) {
        const [, formatId, ext, rest] = formatMatch;

        // Extract resolution, quality, and codecs from the rest
        const resolution = this.extractResolution(rest);
        const filesize = this.extractFilesize(rest);
        const vcodec = this.extractCodec(rest, "video");
        const acodec = this.extractCodec(rest, "audio");

        // Determine quality description
        let quality = rest;
        if (resolution) {
          quality = resolution;
        } else if (rest.includes("audio only")) {
          quality = "audio only";
        } else if (rest.includes("video only")) {
          quality = "video only";
        }

        formats.push({
          formatId,
          ext,
          quality,
          resolution,
          vcodec,
          acodec,
          filesize,
        });
      }
    }

    // Sort formats by quality (video first, then audio)
    return formats.sort((a, b) => {
      // Video formats first
      const aHasVideo = a.vcodec && a.vcodec !== "none";
      const bHasVideo = b.vcodec && b.vcodec !== "none";

      if (aHasVideo && !bHasVideo) return -1;
      if (!aHasVideo && bHasVideo) return 1;

      // For video formats, sort by resolution (higher first)
      if (aHasVideo && bHasVideo) {
        const aHeight = this.extractHeight(a.resolution);
        const bHeight = this.extractHeight(b.resolution);
        return bHeight - aHeight;
      }

      // For audio formats, sort by format ID (higher usually means better quality)
      return parseInt(b.formatId) - parseInt(a.formatId);
    });
  }

  private extractResolution(formatLine: string): string | undefined {
    const resolutionMatch = formatLine.match(/(\d+x\d+)/);
    return resolutionMatch ? resolutionMatch[1] : undefined;
  }

  private extractFilesize(formatLine: string): number | undefined {
    // Look for file size patterns like "123.45MiB", "1.23GiB", "456.78KiB"
    const sizeMatch = formatLine.match(
      /(\d+(?:\.\d+)?)(MiB|GiB|KiB|MB|GB|KB)/i
    );
    if (sizeMatch) {
      const [, size, unit] = sizeMatch;
      const sizeNum = parseFloat(size);

      switch (unit.toLowerCase()) {
        case "gib":
        case "gb":
          return sizeNum * 1024 * 1024 * 1024;
        case "mib":
        case "mb":
          return sizeNum * 1024 * 1024;
        case "kib":
        case "kb":
          return sizeNum * 1024;
        default:
          return sizeNum;
      }
    }
    return undefined;
  }

  private extractHeight(resolution?: string): number {
    if (!resolution) return 0;
    const heightMatch = resolution.match(/\d+x(\d+)/);
    return heightMatch ? parseInt(heightMatch[1]) : 0;
  }

  private extractCodec(
    formatLine: string,
    type: "video" | "audio"
  ): string | undefined {
    if (type === "video") {
      // Look for video codecs
      const codecMatch = formatLine.match(
        /\b(h264|h\.264|avc1|vp9|vp09|av01|av1|hevc|h265|h\.265)\b/i
      );
      if (codecMatch) {
        const codec = codecMatch[1].toLowerCase();
        // Normalize codec names
        if (codec.includes("264") || codec === "avc1") return "h264";
        if (codec.includes("265") || codec === "hevc") return "h265";
        if (codec.includes("vp9") || codec === "vp09") return "vp9";
        if (codec.includes("av01") || codec === "av1") return "av01";
        return codec;
      }
      // Check if it's video only or has video
      if (formatLine.includes("video only") || formatLine.match(/\d+x\d+/)) {
        return "unknown";
      }
      return "none";
    } else {
      // Look for audio codecs
      const codecMatch = formatLine.match(
        /\b(aac|opus|mp3|vorbis|m4a|mp4a)\b/i
      );
      if (codecMatch) {
        const codec = codecMatch[1].toLowerCase();
        // Normalize codec names
        if (codec === "m4a" || codec === "mp4a") return "aac";
        return codec;
      }
      // Check if it's audio only or has audio
      if (
        formatLine.includes("audio only") ||
        (!formatLine.includes("video only") && !formatLine.match(/\d+x\d+/))
      ) {
        return "unknown";
      }
      return "none";
    }
  }

  private buildDownloadArgs(
    options: DownloadOptions,
    outputPath: string
  ): string[] {
    const args: string[] = [
      "--no-warnings",
      "--ignore-errors",
      ...YTDLP_CONFIG.progressOptions,
    ];

    // Format selection
    const downloadOptions = YTDLP_CONFIG.downloadOptions as any;
    if (downloadOptions[options.format]) {
      args.push(...downloadOptions[options.format]);
      if (options.format === "audio" && options.embedThumbnail) {
        args.push(...YTDLP_CONFIG.thumbnailOptions);
      }
    } else {
      // Custom format
      args.push("-f", options.format);
      args.push("--merge-output-format", "mp4");
      args.push("--embed-metadata");
      args.push("--embed-thumbnail");
    }

    // Subtitles
    if (options.includeSubtitles) {
      args.push(...YTDLP_CONFIG.subtitleOptions);
      if (options.subtitleLanguage) {
        args.push("--sub-langs", options.subtitleLanguage);
      }
    }

    // Output path
    args.push("-o", outputPath);

    // URL
    args.push(options.url);

    return args;
  }

  private async generateFilename(options: DownloadOptions): Promise<string> {
    if (options.customFilename) {
      const sanitized = sanitizeFilename(options.customFilename);
      const ext = options.format === "audio" ? "mp3" : "mp4";
      return `${sanitized}.${ext}`;
    }

    try {
      const metadata = await this.getMetadata(options.url);
      const sanitized = sanitizeFilename(metadata.title);
      const ext = options.format === "audio" ? "mp3" : "mp4";
      return `${sanitized}.${ext}`;
    } catch {
      const ext = options.format === "audio" ? "mp3" : "mp4";
      return `download_${generateId()}.${ext}`;
    }
  }

  private setupProgressTracking(
    process: NodeChildProcess,
    onProgress?: (progress: number) => void,
    onTerminalOutput?: (output: string) => void
  ): void {
    console.log("[YT-DLP SERVICE] Setting up progress tracking");

    // Track stdout for progress and terminal output
    process.stdout?.on("data", (data: Buffer | string) => {
      const output = data.toString();
      console.log("[YT-DLP SERVICE] STDOUT:", output.trim());

      // Send raw output to terminal
      if (onTerminalOutput) {
        onTerminalOutput(output);
      }

      // Extract progress information
      if (onProgress) {
        // Look for various progress patterns
        const progressPatterns = [
          /\[download\]\s+(\d+(?:\.\d+)?)%/, // [download] 45.2%
          /(\d+(?:\.\d+)?)%\s+of/, // 45.2% of 100MB
          /(\d+(?:\.\d+)?)%/, // Simple 45.2%
        ];

        for (const pattern of progressPatterns) {
          const match = output.match(pattern);
          if (match) {
            const progress = parseFloat(match[1]);
            if (!isNaN(progress) && progress >= 0 && progress <= 100) {
              console.log(`[YT-DLP SERVICE] Progress detected: ${progress}%`);
              onProgress(progress);
              break;
            }
          }
        }
      }
    });

    // Track stderr for errors and additional output
    process.stderr?.on("data", (data: Buffer | string) => {
      const output = data.toString();
      console.log("[YT-DLP SERVICE] STDERR:", output.trim());

      // Send stderr to terminal as well
      if (onTerminalOutput) {
        onTerminalOutput(`[ERROR] ${output}`);
      }
    });
  }
}
