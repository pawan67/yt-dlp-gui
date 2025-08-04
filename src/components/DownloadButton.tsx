"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  onDownload: () => void;
  isLoading?: boolean;
  progress?: number;
  status?: "idle" | "downloading" | "complete" | "error";
  error?: string | null;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function DownloadButton({
  onDownload,
  isLoading = false,
  progress = 0,
  status = "idle",
  error,
  disabled = false,
  className,
  children = "Download",
}: DownloadButtonProps) {
  const isDownloading = status === "downloading" || isLoading;
  const isComplete = status === "complete";
  const hasError = status === "error" || !!error;

  const getButtonContent = () => {
    if (isComplete) {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Complete
        </>
      );
    }

    if (hasError) {
      return (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Failed
        </>
      );
    }

    if (isDownloading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      );
    }

    return (
      <>
        <Download className="mr-2 h-4 w-4" />
        {children}
      </>
    );
  };

  const getButtonVariant = () => {
    if (isComplete) return "default";
    if (hasError) return "destructive";
    return "default";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        onClick={onDownload}
        disabled={disabled || isDownloading || isComplete}
        variant={getButtonVariant()}
        className="w-full min-h-[40px]"
      >
        {getButtonContent()}
      </Button>

      {isDownloading && progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Downloading...</span>
            <Badge variant="outline">{Math.round(progress)}%</Badge>
          </div>
        </div>
      )}

      {hasError && error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {isComplete && (
        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md">
          Download completed successfully!
        </div>
      )}
    </div>
  );
}
