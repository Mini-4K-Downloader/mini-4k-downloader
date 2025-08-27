const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  downloadVideo: (params) => ipcRenderer.invoke('download-video', params),
  getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
  getSavePath: () => ipcRenderer.invoke('get-save-path'),
  openInBrowser: (url) => ipcRenderer.invoke('open-in-browser', url),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
  onProgress: (callback) => ipcRenderer.on('download-progress', (event, line) => callback(line)),
  abortDownload: () => ipcRenderer.send("abort-download"),
})
