"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Image, Music } from "lucide-react";

interface ThumbnailOptionsProps {
  embedThumbnail: boolean;
  onEmbedThumbnailChange: (embed: boolean) => void;
  isAudioFormat: boolean;
  thumbnailUrl?: string;
  disabled?: boolean;
  className?: string;
}

export function ThumbnailOptions({
  embedThumbnail,
  onEmbedThumbnailChange,
  isAudioFormat,
  thumbnailUrl,
  disabled = false,
  className,
}: ThumbnailOptionsProps) {
  const handleEmbedThumbnailChange = (checked: boolean) => {
    onEmbedThumbnailChange(checked);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="h-5 w-5" />
          Thumbnail Options
          {isAudioFormat && <Badge variant="secondary">Audio Format</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Embed Thumbnail Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="embed-thumbnail"
            checked={embedThumbnail}
            onCheckedChange={handleEmbedThumbnailChange}
            disabled={disabled || !isAudioFormat}
          />
          <label
            htmlFor="embed-thumbnail"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Embed thumbnail as album art
          </label>
        </div>

        {/* Thumbnail Preview */}
        {thumbnailUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Thumbnail Preview</label>
            <div className="relative w-32 h-24 rounded-md overflow-hidden bg-muted border">
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Thumbnail Info */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm">
            {isAudioFormat ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <strong>Audio Format Detected</strong>
                </div>
                {embedThumbnail ? (
                  <p className="text-muted-foreground text-xs">
                    The video thumbnail will be embedded as album art in the MP3
                    file. This helps music players display artwork for the audio
                    file.
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    The MP3 file will be created without embedded artwork.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <strong>Video Format</strong>
                </div>
                <p className="text-muted-foreground text-xs">
                  Thumbnail embedding is only available for audio formats. Video
                  files already contain the visual content.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* No Thumbnail Available */}
        {!thumbnailUrl && isAudioFormat && embedThumbnail && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>No thumbnail available</strong>
              <p className="text-xs mt-1">
                This video doesn't have a thumbnail available for embedding.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
