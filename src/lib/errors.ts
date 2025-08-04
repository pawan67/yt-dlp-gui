import { UserFriendlyError, ErrorType } from "@/types";

// Error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class YtDlpError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "YtDlpError";
  }
}

export class SystemError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "SystemError";
  }
}

// Error handler class
export class ErrorHandler {
  static handleValidationError(error: ValidationError): UserFriendlyError {
    return {
      message: error.message,
      type: "warning",
      recoverable: true,
      suggestions: [
        "Check that the URL is valid and accessible",
        "Make sure the URL is from a supported platform",
      ],
    };
  }

  static handleYtDlpError(error: YtDlpError): UserFriendlyError {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("video unavailable")) {
      return {
        message: "This video is not available for download",
        type: "error",
        recoverable: false,
        suggestions: [
          "The video may be private or deleted",
          "Try a different video URL",
        ],
      };
    }

    if (errorMessage.includes("private video")) {
      return {
        message: "This video is private and cannot be downloaded",
        type: "error",
        recoverable: false,
        suggestions: ["Try a public video instead"],
      };
    }

    if (errorMessage.includes("network")) {
      return {
        message: "Network error occurred while downloading",
        type: "error",
        recoverable: true,
        suggestions: [
          "Check your internet connection",
          "Try again in a few moments",
        ],
      };
    }

    return {
      message: "Download failed due to an unexpected error",
      type: "error",
      recoverable: true,
      suggestions: [
        "Try again with a different format",
        "Check if the video is still available",
      ],
    };
  }

  static handleSystemError(error: SystemError): UserFriendlyError {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("enospc") ||
      errorMessage.includes("disk space")
    ) {
      return {
        message: "Not enough disk space to complete download",
        type: "error",
        recoverable: false,
        suggestions: [
          "Free up some disk space",
          "Try downloading to a different location",
        ],
      };
    }

    if (errorMessage.includes("enoent") || errorMessage.includes("not found")) {
      return {
        message: "Required system tools are not installed",
        type: "error",
        recoverable: false,
        suggestions: [
          "Install yt-dlp and ffmpeg",
          "Make sure they are in your system PATH",
        ],
      };
    }

    if (errorMessage.includes("permission")) {
      return {
        message: "Permission denied while accessing files",
        type: "error",
        recoverable: false,
        suggestions: [
          "Check file permissions",
          "Try running with appropriate permissions",
        ],
      };
    }

    return {
      message: "System error occurred during download",
      type: "error",
      recoverable: true,
      suggestions: ["Try again in a few moments"],
    };
  }

  static handleError(error: Error): UserFriendlyError {
    if (error instanceof ValidationError) {
      return this.handleValidationError(error);
    }

    if (error instanceof YtDlpError) {
      return this.handleYtDlpError(error);
    }

    if (error instanceof SystemError) {
      return this.handleSystemError(error);
    }

    // Generic error handling
    return {
      message: "An unexpected error occurred",
      type: "error",
      recoverable: true,
      suggestions: ["Try again or contact support if the problem persists"],
    };
  }

  static logError(error: Error, context: string): void {
    console.error(`[${context}] ${error.name}: ${error.message}`, {
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
}

// Common error messages
export const ERROR_MESSAGES = {
  INVALID_URL: "Please enter a valid video URL",
  UNSUPPORTED_PLATFORM: "This platform is not supported",
  NETWORK_ERROR: "Network error occurred. Please check your connection.",
  DOWNLOAD_FAILED: "Download failed. Please try again.",
  FILE_NOT_FOUND: "The requested file was not found",
  SYSTEM_ERROR: "A system error occurred. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again",
} as const;
