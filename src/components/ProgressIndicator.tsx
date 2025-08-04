"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/utils";
import { Download, CheckCircle, XCircle, Clock } from "lucide-react";

interface ProgressData {
  type: "progress" | "complete" | "error";
  progress?: number;
  filename?: string;
  error?: string;
  speed?: number;
  eta?: number;
  downloadedBytes?: number;
  totalBytes?: number;
}

interface ProgressIndicatorProps {
  downloadId: string;
  onComplete?: (filename?: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ProgressIndicator({
  downloadId,
  onComplete,
  onError,
  className,
}: ProgressIndicatorProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [status, setStatus] = useState<
    "connecting" | "downloading" | "complete" | "error"
  >("connecting");

  useEffect(() => {
    if (!downloadId) return;

    const eventSource = new EventSource(`/api/progress/${downloadId}`);

    eventSource.onopen = () => {
      setStatus("downloading");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressData = JSON.parse(event.data);
        setProgressData(data);

        switch (data.type) {
          case "progress":
            setStatus("downloading");
            break;

          case "complete":
            setStatus("complete");
            onComplete?.(data.filename);
            eventSource.close();
            break;

          case "error":
            setStatus("error");
            onError?.(data.error || "Download failed");
            eventSource.close();
            break;
        }
      } catch (error) {
        console.error("Error parsing progress data:", error);
      }
    };

    eventSource.onerror = () => {
      if (status === "downloading") {
        // Assume completion if we were downloading
        setStatus("complete");
        onComplete?.();
      } else {
        setStatus("error");
        onError?.("Connection lost");
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [downloadId, onComplete, onError, status]);

  const getStatusIcon = () => {
    switch (status) {
      case "connecting":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "downloading":
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "Connecting...";
      case "downloading":
        return "Downloading...";
      case "complete":
        return "Complete";
      case "error":
        return "Error";
    }
  };

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024)
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatETA = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>

          {progressData?.progress !== undefined && (
            <Badge variant="outline">
              {Math.round(progressData.progress)}%
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {status === "downloading" && progressData?.progress !== undefined && (
          <Progress value={progressData.progress} className="h-2" />
        )}

        {/* Download Stats */}
        {status === "downloading" && progressData && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {progressData.downloadedBytes && progressData.totalBytes && (
                <span>
                  {formatFileSize(progressData.downloadedBytes)} /{" "}
                  {formatFileSize(progressData.totalBytes)}
                </span>
              )}

              {progressData.speed && (
                <span>{formatSpeed(progressData.speed)}</span>
              )}
            </div>

            {progressData.eta && (
              <span>ETA: {formatETA(progressData.eta)}</span>
            )}
          </div>
        )}

        {/* Success Message */}
        {status === "complete" && progressData?.filename && (
          <div className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-200">
            Download completed: {progressData.filename}
          </div>
        )}

        {/* Error Message */}
        {status === "error" && progressData?.error && (
          <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
            {progressData.error}
          </div>
        )}
      </div>
    </div>
  );
}
