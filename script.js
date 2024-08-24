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
        addDoneTaskToDOM(task.text);
    });

    // removing task input field on load
    const taskInputDiv = document.getElementById("task-inputfield");
    taskInputDiv.remove();
    const showInputFieldButton = document.createElement("button");
    console.log(showInputFieldButton);
    console.log(showInputFieldButton.id);
    showInputFieldButton.id = "show-input-field-button";
    const list = document.getElementById('todo-list');
    showInputFieldButton.addEventListener('click', () => {
        list.appendChild(taskInputDiv);
        showInputFieldButton.remove();
    });
    showInputFieldButton.textContent = "Add new task";
    list.appendChild(showInputFieldButton);
};

// submit button handler
const addTask = function() {
    //getting user input
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value;
    const complInp = document.getElementById("compl-selector");
    const compl = complInp.value;   // coplexity: routine or challenging 
    let estTime;
    if (compl === "no effort") { estTime = 15 }
    else if (compl === "easy") { estTime = 30 }
    else if (compl === "normal") { estTime = 60}
    else if (compl === "hard") { estTime = 120 }
    else if (compl === "very hard") { estTime = 180 }
    

    if (taskText === '') { // checking if the submitted input is empty and alerting if so
        alert("You did not enter your task :(");
        return;
    };

    taskInput.value = '';  //clear input field

    const taskInputDiv = document.getElementById("task-inputfield");
    const showInputFieldButton = document.createElement("button");
    showInputFieldButton.classList.add("show-input-field-button");
    showInputFieldButton.textContent = "Add new task";
    const list = document.getElementById('todo-list');
    taskInputDiv.remove();  // hiding input field
    list.appendChild(showInputFieldButton);   // adding buttton to show task input field
    showInputFieldButton.addEventListener('click', () => {
        list.appendChild(taskInputDiv);
        showInputFieldButton.remove();
    });
    
    saveTaskToLS(taskText, estTime, compl); // adding to local storage
    addTaskToDOM({text: taskText, time: estTime, complexity: compl}); //adding to DOM  
    console.log(estTime)
};

const addTaskToDOM = function(taskObject) {
    // creating a new <li> with out task
    const taskToAdd = document.createElement("li");
    taskToAdd.textContent = `${taskObject.text}`;
    const taskDone = false;  // later will indicate that task is done and no need to add it to the lis

    // adding css class to a task
    taskToAdd.classList.add("todo-item");

    //creating a complexity indicator
    const compl_indicator = document.createElement("h4");
    if (taskObject.time === 15) {  //deciding which indicator to show
        compl_indicator.textContent = "🟣";
    } else if (taskObject.time == 30) {
        compl_indicator.textContent = "🔵";
    } else if (taskObject.time === 60) {
        compl_indicator.textContent = "🟢";
    } else if (taskObject.time === 120) {
        compl_indicator.textContent = "🟡";
    } else if (taskObject.time === 180) {
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
            const timeSpentSecs = seconds;
            console.log(timeSpentSecs);
            seconds = 0;

            // TODO: implement countRating() here
            
            
            taskToAdd.remove(); //removes the task
            taskToAdd.classList.add("completed"); // adds css styles for completed tasks
            const doneTaskToAdd = document.createElement("li");  // creating a new LI to not show est time
            doneTaskToAdd.textContent = taskObject.text;
            doneTaskToAdd.classList.add("todo-item");
            doneTaskToAdd.classList.add("completed");
    
            doneList.appendChild(doneTaskToAdd); // adds the task to "done" list when clicked
            
            saveTaskToDoneLS(taskObject.text, timeSpentSecs); // transferring the task from "ready" local storage to "done"
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

    // Create a form element
    const form = document.createElement('form');
    form.setAttribute('id', 'mark-form');

    // Create a label
    const label = document.createElement('label');
    label.setAttribute('for', 'textInput');
    label.classList.add("label-mark-input")
    label.textContent = 'Enter the mark:';
    
    // Create a text input
    const markInput = document.createElement('input');
    markInput.setAttribute('type', 'text');
    markInput.setAttribute('id', 'mark-input');
    markInput.setAttribute('required', true);

    // Create a submit button
    const markSubmitButton = document.createElement('button');
    markSubmitButton.setAttribute('type', 'submit');
    markSubmitButton.classList.add("mark-submit");
    markSubmitButton.textContent = 'Submit';

    // Append the label, input, and button to the form
    form.appendChild(label);
    form.appendChild(markInput);
    form.appendChild(markSubmitButton);

    taskToAdd.appendChild(form);

    // finally adding task to the list
    const doneTaskList = document.getElementById("done-tasks");
    doneTaskList.appendChild(taskToAdd);

};

const countTaskRating = function(task) {  // TODO
    // R = (M * 7,5) + timeBonus timeBonus = (Te / Tf - 1) * complexityBonus complexityBonus = 250 if hard+, 200 if normal, 150 if easy, 100 if no effort
    
}

// saves to local storage for ready tasks
const saveTaskToLS = function(text, time, complexity) {
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks.push({text: text, time: time, complexity: complexity});
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));
};

//saves to local storage for done tasks
const saveTaskToDoneLS = function(tsktxt, spent) {
    //delete from "ready" LS
    let readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks = readyTasks.filter(task => task.text !== tsktxt);
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));

    //add to "done" LS
    const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
    doneTasks.push({text: tsktxt, timeSpent: spent});
    localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
};