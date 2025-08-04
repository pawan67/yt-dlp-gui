"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { UserFriendlyError } from "@/types";

interface ErrorDisplayProps {
  error: string | UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
}: ErrorDisplayProps) {
  const errorData =
    typeof error === "string"
      ? { message: error, type: "error" as const, recoverable: true }
      : error;

  const getAlertVariant = () => {
    switch (errorData.type) {
      case "warning":
        return "default";
      case "info":
        return "default";
      case "error":
      default:
        return "destructive";
    }
  };

  const getIcon = () => {
    switch (errorData.type) {
      case "warning":
      case "info":
      case "error":
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (errorData.type) {
      case "warning":
        return "Warning";
      case "info":
        return "Information";
      case "error":
      default:
        return "Error";
    }
  };

  return (
    <Alert variant={getAlertVariant()} className={className}>
      {getIcon()}
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          {getTitle()}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-3">
            <p>{errorData.message}</p>

            {errorData.suggestions && errorData.suggestions.length > 0 && (
              <div>
                <p className="font-medium mb-1">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errorData.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {onRetry && errorData.recoverable && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
