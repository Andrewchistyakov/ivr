// const { ipcRenderer } = require('electron'); 

// // Function to reload the page
// function reloadPage() {
//     ipcRenderer.send('reload-page');
// }

// adds tasks from local storage when opening the app
window.onload = function() {
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks.forEach(task => {
        addTaskToDOM(task);
    });

    const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
    doneTasks.forEach(task => {
        addDoneTaskToDOM(task);
    });
};

const addTask = function() {
    //getting user input
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value;
    const estTimeInp = document.getElementById("time-estimate");
    const estTime = estTimeInp.value;
    const complInp = document.getElementById("compl-selector");
    const compl = complInp.value;
    

    if (taskText === '') { // checking if the submitted input is empty and alerting if so
        alert("You did not enter your task :(");
        return;
    };

    taskInput.value = '';  //clear input field
    
    saveTaskToLS(taskText, estTime, compl); // adding to local storage
    addTaskToDOM({text: taskText, time: estTime, complexity: compl}); //adding to DOM  
};

const addTaskToDOM = function(taskObject) {
    // creating a new <li> with out task
    const taskToAdd = document.createElement("li");
    taskToAdd.textContent = `${taskObject.text}   (est. minutes: ${taskObject.time})`;
    const taskDone = false;  // later will indicate that task is done and no need to add it to the lis

    // adding css class to a task
    taskToAdd.classList.add("todo-item");

    //creating a complexity indicator
    const compl_indicator = document.createElement("h4");
    if (taskObject.complexity === "routine") {  //deciding which indicator to show
        compl_indicator.textContent = "🟣";
    } else if (taskObject.complexity === "easy") {
        compl_indicator.textContent = "🔵";
    } else if (taskObject.complexity === "normal") {
        compl_indicator.textContent = "🟢";
    } else if (taskObject.complexity === "hard") {
        compl_indicator.textContent = "🟡";
    } else if (taskObject.complexity === "very hard") {
        compl_indicator.textContent = "🔴";
    }
    compl_indicator.classList.add("compl-indicator");
    taskToAdd.appendChild(compl_indicator);

    // creating a button to done tasks
    const doneButton = document.createElement('button'); 
    const doneList = document.getElementById('done-tasks'); 
    doneButton.textContent = 'Start';
    doneButton.onclick = () => {
        doneButton.remove(); // done tasks dont need a button
        compl_indicator.remove();  // not to naezhat on buttons :)

        //creating a stopwatch for time measurement when user starts doing a task
        const stopwatch = document.createElement("div");
        stopwatch.classList.add("stopwatch");
        const timeDisplay = document.createElement("h3");
        timeDisplay.classList.add('time-display');
        const finishButton = document.createElement("button");
        finishButton.classList.add('finish-button');
        finishButton.textContent = "finish";
        const cancelButton = document.createElement("button");
        cancelButton.classList.add('cancel-stopwatch');
        cancelButton.textContent = 'cancel'
        stopwatch.appendChild(timeDisplay);
        stopwatch.appendChild(finishButton);
        stopwatch.appendChild(cancelButton);
        taskToAdd.appendChild(stopwatch);

        let timer;
        let seconds = 0;
        function updateTime() {
            seconds++;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        timer = setInterval(updateTime, 1000);  // starting a timer, updates every 1000ms

        finishButton.addEventListener('click', () => {
            clearInterval(timer);  // stopping timer
            timer = null;
            
            //getting stopwatch finish value
            const timeSpent = timeDisplay.textContent;
            seconds = 0;

            // TODO: implement countRating() here
            
            
            taskToAdd.remove(); //removes the task
            taskToAdd.classList.add("completed"); // adds css styles for completed tasks
            const doneTaskToAdd = document.createElement("li");  // creating a new LI to not show est time
            doneTaskToAdd.textContent = taskObject.text;
            doneTaskToAdd.classList.add("todo-item");
            doneTaskToAdd.classList.add("completed");
    
            doneList.appendChild(doneTaskToAdd); // adds the task to "done" list when clicked
            
            saveTaskToDoneLS(taskObject.text); // transferring the task from "ready" local storage to "done"
        });
        cancelButton.addEventListener('click', () => {
            clearInterval(timer);  // stopping timer
            timer = null;

            stopwatch.remove();
            taskToAdd.appendChild(compl_indicator);
            taskToAdd.appendChild(doneButton);
        })



        
    };
    taskToAdd.appendChild(doneButton);

    // finally adding task to the list
    const taskList = document.getElementById("task-list");
    taskList.appendChild(taskToAdd);
};

const addDoneTaskToDOM = function(text) {
    // creating a new <li> with out task
    const taskToAdd = document.createElement("li");
    taskToAdd.textContent = text;

    // adding css class to a task
    taskToAdd.classList.add("todo-item");
    taskToAdd.classList.add("completed");

    // finally adding task to the list
    const doneTaskList = document.getElementById("done-tasks");
    doneTaskList.appendChild(taskToAdd);
};

// saves to local storage for ready tasks
const saveTaskToLS = function(text, time, complexity) {
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks.push({text: text, time: time, complexity: complexity});
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));
};

//saves to local storage for done tasks
const saveTaskToDoneLS = function(tsktxt) {
    //delete from "ready" LS
    let readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks = readyTasks.filter(task => task.text !== tsktxt);
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));

    //add to "done" LS
    const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
    doneTasks.push(tsktxt);
    localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
};