const { ipcRenderer } = require('electron');
let allTasks; 

const statsButton = document.getElementById('task-list-nav');
const openTasks = () => {
    ipcRenderer.send('open-tasks');
}

window.onload = function() {
    ipcRenderer.send('get-all-tasks'); // Send the request to the main process

    // Listen for the response from the main process
    ipcRenderer.on('all-tasks-response', (event, tasks) => {
        console.log('Fetched tasks:', tasks);
        // Store tasks in a variable
        allTasks = tasks;
        console.log(allTasks);
    });
}