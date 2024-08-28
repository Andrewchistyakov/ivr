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

        // counting total time spent studying
        let totalTimeSpent = 0;
        for (let task of allTasks) {
            totalTimeSpent += task.timeSpent;
        };
        const totalTimeSpentMin = totalTimeSpent / 60;

        //updating weekly avg
        const weeklyAvgHeader = document.getElementById('avg-weekly');
        weeklyAvgHeader.textContent = `This week: ${countAvgWeek()}`;
    });
}

// avg ratings counters:
const countAvgWeek = function() {
        const thisWeekTasks = allTasks.filter((task) => {
            const dateDone = new Date(task.dateWhenDone);
            const today = new Date();
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            return dateDone >= startOfWeek;
        });
        let sum = 0;
        for (let task of thisWeekTasks) {
            let rating = task.rating;
            sum += rating;
        };
        return sum / thisWeekTasks.length;
};

