// Tests for metadata API route

import { POST, GET } from "../metadata/route";
import { NextRequest } from "next/server";
import { YtDlpService } from "@/lib/services";

// Mock the YtDlpService
jest.mock("../../../lib/services", () => ({
  YtDlpService: {
    getInstance: jest.fn(),
  },
}));

const mockYtDlpService = {
  getMetadata: jest.fn(),
  getFormats: jest.fn(),
};

(YtDlpService.getInstance as jest.Mock).mockReturnValue(mockYtDlpService);

describe("/api/metadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should return metadata for valid video URL", async () => {
      const mockMetadata = {
        title: "Test Video",
        thumbnail: "https://example.com/thumb.jpg",
        duration: 180,
        uploader: "Test Channel",
        isPlaylist: false,
      };

      const mockFormats = [
        {
          formatId: "22",
          ext: "mp4",
          quality: "720p",
          resolution: "1280x720",
        },
      ];

      mockYtDlpService.getMetadata.mockResolvedValue(mockMetadata);
      mockYtDlpService.getFormats.mockResolvedValue(mockFormats);

      const request = {
        json: async () => ({ url: "https://youtube.com/watch?v=test123" }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        title: "Test Video",
        thumbnail: "https://example.com/thumb.jpg",
        duration: 180,
        uploader: "Test Channel",
        isPlaylist: false,
        formats: mockFormats,
      });
    });

    it("should return playlist metadata", async () => {
      const mockPlaylistMetadata = {
        title: "Test Playlist",
        thumbnail: "https://example.com/playlist-thumb.jpg",
        duration: 0,
        uploader: "Test Channel",
        isPlaylist: true,
        playlistVideos: [
          {
            id: "video1",
            title: "Video 1",
            thumbnail: "thumb1.jpg",
            duration: 120,
            url: "https://youtube.com/watch?v=video1",
            selected: false,
          },
        ],
      };

      mockYtDlpService.getMetadata.mockResolvedValue(mockPlaylistMetadata);

      const request = {
        json: async () => ({ url: "https://youtube.com/playlist?list=test" }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isPlaylist).toBe(true);
      expect(data.playlistVideos).toHaveLength(1);
      expect(data.formats).toBeUndefined(); // No formats for playlists
    });

    it("should return 400 for missing URL", async () => {
      const request = {
        json: async () => ({}),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("URL is required and must be a string");
    });

    it("should return 400 for invalid URL", async () => {
      const request = {
        json: async () => ({ url: "not-a-url" }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid URL format");
    });

    it("should return 400 for unsupported platform", async () => {
      const request = {
        json: async () => ({ url: "https://example.com/video" }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("URL is not from a supported video platform");
    });

    it("should handle service errors gracefully", async () => {
      mockYtDlpService.getMetadata.mockRejectedValue(
        new Error("Service error")
      );

      const request = {
        json: async () => ({ url: "https://youtube.com/watch?v=test123" }),
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET", () => {
    it("should handle GET requests with URL parameter", async () => {
      const mockMetadata = {
        title: "Test Video",
        thumbnail: "https://example.com/thumb.jpg",
        duration: 180,
        uploader: "Test Channel",
        isPlaylist: false,
      };

      mockYtDlpService.getMetadata.mockResolvedValue(mockMetadata);
      mockYtDlpService.getFormats.mockResolvedValue([]);

      const request = {
        url: "http://localhost:3000/api/metadata?url=https://youtube.com/watch?v=test123",
      } as NextRequest;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe("Test Video");
    });

    it("should return 400 for missing URL parameter", async () => {
      const request = {
        url: "http://localhost:3000/api/metadata",
      } as NextRequest;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("URL parameter is required");
    });
  });
});
