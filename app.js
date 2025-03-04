document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    loadNotes();
    updateTaskProgress();

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
});

// Add a task to the to-do list
function addTask() {
    let taskInput = document.getElementById("taskInput");
    let priority = document.getElementById("priority").value;
    let taskList = document.getElementById("taskList");

    if (taskInput.value.trim() === "") return;

    let li = document.createElement("li");
    li.classList.add(`priority-${priority}`);
    li.setAttribute("draggable", "true");

    li.innerHTML = `
        <span contenteditable="true" class="task-text">${taskInput.value}</span>
        <input type="checkbox" onclick="toggleTask(this)">
        <button class="remove-btn" onclick="removeTask(this)">❌</button>
    `;

    taskList.appendChild(li);
    addDragAndDrop(li);
    saveTasks();
    updateTaskProgress();
    taskInput.value = "";
}

// Remove a task
function removeTask(button) {
    button.parentElement.remove();
    saveTasks();
    updateTaskProgress();
}

// Toggle task completion
function toggleTask(checkbox) {
    checkbox.previousElementSibling.classList.toggle("completed");
    saveTasks();
    updateTaskProgress();
}

// Save tasks to local storage
function saveTasks() {
    let tasks = [];
    document.querySelectorAll("#taskList li").forEach(li => {
        tasks.push({
            text: li.querySelector(".task-text").innerText,
            completed: li.querySelector("input").checked,
            priority: li.className
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from local storage
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        let li = document.createElement("li");
        li.classList.add(task.priority);
        li.setAttribute("draggable", "true");

        li.innerHTML = `
            <span contenteditable="true" class="task-text">${task.text}</span>
            <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleTask(this)">
            <button class="remove-btn" onclick="removeTask(this)">❌</button>
        `;

        taskList.appendChild(li);
        addDragAndDrop(li);
    });
}

// Update task progress
function updateTaskProgress() {
    let totalTasks = document.querySelectorAll("#taskList li").length;
    let completedTasks = document.querySelectorAll("#taskList li input:checked").length;
    document.getElementById("taskProgress").innerText = `Completed: ${completedTasks}/${totalTasks}`;
}

// Drag & Drop Tasks
function addDragAndDrop(li) {
    li.addEventListener("dragstart", () => li.classList.add("dragging"));
    li.addEventListener("dragend", () => li.classList.remove("dragging"));

    document.getElementById("taskList").addEventListener("dragover", event => {
        event.preventDefault();
        const dragging = document.querySelector(".dragging");
        const afterElement = [...document.querySelectorAll("#taskList li:not(.dragging)")]
            .reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = event.clientY - box.top - box.height / 2;
                return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        
        if (afterElement) {
            afterElement.before(dragging);
        }
    });
}

function saveNotes() {
    let notesArea = document.getElementById("notesArea");
    let notes = notesArea.value.trim();

    if (notes === "") return; // Prevent saving empty notes

    let savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];
    savedNotes.push(notes); // Save only the text (no timestamp)
    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));

    notesArea.value = ""; // Clear the textarea after saving
    loadNotes();
}



function loadNotes() {
    let savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];
    let savedNotesList = document.getElementById("savedNotesList");
    savedNotesList.innerHTML = "";

    savedNotes.forEach((note, index) => {
        if (typeof note !== "string") return; // Skip any corrupted data
        
        let li = document.createElement("li");
        li.innerHTML = `
            ${note} <button onclick="removeNote(${index})">❌</button>
        `;
        savedNotesList.appendChild(li);
    });
}


// Remove a Note
function removeNote(index) {
    let savedNotes = JSON.parse(localStorage.getItem("savedNotes")) || [];
    savedNotes.splice(index, 1);
    localStorage.setItem("savedNotes", JSON.stringify(savedNotes));
    loadNotes();
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')  // Ensure this path is correct
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}


