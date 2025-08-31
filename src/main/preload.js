const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    downloadVideo: (params) => ipcRenderer.invoke('download-video', params),
    getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
    getSavePath: () => ipcRenderer.invoke('get-save-path'),
    openInBrowser: (url) => ipcRenderer.invoke('open-in-browser', url),
    removeFile: (filePath) => ipcRenderer.invoke('remove-file', filePath),
    showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
    addSavedVideo: (video) => ipcRenderer.invoke('add-saved-video', video),
    getSavedVideos: () => ipcRenderer.invoke('get-saved-videos'),
    removeSavedVideo: (url) => ipcRenderer.invoke('remove-saved-video', url),
    getClipboard:() => ipcRenderer.invoke('get-clipboard'),
    onProgress: (callback) => ipcRenderer.on('download-progress', (event, progressData) => callback(progressData)),
    abortDownload: () => ipcRenderer.send("abort-download"),
})