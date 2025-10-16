document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("date-input");
  const taskList = document.getElementById("task-list");
  const deleteAllBtn = document.getElementById("delete-all-btn");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const noTasksMessage = document.getElementById("no-tasks-message");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // --- Core Functions ---

  // Function to save tasks to Local Storage
  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // Function to update summary statistics (Total, Completed, Pending, Progress)
  const updateSummary = () => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("pending-tasks").textContent = pending;
    document.getElementById("progress-percent").textContent = `${progress}%`;
  };

  // Function to render a single task item
  const createTaskElement = (task) => {
    const listItem = document.createElement("li");
    listItem.className = `task-item ${task.completed ? "completed-task" : ""}`;
    listItem.dataset.id = task.id;

    // Date formatting: dd/mm/yyyy from yyyy-mm-dd
    const formattedDate = task.dueDate
      ? task.dueDate.split("-").reverse().join("/")
      : "N/A";

    listItem.innerHTML = `
            <div class="task-col">
                <i class="fas ${
                  task.completed ? "fa-check-circle" : "fa-circle"
                }" data-action="toggle"></i>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="date-col">${formattedDate}</div>
            <div class="status-col">
                <span class="${
                  task.completed ? "status-completed" : "status-pending"
                }">
                    ${task.completed ? "Completed" : "Pending"}
                </span>
            </div>
            <div class="actions-col">
                <button data-action="delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    return listItem;
  };

  // Function to render the entire task list
  const renderTasks = (currentTasks = tasks) => {
    taskList.innerHTML = ""; // Clear current list

    if (currentTasks.length === 0) {
      noTasksMessage.style.display = "block";
    } else {
      noTasksMessage.style.display = "none";
      currentTasks.forEach((task) => {
        taskList.appendChild(createTaskElement(task));
      });
    }
    updateSummary();
  };

  // --- CRUD and UI Handlers ---

  // Add Task Handler (Form Submission)
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = taskInput.value.trim();
    const dueDate = dateInput.value;

    // Input Form Validation (Simple check for task text and date)
    if (text === "" || dueDate === "") {
      alert("Please enter a task and select a due date.");
      return;
    }

    const newTask = {
      id: Date.now(),
      text,
      dueDate,
      completed: false,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Clear input fields
    taskInput.value = "";
    dateInput.value = "";
  });

  // Task List Click Handler (Toggle and Delete)
  taskList.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;

    const listItem = target.closest(".task-item");
    const taskId = parseInt(listItem.dataset.id);
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) return;

    if (target.dataset.action === "toggle") {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
    } else if (target.dataset.action === "delete") {
      if (confirm("Are you sure you want to delete this task?")) {
        tasks.splice(taskIndex, 1);
      }
    }

    saveTasks();
    // Re-render the filtered/sorted list if it exists, otherwise the main list
    filterAndSortTasks();
  });

  // Delete All Handler
  deleteAllBtn.addEventListener("click", () => {
    if (
      tasks.length > 0 &&
      confirm(
        "Are you sure you want to delete ALL tasks? This action cannot be undone."
      )
    ) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  });

  // Filter and Sort Logic (Combined for efficiency)
  const filterAndSortTasks = () => {
    let currentTasks = [...tasks];
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    const filterBtn = document.getElementById("filter-btn");

    // --- Filtering (Search) ---
    if (searchTerm) {
      currentTasks = currentTasks.filter((task) =>
        task.text.toLowerCase().includes(searchTerm)
      );
    }

    // --- Filtering (Toggleable Filter Button - Example: Toggle completed/pending view) ---
    if (filterBtn.classList.contains("active-filter")) {
      // Example filter: Show only pending tasks
      currentTasks = currentTasks.filter((task) => !task.completed);
    }

    // --- Sorting ---
    if (sortValue !== "none") {
      currentTasks.sort((a, b) => {
        switch (sortValue) {
          case "date-asc":
            return new Date(a.dueDate) - new Date(b.dueDate);
          case "date-desc":
            return new Date(b.dueDate) - new Date(a.dueDate);
          case "status":
            // Pending first (false is less than true)
            return a.completed - b.completed;
          default:
            return 0;
        }
      });
    }

    renderTasks(currentTasks);
  };

  // Event Listeners for Filtering and Sorting
  searchInput.addEventListener("input", filterAndSortTasks);
  sortSelect.addEventListener("change", filterAndSortTasks);

  // Filter Button Toggle Handler (Example implementation)
  document.getElementById("filter-btn").addEventListener("click", (e) => {
    e.target.classList.toggle("active-filter");
    e.target.textContent = e.target.classList.contains("active-filter")
      ? "SHOW ALL"
      : "FILTER";
    filterAndSortTasks();
  });

  // Initial load
  renderTasks();
});
