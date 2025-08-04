"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download } from "lucide-react";
import { isValidUrl, isVideoUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  className?: string;
}

export function UrlInput({
  onSubmit,
  isLoading = false,
  error,
  placeholder = "Enter video URL (YouTube, Vimeo, etc.)",
  className,
}: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateUrl = (inputUrl: string): string | null => {
    if (!inputUrl.trim()) {
      return "Please enter a URL";
    }

    if (!isValidUrl(inputUrl)) {
      return "Please enter a valid URL";
    }

    if (!isVideoUrl(inputUrl)) {
      return "URL must be from a supported video platform";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    const error = validateUrl(trimmedUrl);

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onSubmit(trimmedUrl);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const displayError = validationError || error;

  return (
    <div className={cn("space-y-4", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "transition-colors",
              displayError && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Get Info
            </>
          )}
        </Button>
      </form>

      {displayError && (
        <Alert variant="destructive">
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
