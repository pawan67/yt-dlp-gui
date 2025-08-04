// Basic tests for utility functions

import {
  isValidUrl,
  isVideoUrl,
  isPlaylistUrl,
  sanitizeFilename,
  formatDuration,
  formatFileSize,
} from "../utils";

describe("URL validation utilities", () => {
  test("isValidUrl should validate URLs correctly", () => {
    expect(isValidUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true
    );
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });

  test("isVideoUrl should detect video URLs", () => {
    expect(isVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true
    );
    expect(isVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isVideoUrl("https://vimeo.com/123456789")).toBe(true);
    expect(isVideoUrl("https://example.com")).toBe(false);
  });

  test("isPlaylistUrl should detect playlist URLs", () => {
    expect(
      isPlaylistUrl("https://www.youtube.com/playlist?list=PLrAXtmRdnEQy")
    ).toBe(true);
    expect(
      isPlaylistUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmRdnEQy"
      )
    ).toBe(true);
    expect(isPlaylistUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      false
    );
  });
});

describe("File utilities", () => {
  test("sanitizeFilename should clean filenames", () => {
    expect(sanitizeFilename("My Video: Title")).toBe("My_Video__Title");
    expect(sanitizeFilename("Video with spaces")).toBe("Video_with_spaces");
    expect(sanitizeFilename("Normal_filename")).toBe("Normal_filename");
  });
});

describe("Formatting utilities", () => {
  test("formatDuration should format time correctly", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3665)).toBe("1:01:05");
    expect(formatDuration(30)).toBe("0:30");
  });

  test("formatFileSize should format bytes correctly", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(500)).toBe("500.0 B");
  });
});
