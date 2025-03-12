import { Task, model } from "./model.js";
import View from "./view.js";
//prettier-ignore
let day = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
let month = new Date().toString().split(" ")[1];
let year = new Date().getFullYear().toString();

const title = document.querySelector("h1");
title.textContent = `for ${day} ${month} ${year}`;

class Controller {
  constructor(view) {
    this.view = view;
  }

  init() {
    this.view.render(model.list);
  }

  addTask(e) {
    if (e.key === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault(); // Prevent default form behavior
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

    if (
      model.list.some((i) => i.text.toLowerCase() === inputValue.toLowerCase())
    ) {
      document.getElementById("popup").classList.add("active");
      setTimeout(() => {
        document.getElementById("popup").classList.remove("active");
      }, 2000);
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

    input.addEventListener("input", (e) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        if (input.value.trim() !== "") {
          listItem.text = input.value.trim();
        }
        this.updateView();
      }
    });
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
}
const view = new View();
const controller = new Controller(view);
controller.init();

const taskInput = document.getElementById("add-item");
const searchInput = document.getElementById("search-item");

taskInput.addEventListener("keydown", (e) => controller.addTask(e));
taskInput.addEventListener("input", (e) => controller.handleMobileInput(e));
taskInput.addEventListener("change", () => controller.processTask());
searchInput.addEventListener("keydown", (e) => controller.searchTask(e));

taskInput.addEventListener("submit", (e) => {
  e.preventDefault();
  controller.processTask();
});

export default controller;
