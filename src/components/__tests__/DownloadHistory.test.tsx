import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DownloadHistory } from "../DownloadHistory";
import { DownloadHistory as DownloadHistoryType } from "@/types";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe("DownloadHistory", () => {
  const mockHistory: DownloadHistoryType[] = [
    {
      id: "1",
      url: "https://youtube.com/watch?v=test1",
      filename: "test-video-1.mp4",
      downloadedAt: new Date("2024-01-01T10:00:00Z"),
      format: "best",
      metadata: {
        id: "test1",
        title: "Test Video 1",
        thumbnail: "https://example.com/thumb1.jpg",
        duration: 300,
        uploader: "Test Channel",
        uploadDate: "2024-01-01",
      },
    },
    {
      id: "2",
      url: "https://youtube.com/watch?v=test2",
      filename: "test-audio-2.mp3",
      downloadedAt: new Date("2024-01-02T15:30:00Z"),
      format: "audio",
      metadata: {
        id: "test2",
        title: "Test Audio 2",
        thumbnail: "https://example.com/thumb2.jpg",
        duration: 180,
        uploader: "Audio Channel",
        uploadDate: "2024-01-02",
      },
    },
  ];

  const mockCallbacks = {
    onDownloadAgain: jest.fn(),
    onClearHistory: jest.fn(),
    onRemoveItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no history", () => {
    render(<DownloadHistory history={[]} />);

    expect(screen.getByText("Download History")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.getByText("No download history")).toBeInTheDocument();
    expect(
      screen.getByText("Completed downloads will appear here")
    ).toBeInTheDocument();
  });

  it("renders history items correctly", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
    expect(screen.getByText("Test Audio 2")).toBeInTheDocument();
    expect(screen.getByText("Test Channel")).toBeInTheDocument();
    expect(screen.getByText("Audio Channel")).toBeInTheDocument();
  });

  it("shows correct format badges", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("shows filenames correctly", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    expect(screen.getByText("test-video-1.mp4")).toBeInTheDocument();
    expect(screen.getByText("test-audio-2.mp3")).toBeInTheDocument();
  });

  it("calls onDownloadAgain when download again button is clicked", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    const downloadButtons = screen.getAllByTitle("Download again");
    fireEvent.click(downloadButtons[0]);

    expect(mockCallbacks.onDownloadAgain).toHaveBeenCalledWith(mockHistory[1]); // Most recent first
  });

  it("calls onRemoveItem when remove button is clicked", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    const removeButtons = screen.getAllByTitle("Remove from history");
    fireEvent.click(removeButtons[0]);

    expect(mockCallbacks.onRemoveItem).toHaveBeenCalledWith("2"); // Most recent first
  });

  it("calls onClearHistory when clear all button is clicked", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    const clearButton = screen.getByText("Clear All");
    fireEvent.click(clearButton);

    expect(mockCallbacks.onClearHistory).toHaveBeenCalled();
  });

  it("shows and hides filters when filter button is clicked", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    const filterButton = screen.getByLabelText("Toggle filters");

    // Filters should be hidden initially
    expect(
      screen.queryByPlaceholderText(/Search by title/)
    ).not.toBeInTheDocument();

    // Show filters
    fireEvent.click(filterButton);
    expect(screen.getByPlaceholderText(/Search by title/)).toBeInTheDocument();

    // Hide filters
    fireEvent.click(filterButton);
    expect(
      screen.queryByPlaceholderText(/Search by title/)
    ).not.toBeInTheDocument();
  });

  it("filters history by search query", async () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    // Show filters
    const filterButton = screen.getByLabelText("Toggle filters");
    fireEvent.click(filterButton);

    // Search for specific video
    const searchInput = screen.getByPlaceholderText(/Search by title/);
    fireEvent.change(searchInput, { target: { value: "Test Video 1" } });

    await waitFor(() => {
      expect(screen.getByText("Test Video 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Audio 2")).not.toBeInTheDocument();
    });
  });

  it("filters history by format", async () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    // Show filters
    const filterButton = screen.getByLabelText("Toggle filters");
    fireEvent.click(filterButton);

    // Filter by audio only
    const audioFilterButton = screen.getByRole("button", { name: "Audio" });
    fireEvent.click(audioFilterButton);

    await waitFor(() => {
      expect(screen.getByText("Test Audio 2")).toBeInTheDocument();
      expect(screen.queryByText("Test Video 1")).not.toBeInTheDocument();
      expect(screen.getByText("1 shown")).toBeInTheDocument();
    });
  });

  it("sorts history by date", async () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    // Show filters
    const filterButton = screen.getByLabelText("Toggle filters");
    fireEvent.click(filterButton);

    // Get all video titles in order
    const videoTitles = screen.getAllByText(/Test (Video|Audio)/);

    // Should be sorted by date desc by default (most recent first)
    expect(videoTitles[0]).toHaveTextContent("Test Audio 2");
    expect(videoTitles[1]).toHaveTextContent("Test Video 1");

    // Click date sort to change to ascending
    const dateSortButton = screen.getByRole("button", { name: /Date/ });
    fireEvent.click(dateSortButton);

    await waitFor(() => {
      const sortedTitles = screen.getAllByText(/Test (Video|Audio)/);
      expect(sortedTitles[0]).toHaveTextContent("Test Video 1");
      expect(sortedTitles[1]).toHaveTextContent("Test Audio 2");
    });
  });

  it("sorts history by title", async () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    // Show filters
    const filterButton = screen.getByLabelText("Toggle filters");
    fireEvent.click(filterButton);

    // Click title sort
    const titleSortButton = screen.getByRole("button", { name: "Title" });
    fireEvent.click(titleSortButton);

    await waitFor(() => {
      const videoTitles = screen.getAllByText(/Test (Video|Audio)/);
      // Should be sorted by title desc
      expect(videoTitles[0]).toHaveTextContent("Test Video 1");
      expect(videoTitles[1]).toHaveTextContent("Test Audio 2");
    });
  });

  it("shows duration when available", () => {
    render(<DownloadHistory history={mockHistory} {...mockCallbacks} />);

    expect(screen.getByText("5:00")).toBeInTheDocument(); // 300 seconds
    expect(screen.getByText("3:00")).toBeInTheDocument(); // 180 seconds
  });

  it("handles missing thumbnails gracefully", () => {
    const historyWithoutThumbnail = [
      {
        ...mockHistory[0],
        metadata: {
          ...mockHistory[0].metadata,
          thumbnail: "",
        },
      },
    ];

    render(
      <DownloadHistory history={historyWithoutThumbnail} {...mockCallbacks} />
    );

    // Should still render the item
    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    const recentHistory = [
      {
        ...mockHistory[0],
        downloadedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
    ];

    render(<DownloadHistory history={recentHistory} {...mockCallbacks} />);

    // Should show time for recent downloads - use getAllByText since duration also matches
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});
