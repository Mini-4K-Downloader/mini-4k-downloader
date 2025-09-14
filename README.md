# Mini 4K Downloader


<div align="center">
    <a href="https://www.electronjs.org/">
        <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"/>
    </a>
    <a href="https://github.com/yt-dlp/yt-dlp">
        <img src="https://img.shields.io/badge/yt--dlp-FFB000?style=for-the-badge&logo=youtube&logoColor=white" alt="yt-dlp"/>
    </a>
    <a href="https://ffmpeg.org/">
        <img src="https://img.shields.io/badge/ffmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" alt="ffmpeg"/>
    </a>
    <a href="https://www.gnu.org/licenses/gpl-3.0">
        <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge" alt="gpl-3.0"/>
    </a>

</div>

**Mini 4K Downloader** is a desktop application built with [Electron](https://www.electronjs.org/).  
It was inspired by the idea of [4K Video Downloader](https://www.4kdownload.com/products/videodownloader), kinda like a
**knock-off** version.

The app uses the powerful [yt-dlp](https://github.com/yt-dlp/yt-dlp) engine under the hood to fetch video information
and download media from YouTube and many other supported platforms.

---

## ✨ Features

- 🎥 Download videos up to **4K resolution** (if available).
- 📥 Extract audio or choose from multiple formats.
- ⚡ Built on `yt-dlp` for speed, reliability, and wide platform support.
- 🖥️ Simple and intuitive GUI — no need to use the command line.
- 🔒 100% local processing, no trackers or ads.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and available in your system PATH

---

### ⚠️ Running Mini 4K Downloader on Different Platforms

- **macOS:**  
  This app is not yet notarized by Apple. If you see a warning like "unidentified developer," you can bypass it by:
    1. Open `System Settings` → `Privacy & Security`.
    2. Click `Open Anyway` for Mini 4K Downloader.
    3. Alternatively, right-click the app and choose `Open`.

- **Windows:**  
  The app is not yet registered with Microsoft SmartScreen. If you see a warning about an unknown app, you can bypass it
  by:
    1. Click `More info` in the warning dialog.
    2. Then click `Run anyway`.

- **Linux:**  
  Ensure the app is executable. You can run it from the terminal with:
  ```bash
  chmod +x Mini4KDownloader
  ./Mini4KDownloader
    ```

---

© 2025 Thai Trung (Shouko)

Licensed under the GNU General Public License v3.0 (GPLv3).  
You may use, modify, and distribute this project under the same license.
