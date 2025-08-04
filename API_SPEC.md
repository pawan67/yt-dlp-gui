# yt-dlp-gui API Specification

This document describes the REST API endpoints for the yt-dlp-gui application.

## Base URL

All API endpoints are relative to the application's base URL (typically `http://localhost:3000` in development).

## API Endpoints

### 1. Get Video Metadata

**Endpoint**: `POST /api/metadata`  
**Description**: Extracts metadata from a video URL without downloading it.

#### Request

```json
{
  "url": "string" // Required. The video URL to extract metadata from
}
```

#### Response

**Success (200 OK)**:
```json
{
  "title": "string",
  "thumbnail": "string",
  "duration": "number",
  "uploader": "string",
  "formats": [
    {
      "formatId": "string",
      "ext": "string",
      "resolution": "string",
      "fps": "number",
      "vcodec": "string",
      "acodec": "string",
      "filesize": "number",
      "quality": "string"
    }
  ],
  "isPlaylist": "boolean",
  "playlistVideos": [
    {
      "id": "string",
      "title": "string",
      "thumbnail": "string",
      "duration": "number",
      "url": "string",
      "selected": "boolean"
    }
  ]
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "string"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "string",
  "type": "warning|error|info",
  "recoverable": "boolean",
  "suggestions": "string[]"
}
```

### 2. Start Video Download

**Endpoint**: `POST /api/download`  
**Description**: Initiates a video download process.

#### Request

```json
{
  "url": "string", // Required. The video URL to download
  "format": "best|1080p|720p|480p|audio|custom", // Required. The format to download
  "customFormat": "string", // Optional. Custom format specification (required when format is "custom")
  "includeSubtitles": "boolean", // Optional. Whether to include subtitles (default: false)
  "subtitleLanguage": "string", // Optional. Language code for subtitles
  "customFilename": "string", // Optional. Custom filename for the download
  "embedThumbnail": "boolean" // Optional. Whether to embed thumbnail in audio files (default: false)
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "downloadId": "string", // Unique identifier for tracking download progress
  "filename": "string" // Filename of the downloaded file (available when download completes)
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "string"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "success": false,
  "downloadId": "string",
  "error": "string"
}
```

### 3. Track Download Progress

**Endpoint**: `GET /api/progress/{downloadId}`  
**Description**: Establishes a Server-Sent Events (SSE) connection to track download progress.

#### Request

Path parameter:
- `downloadId`: The unique identifier returned when starting the download

#### Response (SSE Stream)

The server sends JSON events with the following structure:

```json
{
  "type": "progress|complete|error",
  "downloadId": "string",
  "progress": "number", // Progress percentage (0-100)
  "filename": "string", // Available when download completes
  "error": "string", // Available when an error occurs
  "terminalOutput": "string[]" // Recent terminal output from yt-dlp
}
```

Event types:
- `progress`: Sent periodically during download with progress updates
- `complete`: Sent when download completes successfully
- `error`: Sent when download encounters an error

### 4. Download Completed File

**Endpoint**: `GET /api/download/{filename}`  
**Description**: Downloads a completed file from the server.

#### Request

Path parameter:
- `filename`: The name of the file to download

#### Response

**Success (200 OK)**:
- Binary file content with appropriate `Content-Type` header
- `Content-Disposition: attachment; filename="{filename}"` header

**Error (404 Not Found)**:
```json
{
  "error": "File not found"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Internal server error"
}
```

### 5. Check File Information

**Endpoint**: `HEAD /api/download/{filename}`  
**Description**: Gets metadata about a completed file without downloading it.

#### Request

Path parameter:
- `filename`: The name of the file to check

#### Response

**Success (200 OK)**:
Headers:
- `Content-Type`: MIME type of the file
- `Content-Length`: Size of the file in bytes
- `Content-Disposition`: Filename for download

**Error (404 Not Found)**

**Error (500 Internal Server Error)**

## Error Handling

All API endpoints follow these error handling patterns:

1. **400 Bad Request**: Invalid input parameters or missing required fields
2. **500 Internal Server Error**: Server-side errors including yt-dlp execution errors

Error responses include a JSON body with an `error` field containing a human-readable error message.

## Authentication

Currently, the API does not require authentication. In a production environment, you may want to add authentication and rate limiting.

## Rate Limiting

The API does not currently implement rate limiting. In a production environment, you should consider implementing rate limiting to prevent abuse.

## Examples

### Get Video Metadata

```bash
curl -X POST http://localhost:3000/api/metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Start Video Download

```bash
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "format": "best"}'
```

### Track Download Progress

```javascript
const eventSource = new EventSource('http://localhost:3000/api/progress/download_1234567890');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data);
};
```

### Download Completed File

```bash
curl -O http://localhost:3000/api/download/my-video.mp4