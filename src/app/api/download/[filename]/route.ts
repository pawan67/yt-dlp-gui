import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PATHS } from "@/lib/constants";

// Ensure download directory exists
const ensureDownloadDir = async () => {
  const downloadPath = path.resolve(PATHS.DOWNLOADS);
  await fs.mkdir(downloadPath, { recursive: true });
  return downloadPath;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const downloadPath = await ensureDownloadDir();
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(downloadPath, sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type based on file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".flac": "audio/flac",
      ".m4a": "audio/mp4",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
        "Cache-Control": "no-cache",
      },
    });

    // Schedule file cleanup after response is sent
    // Note: In a production environment, you might want to use a more robust cleanup mechanism
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      } catch (error) {
        console.error(`Failed to cleanup file ${filePath}:`, error);
      }
    }, 30000); // 30 second delay to ensure download completes

    return response;
  } catch (error) {
    console.error("File serving error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle HEAD requests for file info
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const downloadPath = await ensureDownloadDir();
    const { filename } = await params;

    if (!filename) {
      return new NextResponse(null, { status: 400 });
    }

    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(downloadPath, sanitizedFilename);

    // Check if file exists
    try {
      const stats = await fs.stat(filePath);

      const ext = path.extname(sanitizedFilename).toLowerCase();
      const contentTypeMap: Record<string, string> = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mkv": "video/x-matroska",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".flac": "audio/flac",
        ".m4a": "audio/mp4",
      };

      const contentType = contentTypeMap[ext] || "application/octet-stream";

      return new NextResponse(null, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": stats.size.toString(),
          "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    console.error("File HEAD request error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
