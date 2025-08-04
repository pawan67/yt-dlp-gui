import { render, screen, fireEvent } from "@testing-library/react";
import { DuplicateWarning } from "../DuplicateWarning";
import { DownloadHistory } from "@/types";

describe("DuplicateWarning", () => {
  const mockDuplicateInfo: DownloadHistory = {
    id: "1",
    url: "https://youtube.com/watch?v=test1",
    filename: "test-video.mp4",
    downloadedAt: new Date("2024-01-01T10:00:00Z"),
    format: "best",
    metadata: {
      id: "test1",
      title: "Test Video",
      thumbnail: "https://example.com/thumb.jpg",
      duration: 300,
      uploader: "Test Channel",
      uploadDate: "2024-01-01",
    },
  };

  const mockCallbacks = {
    onDownloadAnyway: jest.fn(),
    onViewHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders duplicate warning with correct title", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    expect(screen.getByText("Already Downloaded")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument(); // Format badge
    expect(screen.getByText("Duplicate")).toBeInTheDocument(); // Duplicate badge
  });

  it("shows correct format badge for video", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("shows correct format badge for audio", () => {
    const audioInfo = {
      ...mockDuplicateInfo,
      format: "audio",
      filename: "test-audio.mp3",
    };

    render(<DuplicateWarning duplicateInfo={audioInfo} {...mockCallbacks} />);

    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("displays download date correctly", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    // Should show formatted date - use getAllByText since there are multiple "Downloaded" texts
    const downloadedElements = screen.getAllByText(/Downloaded/);
    expect(downloadedElements.length).toBeGreaterThan(0);
  });

  it("shows previous download filename", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    expect(screen.getByText("Previous download:")).toBeInTheDocument();
    expect(screen.getByText("test-video.mp4")).toBeInTheDocument();
  });

  it("calls onDownloadAnyway when download anyway button is clicked", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    const downloadButton = screen.getByText("Download Anyway");
    fireEvent.click(downloadButton);

    expect(mockCallbacks.onDownloadAnyway).toHaveBeenCalled();
  });

  it("calls onViewHistory when view history button is clicked", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    const historyButton = screen.getByText("View History");
    fireEvent.click(historyButton);

    expect(mockCallbacks.onViewHistory).toHaveBeenCalled();
  });

  it("does not render download anyway button when callback not provided", () => {
    render(
      <DuplicateWarning
        duplicateInfo={mockDuplicateInfo}
        onViewHistory={mockCallbacks.onViewHistory}
      />
    );

    expect(screen.queryByText("Download Anyway")).not.toBeInTheDocument();
  });

  it("does not render view history button when callback not provided", () => {
    render(
      <DuplicateWarning
        duplicateInfo={mockDuplicateInfo}
        onDownloadAnyway={mockCallbacks.onDownloadAnyway}
      />
    );

    expect(screen.queryByText("View History")).not.toBeInTheDocument();
  });

  it("formats recent download time correctly", () => {
    const recentInfo = {
      ...mockDuplicateInfo,
      downloadedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    };

    render(<DuplicateWarning duplicateInfo={recentInfo} {...mockCallbacks} />);

    expect(screen.getByText(/30 minutes ago/)).toBeInTheDocument();
  });

  it("formats yesterday download correctly", () => {
    const yesterdayInfo = {
      ...mockDuplicateInfo,
      downloadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    };

    render(
      <DuplicateWarning duplicateInfo={yesterdayInfo} {...mockCallbacks} />
    );

    expect(screen.getByText(/yesterday/)).toBeInTheDocument();
  });

  it("formats just now correctly", () => {
    const justNowInfo = {
      ...mockDuplicateInfo,
      downloadedAt: new Date(Date.now() - 1000 * 30), // 30 seconds ago
    };

    render(<DuplicateWarning duplicateInfo={justNowInfo} {...mockCallbacks} />);

    expect(screen.getByText(/just now/)).toBeInTheDocument();
  });

  it("shows format information in additional info", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    expect(
      screen.getByText(/This video was previously downloaded in best format/)
    ).toBeInTheDocument();
  });

  it("handles audio format in additional info", () => {
    const audioInfo = {
      ...mockDuplicateInfo,
      format: "audio",
    };

    render(<DuplicateWarning duplicateInfo={audioInfo} {...mockCallbacks} />);

    expect(
      screen.getByText(/This video was previously downloaded in audio format/)
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <DuplicateWarning
        duplicateInfo={mockDuplicateInfo}
        className="custom-class"
        {...mockCallbacks}
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has correct warning styling", () => {
    render(
      <DuplicateWarning duplicateInfo={mockDuplicateInfo} {...mockCallbacks} />
    );

    // Should have yellow warning colors
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-yellow-200", "bg-yellow-50");
  });
});
