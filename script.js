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
    

    if (taskText === '') { // checking if the submitted input is empty and alerting if so
        alert("You did not enter your task :(");
        return;
    };

    taskInput.value = '';  //clear input field
    
    saveTaskToLS(taskText, estTime); // adding to local storage
    addTaskToDOM({text: taskText, time: estTime}); //adding to DOM  
};

const addTaskToDOM = function(taskObject) {
    // creating a new <li> with out task
    const taskToAdd = document.createElement("li");
    taskToAdd.textContent = `${taskObject.text}   (est. minutes: ${taskObject.time})`;

    // adding css class to a task
    taskToAdd.classList.add("todo-item");

    // creating a button to done tasks
    const doneButton = document.createElement('button'); 
    const doneList = document.getElementById('done-tasks'); 
    doneButton.textContent = 'DONE';
    doneButton.onclick = () => {
        doneButton.remove(); // done tasks dont need a button
        taskToAdd.remove(); //removes the task
        taskToAdd.classList.add("completed"); // adds css styles for completed tasks
        const doneTaskToAdd = document.createElement("li");  // creating a new LI to not show est time
        doneTaskToAdd.textContent = taskObject.text;
        doneTaskToAdd.classList.add("todo-item");
        doneTaskToAdd.classList.add("completed");
    
        doneList.appendChild(doneTaskToAdd); // adds the task to "done" list when clicked
        
        saveTaskToDoneLS(taskObject.text); // transferring the task from "ready" local storage to "done"
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
const saveTaskToLS = function(text, time) {
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks.push({text: text, time: time});
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));
};

//saves to local storage for done tasks
const saveTaskToDoneLS = function(tsktxt) {
    //delete from "ready" LS
    let readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks = readyTasks.filter(task => task !== tsktxt);
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));

    //add to "done" LS
    const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
    doneTasks.push(tsktxt);
    localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
};