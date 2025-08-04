"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadJob } from "@/types";
import { formatDuration, formatFileSize } from "@/lib/utils";
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Play,
  X,
  FileDown,
} from "lucide-react";

interface DownloadQueueProps {
  downloads: DownloadJob[];
  onCancelDownload?: (downloadId: string) => void;
  onRetryDownload?: (downloadId: string) => void;
  onClearCompleted?: () => void;
  className?: string;
}

export function DownloadQueue({
  downloads,
  onCancelDownload,
  onRetryDownload,
  onClearCompleted,
  className,
}: DownloadQueueProps) {
  const [expandedDownloads, setExpandedDownloads] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (downloadId: string) => {
    const newExpanded = new Set(expandedDownloads);
    if (newExpanded.has(downloadId)) {
      newExpanded.delete(downloadId);
    } else {
      newExpanded.add(downloadId);
    }
    setExpandedDownloads(newExpanded);
  };

  const getStatusIcon = (status: DownloadJob["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "downloading":
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DownloadJob["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "downloading":
        return <Badge variant="default">Downloading</Badge>;
      case "complete":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Complete
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const activeDownloads = downloads.filter(
    (d) => d.status === "downloading" || d.status === "pending"
  );
  const completedDownloads = downloads.filter((d) => d.status === "complete");
  const erroredDownloads = downloads.filter((d) => d.status === "error");

  if (downloads.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Download Queue
            <Badge variant="outline">Empty</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No downloads in queue</p>
            <p className="text-sm">
              Downloads will appear here when you start them
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Download Queue
            <Badge variant="outline">
              {downloads.length} item{downloads.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>

          {completedDownloads.length > 0 && onClearCompleted && (
            <Button variant="outline" size="sm" onClick={onClearCompleted}>
              Clear Completed
            </Button>
          )}
        </div>

        {/* Queue Summary */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {activeDownloads.length > 0 && (
            <span>{activeDownloads.length} active</span>
          )}
          {completedDownloads.length > 0 && (
            <span>{completedDownloads.length} completed</span>
          )}
          {erroredDownloads.length > 0 && (
            <span>{erroredDownloads.length} failed</span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Download Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(download.status)}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                        {download.metadata.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{download.metadata.uploader}</span>
                        {download.metadata.duration > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDuration(download.metadata.duration)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(download.status)}

                    {/* Action Buttons */}
                    {download.status === "downloading" && onCancelDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelDownload(download.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}

                    {download.status === "error" && onRetryDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetryDownload(download.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {download.status === "downloading" && (
                  <div className="space-y-2">
                    <Progress value={download.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Downloading...</span>
                      <span>{Math.round(download.progress)}%</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {download.status === "error" && download.error && (
                  <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                    {download.error}
                  </div>
                )}

                {/* Success Message */}
                {download.status === "complete" && download.filename && (
                  <div className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-200">
                    <div className="flex items-center justify-between">
                      <span>Download completed</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Trigger download of the file
                          const link = document.createElement("a");
                          link.href = `/api/download/${encodeURIComponent(
                            download.filename!
                          )}`;
                          link.download = download.filename!;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Download Details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Format: {download.options.format}</span>
                    {download.options.includeSubtitles && (
                      <>
                        <span>•</span>
                        <span>
                          Subtitles:{" "}
                          {download.options.subtitleLanguage || "Yes"}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-xs">
                    {new Date(download.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
