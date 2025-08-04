import { NextRequest, NextResponse } from "next/server";
import { activeDownloads } from "@/lib/services/download-tracker";
import { ProgressEvent } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ downloadId: string }> }
) {
  const { downloadId } = await params;

  if (!downloadId) {
    return NextResponse.json(
      { error: "Download ID is required" },
      { status: 400 }
    );
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Function to send SSE data
      const sendEvent = (data: ProgressEvent) => {
        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      };

      // Wait a moment for download to initialize if not found immediately
      let downloadData = activeDownloads.get(downloadId);

      if (!downloadData) {
        // Wait up to 3 seconds for download to initialize
        let attempts = 0;
        const maxAttempts = 6; // 6 attempts * 500ms = 3 seconds

        const waitForDownload = () => {
          setTimeout(() => {
            downloadData = activeDownloads.get(downloadId);
            attempts++;

            if (downloadData) {
              // Download found, proceed with normal flow
              proceedWithDownload();
            } else if (attempts >= maxAttempts) {
              // Give up after max attempts
              sendEvent({
                type: "error",
                downloadId,
                error: "Download not found - may have failed to start",
              });
              controller.close();
            } else {
              // Try again
              waitForDownload();
            }
          }, 500);
        };

        waitForDownload();
        return;
      }

      // Download found immediately, proceed
      proceedWithDownload();

      function proceedWithDownload() {
        if (!downloadData) return;

        // Send current status
        if (downloadData.status === "complete") {
          sendEvent({
            type: "complete",
            downloadId,
            progress: 100,
            filename: downloadData.filename,
          });
          controller.close();
          return;
        }

        if (downloadData.status === "error") {
          sendEvent({
            type: "error",
            downloadId,
            error: downloadData.error || "Unknown error",
          });
          controller.close();
          return;
        }

        // Send progress updates
        sendEvent({
          type: "progress",
          downloadId,
          progress: downloadData.progress,
          terminalOutput: downloadData.terminalOutput || [],
        });

        // Set up interval to check for updates
        const interval = setInterval(() => {
          const currentData = activeDownloads.get(downloadId);

          if (!currentData) {
            sendEvent({
              type: "error",
              downloadId,
              error: "Download not found",
            });
            clearInterval(interval);
            controller.close();
            return;
          }

          if (currentData.status === "complete") {
            sendEvent({
              type: "complete",
              downloadId,
              progress: 100,
              filename: currentData.filename,
            });
            clearInterval(interval);
            controller.close();
            return;
          }

          if (currentData.status === "error") {
            sendEvent({
              type: "error",
              downloadId,
              error: currentData.error || "Unknown error",
            });
            clearInterval(interval);
            controller.close();
            return;
          }

          // Send progress update
          sendEvent({
            type: "progress",
            downloadId,
            progress: currentData.progress,
            terminalOutput: currentData.terminalOutput || [],
          });
        }, 1000); // Update every second

        // Clean up on close
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      }
    },
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
