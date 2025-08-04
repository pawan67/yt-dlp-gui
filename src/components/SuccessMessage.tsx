"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessMessageProps {
  title?: string;
  message: string;
  downloadUrl?: string;
  filename?: string;
  onDismiss?: () => void;
  onDownloadAnother?: () => void;
  className?: string;
}

export function SuccessMessage({
  title = "Success!",
  message,
  downloadUrl,
  filename,
  onDismiss,
  onDownloadAnother,
  className,
}: SuccessMessageProps) {
  const handleDownload = () => {
    if (downloadUrl) {
      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Alert
      className={cn(
        "border-green-200 bg-green-50 dark:bg-green-950",
        className
      )}
    >
      <CheckCircle className="h-4 w-4 text-green-600" />
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between text-green-800 dark:text-green-200">
          {title}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </AlertTitle>
        <AlertDescription className="mt-2 text-green-700 dark:text-green-300">
          <div className="space-y-3">
            <p>{message}</p>

            {filename && (
              <p className="text-sm font-medium">
                File: <span className="font-mono">{filename}</span>
              </p>
            )}

            <div className="flex gap-2">
              {downloadUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                >
                  <Download className="mr-2 h-3 w-3" />
                  Download File
                </Button>
              )}

              {onDownloadAnother && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadAnother}
                  className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                >
                  Download Another
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
