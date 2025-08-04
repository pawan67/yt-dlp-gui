"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Format } from "@/types";
import { DOWNLOAD_FORMATS, FORMAT_OPTIONS } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";
import { Video, Music, Settings, ChevronDown, ChevronUp } from "lucide-react";

interface FormatSelectorProps {
  formats?: Format[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function FormatSelector({
  formats = [],
  selectedFormat,
  onFormatChange,
  isLoading = false,
  className,
}: FormatSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getFormatIcon = (format: Format) => {
    if (format.vcodec && format.vcodec !== "none") {
      return <Video className="h-4 w-4" />;
    }
    if (format.acodec && format.acodec !== "none") {
      return <Music className="h-4 w-4" />;
    }
    return <Settings className="h-4 w-4" />;
  };

  const getFormatQuality = (format: Format) => {
    if (format.resolution) {
      return format.resolution;
    }
    if (format.quality) {
      return format.quality;
    }
    return "Unknown";
  };

  const getFormatDescription = (format: Format) => {
    const parts: string[] = [];

    if (format.ext) {
      parts.push(format.ext.toUpperCase());
    }

    if (format.vcodec && format.vcodec !== "none") {
      parts.push(format.vcodec.toUpperCase());
    }

    if (format.acodec && format.acodec !== "none") {
      parts.push(format.acodec.toUpperCase());
    }

    if (format.filesize) {
      parts.push(formatFileSize(format.filesize));
    }

    return parts.join(" • ");
  };

  const videoFormats = formats.filter((f) => f.vcodec && f.vcodec !== "none");
  const audioFormats = formats.filter(
    (f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
  );

  const handleBasicFormatChange = (value: string) => {
    onFormatChange(value);
    if (value !== DOWNLOAD_FORMATS.CUSTOM) {
      setShowAdvanced(false);
    }
  };

  const handleCustomFormatChange = (formatId: string) => {
    onFormatChange(formatId);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Download Format
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format Type</label>
          <Select
            value={selectedFormat}
            onValueChange={handleBasicFormatChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {(option.value === DOWNLOAD_FORMATS.BEST ||
                      option.value === DOWNLOAD_FORMATS.HD1080 ||
                      option.value === DOWNLOAD_FORMATS.HD720 ||
                      option.value === DOWNLOAD_FORMATS.SD480) && (
                      <Video className="h-4 w-4" />
                    )}
                    {option.value === DOWNLOAD_FORMATS.AUDIO && (
                      <Music className="h-4 w-4" />
                    )}
                    {option.value === DOWNLOAD_FORMATS.CUSTOM && (
                      <Settings className="h-4 w-4" />
                    )}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Format Selection */}
        {selectedFormat === DOWNLOAD_FORMATS.CUSTOM && formats.length > 0 && (
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Advanced Options
                </>
              )}
            </Button>

            {showAdvanced && (
              <div className="space-y-4">
                {/* Video Formats */}
                {videoFormats.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Formats
                    </h4>
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {videoFormats.map((format) => (
                        <div
                          key={format.formatId}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                            selectedFormat === format.formatId
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() =>
                            handleCustomFormatChange(format.formatId)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(format)}
                              <div>
                                <div className="font-medium text-sm">
                                  {getFormatQuality(format)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getFormatDescription(format)}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {format.formatId}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Formats */}
                {audioFormats.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Audio Formats
                    </h4>
                    <div className="grid gap-2 max-h-32 overflow-y-auto">
                      {audioFormats.map((format) => (
                        <div
                          key={format.formatId}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                            selectedFormat === format.formatId
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() =>
                            handleCustomFormatChange(format.formatId)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(format)}
                              <div>
                                <div className="font-medium text-sm">
                                  {getFormatQuality(format)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getFormatDescription(format)}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {format.formatId}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Format Info */}
        {selectedFormat && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Selected:</strong>{" "}
              {selectedFormat === DOWNLOAD_FORMATS.BEST &&
                "Best Quality (4K/1080p + Audio)"}
              {selectedFormat === DOWNLOAD_FORMATS.HD1080 &&
                "1080p (High Quality)"}
              {selectedFormat === DOWNLOAD_FORMATS.HD720 &&
                "720p (Standard Quality)"}
              {selectedFormat === DOWNLOAD_FORMATS.SD480 &&
                "480p (Lower Quality)"}
              {selectedFormat === DOWNLOAD_FORMATS.AUDIO &&
                "Audio Only (MP3 320k)"}
              {selectedFormat === DOWNLOAD_FORMATS.CUSTOM && "Custom Format"}
              {!Object.values(DOWNLOAD_FORMATS).includes(
                selectedFormat as any
              ) && (
                <>
                  Custom Format ({selectedFormat})
                  {formats.find((f) => f.formatId === selectedFormat) && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {getFormatDescription(
                        formats.find((f) => f.formatId === selectedFormat)!
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
