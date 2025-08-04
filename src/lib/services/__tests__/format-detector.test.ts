import { FormatDetector } from "../format-detector";
import { YtDlpService } from "../ytdlp";
import { Format } from "@/types";

// Mock YtDlpService
jest.mock("../ytdlp");
const mockYtDlpService = YtDlpService as jest.MockedClass<typeof YtDlpService>;

describe("FormatDetector", () => {
  let formatDetector: FormatDetector;
  let mockYtDlpInstance: jest.Mocked<YtDlpService>;

  const mockFormats: Format[] = [
    {
      formatId: "137",
      ext: "mp4",
      resolution: "1920x1080",
      vcodec: "h264",
      acodec: "none",
      quality: "1080p video only",
      filesize: 150000000,
    },
    {
      formatId: "298",
      ext: "mp4",
      resolution: "1280x720",
      vcodec: "h264",
      acodec: "none",
      quality: "720p video only",
      filesize: 100000000,
    },
    {
      formatId: "140",
      ext: "m4a",
      vcodec: "none",
      acodec: "aac",
      quality: "audio only",
      filesize: 5000000,
    },
    {
      formatId: "18",
      ext: "mp4",
      resolution: "640x360",
      vcodec: "h264",
      acodec: "aac",
      quality: "360p",
      filesize: 50000000,
    },
    {
      formatId: "251",
      ext: "webm",
      vcodec: "none",
      acodec: "opus",
      quality: "audio only",
      filesize: 4500000,
    },
  ];

  beforeEach(() => {
    mockYtDlpInstance = {
      getFormats: jest.fn(),
      getMetadata: jest.fn(),
      downloadVideo: jest.fn(),
      cancelDownload: jest.fn(),
      checkAvailability: jest.fn(),
    } as any;

    mockYtDlpService.getInstance.mockReturnValue(mockYtDlpInstance);
    formatDetector = new FormatDetector();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getRecommendedFormats", () => {
    it("should return recommended formats successfully", async () => {
      mockYtDlpInstance.getFormats.mockResolvedValue(mockFormats);

      const result = await formatDetector.getRecommendedFormats(
        "https://youtube.com/watch?v=test"
      );

      expect(result.best?.formatId).toBe("18"); // Format with both video and audio
      expect(result.bestAudio?.formatId).toBe("140"); // AAC audio format
      expect(result.formats).toHaveLength(5);
    });

    it("should handle errors gracefully", async () => {
      mockYtDlpInstance.getFormats.mockRejectedValue(
        new Error("Network error")
      );

      const result = await formatDetector.getRecommendedFormats("invalid-url");

      expect(result.best).toBeNull();
      expect(result.bestAudio).toBeNull();
      expect(result.formats).toEqual([]);
    });

    it("should return null when no suitable formats found", async () => {
      const videoOnlyFormats: Format[] = [
        {
          formatId: "137",
          ext: "mp4",
          resolution: "1920x1080",
          vcodec: "h264",
          acodec: "none",
          quality: "1080p video only",
        },
      ];

      mockYtDlpInstance.getFormats.mockResolvedValue(videoOnlyFormats);

      const result = await formatDetector.getRecommendedFormats(
        "https://youtube.com/watch?v=test"
      );

      expect(result.best).toBeNull(); // No format with both video and audio
      expect(result.bestAudio).toBeNull(); // No audio-only format
    });
  });

  describe("getFormatDisplayName", () => {
    it("should format display name correctly for video format", () => {
      const format: Format = {
        formatId: "137",
        ext: "mp4",
        resolution: "1920x1080",
        vcodec: "h264",
        acodec: "aac",
        quality: "1080p",
        filesize: 150000000,
      };

      const displayName = formatDetector.getFormatDisplayName(format);
      expect(displayName).toBe("1920x1080 • MP4 • H264 • AAC • 143.1MB");
    });

    it("should format display name correctly for audio format", () => {
      const format: Format = {
        formatId: "140",
        ext: "m4a",
        vcodec: "none",
        acodec: "aac",
        quality: "audio only",
        filesize: 5000000,
      };

      const displayName = formatDetector.getFormatDisplayName(format);
      expect(displayName).toBe("M4A • AAC • 4.8MB");
    });

    it("should fallback to formatId when no other info available", () => {
      const format: Format = {
        formatId: "unknown",
        ext: "",
        quality: "",
      };

      const displayName = formatDetector.getFormatDisplayName(format);
      expect(displayName).toBe("unknown");
    });
  });

  describe("isAudioFormat", () => {
    it("should identify audio-only formats", () => {
      const audioFormat: Format = {
        formatId: "140",
        ext: "m4a",
        vcodec: "none",
        acodec: "aac",
        quality: "audio only",
      };

      expect(formatDetector.isAudioFormat(audioFormat)).toBe(true);
    });

    it("should not identify video formats as audio", () => {
      const videoFormat: Format = {
        formatId: "18",
        ext: "mp4",
        resolution: "640x360",
        vcodec: "h264",
        acodec: "aac",
        quality: "360p",
      };

      expect(formatDetector.isAudioFormat(videoFormat)).toBe(false);
    });

    it("should handle missing codec info", () => {
      const unknownFormat: Format = {
        formatId: "unknown",
        ext: "mp4",
        quality: "unknown",
      };

      expect(formatDetector.isAudioFormat(unknownFormat)).toBe(false);
    });
  });

  describe("isVideoFormat", () => {
    it("should identify video formats", () => {
      const videoFormat: Format = {
        formatId: "137",
        ext: "mp4",
        resolution: "1920x1080",
        vcodec: "h264",
        acodec: "none",
        quality: "1080p video only",
      };

      expect(formatDetector.isVideoFormat(videoFormat)).toBe(true);
    });

    it("should not identify audio-only formats as video", () => {
      const audioFormat: Format = {
        formatId: "140",
        ext: "m4a",
        vcodec: "none",
        acodec: "aac",
        quality: "audio only",
      };

      expect(formatDetector.isVideoFormat(audioFormat)).toBe(false);
    });
  });

  describe("getQualityScore", () => {
    it("should assign higher scores to better quality formats", () => {
      const format4K: Format = {
        formatId: "313",
        ext: "webm",
        resolution: "3840x2160",
        vcodec: "vp9",
        acodec: "none",
        quality: "4K",
        filesize: 500000000,
      };

      const format1080p: Format = {
        formatId: "137",
        ext: "mp4",
        resolution: "1920x1080",
        vcodec: "h264",
        acodec: "aac",
        quality: "1080p",
        filesize: 150000000,
      };

      const format720p: Format = {
        formatId: "298",
        ext: "mp4",
        resolution: "1280x720",
        vcodec: "h264",
        acodec: "none",
        quality: "720p",
        filesize: 100000000,
      };

      const score4K = formatDetector.getQualityScore(format4K);
      const score1080p = formatDetector.getQualityScore(format1080p);
      const score720p = formatDetector.getQualityScore(format720p);

      expect(score4K).toBeGreaterThan(score1080p);
      expect(score1080p).toBeGreaterThan(score720p);
    });

    it("should give bonus points for preferred codecs", () => {
      const h264Format: Format = {
        formatId: "137",
        ext: "mp4",
        resolution: "1920x1080",
        vcodec: "h264",
        acodec: "aac",
        quality: "1080p",
      };

      const vp9Format: Format = {
        formatId: "313",
        ext: "webm",
        resolution: "1920x1080",
        vcodec: "vp9",
        acodec: "opus",
        quality: "1080p",
      };

      const h264Score = formatDetector.getQualityScore(h264Format);
      const vp9Score = formatDetector.getQualityScore(vp9Format);

      // H264 should get bonus points for video codec, AAC for audio codec
      expect(h264Score).toBeGreaterThan(vp9Score);
    });
  });

  describe("private methods", () => {
    it("should extract height from resolution correctly", () => {
      // Access private method through any cast for testing
      const extractHeight = (formatDetector as any).extractHeight;

      expect(extractHeight("1920x1080")).toBe(1080);
      expect(extractHeight("1280x720")).toBe(720);
      expect(extractHeight("640x360")).toBe(360);
      expect(extractHeight(undefined)).toBe(0);
      expect(extractHeight("invalid")).toBe(0);
    });

    it("should format file size correctly", () => {
      const formatFileSize = (formatDetector as any).formatFileSize;

      expect(formatFileSize(1024)).toBe("1.0KB");
      expect(formatFileSize(1024 * 1024)).toBe("1.0MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0GB");
      expect(formatFileSize(1536)).toBe("1.5KB");
    });

    it("should sort formats correctly", () => {
      const sortFormats = (formatDetector as any).sortFormats.bind(
        formatDetector
      );

      const unsortedFormats = [...mockFormats];
      const sorted = sortFormats(unsortedFormats);

      // Video formats should come first, then sorted by resolution
      expect(sorted[0].formatId).toBe("137"); // 1080p video
      expect(sorted[1].formatId).toBe("298"); // 720p video
      expect(sorted[2].formatId).toBe("18"); // 360p video with audio
    });

    it("should find best video format correctly", () => {
      const findBestVideoFormat = (formatDetector as any).findBestVideoFormat;

      const best = findBestVideoFormat(mockFormats);
      expect(best.formatId).toBe("18"); // Only format with both video and audio
    });

    it("should find best audio format correctly", () => {
      const findBestAudioFormat = (formatDetector as any).findBestAudioFormat;

      const best = findBestAudioFormat(mockFormats);
      expect(best.formatId).toBe("140"); // AAC format (preferred over opus)
    });
  });
});
