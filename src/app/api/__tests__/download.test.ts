// Tests for download API route

import { POST } from "../download/route";
import { NextRequest } from "next/server";
import { YtDlpService } from "@/lib/services";
import { DOWNLOAD_FORMATS } from "@/lib/constants";

// Mock the YtDlpService
jest.mock("../../../lib/services", () => ({
  YtDlpService: {
    getInstance: jest.fn(),
  },
}));

// Mock fs promises
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockYtDlpService = {
  downloadVideo: jest.fn(),
};

(YtDlpService.getInstance as jest.Mock).mockReturnValue(mockYtDlpService);

describe("/api/download", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should start download for valid request", async () => {
      const mockDownloadResult = {
        downloadId: "test-download-id",
        filename: "test-video.mp4",
      };

      mockYtDlpService.downloadVideo.mockResolvedValue(mockDownloadResult);

      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.BEST,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        downloadId: "test-download-id",
        filename: "test-video.mp4",
      });
    });

    it("should handle audio download with thumbnail embedding", async () => {
      const mockDownloadResult = {
        downloadId: "test-audio-id",
        filename: "test-audio.mp3",
      };

      mockYtDlpService.downloadVideo.mockResolvedValue(mockDownloadResult);

      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.AUDIO,
          embedThumbnail: true,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockYtDlpService.downloadVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          format: DOWNLOAD_FORMATS.AUDIO,
          embedThumbnail: true,
        })
      );
    });

    it("should handle custom format download", async () => {
      const mockDownloadResult = {
        downloadId: "test-custom-id",
        filename: "test-custom.webm",
      };

      mockYtDlpService.downloadVideo.mockResolvedValue(mockDownloadResult);

      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.CUSTOM,
          customFormat: "22",
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockYtDlpService.downloadVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          format: "22",
        })
      );
    });

    it("should handle subtitle options", async () => {
      const mockDownloadResult = {
        downloadId: "test-subtitle-id",
        filename: "test-with-subs.mp4",
      };

      mockYtDlpService.downloadVideo.mockResolvedValue(mockDownloadResult);

      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.BEST,
          includeSubtitles: true,
          subtitleLanguage: "en",
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockYtDlpService.downloadVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          includeSubtitles: true,
          subtitleLanguage: "en",
        })
      );
    });

    it("should handle custom filename", async () => {
      const mockDownloadResult = {
        downloadId: "test-custom-name-id",
        filename: "my-custom-name.mp4",
      };

      mockYtDlpService.downloadVideo.mockResolvedValue(mockDownloadResult);

      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.BEST,
          customFilename: "my custom name!",
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockYtDlpService.downloadVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          customFilename: "my_custom_name_",
        })
      );
    });

    it("should return 400 for missing URL", async () => {
      const request = {
        json: async () => ({
          format: DOWNLOAD_FORMATS.BEST,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("URL is required and must be a string");
    });

    it("should return 400 for invalid format", async () => {
      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: "invalid-format",
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Valid format is required (best, audio, or custom)"
      );
    });

    it("should return 400 for invalid URL", async () => {
      const request = {
        json: async () => ({
          url: "not-a-url",
          format: DOWNLOAD_FORMATS.BEST,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid URL format");
    });

    it("should return 400 for unsupported platform", async () => {
      const request = {
        json: async () => ({
          url: "https://example.com/video",
          format: DOWNLOAD_FORMATS.BEST,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("URL is not from a supported video platform");
    });

    it("should return 400 for custom format without customFormat", async () => {
      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.CUSTOM,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'Custom format is required when format is "custom"'
      );
    });

    it("should handle download service errors", async () => {
      mockYtDlpService.downloadVideo.mockRejectedValue(
        new Error("Download failed")
      );

      const request = {
        json: async () => ({
          url: "https://youtube.com/watch?v=test123",
          format: DOWNLOAD_FORMATS.BEST,
        }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it("should handle JSON parsing errors", async () => {
      const request = {
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
