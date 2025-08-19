const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  downloadVideo: (params) => ipcRenderer.invoke('download-video', params)
})
