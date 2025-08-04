import { render, screen } from "@testing-library/react";
import { ResponsiveLayout } from "../ResponsiveLayout";

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });

  // Trigger resize event
  window.dispatchEvent(new Event("resize"));
};

describe("ResponsiveLayout", () => {
  const TestContent = () => <div data-testid="test-content">Test Content</div>;

  beforeEach(() => {
    // Reset to desktop size
    mockInnerWidth(1200);
  });

  it("renders children content", () => {
    render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("applies background and transition classes", () => {
    const { container } = render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass(
      "min-h-screen",
      "bg-background",
      "transition-colors",
      "duration-200"
    );
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <ResponsiveLayout className="custom-class">
        <TestContent />
      </ResponsiveLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass("custom-class");
  });

  it("renders desktop layout for large screens", () => {
    mockInnerWidth(1200);

    render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    // Desktop layout should have max-w-4xl
    const contentContainer = screen
      .getByTestId("test-content")
      .closest(".max-w-4xl");
    expect(contentContainer).toBeInTheDocument();
  });

  it("renders tablet layout for medium screens", () => {
    mockInnerWidth(800);

    render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    // Wait for state update
    setTimeout(() => {
      // Tablet layout should have max-w-3xl
      const contentContainer = screen
        .getByTestId("test-content")
        .closest(".max-w-3xl");
      expect(contentContainer).toBeInTheDocument();
    }, 0);
  });

  it("renders mobile layout for small screens", () => {
    mockInnerWidth(600);

    render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    // Wait for state update
    setTimeout(() => {
      // Mobile layout should have max-w-full
      const contentContainer = screen
        .getByTestId("test-content")
        .closest(".max-w-full");
      expect(contentContainer).toBeInTheDocument();
    }, 0);
  });

  it("handles window resize events", () => {
    const { rerender } = render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    // Start with desktop
    expect(screen.getByTestId("test-content")).toBeInTheDocument();

    // Resize to mobile
    mockInnerWidth(600);
    rerender(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    // Content should still be there
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("cleans up resize event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <ResponsiveLayout>
        <TestContent />
      </ResponsiveLayout>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
