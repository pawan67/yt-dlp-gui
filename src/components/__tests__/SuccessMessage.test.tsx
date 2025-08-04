import { render, screen, fireEvent } from "@testing-library/react";
import { SuccessMessage } from "../SuccessMessage";

// Mock document.createElement and related DOM methods
const mockLink = {
  href: "",
  download: "",
  click: jest.fn(),
  style: { display: "" },
};

const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(document, "createElement", {
  value: jest.fn(() => mockLink),
  writable: true,
});

Object.defineProperty(document.body, "appendChild", {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, "removeChild", {
  value: mockRemoveChild,
  writable: true,
});

describe("SuccessMessage", () => {
  const mockOnDismiss = jest.fn();
  const mockOnDownloadAnother = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLink.href = "";
    mockLink.download = "";
  });

  it("renders success message with default title", () => {
    render(<SuccessMessage message="Download completed successfully!" />);

    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(
      screen.getByText("Download completed successfully!")
    ).toBeInTheDocument();
  });

  it("renders success message with custom title", () => {
    render(
      <SuccessMessage title="Custom Success" message="Operation completed!" />
    );

    expect(screen.getByText("Custom Success")).toBeInTheDocument();
    expect(screen.getByText("Operation completed!")).toBeInTheDocument();
  });

  it("shows filename when provided", () => {
    render(
      <SuccessMessage message="Download ready" filename="test-video.mp4" />
    );

    expect(screen.getByText("File:")).toBeInTheDocument();
    expect(screen.getByText("test-video.mp4")).toBeInTheDocument();
  });

  it("shows download button when downloadUrl is provided", () => {
    render(
      <SuccessMessage
        message="Download ready"
        downloadUrl="/api/download/test-video.mp4"
        filename="test-video.mp4"
      />
    );

    const downloadButton = screen.getByText("Download File");
    expect(downloadButton).toBeInTheDocument();
  });

  it("triggers download when download button is clicked", () => {
    render(
      <SuccessMessage
        message="Download ready"
        downloadUrl="/api/download/test-video.mp4"
        filename="test-video.mp4"
      />
    );

    const downloadButton = screen.getByText("Download File");
    fireEvent.click(downloadButton);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.href).toBe("/api/download/test-video.mp4");
    expect(mockLink.download).toBe("test-video.mp4");
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });

  it("uses default filename when filename not provided", () => {
    render(
      <SuccessMessage
        message="Download ready"
        downloadUrl="/api/download/test-video.mp4"
      />
    );

    const downloadButton = screen.getByText("Download File");
    fireEvent.click(downloadButton);

    expect(mockLink.download).toBe("download");
  });

  it("shows download another button when callback provided", () => {
    render(
      <SuccessMessage
        message="Download completed"
        onDownloadAnother={mockOnDownloadAnother}
      />
    );

    const downloadAnotherButton = screen.getByText("Download Another");
    expect(downloadAnotherButton).toBeInTheDocument();

    fireEvent.click(downloadAnotherButton);
    expect(mockOnDownloadAnother).toHaveBeenCalledTimes(1);
  });

  it("shows dismiss button when onDismiss provided", () => {
    render(
      <SuccessMessage message="Success message" onDismiss={mockOnDismiss} />
    );

    const dismissButton = screen.getByRole("button", { name: "" }); // X button has no text
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not show download button when downloadUrl not provided", () => {
    render(<SuccessMessage message="Success without download" />);

    expect(screen.queryByText("Download File")).not.toBeInTheDocument();
  });

  it("does not show download another button when callback not provided", () => {
    render(<SuccessMessage message="Success message" />);

    expect(screen.queryByText("Download Another")).not.toBeInTheDocument();
  });

  it("does not show dismiss button when onDismiss not provided", () => {
    render(<SuccessMessage message="Success message" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <SuccessMessage message="Test message" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has correct success styling", () => {
    const { container } = render(<SuccessMessage message="Success message" />);

    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert).toHaveClass("border-green-200", "bg-green-50");
  });

  it("shows both download and download another buttons when both provided", () => {
    render(
      <SuccessMessage
        message="Download ready"
        downloadUrl="/api/download/test.mp4"
        filename="test.mp4"
        onDownloadAnother={mockOnDownloadAnother}
      />
    );

    expect(screen.getByText("Download File")).toBeInTheDocument();
    expect(screen.getByText("Download Another")).toBeInTheDocument();
  });
});
