import { renderHook, act } from "@testing-library/react";
import { useDownloadHistory } from "../useDownloadHistory";
import { VideoMetadata } from "@/types";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useDownloadHistory", () => {
  const mockMetadata: VideoMetadata = {
    id: "test1",
    title: "Test Video",
    thumbnail: "https://example.com/thumb.jpg",
    duration: 300,
    uploader: "Test Channel",
    uploadDate: "2024-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("initializes with empty history", () => {
    const { result } = renderHook(() => useDownloadHistory());

    expect(result.current.history).toEqual([]);
    expect(result.current.isDuplicate("test-url")).toBe(false);
    expect(result.current.getDuplicateInfo("test-url")).toBeNull();
  });

  it("loads history from localStorage on mount", () => {
    const savedHistory = JSON.stringify([
      {
        id: "1",
        url: "https://test.com",
        filename: "test.mp4",
        downloadedAt: "2024-01-01T10:00:00.000Z",
        format: "best",
        metadata: mockMetadata,
      },
    ]);

    localStorageMock.getItem.mockReturnValue(savedHistory);

    const { result } = renderHook(() => useDownloadHistory());

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].url).toBe("https://test.com");
    expect(result.current.history[0].downloadedAt).toBeInstanceOf(Date);
  });

  it("handles corrupted localStorage data gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid-json");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useDownloadHistory());

    expect(result.current.history).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load download history:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("adds new item to history", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test.mp4",
        "best",
        "https://test.com"
      );
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({
      url: "https://test.com",
      filename: "test.mp4",
      format: "best",
      metadata: mockMetadata,
    });
    expect(result.current.history[0].id).toBeDefined();
    expect(result.current.history[0].downloadedAt).toBeInstanceOf(Date);
  });

  it("saves history to localStorage when updated", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test.mp4",
        "best",
        "https://test.com"
      );
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "video-downloader-history",
      expect.stringContaining("https://test.com")
    );
  });

  it("handles localStorage save errors gracefully", () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error("Storage full");
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test.mp4",
        "best",
        "https://test.com"
      );
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to save download history:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("removes existing duplicate when adding same URL", () => {
    const { result } = renderHook(() => useDownloadHistory());

    // Add first download
    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test1.mp4",
        "best",
        "https://test.com"
      );
    });

    expect(result.current.history).toHaveLength(1);

    // Add same URL again
    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test2.mp4",
        "audio",
        "https://test.com"
      );
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].filename).toBe("test2.mp4");
    expect(result.current.history[0].format).toBe("audio");
  });

  it("limits history size to maximum", () => {
    const { result } = renderHook(() => useDownloadHistory());

    // Add more than max items (assuming MAX_HISTORY_ITEMS = 1000)
    act(() => {
      for (let i = 0; i < 1001; i++) {
        result.current.addToHistory(
          mockMetadata,
          `test${i}.mp4`,
          "best",
          `https://test${i}.com`
        );
      }
    });

    expect(result.current.history).toHaveLength(1000);
    // Most recent should be first
    expect(result.current.history[0].url).toBe("https://test1000.com");
  });

  it("removes item from history", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test1.mp4",
        "best",
        "https://test1.com"
      );
      result.current.addToHistory(
        mockMetadata,
        "test2.mp4",
        "best",
        "https://test2.com"
      );
    });

    const itemId = result.current.history[0].id;

    act(() => {
      result.current.removeFromHistory(itemId);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].url).toBe("https://test1.com");
  });

  it("clears all history", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test1.mp4",
        "best",
        "https://test1.com"
      );
      result.current.addToHistory(
        mockMetadata,
        "test2.mp4",
        "best",
        "https://test2.com"
      );
    });

    expect(result.current.history).toHaveLength(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(0);
  });

  it("detects duplicates correctly", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test.mp4",
        "best",
        "https://test.com"
      );
    });

    expect(result.current.isDuplicate("https://test.com")).toBe(true);
    expect(result.current.isDuplicate("https://other.com")).toBe(false);
  });

  it("returns duplicate info correctly", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "test.mp4",
        "best",
        "https://test.com"
      );
    });

    const duplicateInfo = result.current.getDuplicateInfo("https://test.com");
    expect(duplicateInfo).not.toBeNull();
    expect(duplicateInfo?.url).toBe("https://test.com");
    expect(duplicateInfo?.filename).toBe("test.mp4");

    const noDuplicate = result.current.getDuplicateInfo("https://other.com");
    expect(noDuplicate).toBeNull();
  });

  it("searches history correctly", () => {
    const { result } = renderHook(() => useDownloadHistory());

    const metadata1 = {
      ...mockMetadata,
      title: "JavaScript Tutorial",
      uploader: "Code Channel",
    };
    const metadata2 = {
      ...mockMetadata,
      title: "Python Guide",
      uploader: "Learn Channel",
    };

    act(() => {
      result.current.addToHistory(
        metadata1,
        "js-tutorial.mp4",
        "best",
        "https://test1.com"
      );
      result.current.addToHistory(
        metadata2,
        "python-guide.mp4",
        "best",
        "https://test2.com"
      );
    });

    // Search by title
    const jsResults = result.current.searchHistory("JavaScript");
    expect(jsResults).toHaveLength(1);
    expect(jsResults[0].metadata.title).toBe("JavaScript Tutorial");

    // Search by uploader
    const codeResults = result.current.searchHistory("Code");
    expect(codeResults).toHaveLength(1);
    expect(codeResults[0].metadata.uploader).toBe("Code Channel");

    // Search by filename
    const pythonResults = result.current.searchHistory("python-guide");
    expect(pythonResults).toHaveLength(1);
    expect(pythonResults[0].filename).toBe("python-guide.mp4");

    // Search by URL
    const urlResults = result.current.searchHistory("test1.com");
    expect(urlResults).toHaveLength(1);
    expect(urlResults[0].url).toBe("https://test1.com");

    // Empty search returns all
    const allResults = result.current.searchHistory("");
    expect(allResults).toHaveLength(2);

    // No matches
    const noResults = result.current.searchHistory("nonexistent");
    expect(noResults).toHaveLength(0);
  });

  it("search is case insensitive", () => {
    const { result } = renderHook(() => useDownloadHistory());

    act(() => {
      result.current.addToHistory(
        mockMetadata,
        "Test-Video.mp4",
        "best",
        "https://test.com"
      );
    });

    const results = result.current.searchHistory("test video");
    expect(results).toHaveLength(1);
  });
});
