"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadHistory } from "@/types";
import { AlertTriangle, Download, History, Clock } from "lucide-react";

interface DuplicateWarningProps {
  duplicateInfo: DownloadHistory;
  onDownloadAnyway?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

export function DuplicateWarning({
  duplicateInfo,
  onDownloadAnyway,
  onViewHistory,
  className,
}: DuplicateWarningProps) {
  const formatDownloadDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return "just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFormatBadge = () => {
    const isAudio =
      duplicateInfo.format === "audio" ||
      duplicateInfo.filename.endsWith(".mp3");
    return (
      <Badge variant={isAudio ? "secondary" : "outline"} className="text-xs">
        {isAudio ? "Audio" : "Video"}
      </Badge>
    );
  };

  return (
    <Alert
      className={`border-yellow-200 bg-yellow-50 dark:bg-yellow-950 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="space-y-3">
          {/* Warning Header */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              Already Downloaded
            </span>
            {getFormatBadge()}
          </div>

          {/* Download Info */}
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                Downloaded{" "}
                {formatDownloadDate(new Date(duplicateInfo.downloadedAt))}
              </span>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-xs">
              <div className="font-medium mb-1">Previous download:</div>
              <div className="font-mono break-all">
                {duplicateInfo.filename}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {onDownloadAnyway && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadAnyway}
                className="gap-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-900"
              >
                <Download className="h-3 w-3" />
                Download Anyway
              </Button>
            )}

            {onViewHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewHistory}
                className="gap-2 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-900"
              >
                <History className="h-3 w-3" />
                View History
              </Button>
            )}
          </div>

          {/* Additional Info */}
          <div className="text-xs text-yellow-600 dark:text-yellow-400 pt-1 border-t border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <span>
                This video was previously downloaded in {duplicateInfo.format}{" "}
                format
              </span>
              <Badge
                variant="outline"
                className="text-xs border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300"
              >
                Duplicate
              </Badge>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
