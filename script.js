const { ipcRenderer } = require('electron');

const statsButton = document.getElementById('stats-nav');
const showStats = () => {
    ipcRenderer.send('open-stats');
};

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

    // removing task input field on load
    const taskInputDiv = document.getElementById("task-inputfield");
    taskInputDiv.remove();
    const showInputFieldButton = document.createElement("button");
    showInputFieldButton.classList.add("show-input-field-button");
    const list = document.getElementById('todo-list');
    showInputFieldButton.addEventListener('click', () => {
        list.appendChild(taskInputDiv);
        showInputFieldButton.remove();
    });
    showInputFieldButton.textContent = "Add new task";
    list.appendChild(showInputFieldButton);

    pushRatings();
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

    // dont let user add task if same one alr exists
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    for (task of readyTasks) {
        if (taskText == task.text) {
            alert('this task already exists');
            return;
        }
    }

    let doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
            for (task of doneTasks) {
                if (taskText == task.text) {
                    alert("this task already exists and is done, finish it before adding yhe same one");
                    return;
    }
}

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
            seconds = 0;
            
            const dateWhenDone = new Date();  // storing date to later count ratings
            // const yearWhenDone = dateWhenDone.getFullYear();
            // const monthWhenDone = dateWhenDone.getMonth();
            // const dayWhenDone = dateWhenDone.getDate();
            // const dayOfWeekWhenDone = dateWhenDone.getDay();

            
            const doneTaskObj = {
                dateWhenDone: dateWhenDone,
                text: taskObject.text,
                timeSpent: timeSpentSecs,
                timeEst: taskObject.time,
                mark: taskObject.mark 
            } 
            
            taskToAdd.remove(); //removes the task
            taskToAdd.classList.add("completed"); // adds css styles for completed tasks
            const doneTaskToAdd = document.createElement("li");  // creating a new LI to not show est time
            doneTaskToAdd.textContent = doneTaskObj.text;
            doneTaskToAdd.classList.add("todo-item");
            doneTaskToAdd.classList.add("completed");

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
            markInput.setAttribute('type', 'number');
            markInput.setAttribute('class', 'mark-input');
            markInput.setAttribute('id', "mark-input-field")
            markInput.setAttribute('required', true);

            // Create a submit button
            const markSubmitButton = document.createElement('button');
            markSubmitButton.setAttribute('type', 'button');
            markSubmitButton.classList.add("mark-submit");
            markSubmitButton.textContent = 'Submit';
            markSubmitButton.addEventListener('click', (e) => {
                e.preventDefault();
                const markInput = document.getElementById('mark-input-field');
                // updateObjectInDoneLocalStorage(taskObj.text, 'mark', markInput.value);
                doneTaskObj.mark = markInput.value;
                console.log("markinput value :", markInput.value)
                console.log(doneTaskObj);
                saveTaskToFinishedLS(doneTaskObj);
                markInput.value = '';
                doneTaskToAdd.remove();
                pushRatings();
    });

            // Append the label, input, and button to the form
            form.appendChild(label);
            form.appendChild(markInput);
            form.appendChild(markSubmitButton);

            doneTaskToAdd.appendChild(form);

            // dont let user finish task if text content already used in done list
            let doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
            for (task of doneTasks) {
                if (doneTaskObj.text == task.text) {
                    alert("this task already exists");
                    addTaskToDOM(taskObject);
                    return;
    }
}
    
            doneList.insertBefore(doneTaskToAdd, doneList.firstChild);
            
            saveTaskToDoneLS(taskObject.text, timeSpentSecs, taskObject.time, doneTaskObj.dateWhenDone); // transferring the task from "ready" local storage to "done"
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
    taskList.insertBefore(taskToAdd, taskList.firstChild);
};

const addDoneTaskToDOM = function(taskObj) {

    const doneTaskObj = {
        dateWhenDone: taskObj.dateWhenDone,
        text: taskObj.text,
        timeSpent: taskObj.timeSpent,
        timeEst: taskObj.timeEst,
        mark: taskObj.mark 
    } 
    // creating a new <li> with out task
    const taskToAdd = document.createElement("li");
    taskToAdd.textContent = taskObj.text;

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
    markInput.setAttribute('type', 'number');
    markInput.setAttribute('class', 'mark-input');
    markInput.setAttribute('id', "mark-input-field")
    markInput.setAttribute('required', true);

    // Create a submit button
    const markSubmitButton = document.createElement('button');
    markSubmitButton.setAttribute('type', 'button');
    markSubmitButton.classList.add("mark-submit");
    markSubmitButton.textContent = 'Submit';
    markSubmitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const markInput = document.getElementById('mark-input-field');
        // updateObjectInDoneLocalStorage(taskObj.text, 'mark', markInput.value);
        doneTaskObj.mark = markInput.value;
        console.log("markinput value :", markInput.value)
        console.log(doneTaskObj);
        saveTaskToFinishedLS(doneTaskObj);
        markInput.value = '';
        taskToAdd.remove();

        pushRatings();
    });

    // Append the label, input, and button to the form
    form.appendChild(label);
    form.appendChild(markInput);
    form.appendChild(markSubmitButton);

    taskToAdd.appendChild(form);

    // finally adding task to the list
    const doneTaskList = document.getElementById("done-tasks");
    doneTaskList.insertBefore(taskToAdd, doneTaskList.firstChild);

};

// counts task rating 
const countTaskRating = function(taskObj) { 
    // R = (M * 7,5) + timeBonus timeBonus = (Te / Tf - 1) * complexityBonus complexityBonus = 250 if hard+, 200 if normal, 150 if easy, 100 if no effort
    const mark = taskObj.mark;
    let complBonus;
    if (taskObj.timeEst == 15) { 
        complBonus = 100;
    } else if (taskObj.timeEst == 30) { 
        complBonus = 150;
    } else if (taskObj.timeEst == 60) { 
        complBonus = 200;
    } else if (taskObj.timeEst == 120) { 
        complBonus = 250;
    } else if (taskObj.timeEst == 180) { 
        complBonus = 250;
    } 
    
    const effectiveness = taskObj.timeEst / taskObj.timeSpent <= 2 ? taskObj.timeEst / taskObj.timeSpent : 2;

    const timeBonus = (effectiveness - 1) * complBonus;

    const rating = mark * 7.5 + timeBonus;
    console.log(`rating = mark (${mark}) * 7,5 (${mark*7.5}) + timeBonus (${timeBonus})`)
    return rating;
}

// func adds ratings to rating div
const pushRatings = function() {
    const storedData = localStorage.getItem('finishedTasks');
    const tasks = storedData ? JSON.parse(storedData) : [];
    const getTodayrating = function(tasks) {
        const today = new Date();
        return tasks.reduce((total, task) => {
            const completedDate = new Date(task.dateWhenDone);
            if (completedDate.toDateString() === today.toDateString()) {
                return total + task.rating;
            }
            return total;
        }, 0);
    };
    const todayRating = getTodayrating(tasks);

    const getWeekRating = function(tasks) {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        return tasks.reduce((total, task) => {
            const completedDate = new Date(task.dateWhenDone);
            if (completedDate >= startOfWeek) {
                return total + task.rating;
            }
            return total;
    }, 0);
    };
    const weekRating = getWeekRating(tasks);

    const getMonthRating = function(tasks) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return tasks.reduce((total, task) => {
            const completedDate = new Date(task.dateWhenDone);
            if (completedDate >= startOfMonth) {
                return total + task.rating;
            }
            return total;
    }, 0);
    };
    const monthRating = getMonthRating(tasks);


    const todayOut = document.getElementById("today-rating");
    todayOut.textContent = `Today: ${todayRating}`;

    const weekOut = document.getElementById("week-rating");
    weekOut.textContent = `This week: ${weekRating}`;

    const monthOut = document.getElementById("month-rating");
    monthOut.textContent = `This month: ${monthRating}`;
}

// func to update values in done LS
function updateObjectInDoneLocalStorage(objectText, attributeName, newValue) {
    // Step 1: Retrieve the existing array from local storage
    let storedData = localStorage.getItem('doneTasks');
    let myArray = storedData ? JSON.parse(storedData) : [];

    // Step 2: Find the object by id and update the specific attribute
    const objectToUpdate = myArray.find(obj => obj.text === objectText);
    console.log(objectToUpdate);
    if (objectToUpdate) {
        objectToUpdate[attributeName] = newValue; // Update the attribute
    }
    console.log(objectToUpdate);    

    // Step 3: Save the updated array back to local storage
    localStorage.setItem('doneTasks', JSON.stringify(myArray));
}

// saves to local storage for ready tasks
const saveTaskToLS = function(text, time, complexity) {
    const readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks.push({text: text, time: time, complexity: complexity});
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));
};

//saves to local storage for done tasks
const saveTaskToDoneLS = function(tsktxt, spent, est, date) {
    //delete from "ready" LS
    let readyTasks = JSON.parse(localStorage.getItem('readyTasks')) || [];
    readyTasks = readyTasks.filter(task => task.text !== tsktxt);
    localStorage.setItem('readyTasks', JSON.stringify(readyTasks));

    //add to "done" LS
    const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
    doneTasks.push({text: tsktxt, timeSpent: spent, estTime: est, dateWhenDone: date});
    localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
};

// func to save task after mark is gotten
const saveTaskToFinishedLS = function(taskObj) {
    //delete from "done" LS
    let doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
    doneTasks = doneTasks.filter(task => task.text !== taskObj.text);
    localStorage.setItem('doneTasks', JSON.stringify(doneTasks));

    //add to "finished" LS
    const finishedTasks = JSON.parse(localStorage.getItem('finishedTasks')) || [];
    const rating = countTaskRating(taskObj);
    finishedTasks.push({
        text: taskObj.text,
        timeSpent: taskObj.timeSpent, 
        timeEst: taskObj.timeEst, 
        mark: taskObj.mark, 
        rating: rating, 
        dateWhenDone: taskObj.dateWhenDone
    });

    ipcRenderer.send('save-task', {
        text: taskObj.text,
        timeSpent: taskObj.timeSpent, 
        timeEst: taskObj.timeEst, 
        mark: taskObj.mark, 
        rating: rating, 
        dateWhenDone: taskObj.dateWhenDone.toISOString()
    }); // Send the task to the main process

    localStorage.setItem('finishedTasks', JSON.stringify(finishedTasks));
}