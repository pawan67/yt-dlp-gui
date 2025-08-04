import { render, screen, waitFor } from "@testing-library/react";
import { ProgressIndicator } from "../ProgressIndicator";

// Mock EventSource
class MockEventSource {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {}

  close() {}

  // Helper methods for testing
  simulateOpen() {
    if (this.onopen) {
      this.onopen(new Event("open"));
    }
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent("message", { data: JSON.stringify(data) })
      );
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event("error"));
    }
  }
}

// Mock EventSource globally
(global as any).EventSource = MockEventSource;

describe("ProgressIndicator", () => {
  let mockEventSource: MockEventSource;
  const mockProps = {
    downloadId: "test-download-123",
    onComplete: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Capture the EventSource instance
    const OriginalEventSource = (global as any).EventSource;
    (global as any).EventSource = jest
      .fn()
      .mockImplementation((url: string) => {
        mockEventSource = new OriginalEventSource(url);
        return mockEventSource;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders connecting state initially", () => {
    render(<ProgressIndicator {...mockProps} />);

    expect(screen.getByText("Connecting...")).toBeInTheDocument();
    expect(
      screen.getByTestId("clock-icon") || screen.getByText("Connecting...")
    ).toBeInTheDocument();
  });

  it("shows downloading state when EventSource opens", async () => {
    render(<ProgressIndicator {...mockProps} />);

    // Simulate EventSource opening
    mockEventSource.simulateOpen();

    await waitFor(() => {
      expect(screen.getByText("Downloading...")).toBeInTheDocument();
    });
  });

  it("displays progress updates", async () => {
    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Simulate progress update
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 45,
      speed: 1024000, // 1MB/s
      eta: 120, // 2 minutes
      downloadedBytes: 45000000,
      totalBytes: 100000000,
    });

    await waitFor(() => {
      expect(screen.getByText("45%")).toBeInTheDocument();
      expect(screen.getByText("1.0 MB/s")).toBeInTheDocument();
      expect(screen.getByText("ETA: 2m")).toBeInTheDocument();
    });
  });

  it("shows completion state and calls onComplete", async () => {
    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Simulate completion
    mockEventSource.simulateMessage({
      type: "complete",
      filename: "test-video.mp4",
    });

    await waitFor(() => {
      expect(screen.getByText("Complete")).toBeInTheDocument();
      expect(
        screen.getByText("Download completed: test-video.mp4")
      ).toBeInTheDocument();
      expect(mockProps.onComplete).toHaveBeenCalledWith("test-video.mp4");
    });
  });

  it("shows error state and calls onError", async () => {
    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Simulate error
    mockEventSource.simulateMessage({
      type: "error",
      error: "Download failed: Network error",
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Download failed: Network error")
      ).toBeInTheDocument();
      expect(mockProps.onError).toHaveBeenCalledWith(
        "Download failed: Network error"
      );
    });
  });

  it("handles EventSource connection errors", async () => {
    render(<ProgressIndicator {...mockProps} />);

    // Simulate connection error
    mockEventSource.simulateError();

    await waitFor(() => {
      expect(mockProps.onError).toHaveBeenCalledWith("Connection lost");
    });
  });

  it("formats file sizes correctly", async () => {
    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Test different file sizes
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 50,
      downloadedBytes: 1536, // 1.5 KB
      totalBytes: 3072, // 3 KB
    });

    await waitFor(() => {
      expect(screen.getByText(/1\.5 KB \/ 3\.0 KB/)).toBeInTheDocument();
    });
  });

  it("formats speed correctly", async () => {
    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Test different speeds
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 25,
      speed: 512, // 512 B/s
    });

    await waitFor(() => {
      expect(screen.getByText("512 B/s")).toBeInTheDocument();
    });

    // Test KB/s
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 30,
      speed: 2048, // 2 KB/s
    });

    await waitFor(() => {
      expect(screen.getByText("2.0 KB/s")).toBeInTheDocument();
    });
  });

  it("formats ETA correctly", async () => {
    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Test seconds
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 25,
      eta: 45,
    });

    await waitFor(() => {
      expect(screen.getByText("ETA: 45s")).toBeInTheDocument();
    });

    // Test minutes
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 30,
      eta: 150, // 2.5 minutes
    });

    await waitFor(() => {
      expect(screen.getByText("ETA: 3m")).toBeInTheDocument();
    });

    // Test hours
    mockEventSource.simulateMessage({
      type: "progress",
      progress: 35,
      eta: 7200, // 2 hours
    });

    await waitFor(() => {
      expect(screen.getByText("ETA: 2h")).toBeInTheDocument();
    });
  });

  it("handles missing downloadId", () => {
    render(<ProgressIndicator {...mockProps} downloadId="" />);

    // Should not create EventSource with empty downloadId
    expect((global as any).EventSource).not.toHaveBeenCalled();
  });

  it("cleans up EventSource on unmount", () => {
    const { unmount } = render(<ProgressIndicator {...mockProps} />);

    const closeSpy = jest.spyOn(mockEventSource, "close");

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ProgressIndicator {...mockProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles malformed JSON in EventSource messages", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(<ProgressIndicator {...mockProps} />);

    mockEventSource.simulateOpen();

    // Simulate malformed JSON
    if (mockEventSource.onmessage) {
      mockEventSource.onmessage(
        new MessageEvent("message", { data: "invalid json" })
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error parsing progress data:",
      expect.any(SyntaxError)
    );

    consoleSpy.mockRestore();
  });
});
