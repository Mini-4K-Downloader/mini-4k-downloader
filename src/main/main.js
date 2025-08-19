const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const isDev = !app.isPackaged;

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

ipcMain.handle('download-video', async (event, { url, format }) => {
  const savePaths = dialog.showOpenDialogSync({ properties: ['openDirectory'] });
  if (!savePaths || savePaths.length === 0) return '❌ Canceled';
  const savePath = savePaths[0];

  let ytdlpPath;
  if (process.platform === 'win32') {
    ytdlpPath = isDev 
      ? path.join(__dirname, '../../bin/yt-dlp.exe')
      : path.join(process.resourcesPath, 'bin/yt-dlp.exe');
  } else if (process.platform === 'darwin') {
    ytdlpPath = isDev
      ? path.join(__dirname, '../../bin/yt-dlp_macos')
      : path.join(process.resourcesPath, 'bin/yt-dlp_macos');
  } else {
    ytdlpPath = isDev
      ? path.join(__dirname, '../../bin/yt-dlp_linux')
      : path.join(process.resourcesPath, 'bin/yt-dlp_linux');
  }


  let cmd = `"${ytdlpPath}" -o "${savePath}/%(title)s.%(ext)s"`

  if (format === 'mp3') {
    cmd += ` --extract-audio --audio-format mp3`
  } else if (format === 'mp4') {
    cmd += ` -f mp4`
  } else if (format === 'webm') {
    cmd += ` -f webm`
  }

  cmd += ` "${url}"`

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(stderr)
      else resolve(stdout || `✅ Downloaded as ${format}`)
    })
  })
})
