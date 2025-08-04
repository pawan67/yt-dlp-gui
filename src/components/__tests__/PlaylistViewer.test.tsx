import { render, screen, fireEvent } from "@testing-library/react";
import { PlaylistViewer } from "../PlaylistViewer";
import { PlaylistVideo } from "@/types";

const mockPlaylistVideos: PlaylistVideo[] = [
  {
    id: "video1",
    title: "First Video",
    thumbnail: "https://example.com/thumb1.jpg",
    duration: 180,
    url: "https://youtube.com/watch?v=video1",
    selected: false,
  },
  {
    id: "video2",
    title: "Second Video",
    thumbnail: "https://example.com/thumb2.jpg",
    duration: 240,
    url: "https://youtube.com/watch?v=video2",
    selected: false,
  },
  {
    id: "video3",
    title: "Third Video",
    thumbnail: "https://example.com/thumb3.jpg",
    duration: 300,
    url: "https://youtube.com/watch?v=video3",
    selected: false,
  },
];

describe("PlaylistViewer", () => {
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders playlist with correct video count", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getByText("Playlist Videos")).toBeInTheDocument();
    expect(screen.getByText("0 of 3 selected")).toBeInTheDocument();
    expect(screen.getByText("First Video")).toBeInTheDocument();
    expect(screen.getByText("Second Video")).toBeInTheDocument();
    expect(screen.getByText("Third Video")).toBeInTheDocument();
  });

  it("shows video durations correctly", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getAllByText("3:00").length).toBeGreaterThan(0); // 180 seconds
    expect(screen.getAllByText("4:00").length).toBeGreaterThan(0); // 240 seconds
    expect(screen.getAllByText("5:00").length).toBeGreaterThan(0); // 300 seconds
  });

  it("shows video numbers correctly", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
  });

  it("handles individual video selection", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]); // Select first video

    expect(mockOnSelectionChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "video1",
        selected: true,
      }),
    ]);
  });

  it("handles select all functionality", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "video1", selected: true }),
        expect.objectContaining({ id: "video2", selected: true }),
        expect.objectContaining({ id: "video3", selected: true }),
      ])
    );
  });

  it("handles select none functionality", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // First select all
    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    // Then select none
    const selectNoneButton = screen.getByText("Select None");
    fireEvent.click(selectNoneButton);

    expect(mockOnSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it("disables controls when loading", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
        isLoading={true}
      />
    );

    const selectAllButton = screen.getByText("Select All");
    const selectNoneButton = screen.getByText("Select None");
    const checkboxes = screen.getAllByRole("checkbox");

    expect(selectAllButton).toBeDisabled();
    expect(selectNoneButton).toBeDisabled();
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("shows selection summary when videos are selected", () => {
    const { rerender } = render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // Initially no summary
    expect(screen.queryByText(/videos? selected/)).not.toBeInTheDocument();

    // Select first video
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    // Should show summary after selection
    expect(screen.getByText("1 of 3 selected")).toBeInTheDocument();
  });

  it("calculates total duration correctly", () => {
    render(
      <PlaylistViewer
        videos={mockPlaylistVideos}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // Select all videos
    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    // Should show total duration (180 + 240 + 300 = 720 seconds = 12:00)
    expect(screen.getByText(/Total duration: 12:00/)).toBeInTheDocument();
  });

  it("handles empty playlist", () => {
    render(
      <PlaylistViewer videos={[]} onSelectionChange={mockOnSelectionChange} />
    );

    expect(screen.getByText("0 of 0 selected")).toBeInTheDocument();
    expect(screen.getByText("Select All")).toBeDisabled();
    expect(screen.getByText("Select None")).toBeDisabled();
  });
});
