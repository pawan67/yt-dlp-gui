import { render, screen, fireEvent } from "@testing-library/react";
import { SubtitleOptions } from "../SubtitleOptions";

const mockLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French", auto: true },
  { code: "de", name: "German", auto: true },
];

describe("SubtitleOptions", () => {
  const mockOnIncludeSubtitlesChange = jest.fn();
  const mockOnLanguageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders subtitle options with correct title", () => {
    render(
      <SubtitleOptions
        includeSubtitles={false}
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(screen.getByText("Subtitle Options")).toBeInTheDocument();
    expect(
      screen.getByText("Include subtitles in download")
    ).toBeInTheDocument();
  });

  it("shows language count badge when languages are available", () => {
    render(
      <SubtitleOptions
        availableLanguages={mockLanguages}
        includeSubtitles={false}
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(screen.getByText("4 languages available")).toBeInTheDocument();
  });

  it("handles subtitle inclusion toggle", () => {
    render(
      <SubtitleOptions
        includeSubtitles={false}
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnIncludeSubtitlesChange).toHaveBeenCalledWith(true);
  });

  it("shows language selector when subtitles are enabled", () => {
    render(
      <SubtitleOptions
        availableLanguages={mockLanguages}
        includeSubtitles={true}
        selectedLanguage="en"
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(screen.getByText("Subtitle Language")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays selected language correctly", () => {
    render(
      <SubtitleOptions
        availableLanguages={mockLanguages}
        includeSubtitles={true}
        selectedLanguage="es"
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(screen.getAllByText("Spanish").length).toBeGreaterThan(0);
  });

  it("shows auto-generated subtitle info when available", () => {
    render(
      <SubtitleOptions
        availableLanguages={mockLanguages}
        includeSubtitles={true}
        selectedLanguage="en"
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(
      screen.getByText(/Auto-generated subtitles may have lower accuracy/)
    ).toBeInTheDocument();
  });

  it("shows no subtitles available message when appropriate", () => {
    render(
      <SubtitleOptions
        availableLanguages={[]}
        includeSubtitles={true}
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(screen.getByText("No subtitles available")).toBeInTheDocument();
    expect(
      screen.getByText(/This video doesn't have subtitles available/)
    ).toBeInTheDocument();
  });

  it("disables controls when disabled prop is true", () => {
    render(
      <SubtitleOptions
        includeSubtitles={false}
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
        disabled={true}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("calls onLanguageChange when default language is set on enable", () => {
    render(
      <SubtitleOptions
        includeSubtitles={false}
        selectedLanguage=""
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnLanguageChange).toHaveBeenCalledWith("en");
  });

  it("shows subtitle embedding info", () => {
    render(
      <SubtitleOptions
        includeSubtitles={true}
        selectedLanguage="en"
        onIncludeSubtitlesChange={mockOnIncludeSubtitlesChange}
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(
      screen.getByText(/Subtitles will be embedded in the video file/)
    ).toBeInTheDocument();
  });
});
