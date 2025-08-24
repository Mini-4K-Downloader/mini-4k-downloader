const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const isDev = !app.isPackaged
const { getFormatArgs } = require('../scripts/format')
const { initAutoUpdater } = require('./updater');
const { getQualityArgs } = require('../scripts/quality')
const { getTypeArgs } = require('../scripts/type')
const { getVideoInfo} = require("./videoInfo");
const fs = require('fs');

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
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

console.log("✅ Registering get-video-info handler");
ipcMain.handle('get-video-info', async (event, url) => {
    return await getVideoInfo(url)
})


ipcMain.handle('download-video', async (event, { url, format, quality, type }) => {
    let basePath;
    if (process.platform === 'darwin') {
        basePath = path.join(app.getPath("home"), "Movies");
    }

    const savePath = path.join(basePath, "Mini 4K Downloader");
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
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

    const args = ['--newline', '-o', `${savePath}/%(title)s.%(ext)s`]

    args.push(...getTypeArgs(type))
    args.push(...getFormatArgs(format))
    args.push(...getQualityArgs(quality))

    args.push('--ffmpeg-location', ffmpegPath)
    args.push('--no-playlist');
    args.push(url)

    console.log('Yt-dlp args:', args)

    return new Promise((resolve, reject) => {
        const proc = spawn(ytdlpPath, args)

        proc.stdout.on('data', (data) => {
            const line = data.toString()
            event.sender.send('download-progress', line)
        })

        proc.stderr.on('data', (data) => {
            const line = data.toString()
            event.sender.send('download-progress', line)
        })

        proc.on('close', (code) => {
            if (code === 0) resolve(`✅ Downloaded as ${format}`)
            else reject(`❌ Failed with code ${code}`)
        })
    })
})