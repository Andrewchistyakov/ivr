const path = require('path');
const sqlite3 = require('sqlite3').verbose();   
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');



let win;
const dbPath = path.join(app.getPath('userData'), 'tasks.db');
const db = new sqlite3.Database(dbPath);

function createWindow() {
    win = new BrowserWindow({
        width: 1050,
        height: 750,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: true
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

// Database functions
db.serialize(() => {
    // Create the tasks table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS finishedTasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        mark INTEGER,
        timeEst INTEGER,
        timeSpent INTEGER,
        rating INTEGER,
        dateWhenDone TEXT
    )`);
});

function saveTask(task, callback) {
    db.serialize(() => {
        const stmt = db.prepare("INSERT INTO finishedTasks (text, mark, timeEst, timeSpent, rating, dateWhenDone) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(task.text, task.mark, task.timeEst, task.timeSpent, task.rating, task.dateWhenDone, (err) => {
            if (err) {
                console.error('Error inserting task:', err);
                callback(err);
            } else {
                console.log('Task added successfully');
                callback(null); // Call the callback with no error
            }
        });
        stmt.finalize();
    });
}

function getTasks(callback) {
    db.all("SELECT * FROM finishedTasks", [], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            callback([]); // Return an empty array on error
        } else {
            console.log('Fetched tasks:', rows); // Log the fetched tasks
            callback(rows); // Return the array of tasks
        }
    });
}

app.on('before-quit', () => {
    db.close();
});

ipcMain.on('save-task', (event, task) => {
    saveTask(task, (err) => {
        if (!err) {
            getTasks((tasks) => {
                console.log('Fetched tasks:', tasks); // This should show the tasks
            });
        }
    }); // Call the function to add the task to the database
    event.reply('task-saved', { success: true }); // Send a response back to the renderer
    console.log('task saver func called')
});

ipcMain.on('get-all-tasks', (event) => {
    getTasks((tasks) => {
        event.reply('all-tasks-response', tasks); // Send the tasks back to the renderer
    });
});