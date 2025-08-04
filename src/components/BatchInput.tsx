"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isValidUrl, isVideoUrl } from "@/lib/utils";
import { List, Download, AlertTriangle } from "lucide-react";

interface BatchInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading?: boolean;
  className?: string;
}

interface ValidationResult {
  validUrls: string[];
  invalidUrls: string[];
  unsupportedUrls: string[];
}

export function BatchInput({
  onSubmit,
  isLoading = false,
  className,
}: BatchInputProps) {
  const [input, setInput] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const validateUrls = (text: string): ValidationResult => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const validUrls: string[] = [];
    const invalidUrls: string[] = [];
    const unsupportedUrls: string[] = [];

    lines.forEach((line) => {
      if (!isValidUrl(line)) {
        invalidUrls.push(line);
      } else if (!isVideoUrl(line)) {
        unsupportedUrls.push(line);
      } else {
        validUrls.push(line);
      }
    });

    return { validUrls, invalidUrls, unsupportedUrls };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Clear validation when input is empty
    if (!value.trim()) {
      setValidationResult(null);
      return;
    }

    // Validate URLs as user types (debounced)
    const result = validateUrls(value);
    setValidationResult(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      return;
    }

    const result = validateUrls(input);
    setValidationResult(result);

    if (result.validUrls.length > 0) {
      onSubmit(result.validUrls);
    }
  };

  const getTotalUrls = () => {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0).length;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <List className="h-5 w-5" />
          Batch Download
          {getTotalUrls() > 0 && (
            <Badge variant="outline">
              {getTotalUrls()} URL{getTotalUrls() !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Video URLs (one per line)
            </label>
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder={`Enter multiple video URLs, one per line:

https://youtube.com/watch?v=example1
https://youtube.com/watch?v=example2
https://vimeo.com/example3`}
              className="min-h-32 font-mono text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !validationResult?.validUrls.length}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isLoading
              ? "Processing..."
              : `Download ${validationResult?.validUrls.length || 0} Video${
                  (validationResult?.validUrls.length || 0) !== 1 ? "s" : ""
                }`}
          </Button>
        </form>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-3">
            {/* Valid URLs */}
            {validationResult.validUrls.length > 0 && (
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>
                  <strong>{validationResult.validUrls.length}</strong> valid URL
                  {validationResult.validUrls.length !== 1 ? "s" : ""} ready for
                  download
                </AlertDescription>
              </Alert>
            )}

            {/* Invalid URLs */}
            {validationResult.invalidUrls.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>{validationResult.invalidUrls.length}</strong>{" "}
                      invalid URL
                      {validationResult.invalidUrls.length !== 1 ? "s" : ""}:
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {validationResult.invalidUrls
                        .slice(0, 3)
                        .map((url, index) => (
                          <li key={index} className="truncate">
                            {url}
                          </li>
                        ))}
                      {validationResult.invalidUrls.length > 3 && (
                        <li>
                          ... and {validationResult.invalidUrls.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Unsupported URLs */}
            {validationResult.unsupportedUrls.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>{validationResult.unsupportedUrls.length}</strong>{" "}
                      unsupported platform
                      {validationResult.unsupportedUrls.length !== 1 ? "s" : ""}
                      :
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {validationResult.unsupportedUrls
                        .slice(0, 3)
                        .map((url, index) => (
                          <li key={index} className="truncate">
                            {url}
                          </li>
                        ))}
                      {validationResult.unsupportedUrls.length > 3 && (
                        <li>
                          ... and {validationResult.unsupportedUrls.length - 3}{" "}
                          more
                        </li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Usage Instructions */}
        {!input.trim() && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <p className="font-medium mb-2">How to use batch download:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Enter one video URL per line</li>
                <li>Supports YouTube, Vimeo, and other platforms</li>
                <li>Invalid URLs will be highlighted</li>
                <li>Only valid URLs will be processed</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
