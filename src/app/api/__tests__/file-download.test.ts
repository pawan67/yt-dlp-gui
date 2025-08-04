// Tests for file download API route

import { GET, HEAD } from "../download/[filename]/route";
import { NextRequest } from "next/server";
import { promises as fs } from "fs";

// Mock fs promises
jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("/api/download/[filename]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("GET", () => {
    it("should serve existing file with correct headers", async () => {
      const filename = "test-video.mp4";
      const fileBuffer = Buffer.from("fake video content");
      const fileStats = { size: fileBuffer.length };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue(fileStats as any);
      mockFs.readFile.mockResolvedValue(fileBuffer);

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("video/mp4");
      expect(response.headers.get("Content-Length")).toBe(
        fileBuffer.length.toString()
      );
      expect(response.headers.get("Content-Disposition")).toBe(
        `attachment; filename="${filename}"`
      );
      expect(response.headers.get("Cache-Control")).toBe("no-cache");

      // Check that file cleanup is scheduled
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it("should serve audio file with correct content type", async () => {
      const filename = "test-audio.mp3";
      const fileBuffer = Buffer.from("fake audio content");
      const fileStats = { size: fileBuffer.length };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue(fileStats as any);
      mockFs.readFile.mockResolvedValue(fileBuffer);

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("audio/mpeg");
    });

    it("should handle different file extensions", async () => {
      const testCases = [
        { filename: "test.webm", expectedType: "video/webm" },
        { filename: "test.mkv", expectedType: "video/x-matroska" },
        { filename: "test.wav", expectedType: "audio/wav" },
        { filename: "test.flac", expectedType: "audio/flac" },
        { filename: "test.m4a", expectedType: "audio/mp4" },
        { filename: "test.unknown", expectedType: "application/octet-stream" },
      ];

      for (const testCase of testCases) {
        const fileBuffer = Buffer.from("fake content");
        const fileStats = { size: fileBuffer.length };

        mockFs.access.mockResolvedValue(undefined);
        mockFs.stat.mockResolvedValue(fileStats as any);
        mockFs.readFile.mockResolvedValue(fileBuffer);

        const request = {} as NextRequest;
        const params = Promise.resolve({ filename: testCase.filename });

        const response = await GET(request, { params });

        expect(response.headers.get("Content-Type")).toBe(
          testCase.expectedType
        );
      }
    });

    it("should return 400 for missing filename", async () => {
      const request = {} as NextRequest;
      const params = Promise.resolve({ filename: "" });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Filename is required");
    });

    it("should return 404 for non-existent file", async () => {
      const filename = "non-existent.mp4";

      mockFs.access.mockRejectedValue(new Error("File not found"));

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("File not found");
    });

    it("should sanitize filename to prevent directory traversal", async () => {
      const maliciousFilename = "../../../etc/passwd";
      const sanitizedFilename = "passwd";
      const fileBuffer = Buffer.from("fake content");
      const fileStats = { size: fileBuffer.length };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue(fileStats as any);
      mockFs.readFile.mockResolvedValue(fileBuffer);

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename: maliciousFilename });

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Disposition")).toBe(
        `attachment; filename="${sanitizedFilename}"`
      );
    });

    it("should handle file read errors", async () => {
      const filename = "test-video.mp4";

      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockRejectedValue(new Error("Read error"));

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should schedule file cleanup after serving", async () => {
      const filename = "test-video.mp4";
      const fileBuffer = Buffer.from("fake video content");
      const fileStats = { size: fileBuffer.length };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue(fileStats as any);
      mockFs.readFile.mockResolvedValue(fileBuffer);
      mockFs.unlink.mockResolvedValue(undefined);

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      await GET(request, { params });

      // Fast-forward time to trigger cleanup
      jest.advanceTimersByTime(5000);

      expect(mockFs.unlink).toHaveBeenCalled();
    });
  });

  describe("HEAD", () => {
    it("should return file info without content", async () => {
      const filename = "test-video.mp4";
      const fileStats = { size: 1024 };

      mockFs.stat.mockResolvedValue(fileStats as any);

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await HEAD(request, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("video/mp4");
      expect(response.headers.get("Content-Length")).toBe("1024");
      expect(response.headers.get("Content-Disposition")).toBe(
        `attachment; filename="${filename}"`
      );
    });

    it("should return 400 for missing filename", async () => {
      const request = {} as NextRequest;
      const params = Promise.resolve({ filename: "" });

      const response = await HEAD(request, { params });

      expect(response.status).toBe(400);
    });

    it("should return 404 for non-existent file", async () => {
      const filename = "non-existent.mp4";

      mockFs.stat.mockRejectedValue(new Error("File not found"));

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await HEAD(request, { params });

      expect(response.status).toBe(404);
    });

    it("should handle stat errors", async () => {
      const filename = "test-video.mp4";

      mockFs.stat.mockRejectedValue(new Error("Stat error"));

      const request = {} as NextRequest;
      const params = Promise.resolve({ filename });

      const response = await HEAD(request, { params });

      expect(response.status).toBe(404);
    });
  });
});
