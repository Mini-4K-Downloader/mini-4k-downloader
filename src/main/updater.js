const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

function initAutoUpdater(mainWindow) {
    autoUpdater.autoDownload = false;

    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info.version);
        const result = dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: ['Download', 'Later'],
            title: 'Update Available',
            message: `Version ${info.version} is available. Do you want to download it?`
        });
        if (result === 0) autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-not-available', () => {
        console.log('No update available.');
    });

    autoUpdater.on('download-progress', (progress) => {
        console.log(`Download progress: ${Math.round(progress.percent)}%`);
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded; installing...');
        autoUpdater.quitAndInstall();
    });
}

module.exports = { initAutoUpdater };