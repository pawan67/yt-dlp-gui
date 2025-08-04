"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UrlInput } from "./UrlInput";
import { MetadataPreview } from "./MetadataPreview";
import { FormatSelector } from "./FormatSelector";
import { PlaylistViewer } from "./PlaylistViewer";
import { SubtitleOptions } from "./SubtitleOptions";
import { ThumbnailOptions } from "./ThumbnailOptions";
import { DownloadButton } from "./DownloadButton";
import { DownloadQueue } from "./DownloadQueue";
import { DownloadHistory } from "./DownloadHistory";
import { DuplicateWarning } from "./DuplicateWarning";
import { ErrorDisplay } from "./ErrorDisplay";
import { SuccessMessage } from "./SuccessMessage";
import { TerminalOutput } from "./TerminalOutput";
import { useVideoDownload } from "@/hooks/useVideoDownload";
import { useDownloadManager } from "@/hooks/useDownloadManager";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";
import { Download, RefreshCw, History } from "lucide-react";

interface VideoDownloaderProps {
  className?: string;
}

export function VideoDownloader({ className }: VideoDownloaderProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);

  // Download manager for queue functionality
  const {
    downloads,
    addDownload,
    cancelDownload,
    retryDownload,
    clearCompleted,
  } = useDownloadManager();

  // Download history functionality
  const {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isDuplicate,
    getDuplicateInfo,
  } = useDownloadHistory();

  const {
    metadata,
    formats,
    isLoadingMetadata,
    metadataError,
    isPlaylist,
    playlistVideos,
    selectedPlaylistVideos,
    selectedFormat,
    isDownloading,
    downloadProgress,
    downloadError,
    downloadComplete,
    downloadedFilename,
    terminalOutput,
    includeSubtitles,
    selectedSubtitleLanguage,
    embedThumbnail,
    fetchMetadata,
    setSelectedFormat,
    setSelectedPlaylistVideos,
    setIncludeSubtitles,
    setSelectedSubtitleLanguage,
    setEmbedThumbnail,
    startDownload,
    startPlaylistDownload,
    resetState,
  } = useVideoDownload();

  // Add completed downloads to history
  useEffect(() => {
    if (downloadComplete && downloadedFilename && metadata && currentUrl) {
      addToHistory(metadata, downloadedFilename, selectedFormat, currentUrl);
    }
  }, [
    downloadComplete,
    downloadedFilename,
    metadata,
    currentUrl,
    selectedFormat,
    addToHistory,
  ]);

  const handleUrlSubmit = async (url: string) => {
    setCurrentUrl(url);
    await fetchMetadata(url);
  };

  const handleDownload = async () => {
    if (!currentUrl) return;

    // Show terminal when download starts
    setShowTerminal(true);
    setIsTerminalMinimized(false);

    if (isPlaylist && selectedPlaylistVideos.length > 0) {
      await startPlaylistDownload(selectedPlaylistVideos);
    } else {
      await startDownload(currentUrl);
    }
  };

  const handleRetry = () => {
    if (metadataError && currentUrl) {
      fetchMetadata(currentUrl);
    } else if (downloadError && currentUrl) {
      startDownload(currentUrl);
    }
  };

  const handleReset = () => {
    setCurrentUrl("");
    resetState();
  };

  const getDownloadUrl = () => {
    if (downloadedFilename) {
      return `/api/download/${encodeURIComponent(downloadedFilename)}`;
    }
    return undefined;
  };

  return (
    <div className={className}>
      <div
        className={`grid gap-6 ${
          isDownloading || terminalOutput.length > 0
            ? "lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Download className="h-6 w-6" />
                Video Downloader
              </CardTitle>

              {/* History Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                History
                {history.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {history.length}
                  </span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <UrlInput
              onSubmit={handleUrlSubmit}
              isLoading={isLoadingMetadata}
              error={metadataError}
            />

            {/* Metadata Error */}
            {metadataError && (
              <ErrorDisplay
                error={metadataError}
                onRetry={handleRetry}
                onDismiss={() => setCurrentUrl("")}
              />
            )}

            {/* Metadata Preview */}
            {metadata && (
              <MetadataPreview
                metadata={metadata}
                isPlaylist={isPlaylist}
                playlistCount={playlistVideos.length}
              />
            )}

            {/* Duplicate Warning */}
            {metadata &&
              !isPlaylist &&
              currentUrl &&
              isDuplicate(currentUrl) && (
                <DuplicateWarning
                  duplicateInfo={getDuplicateInfo(currentUrl)!}
                  onDownloadAnyway={handleDownload}
                  onViewHistory={() => setShowHistory(true)}
                />
              )}

            {/* Playlist Viewer */}
            {isPlaylist && playlistVideos.length > 0 && (
              <PlaylistViewer
                videos={playlistVideos}
                onSelectionChange={setSelectedPlaylistVideos}
                isLoading={isDownloading}
              />
            )}

            {/* Format Selection */}
            {metadata && (
              <FormatSelector
                formats={formats}
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
                isLoading={isDownloading}
              />
            )}

            {/* Subtitle and Thumbnail Options - Side by side on desktop, stacked on mobile */}
            {metadata && !isPlaylist && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubtitleOptions
                  includeSubtitles={includeSubtitles}
                  selectedLanguage={selectedSubtitleLanguage}
                  onIncludeSubtitlesChange={setIncludeSubtitles}
                  onLanguageChange={setSelectedSubtitleLanguage}
                  disabled={isDownloading}
                />

                <ThumbnailOptions
                  embedThumbnail={embedThumbnail}
                  onEmbedThumbnailChange={setEmbedThumbnail}
                  isAudioFormat={selectedFormat === "audio"}
                  thumbnailUrl={metadata.thumbnail}
                  disabled={isDownloading}
                />
              </div>
            )}

            {/* Download Section */}
            {metadata && (
              <div className="space-y-4">
                <DownloadButton
                  onDownload={handleDownload}
                  isLoading={isDownloading}
                  progress={downloadProgress}
                  status={
                    downloadComplete
                      ? "complete"
                      : downloadError
                      ? "error"
                      : isDownloading
                      ? "downloading"
                      : "idle"
                  }
                  error={downloadError}
                  disabled={
                    !selectedFormat ||
                    (isPlaylist && selectedPlaylistVideos.length === 0)
                  }
                >
                  {isPlaylist
                    ? `Download ${selectedPlaylistVideos.length} Video${
                        selectedPlaylistVideos.length !== 1 ? "s" : ""
                      }`
                    : "Download"}
                </DownloadButton>

                {/* Download Error */}
                {downloadError && (
                  <ErrorDisplay error={downloadError} onRetry={handleRetry} />
                )}

                {/* Success Message */}
                {downloadComplete && downloadedFilename && (
                  <SuccessMessage
                    message="Your download is ready!"
                    downloadUrl={getDownloadUrl()}
                    filename={downloadedFilename}
                    onDownloadAnother={handleReset}
                  />
                )}
              </div>
            )}

            {/* Reset Button */}
            {(metadata || metadataError) && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Start Over
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terminal Output */}
        {(isDownloading || terminalOutput.length > 0) && (
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <TerminalOutput
              output={terminalOutput}
              title="yt-dlp Terminal"
              isMinimized={isTerminalMinimized}
              onToggleMinimize={() =>
                setIsTerminalMinimized(!isTerminalMinimized)
              }
              onClear={() => {
                /* Terminal output is managed by the hook */
              }}
            />
          </div>
        )}
      </div>

      {/* Download Queue */}
      {downloads.length > 0 && (
        <div className="mt-6">
          <DownloadQueue
            downloads={downloads}
            onCancelDownload={cancelDownload}
            onRetryDownload={retryDownload}
            onClearCompleted={clearCompleted}
          />
        </div>
      )}

      {/* Download History */}
      {showHistory && (
        <div className="mt-6">
          <DownloadHistory
            history={history}
            onDownloadAgain={(historyItem) => {
              setCurrentUrl(historyItem.url);
              fetchMetadata(historyItem.url);
              setShowHistory(false);
            }}
            onClearHistory={clearHistory}
            onRemoveItem={removeFromHistory}
          />
        </div>
      )}
    </div>
  );
}
