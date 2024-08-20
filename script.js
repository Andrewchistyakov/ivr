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
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value;
    

    if (taskText === '') { // checking if the submitted input is empty and alerting if so
        alert("You did not enter your task :(");
        return;
    };

    taskInput.value = '';  //clear input field
    addTaskToDOM(taskText); //adding to DOM 
    saveTaskToLS(taskText); // adding to local storage 
};

const addTaskToDOM = function(text) {
    // creating a new <li> with out task
    const taskToAdd = document.createElement("li");
    taskToAdd.textContent = text;

    // creating a button to done tasks
    const doneButton = document.createElement('button'); 
    const doneList = document.getElementById('done-tasks'); 
    doneButton.textContent = 'DONE';
    doneButton.onclick = () => {
        doneButton.remove(); // done tasks dont need a button
        taskToAdd.remove(); //removes the task
        doneList.appendChild(taskToAdd); // adds the task to "done" list when clicked
        saveTaskToDoneLS(text); // transferring the task from "ready" local storage to "done"
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

    // finally adding task to the list
    const doneTaskList = document.getElementById("done-tasks");
    doneTaskList.appendChild(taskToAdd);
};

// saves to local storage for ready tasks
const saveTaskToLS = function(text) {
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks.push(text);
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