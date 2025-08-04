import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadButton } from "../DownloadButton";

describe("DownloadButton", () => {
  const mockOnDownload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders download button in idle state", () => {
    render(<DownloadButton onDownload={mockOnDownload} />);

    const button = screen.getByRole("button", { name: /download/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("calls onDownload when clicked", () => {
    render(<DownloadButton onDownload={mockOnDownload} />);

    const button = screen.getByRole("button", { name: /download/i });
    fireEvent.click(button);

    expect(mockOnDownload).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when downloading", () => {
    render(
      <DownloadButton
        onDownload={mockOnDownload}
        status="downloading"
        isLoading={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Downloading...")).toBeInTheDocument();
  });

  it("shows progress bar when downloading with progress", () => {
    render(
      <DownloadButton
        onDownload={mockOnDownload}
        status="downloading"
        progress={50}
      />
    );

    expect(screen.getByText("Downloading...")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows complete state when download is finished", () => {
    render(<DownloadButton onDownload={mockOnDownload} status="complete" />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(
      screen.getByText("Download completed successfully!")
    ).toBeInTheDocument();
  });

  it("shows error state when download fails", () => {
    const errorMessage = "Download failed";
    render(
      <DownloadButton
        onDownload={mockOnDownload}
        status="error"
        error={errorMessage}
      />
    );

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled(); // Should allow retry
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<DownloadButton onDownload={mockOnDownload} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders custom children text", () => {
    render(
      <DownloadButton onDownload={mockOnDownload}>
        Custom Download Text
      </DownloadButton>
    );

    expect(screen.getByText("Custom Download Text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <DownloadButton onDownload={mockOnDownload} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows correct variant for different states", () => {
    const { rerender } = render(
      <DownloadButton onDownload={mockOnDownload} status="complete" />
    );

    let button = screen.getByRole("button");
    expect(button).toHaveClass("bg-primary"); // default variant

    rerender(<DownloadButton onDownload={mockOnDownload} status="error" />);

    button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive"); // destructive variant
  });
});
