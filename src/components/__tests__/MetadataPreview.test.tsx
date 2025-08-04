import { render, screen } from "@testing-library/react";
import { MetadataPreview } from "../MetadataPreview";
import { VideoMetadata } from "@/types";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe("MetadataPreview", () => {
  const mockMetadata: VideoMetadata = {
    id: "test123",
    title: "Test Video Title",
    thumbnail: "https://example.com/thumbnail.jpg",
    duration: 300, // 5 minutes
    uploader: "Test Channel",
    uploadDate: "2024-01-01",
    viewCount: 1000000,
    description:
      "This is a test video description that should be displayed in the preview.",
  };

  it("renders video metadata correctly", () => {
    render(<MetadataPreview metadata={mockMetadata} />);

    expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    expect(screen.getByText("Test Channel")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument(); // formatted duration
    expect(screen.getByText("1,000,000 views")).toBeInTheDocument();
    expect(
      screen.getByText(/This is a test video description/)
    ).toBeInTheDocument();
  });

  it("renders thumbnail image", () => {
    render(<MetadataPreview metadata={mockMetadata} />);

    const image = screen.getByAltText("Test Video Title");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/thumbnail.jpg");
  });

  it("shows playlist badge when isPlaylist is true", () => {
    render(
      <MetadataPreview
        metadata={mockMetadata}
        isPlaylist={true}
        playlistCount={5}
      />
    );

    expect(screen.getByText("Playlist (5 videos)")).toBeInTheDocument();
  });

  it("shows upload date badge", () => {
    render(<MetadataPreview metadata={mockMetadata} />);

    expect(screen.getByText("1/1/2024")).toBeInTheDocument();
  });

  it("handles missing thumbnail gracefully", () => {
    const metadataWithoutThumbnail = {
      ...mockMetadata,
      thumbnail: "",
    };

    render(<MetadataPreview metadata={metadataWithoutThumbnail} />);

    expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    expect(screen.queryByAltText("Test Video Title")).not.toBeInTheDocument();
  });

  it("handles missing uploader", () => {
    const metadataWithoutUploader = {
      ...mockMetadata,
      uploader: "",
    };

    render(<MetadataPreview metadata={metadataWithoutUploader} />);

    expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    expect(screen.queryByText("Test Channel")).not.toBeInTheDocument();
  });

  it("handles zero duration", () => {
    const metadataWithZeroDuration = {
      ...mockMetadata,
      duration: 0,
    };

    render(<MetadataPreview metadata={metadataWithZeroDuration} />);

    expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    expect(screen.queryByText("0:00")).not.toBeInTheDocument();
  });

  it("handles missing view count", () => {
    const metadataWithoutViews = {
      ...mockMetadata,
      viewCount: undefined,
    };

    render(<MetadataPreview metadata={metadataWithoutViews} />);

    expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    expect(screen.queryByText(/views/)).not.toBeInTheDocument();
  });

  it("handles missing description", () => {
    const metadataWithoutDescription = {
      ...mockMetadata,
      description: undefined,
    };

    render(<MetadataPreview metadata={metadataWithoutDescription} />);

    expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    expect(
      screen.queryByText(/This is a test video description/)
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MetadataPreview metadata={mockMetadata} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("truncates long titles", () => {
    const longTitleMetadata = {
      ...mockMetadata,
      title:
        "This is a very long video title that should be truncated when displayed in the metadata preview component",
    };

    render(<MetadataPreview metadata={longTitleMetadata} />);

    const titleElement = screen.getByText(/This is a very long video title/);
    expect(titleElement).toHaveClass("line-clamp-2");
  });

  it("truncates long descriptions", () => {
    const longDescriptionMetadata = {
      ...mockMetadata,
      description:
        "This is a very long description that should be truncated when displayed. ".repeat(
          10
        ),
    };

    render(<MetadataPreview metadata={longDescriptionMetadata} />);

    const descriptionElement = screen.getByText(
      /This is a very long description/
    );
    expect(descriptionElement).toHaveClass("line-clamp-3");
  });

  it("formats large view counts correctly", () => {
    const highViewMetadata = {
      ...mockMetadata,
      viewCount: 1234567890,
    };

    render(<MetadataPreview metadata={highViewMetadata} />);

    expect(screen.getByText("1,234,567,890 views")).toBeInTheDocument();
  });
});
