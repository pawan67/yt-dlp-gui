import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UrlInput } from "../UrlInput";

describe("UrlInput", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default placeholder", () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText(/Enter video URL/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Get Info/ })
    ).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(
      <UrlInput onSubmit={mockOnSubmit} placeholder="Custom placeholder" />
    );

    expect(
      screen.getByPlaceholderText("Custom placeholder")
    ).toBeInTheDocument();
  });

  it("disables input and button when loading", () => {
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows validation error for empty URL", async () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const button = screen.getByRole("button", { name: /Get Info/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Please enter a URL")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid URL", async () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /Get Info/ });

    fireEvent.change(input, { target: { value: "://invalid" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for unsupported platform", async () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /Get Info/ });

    fireEvent.change(input, { target: { value: "https://example.com/video" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("URL must be from a supported video platform")
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits valid YouTube URL", async () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /Get Info/ });

    fireEvent.change(input, {
      target: { value: "https://youtube.com/watch?v=test123" },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "https://youtube.com/watch?v=test123"
      );
    });
  });

  it("clears validation error when user starts typing", async () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /Get Info/ });

    // Trigger validation error
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Please enter a URL")).toBeInTheDocument();
    });

    // Start typing
    fireEvent.change(input, { target: { value: "h" } });

    await waitFor(() => {
      expect(screen.queryByText("Please enter a URL")).not.toBeInTheDocument();
    });
  });

  it("displays external error", () => {
    render(<UrlInput onSubmit={mockOnSubmit} error="External error message" />);

    expect(screen.getByText("External error message")).toBeInTheDocument();
  });

  it("handles form submission with Enter key", async () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, {
      target: { value: "https://youtube.com/watch?v=test123" },
    });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "https://youtube.com/watch?v=test123"
      );
    });
  });
});
