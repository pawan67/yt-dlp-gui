"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadHistory as DownloadHistoryType } from "@/types";
import { formatDuration, formatFileSize } from "@/lib/utils";
import {
  History,
  Search,
  Download,
  Trash2,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

interface DownloadHistoryProps {
  history: DownloadHistoryType[];
  onDownloadAgain?: (historyItem: DownloadHistoryType) => void;
  onClearHistory?: () => void;
  onRemoveItem?: (id: string) => void;
  className?: string;
}

type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc";
type FilterOption = "all" | "video" | "audio";

export function DownloadHistory({
  history,
  onDownloadAgain,
  onClearHistory,
  onRemoveItem,
  className,
}: DownloadHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort history
  const filteredHistory = history
    .filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.metadata.title.toLowerCase().includes(query);
        const matchesUploader = item.metadata.uploader
          .toLowerCase()
          .includes(query);
        const matchesFilename = item.filename.toLowerCase().includes(query);

        if (!matchesTitle && !matchesUploader && !matchesFilename) {
          return false;
        }
      }

      // Format filter
      if (filterBy !== "all") {
        const isAudio =
          item.format === "audio" || item.filename.endsWith(".mp3");
        if (filterBy === "audio" && !isAudio) return false;
        if (filterBy === "video" && isAudio) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.downloadedAt).getTime() -
            new Date(a.downloadedAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.downloadedAt).getTime() -
            new Date(b.downloadedAt).getTime()
          );
        case "title-asc":
          return a.metadata.title.localeCompare(b.metadata.title);
        case "title-desc":
          return b.metadata.title.localeCompare(a.metadata.title);
        default:
          return 0;
      }
    });

  const getSortIcon = () => {
    return sortBy.includes("desc") ? (
      <SortDesc className="h-4 w-4" />
    ) : (
      <SortAsc className="h-4 w-4" />
    );
  };

  const getFormatBadge = (item: DownloadHistoryType) => {
    const isAudio = item.format === "audio" || item.filename.endsWith(".mp3");
    return (
      <Badge variant={isAudio ? "secondary" : "outline"}>
        {isAudio ? "Audio" : "Video"}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Download History
            <Badge variant="outline">Empty</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No download history</p>
            <p className="text-sm">Completed downloads will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Download History
            <Badge variant="outline">
              {history.length} item{history.length !== 1 ? "s" : ""}
            </Badge>
            {filteredHistory.length !== history.length && (
              <Badge variant="secondary">{filteredHistory.length} shown</Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {onClearHistory && (
              <Button variant="outline" size="sm" onClick={onClearHistory}>
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, uploader, or filename..."
                className="pl-10"
              />
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex flex-wrap gap-2">
              {/* Sort Options */}
              <div className="flex items-center gap-1">
                <Button
                  variant={sortBy.startsWith("date") ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSortBy(sortBy === "date-desc" ? "date-asc" : "date-desc")
                  }
                  className="gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Date
                  {sortBy.startsWith("date") && getSortIcon()}
                </Button>

                <Button
                  variant={sortBy.startsWith("title") ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSortBy(
                      sortBy === "title-desc" ? "title-asc" : "title-desc"
                    )
                  }
                  className="gap-1"
                >
                  Title
                  {sortBy.startsWith("title") && getSortIcon()}
                </Button>
              </div>

              {/* Filter Options */}
              <div className="flex items-center gap-1">
                <Button
                  variant={filterBy === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterBy === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("video")}
                >
                  Video
                </Button>
                <Button
                  variant={filterBy === "audio" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("audio")}
                >
                  Audio
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                  {item.metadata.thumbnail ? (
                    <Image
                      src={item.metadata.thumbnail}
                      alt={item.metadata.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Download className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {item.metadata.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{item.metadata.uploader}</span>
                        {item.metadata.duration && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDuration(item.metadata.duration)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {getFormatBadge(item)}
                        <span className="text-muted-foreground">
                          {formatDate(new Date(item.downloadedAt))}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {onDownloadAgain && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownloadAgain(item)}
                          title="Download again"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {onRemoveItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          title="Remove from history"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Filename */}
                  <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded mt-2 truncate">
                    {item.filename}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
