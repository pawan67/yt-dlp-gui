import { NextRequest, NextResponse } from "next/server";
import { YtDlpService } from "@/lib/services";
import { ErrorHandler } from "@/lib/errors";
import { isValidUrl, isVideoUrl } from "@/lib/utils";
import { MetadataRequest, MetadataResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: MetadataRequest = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required and must be a string" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    if (!isVideoUrl(url)) {
      return NextResponse.json(
        { error: "URL is not from a supported video platform" },
        { status: 400 }
      );
    }

    // Get metadata using yt-dlp service
    const ytdlpService = YtDlpService.getInstance();
    const metadata = await ytdlpService.getMetadata(url);

    const response: MetadataResponse = {
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
      uploader: metadata.uploader,
      isPlaylist: metadata.isPlaylist,
      playlistVideos: metadata.playlistVideos,
    };

    // Get formats if it's not a playlist
    if (!metadata.isPlaylist) {
      try {
        const formats = await ytdlpService.getFormats(url);
        response.formats = formats;
      } catch (error) {
        // Formats are optional, continue without them
        console.warn("Failed to get formats:", error);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Metadata API error:", error);

    const userFriendlyError = ErrorHandler.handleError(error as Error);

    return NextResponse.json(
      {
        error: userFriendlyError.message,
        type: userFriendlyError.type,
        recoverable: userFriendlyError.recoverable,
        suggestions: userFriendlyError.suggestions,
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  // Convert GET to POST format
  const mockRequest = {
    json: async () => ({ url }),
  } as NextRequest;

  return POST(mockRequest);
}
