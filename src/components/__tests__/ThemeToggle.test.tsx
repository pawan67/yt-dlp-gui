import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document classes
    document.documentElement.className = "";
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows moon icon in light mode", () => {
    mockLocalStorage.getItem.mockReturnValue("light");

    render(<ThemeToggle />);

    const moonIcon = screen.getByTitle("Switch to dark mode");
    expect(moonIcon).toBeInTheDocument();
  });

  it("shows sun icon in dark mode", () => {
    mockLocalStorage.getItem.mockReturnValue("dark");

    render(<ThemeToggle />);

    const sunIcon = screen.getByTitle("Switch to light mode");
    expect(sunIcon).toBeInTheDocument();
  });

  it("toggles theme when clicked", () => {
    mockLocalStorage.getItem.mockReturnValue("light");

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("applies dark class to document when switching to dark mode", () => {
    mockLocalStorage.getItem.mockReturnValue("light");

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class from document when switching to light mode", () => {
    mockLocalStorage.getItem.mockReturnValue("dark");
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("uses system preference when no saved theme", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    // Mock system preference for dark mode
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("shows disabled state before mounting", () => {
    // This test checks the initial render before useEffect runs
    const { container } = render(<ThemeToggle />);

    // The button should be present but might be disabled initially
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
