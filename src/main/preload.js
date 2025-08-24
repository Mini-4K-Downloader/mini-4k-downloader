const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  downloadVideo: (params) => ipcRenderer.invoke('download-video', params),
  getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
  onProgress: (callback) => ipcRenderer.on('download-progress', (event, line) => callback(line)),
  abortDownload: () => ipcRenderer.send("abort-download")
})
