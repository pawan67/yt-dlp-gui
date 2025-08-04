"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sanitizeFilename, getFileExtension } from "@/lib/utils";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";

interface CustomFilenameInputProps {
  useCustomFilename: boolean;
  customFilename: string;
  selectedFormat: string;
  videoTitle?: string;
  onUseCustomFilenameChange: (use: boolean) => void;
  onCustomFilenameChange: (filename: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CustomFilenameInput({
  useCustomFilename,
  customFilename,
  selectedFormat,
  videoTitle,
  onUseCustomFilenameChange,
  onCustomFilenameChange,
  disabled = false,
  className,
}: CustomFilenameInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string>("");

  // Update preview filename when inputs change
  useEffect(() => {
    if (useCustomFilename && customFilename) {
      const sanitized = sanitizeFilename(customFilename);
      const extension = getFileExtension(selectedFormat);
      setPreviewFilename(`${sanitized}.${extension}`);
    } else if (videoTitle) {
      const sanitized = sanitizeFilename(videoTitle);
      const extension = getFileExtension(selectedFormat);
      setPreviewFilename(`${sanitized}.${extension}`);
    } else {
      const extension = getFileExtension(selectedFormat);
      setPreviewFilename(`download.${extension}`);
    }
  }, [useCustomFilename, customFilename, selectedFormat, videoTitle]);

  const validateFilename = (filename: string): string | null => {
    if (!filename.trim()) {
      return "Filename cannot be empty";
    }

    if (filename.length > 200) {
      return "Filename is too long (max 200 characters)";
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      return 'Filename contains invalid characters: < > : " / \\ | ? *';
    }

    // Check for reserved names on Windows
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(filename.trim())) {
      return "Filename uses a reserved system name";
    }

    return null;
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onCustomFilenameChange(value);

    // Validate filename
    const error = validateFilename(value);
    setValidationError(error);
  };

  const handleUseCustomChange = (checked: boolean) => {
    onUseCustomFilenameChange(checked);

    // Clear validation error when disabling custom filename
    if (!checked) {
      setValidationError(null);
    }
  };

  const getSanitizedPreview = () => {
    if (useCustomFilename && customFilename) {
      return sanitizeFilename(customFilename);
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Filename
          {useCustomFilename && <Badge variant="secondary">Custom</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enable Custom Filename Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-custom-filename"
            checked={useCustomFilename}
            onCheckedChange={handleUseCustomChange}
            disabled={disabled}
          />
          <label
            htmlFor="use-custom-filename"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Use custom filename
          </label>
        </div>

        {/* Custom Filename Input */}
        {useCustomFilename && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Filename (without extension)
              </label>
              <Input
                value={customFilename}
                onChange={handleFilenameChange}
                placeholder="Enter custom filename"
                disabled={disabled}
                className={validationError ? "border-red-500" : ""}
              />
            </div>

            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Sanitization Warning */}
            {!validationError &&
              customFilename &&
              getSanitizedPreview() !== customFilename && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>Filename will be sanitized for compatibility:</p>
                      <p className="font-mono text-xs bg-muted p-1 rounded">
                        {getSanitizedPreview()}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
          </div>
        )}

        {/* Filename Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4" />
              <strong>Final filename:</strong>
            </div>
            <p className="font-mono text-xs bg-background p-2 rounded border">
              {previewFilename}
            </p>

            {!useCustomFilename && videoTitle && (
              <p className="text-muted-foreground text-xs mt-2">
                Using video title as filename
              </p>
            )}

            {!useCustomFilename && !videoTitle && (
              <p className="text-muted-foreground text-xs mt-2">
                Using default filename
              </p>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        {!useCustomFilename && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <p className="font-medium mb-2">Filename options:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>By default, the video title is used as filename</li>
                <li>Enable custom filename to specify your own</li>
                <li>Invalid characters will be automatically replaced</li>
                <li>File extension is added automatically based on format</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
