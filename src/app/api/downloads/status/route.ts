import { NextResponse } from "next/server";
import { activeDownloads } from "@/lib/services/download-tracker";

export async function GET() {
  const downloads = Array.from(activeDownloads.entries()).map(([id, data]) => ({
    id,
    ...data,
    terminalOutput: data.terminalOutput.slice(-10), // Only last 10 lines for overview
  }));

  return NextResponse.json({
    totalDownloads: downloads.length,
    downloads,
  });
}
