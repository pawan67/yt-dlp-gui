"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaylistVideo } from "@/types";
import { formatDuration } from "@/lib/utils";
import { List, CheckSquare, Square, Play, Clock } from "lucide-react";
import Image from "next/image";

interface PlaylistViewerProps {
  videos: PlaylistVideo[];
  onSelectionChange: (selectedVideos: PlaylistVideo[]) => void;
  isLoading?: boolean;
  className?: string;
}

export function PlaylistViewer({
  videos,
  onSelectionChange,
  isLoading = false,
  className,
}: PlaylistViewerProps) {
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  const handleVideoToggle = (videoId: string, checked: boolean) => {
    const newSelected = new Set(selectedVideos);

    if (checked) {
      newSelected.add(videoId);
    } else {
      newSelected.delete(videoId);
    }

    setSelectedVideos(newSelected);

    // Update the videos with selection state and notify parent
    const updatedVideos = videos.map((video) => ({
      ...video,
      selected: newSelected.has(video.id),
    }));

    onSelectionChange(updatedVideos.filter((v) => v.selected));
  };

  const handleSelectAll = () => {
    const allVideoIds = new Set(videos.map((v) => v.id));
    setSelectedVideos(allVideoIds);

    const updatedVideos = videos.map((video) => ({
      ...video,
      selected: true,
    }));

    onSelectionChange(updatedVideos);
  };

  const handleSelectNone = () => {
    setSelectedVideos(new Set());
    onSelectionChange([]);
  };

  const selectedCount = selectedVideos.size;
  const totalCount = videos.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="h-5 w-5" />
            Playlist Videos
            <Badge variant="outline">
              {selectedCount} of {totalCount} selected
            </Badge>
          </CardTitle>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading || selectedCount === totalCount}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              disabled={isLoading || selectedCount === 0}
            >
              <Square className="mr-2 h-4 w-4" />
              Select None
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  selectedVideos.has(video.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {/* Checkbox */}
                <div className="flex items-center pt-1">
                  <Checkbox
                    checked={selectedVideos.has(video.id)}
                    onCheckedChange={(checked) =>
                      handleVideoToggle(video.id, checked as boolean)
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Thumbnail */}
                <div className="relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Duration overlay */}
                  {video.duration > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                        {video.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>#{index + 1}</span>
                        {video.duration > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(video.duration)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {selectedVideos.has(video.id) && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        {selectedCount > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>{selectedCount}</strong> video
              {selectedCount !== 1 ? "s" : ""} selected
              {selectedCount > 0 && (
                <>
                  {" • "}
                  Total duration:{" "}
                  {formatDuration(
                    videos
                      .filter((v) => selectedVideos.has(v.id))
                      .reduce((total, v) => total + v.duration, 0)
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
