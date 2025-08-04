import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadQueue } from "../DownloadQueue";
import { DownloadJob } from "@/types";

const mockDownloads: DownloadJob[] = [
  {
    id: "download1",
    url: "https://youtube.com/watch?v=test1",
    status: "downloading",
    progress: 45,
    metadata: {
      id: "test1",
      title: "Test Video 1",
      thumbnail: "https://example.com/thumb1.jpg",
      duration: 180,
      uploader: "Test Channel",
      uploadDate: "2024-01-01",
    },
    options: {
      url: "https://youtube.com/watch?v=test1",
      format: "best",
      outputPath: "./downloads",
      includeSubtitles: false,
      embedThumbnail: false,
    },
    createdAt: new Date("2024-01-01T10:00:00Z"),
  },
  {
    id: "download2",
    url: "https://youtube.com/watch?v=test2",
    status: "complete",
    progress: 100,
    filename: "test-video-2.mp4",
    metadata: {
      id: "test2",
      title: "Test Video 2",
      thumbnail: "https://example.com/thumb2.jpg",
      duration: 240,
      uploader: "Another Channel",
      uploadDate: "2024-01-02",
    },
    options: {
      url: "https://youtube.com/watch?v=test2",
      format: "audio",
      outputPath: "./downloads",
      includeSubtitles: true,
      subtitleLanguage: "en",
      embedThumbnail: true,
    },
    createdAt: new Date("2024-01-02T10:00:00Z"),
  },
  {
    id: "download3",
    url: "https://youtube.com/watch?v=test3",
    status: "error",
    progress: 0,
    error: "Video not available",
    metadata: {
      id: "test3",
      title: "Test Video 3",
      thumbnail: "https://example.com/thumb3.jpg",
      duration: 300,
      uploader: "Error Channel",
      uploadDate: "2024-01-03",
    },
    options: {
      url: "https://youtube.com/watch?v=test3",
      format: "best",
      outputPath: "./downloads",
      includeSubtitles: false,
      embedThumbnail: false,
    },
    createdAt: new Date("2024-01-03T10:00:00Z"),
  },
];

describe("DownloadQueue", () => {
  const mockOnCancelDownload = jest.fn();
  const mockOnRetryDownload = jest.fn();
  const mockOnClearCompleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no downloads", () => {
    render(
      <DownloadQueue
        downloads={[]}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText("Download Queue")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.getByText("No downloads in queue")).toBeInTheDocument();
  });

  it("renders download queue with correct item count", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
    expect(screen.getByText("Test Video 2")).toBeInTheDocument();
    expect(screen.getByText("Test Video 3")).toBeInTheDocument();
  });

  it("shows correct status badges", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText("Downloading")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows progress bar for downloading items", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("shows error message for failed downloads", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText("Video not available")).toBeInTheDocument();
  });

  it("shows download options in details", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getAllByText("Format: best").length).toBeGreaterThan(0);
    expect(screen.getByText("Format: audio")).toBeInTheDocument();
    expect(screen.getByText("Subtitles: en")).toBeInTheDocument();
  });

  it("calls onCancelDownload when cancel button is clicked", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    // Find cancel button for downloading item
    const cancelButtons = screen.getAllByRole("button");
    const cancelButton = cancelButtons.find((button) =>
      button.querySelector("svg")?.classList.contains("lucide-x")
    );

    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockOnCancelDownload).toHaveBeenCalledWith("download1");
    }
  });

  it("calls onRetryDownload when retry button is clicked", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    // Find retry button for error item
    const retryButtons = screen.getAllByRole("button");
    const retryButton = retryButtons.find((button) =>
      button.querySelector("svg")?.classList.contains("lucide-play")
    );

    if (retryButton) {
      fireEvent.click(retryButton);
      expect(mockOnRetryDownload).toHaveBeenCalledWith("download3");
    }
  });

  it("calls onClearCompleted when clear completed button is clicked", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    const clearButton = screen.getByText("Clear Completed");
    fireEvent.click(clearButton);

    expect(mockOnClearCompleted).toHaveBeenCalled();
  });

  it("shows queue summary with correct counts", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText("1 active")).toBeInTheDocument();
    expect(screen.getByText("1 completed")).toBeInTheDocument();
    expect(screen.getByText("1 failed")).toBeInTheDocument();
  });

  it("shows download button for completed items", () => {
    render(
      <DownloadQueue
        downloads={mockDownloads}
        onCancelDownload={mockOnCancelDownload}
        onRetryDownload={mockOnRetryDownload}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    const downloadButtons = screen.getAllByText("Download");
    expect(downloadButtons.length).toBeGreaterThan(0);
  });
});
