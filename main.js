const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');



let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1050,
        height: 750,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: __dirname + "/img/icon.png"})

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }))
    
    win.webContents.openDevTools();

    win.on('closed', () => win = null);

    // opens stats page when recieves a call
    ipcMain.on('open-stats', () => {
        win.loadFile('stats.html');
    });

    ipcMain.on('open-tasks', () => {
        win.loadFile('index.html');
    });
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());
