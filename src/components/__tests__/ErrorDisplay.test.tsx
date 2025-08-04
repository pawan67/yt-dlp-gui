import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorDisplay } from "../ErrorDisplay";
import { UserFriendlyError } from "@/types";

describe("ErrorDisplay", () => {
  const mockOnRetry = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders simple string error", () => {
    render(<ErrorDisplay error="Something went wrong" />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders UserFriendlyError object", () => {
    const error: UserFriendlyError = {
      message: "Network connection failed",
      type: "error",
      recoverable: true,
      suggestions: ["Check your internet connection", "Try again later"],
    };

    render(<ErrorDisplay error={error} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Network connection failed")).toBeInTheDocument();
    expect(screen.getByText("Suggestions:")).toBeInTheDocument();
    expect(
      screen.getByText("Check your internet connection")
    ).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("shows warning variant for warning type", () => {
    const warning: UserFriendlyError = {
      message: "This is a warning",
      type: "warning",
      recoverable: true,
    };

    render(<ErrorDisplay error={warning} />);

    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("This is a warning")).toBeInTheDocument();
  });

  it("shows info variant for info type", () => {
    const info: UserFriendlyError = {
      message: "This is information",
      type: "info",
      recoverable: false,
    };

    render(<ErrorDisplay error={info} />);

    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(screen.getByText("This is information")).toBeInTheDocument();
  });

  it("shows retry button for recoverable errors", () => {
    const error: UserFriendlyError = {
      message: "Recoverable error",
      type: "error",
      recoverable: true,
    };

    render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText("Try Again");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show retry button for non-recoverable errors", () => {
    const error: UserFriendlyError = {
      message: "Non-recoverable error",
      type: "error",
      recoverable: false,
    };

    render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("shows dismiss button when onDismiss is provided", () => {
    render(
      <ErrorDisplay error="Dismissible error" onDismiss={mockOnDismiss} />
    );

    const dismissButton = screen.getByRole("button", { name: "" }); // X button has no text
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not show dismiss button when onDismiss is not provided", () => {
    render(<ErrorDisplay error="Non-dismissible error" />);

    // Should not have any buttons if no onRetry or onDismiss
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ErrorDisplay error="Test error" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows destructive variant for error type", () => {
    const error: UserFriendlyError = {
      message: "Critical error",
      type: "error",
      recoverable: true,
    };

    const { container } = render(<ErrorDisplay error={error} />);

    expect(container.querySelector('[data-slot="alert"]')).toHaveClass(
      "border-destructive"
    );
  });

  it("handles error without suggestions", () => {
    const error: UserFriendlyError = {
      message: "Error without suggestions",
      type: "error",
      recoverable: true,
    };

    render(<ErrorDisplay error={error} />);

    expect(screen.getByText("Error without suggestions")).toBeInTheDocument();
    expect(screen.queryByText("Suggestions:")).not.toBeInTheDocument();
  });

  it("handles empty suggestions array", () => {
    const error: UserFriendlyError = {
      message: "Error with empty suggestions",
      type: "error",
      recoverable: true,
      suggestions: [],
    };

    render(<ErrorDisplay error={error} />);

    expect(
      screen.getByText("Error with empty suggestions")
    ).toBeInTheDocument();
    expect(screen.queryByText("Suggestions:")).not.toBeInTheDocument();
  });

  it("shows both retry and dismiss buttons when both callbacks provided", () => {
    const error: UserFriendlyError = {
      message: "Error with both actions",
      type: "error",
      recoverable: true,
    };

    render(
      <ErrorDisplay
        error={error}
        onRetry={mockOnRetry}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument(); // X button
  });
});
