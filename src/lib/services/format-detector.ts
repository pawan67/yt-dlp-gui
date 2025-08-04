import { Format } from "@/types";
import { YtDlpService } from "./ytdlp";

export class FormatDetector {
  private ytdlpService: YtDlpService;

  constructor() {
    this.ytdlpService = YtDlpService.getInstance();
  }

  /**
   * Get recommended formats for a video
   */
  async getRecommendedFormats(url: string): Promise<{
    best: Format | null;
    bestAudio: Format | null;
    formats: Format[];
  }> {
    try {
      const formats = await this.ytdlpService.getFormats(url);

      return {
        best: this.findBestVideoFormat(formats),
        bestAudio: this.findBestAudioFormat(formats),
        formats: this.sortFormats(formats),
      };
    } catch (error) {
      return {
        best: null,
        bestAudio: null,
        formats: [],
      };
    }
  }

  /**
   * Find the best video format (highest quality with both video and audio)
   */
  private findBestVideoFormat(formats: Format[]): Format | null {
    const videoFormats = formats.filter(
      (f) => f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none"
    );

    if (videoFormats.length === 0) return null;

    // Sort by resolution (prefer higher resolution)
    return videoFormats.sort((a, b) => {
      const aHeight = this.extractHeight(a.resolution);
      const bHeight = this.extractHeight(b.resolution);
      return bHeight - aHeight;
    })[0];
  }

  /**
   * Find the best audio-only format
   */
  private findBestAudioFormat(formats: Format[]): Format | null {
    const audioFormats = formats.filter(
      (f) =>
        f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
    );

    if (audioFormats.length === 0) return null;

    // Prefer common audio formats
    const preferredCodecs = ["aac", "mp3", "opus", "vorbis"];

    for (const codec of preferredCodecs) {
      const format = audioFormats.find((f) =>
        f.acodec?.toLowerCase().includes(codec)
      );
      if (format) return format;
    }

    return audioFormats[0];
  }

  /**
   * Sort formats by quality (best first)
   */
  private sortFormats(formats: Format[]): Format[] {
    return formats.sort((a, b) => {
      // Video formats first
      const aHasVideo = a.vcodec && a.vcodec !== "none";
      const bHasVideo = b.vcodec && b.vcodec !== "none";

      if (aHasVideo && !bHasVideo) return -1;
      if (!aHasVideo && bHasVideo) return 1;

      // Then by resolution
      const aHeight = this.extractHeight(a.resolution);
      const bHeight = this.extractHeight(b.resolution);

      if (aHeight !== bHeight) return bHeight - aHeight;

      // Then by file size if available
      if (a.filesize && b.filesize) {
        return b.filesize - a.filesize;
      }

      return 0;
    });
  }

  /**
   * Extract height from resolution string (e.g., "1920x1080" -> 1080)
   */
  private extractHeight(resolution?: string): number {
    if (!resolution) return 0;

    const match = resolution.match(/\d+x(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get format display name for UI
   */
  getFormatDisplayName(format: Format): string {
    const parts: string[] = [];

    if (format.resolution) {
      parts.push(format.resolution);
    }

    if (format.ext) {
      parts.push(format.ext.toUpperCase());
    }

    if (format.vcodec && format.vcodec !== "none") {
      parts.push(format.vcodec.toUpperCase());
    }

    if (format.acodec && format.acodec !== "none") {
      parts.push(format.acodec.toUpperCase());
    }

    if (format.filesize) {
      parts.push(this.formatFileSize(format.filesize));
    }

    return parts.join(" • ") || format.formatId;
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  /**
   * Check if format is suitable for audio extraction
   */
  isAudioFormat(format: Format): boolean {
    return (
      format.acodec !== undefined &&
      format.acodec !== "none" &&
      (!format.vcodec || format.vcodec === "none")
    );
  }

  /**
   * Check if format has video
   */
  isVideoFormat(format: Format): boolean {
    return format.vcodec !== undefined && format.vcodec !== "none";
  }

  /**
   * Get format quality score (higher is better)
   */
  getQualityScore(format: Format): number {
    let score = 0;

    // Resolution score
    const height = this.extractHeight(format.resolution);
    if (height >= 2160) score += 100; // 4K
    else if (height >= 1440) score += 80; // 1440p
    else if (height >= 1080) score += 60; // 1080p
    else if (height >= 720) score += 40; // 720p
    else if (height >= 480) score += 20; // 480p

    // Codec preference
    if (format.vcodec?.includes("h264")) score += 10;
    if (format.acodec?.includes("aac")) score += 5;

    // File size bonus (larger usually means better quality)
    if (format.filesize) {
      score += Math.min(format.filesize / (1024 * 1024), 20); // Max 20 points for size
    }

    return score;
  }
}
