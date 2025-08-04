import { render, screen, fireEvent } from "@testing-library/react";
import { FormatSelector } from "../FormatSelector";
import { Format } from "@/types";
import { DOWNLOAD_FORMATS } from "@/lib/constants";

const mockFormats: Format[] = [
  {
    formatId: "22",
    ext: "mp4",
    quality: "720p",
    resolution: "1280x720",
    vcodec: "h264",
    acodec: "aac",
    filesize: 50000000,
  },
  {
    formatId: "18",
    ext: "mp4",
    quality: "360p",
    resolution: "640x360",
    vcodec: "h264",
    acodec: "aac",
    filesize: 25000000,
  },
  {
    formatId: "140",
    ext: "m4a",
    quality: "audio",
    acodec: "aac",
    filesize: 5000000,
  },
];

describe("FormatSelector", () => {
  const mockOnFormatChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with basic format options", () => {
    render(
      <FormatSelector
        selectedFormat={DOWNLOAD_FORMATS.BEST}
        onFormatChange={mockOnFormatChange}
      />
    );

    expect(screen.getByText("Download Format")).toBeInTheDocument();
    expect(screen.getByText("Format Type")).toBeInTheDocument();
  });

  it("shows selected format info", () => {
    render(
      <FormatSelector
        selectedFormat={DOWNLOAD_FORMATS.BEST}
        onFormatChange={mockOnFormatChange}
      />
    );

    expect(
      screen.getAllByText(/Best Quality \(Video \+ Audio\)/).length
    ).toBeGreaterThan(0);
  });

  it("shows audio format info when audio selected", () => {
    render(
      <FormatSelector
        selectedFormat={DOWNLOAD_FORMATS.AUDIO}
        onFormatChange={mockOnFormatChange}
      />
    );

    expect(screen.getAllByText(/Audio Only \(MP3\)/).length).toBeGreaterThan(0);
  });

  it("shows advanced options when custom format selected", () => {
    render(
      <FormatSelector
        formats={mockFormats}
        selectedFormat={DOWNLOAD_FORMATS.CUSTOM}
        onFormatChange={mockOnFormatChange}
      />
    );

    expect(screen.getByText("Show Advanced Options")).toBeInTheDocument();
  });

  it("expands advanced options when button clicked", () => {
    render(
      <FormatSelector
        formats={mockFormats}
        selectedFormat={DOWNLOAD_FORMATS.CUSTOM}
        onFormatChange={mockOnFormatChange}
      />
    );

    const advancedButton = screen.getByText("Show Advanced Options");
    fireEvent.click(advancedButton);

    expect(screen.getByText("Video Formats")).toBeInTheDocument();
    expect(screen.getByText("Audio Formats")).toBeInTheDocument();
    expect(screen.getByText("Hide Advanced Options")).toBeInTheDocument();
  });

  it("displays video formats correctly", () => {
    render(
      <FormatSelector
        formats={mockFormats}
        selectedFormat={DOWNLOAD_FORMATS.CUSTOM}
        onFormatChange={mockOnFormatChange}
      />
    );

    const advancedButton = screen.getByText("Show Advanced Options");
    fireEvent.click(advancedButton);

    expect(screen.getByText("1280x720")).toBeInTheDocument();
    expect(screen.getByText("640x360")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("displays audio formats correctly", () => {
    render(
      <FormatSelector
        formats={mockFormats}
        selectedFormat={DOWNLOAD_FORMATS.CUSTOM}
        onFormatChange={mockOnFormatChange}
      />
    );

    const advancedButton = screen.getByText("Show Advanced Options");
    fireEvent.click(advancedButton);

    expect(screen.getByText("140")).toBeInTheDocument();
  });

  it("calls onFormatChange when format is selected", () => {
    render(
      <FormatSelector
        formats={mockFormats}
        selectedFormat={DOWNLOAD_FORMATS.CUSTOM}
        onFormatChange={mockOnFormatChange}
      />
    );

    const advancedButton = screen.getByText("Show Advanced Options");
    fireEvent.click(advancedButton);

    const format22 = screen.getByText("1280x720").closest("div");
    if (format22) {
      fireEvent.click(format22);
      expect(mockOnFormatChange).toHaveBeenCalledWith("22");
    }
  });

  it("disables selection when loading", () => {
    render(
      <FormatSelector
        selectedFormat={DOWNLOAD_FORMATS.BEST}
        onFormatChange={mockOnFormatChange}
        isLoading={true}
      />
    );

    const select = screen.getByRole("combobox");
    // Check for disabled state - could be disabled attribute or aria-disabled
    expect(
      select.hasAttribute("disabled") ||
        select.getAttribute("aria-disabled") === "true" ||
        select.hasAttribute("data-disabled")
    ).toBe(true);
  });

  it("shows custom format info when custom format selected", () => {
    render(
      <FormatSelector
        formats={mockFormats}
        selectedFormat="22"
        onFormatChange={mockOnFormatChange}
      />
    );

    expect(screen.getByText(/Custom Format \(22\)/)).toBeInTheDocument();
  });
});
