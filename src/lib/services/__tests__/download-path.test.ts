import { YtDlpService } from "../ytdlp";
import path from "path";

// Mock the spawn function
jest.mock("child_process", () => {
  const mockChildProcess = {
    on: jest.fn(),
    stdout: {
      on: jest.fn(),
    },
    stderr: {
      on: jest.fn(),
    },
  };
  
  return {
    spawn: jest.fn(() => mockChildProcess),
  };
});

// Mock fs promises
jest.mock("fs", () => {
  return {
    promises: {
      mkdir: jest.fn(),
      access: jest.fn(),
      stat: jest.fn(),
      readFile: jest.fn(),
      unlink: jest.fn(),
    },
  };
});

describe("YtDlpService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("download path resolution", () => {
    it("should use DOWNLOADS_PATH environment variable when set", async () => {
      // Set environment variable
      process.env.DOWNLOADS_PATH = "/custom/downloads";
      
      const service = YtDlpService.getInstance();
      
      // Mock the process events to simulate successful download
      const mockSpawn = require("child_process").spawn;
      mockSpawn.mockImplementation(() => {
        const mockProcess = {
          on: jest.fn((event, callback) => {
            if (event === "close") {
              // Simulate successful completion
              setTimeout(() => callback(0), 1);
            }
          }),
          stdout: {
            on: jest.fn(),
          },
          stderr: {
            on: jest.fn(),
          },
        };
        return mockProcess;
      });
      
      // Mock fs.mkdir to avoid actual file system operations
      const fs = require("fs");
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      
      try {
        await service.downloadVideo({
          url: "https://example.com/video",
          format: "best",
          outputPath: "./downloads",
          includeSubtitles: false,
        });
      } catch (error) {
        // Expected to fail because we're not actually downloading
      }
      
      // Verify that mkdir was called with the correct path
      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.resolve("/custom/downloads"),
        { recursive: true }
      );
    });

    it("should use default download path when DOWNLOADS_PATH is not set", async () => {
      // Clear environment variable
      delete process.env.DOWNLOADS_PATH;
      
      const service = YtDlpService.getInstance();
      
      // Mock the process events to simulate successful download
      const mockSpawn = require("child_process").spawn;
      mockSpawn.mockImplementation(() => {
        const mockProcess = {
          on: jest.fn((event, callback) => {
            if (event === "close") {
              // Simulate successful completion
              setTimeout(() => callback(0), 1);
            }
          }),
          stdout: {
            on: jest.fn(),
          },
          stderr: {
            on: jest.fn(),
          },
        };
        return mockProcess;
      });
      
      // Mock fs.mkdir to avoid actual file system operations
      const fs = require("fs");
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      
      try {
        await service.downloadVideo({
          url: "https://example.com/video",
          format: "best",
          outputPath: "./downloads",
          includeSubtitles: false,
        });
      } catch (error) {
        // Expected to fail because we're not actually downloading
      }
      
      // Verify that mkdir was called with the correct path
      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.resolve("./downloads"),
        { recursive: true }
      );
    });
  });
});