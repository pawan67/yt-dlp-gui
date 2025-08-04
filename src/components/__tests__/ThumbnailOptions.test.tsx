import { render, screen, fireEvent } from "@testing-library/react";
import { ThumbnailOptions } from "../ThumbnailOptions";

describe("ThumbnailOptions", () => {
  const mockOnEmbedThumbnailChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders thumbnail options with correct title", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    expect(screen.getByText("Thumbnail Options")).toBeInTheDocument();
    expect(
      screen.getByText("Embed thumbnail as album art")
    ).toBeInTheDocument();
  });

  it("shows audio format badge when audio format is selected", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    expect(screen.getByText("Audio Format")).toBeInTheDocument();
  });

  it("enables checkbox for audio formats", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeDisabled();
  });

  it("disables checkbox for video formats", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={false}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("handles thumbnail embedding toggle", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnEmbedThumbnailChange).toHaveBeenCalledWith(true);
  });

  it("shows thumbnail preview when thumbnail URL is provided", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={true}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
        thumbnailUrl="https://example.com/thumb.jpg"
      />
    );

    expect(screen.getByText("Thumbnail Preview")).toBeInTheDocument();
    expect(screen.getByAltText("Video thumbnail")).toBeInTheDocument();
  });

  it("shows audio format info when audio format is selected", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={true}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    expect(screen.getByText("Audio Format Detected")).toBeInTheDocument();
    expect(
      screen.getByText(/The video thumbnail will be embedded as album art/)
    ).toBeInTheDocument();
  });

  it("shows video format info when video format is selected", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={false}
      />
    );

    expect(screen.getByText("Video Format")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Thumbnail embedding is only available for audio formats/
      )
    ).toBeInTheDocument();
  });

  it("shows no thumbnail available message when appropriate", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={true}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
        thumbnailUrl=""
      />
    );

    expect(screen.getByText("No thumbnail available")).toBeInTheDocument();
    expect(
      screen.getByText(/This video doesn't have a thumbnail available/)
    ).toBeInTheDocument();
  });

  it("disables controls when disabled prop is true", () => {
    render(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
        disabled={true}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("shows different messages based on embedding state for audio format", () => {
    const { rerender } = render(
      <ThumbnailOptions
        embedThumbnail={true}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    expect(
      screen.getByText(/The video thumbnail will be embedded as album art/)
    ).toBeInTheDocument();

    rerender(
      <ThumbnailOptions
        embedThumbnail={false}
        onEmbedThumbnailChange={mockOnEmbedThumbnailChange}
        isAudioFormat={true}
      />
    );

    expect(
      screen.getByText(/The MP3 file will be created without embedded artwork/)
    ).toBeInTheDocument();
  });
});
