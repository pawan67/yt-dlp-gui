// Simplified tests for YtDlpService core functionality

import { YtDlpService } from "../ytdlp";
import { YtDlpError } from "@/lib/errors";

describe("YtDlpService - Core Functionality", () => {
  let service: YtDlpService;

  beforeEach(() => {
    service = YtDlpService.getInstance();
  });

  test("should be a singleton", () => {
    const service1 = YtDlpService.getInstance();
    const service2 = YtDlpService.getInstance();
    expect(service1).toBe(service2);
  });

  test("should have required methods", () => {
    expect(typeof service.getMetadata).toBe("function");
    expect(typeof service.getFormats).toBe("function");
    expect(typeof service.downloadVideo).toBe("function");
    expect(typeof service.cancelDownload).toBe("function");
    expect(typeof service.checkAvailability).toBe("function");
  });

  test("should return false for non-existent download cancellation", () => {
    const cancelled = service.cancelDownload("non-existent-id");
    expect(cancelled).toBe(false);
  });
});
