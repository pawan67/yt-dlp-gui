// Tests for progress API route

import { GET } from "../progress/[downloadId]/route";
import { NextRequest } from "next/server";

// Mock the activeDownloads from download route
const mockActiveDownloads = new Map();

jest.mock("../download/route", () => ({
  activeDownloads: mockActiveDownloads,
}));

describe("/api/progress/[downloadId]", () => {
  beforeEach(() => {
    mockActiveDownloads.clear();
    jest.clearAllMocks();
  });

  it("should return error for missing download ID", async () => {
    const request = {
      signal: { addEventListener: jest.fn() },
    } as unknown as NextRequest;

    const params = Promise.resolve({ downloadId: "" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Download ID is required");
  });

  it("should return error for non-existent download", async () => {
    const request = {
      signal: { addEventListener: jest.fn() },
    } as unknown as NextRequest;

    const params = Promise.resolve({ downloadId: "non-existent" });

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("should return complete status for completed download", async () => {
    const downloadId = "test-complete";
    mockActiveDownloads.set(downloadId, {
      progress: 100,
      status: "complete",
      filename: "test-video.mp4",
    });

    const request = {
      signal: { addEventListener: jest.fn() },
    } as unknown as NextRequest;

    const params = Promise.resolve({ downloadId });

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.headers.get("Connection")).toBe("keep-alive");
  });

  it("should return error status for failed download", async () => {
    const downloadId = "test-error";
    mockActiveDownloads.set(downloadId, {
      progress: 0,
      status: "error",
      error: "Download failed",
    });

    const request = {
      signal: { addEventListener: jest.fn() },
    } as unknown as NextRequest;

    const params = Promise.resolve({ downloadId });

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("should return progress status for downloading", async () => {
    const downloadId = "test-progress";
    mockActiveDownloads.set(downloadId, {
      progress: 50,
      status: "downloading",
    });

    const request = {
      signal: { addEventListener: jest.fn() },
    } as unknown as NextRequest;

    const params = Promise.resolve({ downloadId });

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("should set correct CORS headers", async () => {
    const downloadId = "test-cors";
    mockActiveDownloads.set(downloadId, {
      progress: 0,
      status: "downloading",
    });

    const request = {
      signal: { addEventListener: jest.fn() },
    } as unknown as NextRequest;

    const params = Promise.resolve({ downloadId });

    const response = await GET(request, { params });

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Cache-Control"
    );
  });
});
