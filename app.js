const taskInput = document.querySelector("#taskInput");
const addButton = document.querySelector("#addButton");
const taskList = document.querySelector("#taskList");
const taskTemplate = document.querySelector("#taskTemplate");
const taskCount = document.querySelector("#taskCount");
const progressTitle = document.querySelector("#progressTitle");
const progressPercent = document.querySelector("#progressPercent");
const ringFill = document.querySelector("#ringFill");
const resetButton = document.querySelector("#resetButton");
const themeButton = document.querySelector("#themeButton");
const timerDisplay = document.querySelector("#timerDisplay");
const timerToggle = document.querySelector("#timerToggle");
const timerReset = document.querySelector("#timerReset");
const timerModeLabel = document.querySelector("#timerModeLabel");
const timerModeButtons = document.querySelectorAll("[data-minutes]");

const STORAGE_KEY = "momentum-board-tasks";
const THEME_KEY = "momentum-board-theme";
const TIMER_KEY = "momentum-board-timer-minutes";
const RING_LENGTH = 326.73;
const DEFAULT_TIMER_MINUTES = 25;

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: crypto.randomUUID(), text: "Create my first GitHub project", done: false },
  { id: crypto.randomUUID(), text: "Write a clear README", done: false },
  { id: crypto.randomUUID(), text: "Share the repo link", done: false },
];

let focusMinutes = Number(localStorage.getItem(TIMER_KEY)) || DEFAULT_TIMER_MINUTES;
let remainingSeconds = focusMinutes * 60;
let timerId = null;

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === "dark" ? "Light" : "Dark";
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  localStorage.setItem(THEME_KEY, theme);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "Add one small task to start building momentum.";
    taskList.append(emptyState);
    updateProgress();
    return;
  }

  tasks.forEach((task) => {
    const item = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");
    const label = item.querySelector("span");
    const deleteButton = item.querySelector("button");

    checkbox.checked = task.done;
    label.textContent = task.text;

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      updateProgress();
    });

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.append(item);
  });

  updateProgress();
}

function updateProgress() {
  const completed = tasks.filter((task) => task.done).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const openTasks = total - completed;

  taskCount.textContent = `${openTasks} open`;
  progressPercent.textContent = `${percent}%`;
  ringFill.style.strokeDashoffset = RING_LENGTH - (percent / 100) * RING_LENGTH;

  if (total === 0) {
    progressTitle.textContent = "Start with one clear task.";
  } else if (percent === 100) {
    progressTitle.textContent = "Done. That is a proper little streak.";
  } else if (percent >= 50) {
    progressTitle.textContent = "You are past halfway. Keep the pace.";
  } else {
    progressTitle.textContent = "Build your streak one task at a time.";
  }
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secondsLeft = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secondsLeft}`;
}

function updateTimer() {
  timerDisplay.textContent = formatTime(remainingSeconds);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  timerToggle.textContent = "Start";
}

function updateTimerModeButtons() {
  timerModeLabel.textContent = `${focusMinutes} min`;

  timerModeButtons.forEach((button) => {
    const isSelected = Number(button.dataset.minutes) === focusMinutes;
    button.classList.toggle("is-selected", isSelected);
  });
}

function setTimerMinutes(minutes) {
  focusMinutes = minutes;
  remainingSeconds = focusMinutes * 60;
  localStorage.setItem(TIMER_KEY, String(focusMinutes));
  stopTimer();
  updateTimerModeButtons();
  updateTimer();
}

function startTimer() {
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    updateTimer();

    if (remainingSeconds <= 0) {
      stopTimer();
      remainingSeconds = focusMinutes * 60;
      updateTimer();
    }
  }, 1000);

  timerToggle.textContent = "Pause";
}

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

resetButton.addEventListener("click", () => {
  const confirmed = confirm("Clear all tasks from this board?");

  if (!confirmed) {
    return;
  }

  tasks = [];
  saveTasks();
  renderTasks();
});

themeButton.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

timerToggle.addEventListener("click", () => {
  if (timerId) {
    stopTimer();
  } else {
    startTimer();
  }
});

timerReset.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = focusMinutes * 60;
  updateTimer();
});

timerModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTimerMinutes(Number(button.dataset.minutes));
  });
});

applyTheme(localStorage.getItem(THEME_KEY) || "light");
updateTimerModeButtons();
renderTasks();
updateTimer();
