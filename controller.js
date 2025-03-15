import { Task, model } from "./model.js";
import View from "./view.js";
import Router from "./router.js";
//prettier-ignore
let day = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
let month = new Date().toString().split(" ")[1];
let year = new Date().getFullYear().toString();

const title = document.querySelector("h1");
title.textContent = `${day} ${month} ${year}`;

function checkNotificationSupport() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    console.log("Notification permission granted.");
    new Notification("Why notification not showing?");
    return true;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
        return true;
      } else {
        console.log("Notification permission denied.");
        return false;
      }
    });
  } else {
    console.log("Notification permission denied.");
    return false;
  }
}
class Controller {
  constructor(view) {
    this.view = view;
    new Router(this);
    this.handleDeadlineChange = null;
    this.handleDetailsKeydown = null;

    // Check notification support and request permission if needed
    this.notificationSupported = checkNotificationSupport();
  }

  init() {
    this.view.render(model.list);
  }

  showTodoList() {
    document.getElementById("todo").style.display = "block";
    document.getElementById("task-details").style.display = "none";
    this.view.render(model.list);
    console.log(model.list);
  }

  showTaskDetails(taskId) {
    document.getElementById("todo").style.display = "none";
    document.getElementById("task-details").style.display = "flex";

    const task = model.list.find((t) => t.id === taskId);
    if (task) {
      document.getElementById("task-title").textContent = task.text;

      const today = new Date().toISOString().split("T")[0];
      const deadlineInput = document.getElementById("task-deadline");
      const timeInput = document.getElementById("task-time");

      let storedDate, storedTime;

      if (task.deadline) {
        [storedDate, storedTime] = task.deadline.split(" ");
      }

      deadlineInput.value = storedDate || "";
      timeInput.value = storedTime || "";

      deadlineInput.setAttribute("min", today);

      if (storedDate) {
        timeInput.style.display = "block";
      } else {
        timeInput.style.display = "none";
      }

      // Remove any existing event listeners before adding a new one
      if (this.handleDeadlineChange) {
        deadlineInput.removeEventListener("change", this.handleDeadlineChange);
        timeInput.removeEventListener("change", this.handleDeadlineChange);
      }
      this.handleDeadlineChange = () => this.updateDeadline(taskId);
      deadlineInput.addEventListener("change", this.handleDeadlineChange);
      timeInput.addEventListener("change", this.handleDeadlineChange);

      const detailsTextarea = document.getElementById("task-details-text");
      detailsTextarea.value = task.details || "";

      // Remove any existing event listeners before adding a new one
      if (this.handleDetailsKeydown) {
        detailsTextarea.removeEventListener(
          "keydown",
          this.handleDetailsKeydown
        );
      }
      this.handleDetailsKeydown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          this.updateTaskDetails(taskId, detailsTextarea.value);
        }
      };
      detailsTextarea.addEventListener("keydown", this.handleDetailsKeydown);
    }
  }

  updateDeadline(taskId) {
    const task = model.list.find((t) => t.id === taskId);
    if (task) {
      let deadlineValue = document.getElementById("task-deadline").value;
      const timeInput = document.getElementById("task-time");

      if (!deadlineValue) {
        // If deadline is cleared, hide the time input and set its value to an empty string
        timeInput.style.display = "none";
        timeInput.value = "";
        task.deadline = "";
      } else {
        // If deadline is set, show the time input
        timeInput.style.display = "block";
        let timeValue = timeInput.value || "12:00";
        task.deadline = `${deadlineValue} ${timeValue}`;
        this.scheduleNotification(taskId, task.deadline);
      }

      localStorage.setItem("todos", JSON.stringify(model.list));
    }
  }

  updateTaskDetails(taskId, details) {
    const task = model.list.find((t) => t.id === taskId);
    if (task) {
      task.details = details;
      localStorage.setItem("todos", JSON.stringify(model.list));
    }
  }

  scheduleNotification(taskId, deadline) {
    const task = model.list.find((t) => t.id === taskId);
    if (!task || !deadline) return;

    const deadlineTime = new Date(deadline).getTime();
    const currentTime = new Date().getTime();
    const timeUntilDeadline = deadlineTime - currentTime;

    if (timeUntilDeadline > 0) {
      setTimeout(() => this.sendNotification(taskId), timeUntilDeadline);
    }
  }

  sendNotification(taskId) {
    const task = model.list.find((t) => t.id === taskId);
    if (!task) return;

    if (!this.notificationSupported) {
      this.firePopup(`Deadline is now for ${task.text}`, 6000);
    } else {
      console.log("Notifications support: ", this.notificationSupported);
      new Notification("Task Reminder", {
        body: `Deadline is now for: ${task.text}`,
      });
    }
  }

  addTask(e) {
    if (e.key === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      this.processTask();
    }
  }

  handleMobileInput(e) {
    if (e.inputType === "insertText" && e.data === "\n") {
      e.preventDefault();
      this.processTask();
    }
  }

  processTask() {
    let inputField = document.getElementById("add-item");
    let inputValue = inputField.value.trim();

    if (!inputValue) return;
    //prettier-ignore
    if (model.list.some((i) => i.text.toLowerCase() === inputValue.toLowerCase())) {
      this.firePopup("Task already exists", 2000);
      return;
    }

    this.addItem(new Task(inputValue));
    inputField.value = "";
  }

  searchTask(e) {
    if (e.key === "Enter" || e.key === "NumpadEnter" || e.key === "Done") {
      e.preventDefault();
      let inputValue = document.getElementById("search-item").value.trim();
      if (inputValue) {
        this.searchItem(inputValue);
      }
    }
  }

  sortItems() {
    return model.list.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  addItem(task) {
    model.list.push(task);
    this.sortItems();
    document.getElementById("add-item").value = "";
    this.updateView();
  }

  completeItem(listItem) {
    listItem.completed = !listItem.completed;
    listItem.priority = false;
    this.sortItems();
    this.updateView();
  }

  deleteItem(listItem) {
    model.list = model.list.filter(
      (remainItem) => remainItem.text !== listItem.text
    );
    this.updateView();
  }

  prioritizeItem(listItem) {
    listItem.priority = !listItem.priority;
    model.list.sort((a, b) => Number(b.priority) - Number(a.priority));
    this.updateView();
  }

  editItem(listItem, e) {
    const listItemElement = e.target
      .closest(".item")
      .querySelector(".item-text");

    const input = document.createElement("input");
    input.type = "text";
    input.value = listItem.text;
    input.className = "edit-input";
    input.name = "edit-input";
    listItemElement.innerHTML = "";
    listItemElement.appendChild(input);
    input.focus();

    const handleEditSubmit = (e) => {
      if (
        e.key === "Enter" ||
        e.code === "NumpadEnter" ||
        (e.inputType === "insertText" && e.data === "\n")
      ) {
        e.preventDefault();
        if (input.value.trim() !== "") {
          listItem.text = input.value.trim();
        }
        this.updateView();
      }
    };
    input.addEventListener("keydown", handleEditSubmit);
    input.addEventListener("input", handleEditSubmit);
  }

  searchItem(query) {
    model.search = model.list.filter((task) =>
      task.text.toLowerCase().includes(query.toLowerCase())
    );
    document.getElementById("search-item").value = "";

    if (model.search.length) {
      this.view.render(model.search);
    } else {
      this.view.renderEmpty("Nothing found...");
    }
  }

  save() {
    localStorage.setItem("todos", JSON.stringify(model.list));
  }

  updateView() {
    this.view.render(model.list);
    this.save();
  }

  firePopup(text, timeout) {
    const popup = document.getElementById("popup");
    popup.textContent = text;
    popup.classList.add("active");
    setTimeout(() => {
      document.getElementById("popup").classList.remove("active");
    }, timeout);
  }

  performNavigation() {
    return (window.location.href = "#/todos/");
  }
}

const view = new View();
const controller = new Controller(view);
controller.init();

const taskInput = document.getElementById("add-item");
const searchInput = document.getElementById("search-item");
const backIcon = document.querySelector(".icon-back");

taskInput.addEventListener("keydown", (e) => controller.addTask(e));
taskInput.addEventListener("input", (e) => controller.handleMobileInput(e));
taskInput.addEventListener("change", () => controller.processTask());
searchInput.addEventListener("keydown", (e) => controller.searchTask(e));

taskInput.addEventListener("submit", (e) => {
  e.preventDefault();
  controller.processTask();
});

backIcon.addEventListener("click", () => controller.performNavigation());

export default controller;
