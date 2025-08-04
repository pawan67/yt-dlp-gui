"use client";

import { useState, useEffect, useCallback } from "react";
import { DownloadHistory, VideoMetadata } from "@/types";

interface UseDownloadHistoryReturn {
  history: DownloadHistory[];
  addToHistory: (
    metadata: VideoMetadata,
    filename: string,
    format: string,
    url: string
  ) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  isDuplicate: (url: string) => boolean;
  getDuplicateInfo: (url: string) => DownloadHistory | null;
  searchHistory: (query: string) => DownloadHistory[];
}

const HISTORY_STORAGE_KEY = "video-downloader-history";
const MAX_HISTORY_ITEMS = 1000; // Limit history size

export function useDownloadHistory(): UseDownloadHistoryReturn {
  const [history, setHistory] = useState<DownloadHistory[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Convert date strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          downloadedAt: new Date(item.downloadedAt),
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error("Failed to load download history:", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save download history:", error);
    }
  }, [history]);

  const addToHistory = useCallback(
    (
      metadata: VideoMetadata,
      filename: string,
      format: string,
      url: string
    ) => {
      const historyItem: DownloadHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        filename,
        downloadedAt: new Date(),
        format,
        metadata,
      };

      setHistory((prev) => {
        // Remove any existing entry for the same URL to avoid duplicates
        const filtered = prev.filter((item) => item.url !== url);

        // Add new item at the beginning
        const updated = [historyItem, ...filtered];

        // Limit history size
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    },
    []
  );

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const isDuplicate = useCallback(
    (url: string) => {
      return history.some((item) => item.url === url);
    },
    [history]
  );

  const getDuplicateInfo = useCallback(
    (url: string) => {
      return history.find((item) => item.url === url) || null;
    },
    [history]
  );

  const searchHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return history;

      const searchTerm = query.toLowerCase();
      return history.filter(
        (item) =>
          item.metadata.title.toLowerCase().includes(searchTerm) ||
          item.metadata.uploader.toLowerCase().includes(searchTerm) ||
          item.filename.toLowerCase().includes(searchTerm) ||
          item.url.toLowerCase().includes(searchTerm)
      );
    },
    [history]
  );

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isDuplicate,
    getDuplicateInfo,
    searchHistory,
  };
}
