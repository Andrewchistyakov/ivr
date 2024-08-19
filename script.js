const addTask = function() {
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value;
    const taskList = document.getElementById("task-list");

    if (taskText === '') { // checking if the submitted input is empty and alerting if so
        alert("You did not enter your task :(");
        return;
    }

    const newTask = document.createElement('li'); // creating a list item
    newTask.textContent = taskText; // add the text we got from the input field to the task
    
    
    const removeButton = document.createElement('button');  // creating a button to remove tasks
    removeButton.textContent = 'DONE';
    removeButton.onclick = () => newTask.remove(); // remove a task when clicked
    newTask.appendChild(removeButton);

    taskInput.value = ''; // clearing input field
    taskList.appendChild(newTask); // adding a task
}