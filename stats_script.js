const { ipcRenderer } = require('electron');

const statsButton = document.getElementById('task-list-nav');
const openTasks = () => {
    ipcRenderer.send('open-tasks');
}
