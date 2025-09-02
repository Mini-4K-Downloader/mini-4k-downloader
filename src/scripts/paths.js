const path = require("path");
const { app } = require("electron");

const isDev = !app.isPackaged;

function getYtDlpPath() {
    if (process.platform === "win32") {
        return isDev
            ? path.join(__dirname, "../../bin/yt-dlp.exe")
            : path.join(process.resourcesPath, "bin/yt-dlp.exe");
    } else if (process.platform === "darwin") {
        return isDev
            ? path.join(__dirname, "../../bin/yt-dlp_macos")
            : path.join(process.resourcesPath, "bin/yt-dlp_macos");
    } else {
        return isDev
            ? path.join(__dirname, "../../bin/yt-dlp_linux")
            : path.join(process.resourcesPath, "bin/yt-dlp_linux");
    }
}

function getFfmpegPath() {
    if (process.platform === "win32") {
        return isDev
            ? path.join(__dirname, "../../bin/ffmpeg_win.exe")
            : path.join(process.resourcesPath, "bin/ffmpeg_win.exe");
    } else if (process.platform === "darwin") {
        return isDev
            ? path.join(__dirname, "../../bin/ffmpeg_macos")
            : path.join(process.resourcesPath, "bin/ffmpeg_macos");
    } else {
        return isDev
            ? path.join(__dirname, "../../bin/ffmpeg_linux")
            : path.join(process.resourcesPath, "bin/ffmpeg_linux");
    }
}

module.exports = { getYtDlpPath, getFfmpegPath };
