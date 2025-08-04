"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoMetadata } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Clock, User, Eye } from "lucide-react";
import Image from "next/image";

interface MetadataPreviewProps {
  metadata: VideoMetadata;
  isPlaylist?: boolean;
  playlistCount?: number;
  className?: string;
}

export function MetadataPreview({
  metadata,
  isPlaylist = false,
  playlistCount = 0,
  className,
}: MetadataPreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {metadata.thumbnail && (
            <div className="relative w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              <Image
                src={metadata.thumbnail}
                alt={metadata.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 128px"
                onError={(e) => {
                  // Hide image on error
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
              {metadata.title}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {metadata.uploader && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">
                    {metadata.uploader}
                  </span>
                </div>
              )}

              {metadata.duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(metadata.duration)}</span>
                </div>
              )}

              {metadata.viewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{metadata.viewCount.toLocaleString()} views</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {isPlaylist && (
                <Badge variant="secondary">
                  Playlist ({playlistCount} videos)
                </Badge>
              )}

              {metadata.uploadDate && (
                <Badge variant="outline">
                  {new Date(metadata.uploadDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {metadata.description && (
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-3">{metadata.description}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
