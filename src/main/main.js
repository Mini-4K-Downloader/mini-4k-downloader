const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const isDev = !app.isPackaged
const { getFormatArgs } = require('../scripts/format')
const { initAutoUpdater } = require('./updater');
const { getQualityArgs } = require('../scripts/quality')
const { getTypeArgs } = require('../scripts/type')
const { getVideoInfo } = require("./videoInfo");
const fs = require('fs');
const Store = require("electron-store");
const store = new Store();

let mainWindow
let currentDownloadProcess = null

function saveVideoMetadata(video) {
    try {
        let videos = store.get('videos', []);
        const existingIndex = videos.findIndex(v => v.url === video.url);

        if (existingIndex !== -1) {
            videos[existingIndex] = { ...videos[existingIndex], ...video };
        } else {
            videos.push(video);
        }

        store.set('videos', videos);
        return true;
    } catch (error) {
        console.error('Error saving video metadata:', error);
        return false;
    }
}

function getSavedVideo() {
    return store.get('videos', []);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        show: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('get-clipboard', async () => {
    return await clipboard.readText();
})

ipcMain.handle('get-video-info', async (event, url) => {
    return await getVideoInfo(url)
})

ipcMain.handle('show-in-folder', async (event, filePath) => {
    if (fs.existsSync(filePath)) {
        shell.showItemInFolder(filePath)
        return true
    }
    return false
})

ipcMain.handle('open-in-browser', async (event, url) => {
    await shell.openExternal(url);
})

ipcMain.handle('remove-file', async (event, filePath) => {
    try {
        await fs.promises.unlink(filePath);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-saved-videos', () => getSavedVideo());

ipcMain.handle('add-saved-video', (event, video) => saveVideoMetadata(video));

ipcMain.handle('remove-saved-video', (event, videoUrl) => {
    try {
        let videos = store.get('videos', []);
        const videoToRemove = videos.find(v => v.url === videoUrl);

        if (videoToRemove && videoToRemove.filePath) {
            if (fs.existsSync(videoToRemove.filePath)) {
                fs.unlinkSync(videoToRemove.filePath);
            }
        }

        videos = videos.filter(v => v.url !== videoUrl);
        store.set('videos', videos);

        return { success: true };
    } catch (error) {
        console.error('Error removing video:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('download-video', async (event, { url, format, quality, type }) => {
    // Hiển thị hộp thoại Save As
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Choose where to save the video",
        defaultPath: path.join(app.getPath("downloads"), "%(title)s.%(ext)s"),
        filters: [{ name: format.toUpperCase(), extensions: [format] }]
    });

    if (canceled || !filePath) {
        return { message: '❌ Canceled' };
    }

    let ytdlpPath;
    if (process.platform === 'win32') {
        ytdlpPath = isDev
            ? path.join(__dirname, '../../bin/yt-dlp.exe')
            : path.join(process.resourcesPath, 'bin/yt-dlp.exe')
    } else if (process.platform === 'darwin') {
        ytdlpPath = isDev
            ? path.join(__dirname, '../../bin/yt-dlp_macos')
            : path.join(process.resourcesPath, 'bin/yt-dlp_macos')
    } else {
        ytdlpPath = isDev
            ? path.join(__dirname, '../../bin/yt-dlp_linux')
            : path.join(process.resourcesPath, 'bin/yt-dlp_linux')
    }

    let ffmpegPath;
    if (process.platform === 'win32') {
        ffmpegPath = isDev
            ? path.join(__dirname, '../../bin/ffmpeg_win.exe')
            : path.join(process.resourcesPath, 'bin/ffmpeg_win.exe')
    } else if (process.platform === 'darwin') {
        ffmpegPath = isDev
            ? path.join(__dirname, '../../bin/ffmpeg_macos')
            : path.join(process.resourcesPath, 'bin/ffmpeg_macos')
    } else {
        ffmpegPath = isDev
            ? path.join(__dirname, '../../bin/ffmpeg_linux')
            : path.join(process.resourcesPath, 'bin/ffmpeg_linux')
    }

    let aria2c;
    if (process.platform === 'win32') {
        aria2c = isDev
            ? path.join(__dirname, '../../bin/aria2c.exe')
            : path.join(process.resourcesPath, 'aria2c.exe')
    }

    const args = ['--newline', '-o', filePath]

    args.push('--hls-prefer-ffmpeg');

    args.push(...getTypeArgs(type))
    args.push(...getFormatArgs(format))
    args.push(...getQualityArgs(quality))

    args.push('--external-downloader', aria2c)
    args.push('--external-downloader-args', '-x 16 -k 1M')

    args.push('--ffmpeg-location', ffmpegPath)
    args.push('--no-playlist')
    args.push(url)

    console.log('Yt-dlp args:', args)
    console.log('Save Path:', filePath)

    if (currentDownloadProcess) {
        currentDownloadProcess.kill();
    }

    return new Promise((resolve, reject) => {
        const proc = spawn(ytdlpPath, args, { stdio: ['pipe', 'pipe', 'pipe'] })
        currentDownloadProcess = proc;
        let outputPath = filePath;

        proc.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');

            lines.forEach(line => {
                if (line.trim() === '') return;

                console.log('yt-dlp output:', line);

                if (line.includes('[download]') &&
                    (line.includes('%') || line.includes('ETA'))) {

                    const progressMatch = line.match(/\[download\]\s+([\d.]+)%/);
                    const etaMatch = line.match(/ETA\s+([\d:]+)/);
                    const speedMatch = line.match(/\s+at\s+([\d.\w\/s]+)/);

                    const progressData = {
                        raw: line.trim(),
                        percent: progressMatch ? parseFloat(progressMatch[1]) : null,
                        eta: etaMatch ? etaMatch[1] : null,
                        speed: speedMatch ? speedMatch[1] : null
                    };

                    event.sender.send('download-progress', progressData);
                }

                if (line.includes('[download] Destination:')) {
                    outputPath = line.split('[download] Destination:')[1].trim();
                } else if (line.includes('[Merger] Merging formats into "')) {
                    outputPath = line.split('[Merger] Merging formats into "')[1].split('"')[0];
                }
            });
        });

        proc.on('close', async (code) => {
            currentDownloadProcess = null;
            if (code === 0) {
                const videoData = {
                    url: url,
                    format: format,
                    quality: quality,
                    type: type,
                    filePath: outputPath,
                    downloadedAt: new Date().toISOString()
                };

                await saveVideoMetadata(videoData);
                resolve({ message: `✅ Downloaded as ${format}`, filePath: outputPath });
            } else {
                reject({ message: `❌ Failed with code ${code}` });
            }
        });

        proc.on('error', (err) => {
            currentDownloadProcess = null;
            if (err.code === 'EPERM') {
                reject({ message: '❌ Permission denied. Please check file permissions.' });
            }
            else {
                reject({ message: err.message });
            }
        })
    });
});

ipcMain.on('abort-download', () => {
    if (currentDownloadProcess) {
        currentDownloadProcess.kill('SIGTERM');
        currentDownloadProcess = null;
        console.log('Download aborted by user');
    }
});