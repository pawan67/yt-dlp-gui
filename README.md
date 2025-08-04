# YT-DLP GUI Wrapper

A modern, user-friendly web interface for [yt-dlp](https://github.com/yt-dlp/yt-dlp), the powerful command-line video downloader. This application provides an intuitive GUI to download videos from YouTube and other supported platforms with real-time progress tracking and terminal output.

## 🎯 What is this?

This is a **GUI wrapper** for [yt-dlp](https://github.com/yt-dlp/yt-dlp), built with Next.js and React. It transforms the command-line experience into a modern web interface while maintaining all the power and flexibility of yt-dlp.

**yt-dlp** is a feature-rich command-line audio/video downloader with support for thousands of sites. It's a fork of youtube-dl with additional features and fixes.

## ✨ Features

- 🎬 **Video Downloads**: Download videos from YouTube and 1000+ other sites
- 🎵 **Audio Extraction**: Extract audio-only files in various formats
- 📱 **Quality Selection**: Choose from available video qualities (4K, 1080p, 720p, etc.)
- 🎯 **Custom Formats**: Advanced format selection for power users
- 📝 **Subtitle Support**: Download subtitles in multiple languages
- 🖼️ **Thumbnail Embedding**: Embed thumbnails in audio files
- 📊 **Real-time Progress**: Live progress tracking with percentage and speed
- 💻 **Terminal Output**: View yt-dlp's raw output in real-time
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## 🔗 Related Links

- **yt-dlp GitHub**: [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **yt-dlp Documentation**: [https://github.com/yt-dlp/yt-dlp#readme](https://github.com/yt-dlp/yt-dlp#readme)
- **Supported Sites**: [https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## 📋 Prerequisites

Before using this application, you need to have **yt-dlp** installed on your system:

### Install yt-dlp

**Windows:**

```bash
# Using pip
pip install yt-dlp

# Using winget
winget install yt-dlp

# Using chocolatey
choco install yt-dlp
```

**macOS:**

```bash
# Using Homebrew
brew install yt-dlp

# Using pip
pip install yt-dlp
```

**Linux:**

```bash
# Using pip
pip install yt-dlp

# Using package manager (Ubuntu/Debian)
sudo apt install yt-dlp

# Using package manager (Arch)
sudo pacman -S yt-dlp
```

### Verify Installation

```bash
yt-dlp --version
```

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd yt-dlp-gui
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Open the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

### Basic Video Download

1. **Paste URL**: Copy and paste a video URL into the input field
2. **Select Quality**: Choose your preferred video quality:

   - **Best**: Highest available quality
   - **1080p**: Full HD quality
   - **720p**: HD quality
   - **480p**: Standard quality
   - **Audio Only**: Extract audio only
   - **Custom**: Advanced format selection

3. **Configure Options** (optional):

   - **Custom Filename**: Set a custom name for the downloaded file
   - **Include Subtitles**: Download subtitle files
   - **Subtitle Language**: Choose subtitle language (e.g., "en", "es", "fr")
   - **Embed Thumbnail**: Embed thumbnail in audio files

4. **Download**: Click the "Download Video" button

### Advanced Features

#### Custom Format Selection

For advanced users, select "Custom" format and enter yt-dlp format selectors:

- `best[height<=720]`: Best quality up to 720p
- `bestvideo+bestaudio`: Best video + best audio (requires merging)
- `worst`: Lowest quality (for testing)

#### Playlist Support

- Paste playlist URLs to see all videos
- Select individual videos to download
- Bulk download multiple videos

#### Progress Monitoring

- **Progress Bar**: Visual progress indicator
- **Terminal Output**: Real-time yt-dlp command output
- **Download Speed**: Current download speed
- **ETA**: Estimated time remaining

## 🎛️ Supported Formats

### Video Formats

- **MP4**: Most compatible format
- **WebM**: Open source format
- **MKV**: High-quality container
- **AVI**: Legacy format support

### Audio Formats

- **MP3**: Universal compatibility
- **M4A**: High-quality audio
- **OGG**: Open source audio
- **FLAC**: Lossless audio

## 🌐 Supported Sites

This GUI supports all sites that yt-dlp supports, including:

- **YouTube** (videos, playlists, channels)
- **Vimeo**
- **Dailymotion**
- **Facebook**
- **Instagram**
- **TikTok**
- **Twitter**
- **Twitch**
- **And 1000+ more sites**

For a complete list, visit: [Supported Sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## 📁 File Organization

Downloaded files are saved to the `downloads/` directory in the project root:

```
yt-dlp-gui/
├── downloads/           # Downloaded videos and audio
│   ├── video1.mp4
│   ├── audio1.mp3
│   └── subtitles1.srt
├── src/                 # Application source code
└── ...
```

## ⚙️ Configuration

The application uses sensible defaults, but you can customize behavior by modifying:

- `src/lib/config.ts`: yt-dlp command options
- `src/lib/constants.ts`: Download paths and formats
- Environment variables for advanced configuration

## 🔧 Troubleshooting

### Common Issues

**"yt-dlp not found"**

- Ensure yt-dlp is installed and in your system PATH
- Try running `yt-dlp --version` in terminal

**Download fails**

- Check if the URL is supported
- Try updating yt-dlp: `pip install -U yt-dlp`
- Check the terminal output for specific error messages

**Slow downloads**

- This depends on your internet connection and the source server
- yt-dlp will show download speed in the terminal output

**Permission errors**

- Ensure the `downloads/` directory is writable
- On Linux/macOS, check file permissions

### Getting Help

1. Check the terminal output for detailed error messages
2. Verify the URL works with yt-dlp directly: `yt-dlp <url>`
3. Update yt-dlp to the latest version
4. Check [yt-dlp issues](https://github.com/yt-dlp/yt-dlp/issues) for known problems

## 🛠️ Development

Built with modern web technologies:

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Server-Sent Events**: Real-time progress updates

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
└── types/              # TypeScript definitions
```

## 📄 License

This project is a GUI wrapper for yt-dlp. Please respect the licenses of both this project and yt-dlp itself.

## 🤝 Contributing

Contributions are welcome! This is a GUI wrapper that aims to make yt-dlp more accessible to users who prefer graphical interfaces over command-line tools.

---

**Note**: This application is a GUI wrapper for yt-dlp and requires yt-dlp to be installed separately. All download functionality is provided by yt-dlp itself.
