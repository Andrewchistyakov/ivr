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
        const totalTimeOutput = totalTimeSpentMin.toFixed(2);

        document.getElementById('total-min').textContent = totalTimeOutput + " minutes";

        //updating weekly avg
        const weeklyAvgHeader = document.getElementById('avg-weekly');
        weeklyAvgHeader.textContent = `This week: ${countAvgWeek()}`;
        console.log(countAvgMonth(), countAvgWeek())

        const monthlyAvgHeader = document.getElementById('avg-monthly');
        monthlyAvgHeader.textContent = `This month: ${countAvgMonth()}`;
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

const countAvgMonth = function() {
    const thisMonthTasks = allTasks.filter((task) => {
        const dateDone = new Date(task.dateWhenDone);
        const today = new Date();
        
        // Get the first day of the current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Check if the task was completed this month
        return dateDone >= startOfMonth && dateDone < new Date(today.getFullYear(), today.getMonth() + 1, 1);
    });

    // Calculate the average rating on tasks completed this month
    let sum = 0;
    for (let task of thisMonthTasks) {
        let rating = task.rating;
        sum += rating;
    };
    return sum / thisMonthTasks.length; 
};

